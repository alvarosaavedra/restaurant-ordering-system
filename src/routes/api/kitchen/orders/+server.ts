import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { order, orderItem, menuItem, user } from '$lib/server/db/schema';
import { eq, inArray } from 'drizzle-orm';
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
			.where(inArray(order.status, ['pending', 'preparing']))
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

				return { ...order, items };
			})
		);

		return json(ordersWithItems);
	} catch (error) {
		console.error('Error fetching kitchen orders:', error);
		return json({ error: 'Failed to fetch kitchen orders' }, { status: 500 });
	}
};
