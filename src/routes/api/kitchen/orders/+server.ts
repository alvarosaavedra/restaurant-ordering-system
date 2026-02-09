import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { order, orderItem, menuItem, user, orderItemVariation, orderItemModifier, variation, variationGroup, modifier } from '$lib/server/db/schema';
import { eq, inArray, and, isNull } from 'drizzle-orm';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (locals.user.role !== 'kitchen' && locals.user.role !== 'admin') {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	try {
		const orders = await db
			.select({
				id: order.id,
				customerName: order.customerName,
				customerPhone: order.customerPhone,
				deliveryDateTime: order.deliveryDateTime,
				address: order.address,
				comment: order.comment,
				totalAmount: order.totalAmount,
				status: order.status,
				createdAt: order.createdAt,
				// Discount fields
				discountAmount: order.discountAmount,
				discountType: order.discountType,
				discountValue: order.discountValue,
				discountReason: order.discountReason,
				employee: {
					name: user.name,
					email: user.email
				}
			})
			.from(order)
			.leftJoin(user, eq(order.employeeId, user.id))
			.where(and(isNull(order.deletedAt), inArray(order.status, ['pending', 'preparing'])))
			.orderBy(order.createdAt);

		const ordersWithItems = await Promise.all(
			orders.map(async (order) => {
				const items = await db
					.select({
						id: orderItem.id,
						quantity: orderItem.quantity,
						unitPrice: orderItem.unitPrice,
						menuItemId: orderItem.menuItemId,
						// Item discount fields
						discountAmount: orderItem.discountAmount,
						discountType: orderItem.discountType,
						discountValue: orderItem.discountValue,
						discountReason: orderItem.discountReason,
						menuItem: {
							id: menuItem.id,
							name: menuItem.name,
							categoryId: menuItem.categoryId
						}
					})
					.from(orderItem)
					.leftJoin(menuItem, eq(orderItem.menuItemId, menuItem.id))
					.where(eq(orderItem.orderId, order.id));

				// Get all item IDs for this order
				const itemIds = items.map(item => item.id);

				// Fetch variations for all items
				const variations = itemIds.length > 0
					? await db
						.select({
							orderItemId: orderItemVariation.orderItemId,
							variationGroupId: orderItemVariation.variationGroupId,
							variationId: orderItemVariation.variationId,
							groupName: variationGroup.name,
							variationName: variation.name,
							priceAdjustment: variation.priceAdjustment
						})
						.from(orderItemVariation)
						.leftJoin(variationGroup, eq(orderItemVariation.variationGroupId, variationGroup.id))
						.leftJoin(variation, eq(orderItemVariation.variationId, variation.id))
						.where(inArray(orderItemVariation.orderItemId, itemIds))
					: [];

				// Fetch modifiers for all items
				const modifiers = itemIds.length > 0
					? await db
						.select({
							orderItemId: orderItemModifier.orderItemId,
							modifierId: orderItemModifier.modifierId,
							modifierName: modifier.name,
							quantity: orderItemModifier.quantity,
							priceAtOrder: orderItemModifier.priceAtOrder
						})
						.from(orderItemModifier)
						.leftJoin(modifier, eq(orderItemModifier.modifierId, modifier.id))
						.where(inArray(orderItemModifier.orderItemId, itemIds))
					: [];

				// Attach variations and modifiers to items
				const itemsWithCustomizations = items.map(item => ({
					...item,
					variations: variations.filter(v => v.orderItemId === item.id),
					modifiers: modifiers.filter(m => m.orderItemId === item.id)
				}));

				return { ...order, items: itemsWithCustomizations };
			})
		);

		return json(ordersWithItems);
	} catch (error) {
		console.error('Error fetching kitchen orders:', error);
		return json({ error: 'Failed to fetch kitchen orders' }, { status: 500 });
	}
};
