import { json, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { order, orderItem, menuItem, user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { Actions, RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		const orders = await db
			.select({
				id: order.id,
				customerName: order.customerName,
				customerPhone: order.customerPhone,
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
			.orderBy(order.createdAt);

		return json({ orders });
	} catch (error) {
		console.error('Error fetching orders:', error);
		return json({ error: 'Failed to fetch orders' }, { status: 500 });
	}
};

export const POST: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		try {
			const data = await request.json();
			const { customerName, customerPhone, items } = data;

			// Validate input
			if (!customerName?.trim()) {
				return fail(400, { error: 'Customer name is required' });
			}

			if (!items || items.length === 0) {
				return fail(400, { error: 'At least one item is required' });
			}

			// Calculate total amount
			let totalAmount = 0;
			const orderItems: typeof orderItem.$inferInsert[] = [];

			for (const item of items) {
				const menuItemRecord = await db
					.select()
					.from(menuItem)
					.where(eq(menuItem.id, item.menuItemId))
					.limit(1);

				if (!menuItemRecord || menuItemRecord.length === 0) {
					return fail(400, { error: `Menu item ${item.menuItemId} not found` });
				}

				const menuItemData = menuItemRecord[0];
				
				if (!menuItemData.isAvailable) {
					return fail(400, { error: `Menu item ${menuItemData.name} is not available` });
				}

				const itemTotal = menuItemData.price * item.quantity;
				totalAmount += itemTotal;

				orderItems.push({
					id: nanoid(),
					orderId: '', // Will be set after order creation
					menuItemId: item.menuItemId,
					quantity: item.quantity,
					unitPrice: menuItemData.price
				});
			}

			// Create order
			const orderId = nanoid();
			await db.insert(order).values({
				id: orderId,
				customerName: customerName.trim(),
				customerPhone: customerPhone?.trim() || null,
				totalAmount,
				status: 'pending',
				employeeId: locals.user.id
			});

			// Create order items with the order ID
			const orderItemsWithOrderId = orderItems.map(item => ({
				...item,
				orderId
			}));

			await db.insert(orderItem).values(orderItemsWithOrderId);

			return json({ 
				success: true,
				orderId,
				message: 'Order created successfully'
			});

		} catch (error) {
			console.error('Error creating order:', error);
			return fail(500, { error: 'Failed to create order' });
		}
	}
};