import { db } from '$lib/server/db';
import { order, orderItem, menuItem, user } from '$lib/server/db/schema';
import { eq, inArray, isNull, and } from 'drizzle-orm';
import { orderLogger } from '$lib/server/logger';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || (locals.user.role !== 'kitchen' && locals.user.role !== 'admin')) {
		orderLogger.warn({ event: 'access_denied', userId: locals.user?.id, role: locals.user?.role }, 'Access denied to kitchen view');
		return { orders: [] };
	}

	try {
		orderLogger.debug({ event: 'fetching_kitchen_orders', userId: locals.user.id, role: locals.user.role }, 'Fetching kitchen orders');

		const kitchenOrders = await db
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
			.where(and(isNull(order.deletedAt), inArray(order.status, ['pending', 'preparing'])))
			.orderBy(order.createdAt);

		orderLogger.info({ event: 'kitchen_orders_fetched', userId: locals.user.id, count: kitchenOrders.length }, 'Kitchen orders fetched');

		const ordersWithItems = await Promise.all(
			kitchenOrders.map(async (ord) => {
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
		orderLogger.error({ event: 'fetch_kitchen_orders_error', userId: locals.user?.id, error }, 'Error fetching kitchen orders');
		return { orders: [] };
	}
};
