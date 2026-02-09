import { db } from '$lib/server/db';
import { order, orderItem, menuItem, user, orderItemVariation, orderItemModifier, variation, variationGroup, modifier } from '$lib/server/db/schema';
import { eq, inArray, isNull, and } from 'drizzle-orm';
import { orderLogger } from '$lib/server/logger';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || (locals.user.role !== 'delivery' && locals.user.role !== 'admin')) {
		orderLogger.warn({ event: 'access_denied', userId: locals.user?.id, role: locals.user?.role }, 'Access denied to delivery view');
		return { orders: [] };
	}

	try {
		orderLogger.debug({ event: 'fetching_delivery_orders', userId: locals.user.id, role: locals.user.role }, 'Fetching delivery orders');

		const deliveryOrders = await db
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
			.where(and(isNull(order.deletedAt), eq(order.status, 'ready')))
			.orderBy(order.createdAt);

		orderLogger.info({ event: 'delivery_orders_fetched', userId: locals.user.id, count: deliveryOrders.length }, 'Delivery orders fetched');

		const ordersWithItems = await Promise.all(
			deliveryOrders.map(async (ord) => {
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
					.where(eq(orderItem.orderId, ord.id));

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

				return {
					...ord,
					items: itemsWithCustomizations
				};
			})
		);

		return { orders: ordersWithItems };
	} catch (error) {
		orderLogger.error({ event: 'fetch_delivery_orders_error', userId: locals.user?.id, error }, 'Error fetching delivery orders');
		return { orders: [] };
	}
};
