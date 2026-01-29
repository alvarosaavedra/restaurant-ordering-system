import { db } from '$lib/server/db';
import { order, orderItem, menuItem, user } from '$lib/server/db/schema';
import { eq, isNull, and } from 'drizzle-orm';
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
						menuItem: {
							id: menuItem.id,
							name: menuItem.name,
							categoryId: menuItem.categoryId
						}
					})
					.from(orderItem)
					.leftJoin(menuItem, eq(orderItem.menuItemId, menuItem.id))
					.where(eq(orderItem.orderId, ord.id));

				return {
					...ord,
					items
				};
			})
		);

		return { orders: ordersWithItems };
	} catch (error) {
		orderLogger.error({ event: 'fetch_delivery_orders_error', userId: locals.user?.id, error }, 'Error fetching delivery orders');
		return { orders: [] };
	}
};
