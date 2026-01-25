import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { order, orderItem, menuItem, user, client } from '$lib/server/db/schema';
import { eq, or } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
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

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const data = await request.json();
		const { customerName, customerPhone, deliveryDateTime, address, comment, items } = data;

		// Validate input
		if (!customerName?.trim()) {
			return json({ error: 'Customer name is required' }, { status: 400 });
		}

		if (!deliveryDateTime) {
			return json({ error: 'Delivery date/time is required' }, { status: 400 });
		}

		const parsedDeliveryDateTime = new Date(deliveryDateTime);
		if (isNaN(parsedDeliveryDateTime.getTime())) {
			return json({ error: 'Invalid delivery date/time' }, { status: 400 });
		}

		if (parsedDeliveryDateTime < new Date()) {
			return json({ error: 'Delivery date/time must be in the future' }, { status: 400 });
		}

		if (!items || items.length === 0) {
			return json({ error: 'At least one item is required' }, { status: 400 });
		}

		const trimmedPhone = customerPhone?.trim() || null;

		let existingClient = null;

		if (trimmedPhone) {
			existingClient = await db
				.select()
				.from(client)
				.where(eq(client.phone, trimmedPhone))
				.limit(1);
		}

		if ((!existingClient || existingClient.length === 0) && customerName) {
			existingClient = await db
				.select()
				.from(client)
				.where(eq(client.name, customerName.trim()))
				.limit(1);
		}

		if (!existingClient || existingClient.length === 0) {
			if (trimmedPhone) {
				await db.insert(client).values({
					id: nanoid(),
					name: customerName.trim(),
					phone: trimmedPhone,
					address: address?.trim() || null
				});
			}
		} else {
			const clientData = existingClient[0];
			if (address?.trim() && !clientData.address) {
				await db
					.update(client)
					.set({ address: address.trim() })
					.where(eq(client.id, clientData.id));
			}
		}

		let totalAmount = 0;
		const orderItems: typeof orderItem.$inferInsert[] = [];
		
		for (const item of items) {
			const menuItemRecord = await db
				.select()
				.from(menuItem)
				.where(eq(menuItem.id, item.menuItemId))
				.limit(1);

			if (!menuItemRecord || menuItemRecord.length === 0) {
				return json({ error: `Menu item ${item.menuItemId} not found` }, { status: 400 });
			}

			const menuItemData = menuItemRecord[0];
			
			if (!menuItemData.isAvailable) {
				return json({ error: `Menu item ${menuItemData.name} is not available` }, { status: 400 });
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
			deliveryDateTime: parsedDeliveryDateTime,
			address: address?.trim() || null,
			comment: comment?.trim() || null,
			totalAmount,
			status: 'pending',
			employeeId: locals.user.id
		});

		// Create order items with order ID
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
		return json({ error: 'Failed to create order' }, { status: 500 });
	}
};