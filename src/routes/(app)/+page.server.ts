import { db } from '$lib/server/db';
import { order, orderItem, menuItem, user, category } from '$lib/server/db/schema';
import { eq, desc, sql, count } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return {
			user: null,
			stats: null,
			recentOrders: [],
			error: 'Unauthorized'
		};
	}

	try {
		// Get order statistics
		const stats = await db
			.select({
				pending: sql<number>`SUM(CASE WHEN ${order.status} = 'pending' THEN 1 ELSE 0 END)`.mapWith(Number),
				preparing: sql<number>`SUM(CASE WHEN ${order.status} = 'preparing' THEN 1 ELSE 0 END)`.mapWith(Number),
				ready: sql<number>`SUM(CASE WHEN ${order.status} = 'ready' THEN 1 ELSE 0 END)`.mapWith(Number),
				delivered: sql<number>`SUM(CASE WHEN ${order.status} = 'delivered' THEN 1 ELSE 0 END)`.mapWith(Number),
				total: count()
			})
			.from(order);

		const statsData = stats[0] || {
			pending: 0,
			preparing: 0,
			ready: 0,
			delivered: 0,
			total: 0
		};

		// Fetch recent orders (last 5)
		const recentOrders = await db
			.select({
				id: order.id,
				customerName: order.customerName,
				customerPhone: order.customerPhone,
				totalAmount: order.totalAmount,
				status: order.status,
				createdAt: order.createdAt,
				employee: {
					id: user.id,
					name: user.name,
					email: user.email
				}
			})
			.from(order)
			.leftJoin(user, eq(order.employeeId, user.id))
			.orderBy(desc(order.createdAt))
			.limit(5);

		// Fetch order items for recent orders
		const recentOrdersWithItems = await Promise.all(
			recentOrders.map(async (ord) => {
				const items = await db
					.select({
						id: orderItem.id,
						quantity: orderItem.quantity,
						unitPrice: orderItem.unitPrice,
						menuItemId: orderItem.menuItemId,
						menuItem: {
							id: menuItem.id,
							name: menuItem.name,
							description: menuItem.description,
							price: menuItem.price,
							categoryId: menuItem.categoryId,
							categoryName: category.name
						}
					})
					.from(orderItem)
					.leftJoin(menuItem, eq(orderItem.menuItemId, menuItem.id))
					.leftJoin(category, eq(menuItem.categoryId, category.id))
					.where(eq(orderItem.orderId, ord.id));

				return {
					...ord,
					items
				};
			})
		);

		return {
			user: {
				id: locals.user.id,
				name: locals.user.name,
				email: locals.user.email,
				role: locals.user.role
			},
			stats: statsData,
			recentOrders: recentOrdersWithItems
		};
	} catch (error) {
		console.error('Error fetching dashboard data:', error);
		return {
			user: {
				id: locals.user.id,
				name: locals.user.name,
				email: locals.user.email,
				role: locals.user.role
			},
			stats: {
				pending: 0,
				preparing: 0,
				ready: 0,
				delivered: 0,
				total: 0
			},
			recentOrders: [],
			error: 'Failed to fetch dashboard data'
		};
	}
};
