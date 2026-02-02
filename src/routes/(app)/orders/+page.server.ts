import { db } from '$lib/server/db';
import { order, orderItem, menuItem, user } from '$lib/server/db/schema';
import { eq, desc, asc, and, like, isNull } from 'drizzle-orm';
import { orderLogger } from '$lib/server/logger';
import type { PageServerLoad } from './$types';
import type { OrderStatus } from '$lib/types/orders';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		orderLogger.warn({ event: 'unauthorized_access' }, 'Unauthorized access to orders history');
		return { orders: [], totalCount: 0 };
	}

	try {
		const search = url.searchParams.get('search') || '';
		const status = url.searchParams.get('status') || '';
		const sort = url.searchParams.get('sort') || 'newest';
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const offset = (page - 1) * limit;

		orderLogger.debug(
			{
				event: 'fetching_orders_history',
				userId: locals.user.id,
				role: locals.user.role,
				search,
				status,
				sort,
				page,
				limit
			},
			'Fetching orders history'
		);

		const conditions = [isNull(order.deletedAt)];

		if (search) {
			conditions.push(like(order.customerName, `%${search}%`));
		}

		if (status && ['pending', 'preparing', 'ready', 'delivered'].includes(status)) {
			conditions.push(eq(order.status, status as OrderStatus));
		}

		const orderBy = sort === 'oldest' ? asc(order.createdAt) : desc(order.createdAt);

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
				updatedAt: order.updatedAt,
				// Discount fields
				discountAmount: order.discountAmount,
				discountType: order.discountType,
				discountValue: order.discountValue,
				discountReason: order.discountReason,
				employee: {
					id: user.id,
					name: user.name,
					email: user.email
				}
			})
			.from(order)
			.leftJoin(user, eq(order.employeeId, user.id))
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(orderBy)
			.limit(limit)
			.offset(offset);

		const ordersWithItems = await Promise.all(
			orders.map(async (ord) => {
				const items = await db
					.select({
						id: orderItem.id,
						quantity: orderItem.quantity,
						unitPrice: orderItem.unitPrice,
						menuItemId: orderItem.menuItemId,
						// Discount fields
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

				return {
					...ord,
					items
				};
			})
		);

		const totalCount = await db
			.select({ count: order.id })
			.from(order)
			.where(conditions.length > 0 ? and(...conditions) : undefined);

		orderLogger.info(
			{
				event: 'orders_history_fetched',
				userId: locals.user.id,
				role: locals.user.role,
				count: orders.length,
				totalCount: totalCount.length
			},
			'Orders history fetched'
		);

		return {
			orders: ordersWithItems,
			totalCount: totalCount.length,
			currentPage: page,
			limit,
			search,
			status,
			sort
		};
	} catch (error) {
		orderLogger.error({ event: 'fetch_orders_history_error', userId: locals.user.id, error }, 'Error fetching orders');
		return {
			orders: [],
			totalCount: 0,
			currentPage: 1,
			limit: 20,
			search: '',
			status: '',
			sort: 'newest',
			error: 'Failed to fetch orders'
		};
	}
};
