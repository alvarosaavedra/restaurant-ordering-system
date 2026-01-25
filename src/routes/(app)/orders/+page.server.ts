import { db } from '$lib/server/db';
import { order, orderItem, menuItem, user } from '$lib/server/db/schema';
import { eq, inArray, desc, asc, or, ilike } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		return { orders: [], totalCount: 0 };
	}

	try {
		const search = url.searchParams.get('search') || '';
		const status = url.searchParams.get('status') || '';
		const sort = url.searchParams.get('sort') || 'newest';
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const offset = (page - 1) * limit;

		const conditions = [];

		if (search) {
			conditions.push(ilike(order.customerName, `%${search}%`));
		}

		if (status && ['pending', 'preparing', 'ready', 'delivered'].includes(status)) {
			conditions.push(eq(order.status, status as any));
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
				employee: {
					id: user.id,
					name: user.name,
					email: user.email
				}
			})
			.from(order)
			.leftJoin(user, eq(order.employeeId, user.id))
			.where(conditions.length > 0 ? or(...conditions) : undefined)
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
			.where(conditions.length > 0 ? or(...conditions) : undefined);

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
		console.error('Error fetching orders:', error);
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
