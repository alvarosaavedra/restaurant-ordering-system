import { db } from '$lib/server/db';
import { order, orderItem, menuItem, user, category } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import { adminLogger } from '$lib/server/logger';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const isAdmin = locals.user.role === 'admin';

	try {
		const orderId = params.id;

		const orderData = await db
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
				employeeId: order.employeeId,
				deletedAt: order.deletedAt,
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

		const menuItems = await db
			.select()
			.from(menuItem)
			.orderBy(menuItem.name);

		return {
			order: {
				...orderRecord,
				items
			},
			isAdmin,
			menuItems
		};
	} catch (e) {
		if (e instanceof Error && e.message === 'Order not found') {
			throw error(404, 'Order not found');
		}
		console.error('Error fetching order details:', e);
		throw error(500, 'Failed to fetch order details');
	}
};

export const actions: Actions = {
	updateOrder: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, {
				error: 'Unauthorized - Admin access required'
			});
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const customerName = formData.get('customerName')?.toString().trim();
		const customerPhone = formData.get('customerPhone')?.toString().trim() || null;
		const deliveryDateTime = formData.get('deliveryDateTime')?.toString();
		const address = formData.get('address')?.toString().trim() || null;
		const comment = formData.get('comment')?.toString().trim() || null;
		const status = formData.get('status')?.toString();

		if (!id || !customerName || !deliveryDateTime || !status) {
			return fail(400, {
				error: 'Customer name, delivery date/time, and status are required'
			});
		}

		const validStatuses = ['pending', 'preparing', 'ready', 'delivered'];
		if (!validStatuses.includes(status)) {
			return fail(400, {
				error: 'Invalid order status'
			});
		}

		try {
			const [orderRecord] = await db
				.select()
				.from(order)
				.where(eq(order.id, id));

			if (!orderRecord) {
				return fail(404, {
					error: 'Order not found'
				});
			}

			if (orderRecord.deletedAt) {
				return fail(400, {
					error: 'Cannot update deleted order'
				});
			}

			const parsedDate = new Date(deliveryDateTime);
			if (isNaN(parsedDate.getTime())) {
				return fail(400, {
					error: 'Invalid delivery date/time'
				});
			}

			await db
				.update(order)
				.set({
					customerName,
					customerPhone,
					deliveryDateTime: parsedDate,
					address,
					comment,
					status: status as 'pending' | 'preparing' | 'ready' | 'delivered',
					updatedAt: new Date()
				})
				.where(eq(order.id, id));

			adminLogger.info({
				event: 'order_updated',
				orderId: id,
				userId: locals.user.id,
				changes: {
					customerName,
					customerPhone,
					deliveryDateTime: parsedDate,
					address,
					comment,
					status
				}
			});

			return { success: true, message: 'Order updated successfully' };
		} catch (err) {
			console.error('Error updating order:', err);
			return fail(500, {
				error: 'Failed to update order'
			});
		}
	},

	updateOrderItems: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, {
				error: 'Unauthorized - Admin access required'
			});
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const itemsJson = formData.get('itemsJson')?.toString();

		if (!id || !itemsJson) {
			return fail(400, {
				error: 'Order ID and items are required'
			});
		}

		try {
			let items;
			try {
				items = JSON.parse(itemsJson);
			} catch {
				return fail(400, {
					error: 'Invalid items data'
				});
			}

			if (!Array.isArray(items) || items.length === 0) {
				return fail(400, {
					error: 'At least one item is required'
				});
			}

			const [orderRecord] = await db
				.select()
				.from(order)
				.where(eq(order.id, id));

			if (!orderRecord) {
				return fail(404, {
					error: 'Order not found'
				});
			}

			if (orderRecord.deletedAt) {
				return fail(400, {
					error: 'Cannot update deleted order'
				});
			}

			const menuItemIds = items.map((item) => item.menuItemId);
			const menuItemsCheck = await db
				.select()
				.from(menuItem)
				.where(eq(menuItem.id, menuItemIds[0]));

			for (const item of items) {
				const menuItemRecord = menuItemsCheck.find((m) => m.id === item.menuItemId);
				if (!menuItemRecord) {
					return fail(400, {
						error: `Menu item ${item.menuItemId} not found`
					});
				}
			}

			await db.delete(orderItem).where(eq(orderItem.orderId, id));

			let totalAmount = 0;
			for (const item of items) {
				const menuItemRecord = menuItemsCheck.find((m) => m.id === item.menuItemId);
				if (menuItemRecord) {
					const itemTotal = item.quantity * menuItemRecord.price;
					totalAmount += itemTotal;

					await db.insert(orderItem).values({
						id: crypto.randomUUID(),
						orderId: id,
						menuItemId: item.menuItemId,
						quantity: item.quantity,
						unitPrice: menuItemRecord.price
					});
				}
			}

			await db
				.update(order)
				.set({
					totalAmount,
					updatedAt: new Date()
				})
				.where(eq(order.id, id));

			adminLogger.info({
				event: 'order_items_updated',
				orderId: id,
				userId: locals.user.id,
				itemCount: items.length,
				totalAmount
			});

			return { success: true, message: 'Order items updated successfully' };
		} catch (err) {
			console.error('Error updating order items:', err);
			return fail(500, {
				error: 'Failed to update order items'
			});
		}
	},

	deleteOrder: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, {
				error: 'Unauthorized - Admin access required'
			});
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, {
				error: 'Order ID is required'
			});
		}

		try {
			const [orderRecord] = await db
				.select()
				.from(order)
				.where(eq(order.id, id));

			if (!orderRecord) {
				return fail(404, {
					error: 'Order not found'
				});
			}

			if (orderRecord.deletedAt) {
				return fail(400, {
					error: 'Order is already deleted'
				});
			}

			await db
				.update(order)
				.set({
					deletedAt: new Date()
				})
				.where(eq(order.id, id));

			adminLogger.info({
				event: 'order_deleted',
				orderId: id,
				userId: locals.user.id,
				orderData: {
					customerName: orderRecord.customerName,
					customerPhone: orderRecord.customerPhone,
					totalAmount: orderRecord.totalAmount,
					status: orderRecord.status
				}
			});

			throw redirect(302, '/orders');
		} catch (err) {
			if (err instanceof Response && err.status === 302) {
				throw err;
			}
			console.error('Error deleting order:', err);
			return fail(500, {
				error: 'Failed to delete order'
			});
		}
	}
};
