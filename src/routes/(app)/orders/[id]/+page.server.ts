import { db } from '$lib/server/db';
import { order, orderItem, menuItem, user, category } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		const orderId = params.id;

		const orderData = await db
			.select({
				id: order.id,
				customerName: order.customerName,
				customerPhone: order.customerPhone,
				totalAmount: order.totalAmount,
				status: order.status,
				createdAt: order.createdAt,
				updatedAt: order.updatedAt,
				employeeId: order.employeeId,
				employee: {
					id: user.id,
					name: user.name,
					email: user.email,
					role: user.role
				}
			})
			.from(order)
			.leftJoin(user, eq(order.employeeId, user.id))
			.where(eq(order.id, orderId))
			.limit(1);

		if (!orderData || orderData.length === 0) {
			throw error(404, 'Order not found');
		}

		const orderRecord = orderData[0];

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
			.where(eq(orderItem.orderId, orderId));

		return {
			order: {
				...orderRecord,
				items
			}
		};
	} catch (e) {
		if (e instanceof Error && e.message === 'Order not found') {
			throw error(404, 'Order not found');
		}
		console.error('Error fetching order details:', e);
		throw error(500, 'Failed to fetch order details');
	}
};
