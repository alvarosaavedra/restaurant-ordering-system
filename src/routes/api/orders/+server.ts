import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { order, orderItem, menuItem, user, client } from '$lib/server/db/schema';
import { eq, or } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { orderLogger } from '$lib/server/logger';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	try {
		orderLogger.debug({ event: 'fetching_all_orders' }, 'Fetching all orders');

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

		orderLogger.info({ event: 'orders_fetched', count: orders.length }, 'Fetched all orders');

		return json({ orders });
	} catch (error) {
		orderLogger.error({ event: 'fetch_orders_error', error }, 'Error fetching orders');
		return json({ error: 'Failed to fetch orders' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		orderLogger.warn({ event: 'unauthorized_order_creation' }, 'Unauthorized order creation attempt');
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const data = await request.json();
		const { customerName, customerPhone, deliveryDateTime, address, comment, items } = data;

		orderLogger.info(
			{
				event: 'order_creation_attempt',
				userId: locals.user.id,
				userRole: locals.user.role,
				customerName,
				itemCount: items?.length || 0
			},
			'Order creation attempt'
		);

		if (!customerName?.trim()) {
			orderLogger.warn({ event: 'validation_failed', field: 'customerName' }, 'Customer name is required');
			return json({ error: 'Customer name is required' }, { status: 400 });
		}

		if (!deliveryDateTime) {
			orderLogger.warn({ event: 'validation_failed', field: 'deliveryDateTime' }, 'Delivery date/time is required');
			return json({ error: 'Delivery date/time is required' }, { status: 400 });
		}

		const parsedDeliveryDateTime = new Date(deliveryDateTime);
		if (isNaN(parsedDeliveryDateTime.getTime())) {
			orderLogger.warn({ event: 'validation_failed', field: 'deliveryDateTime', value: deliveryDateTime }, 'Invalid delivery date/time');
			return json({ error: 'Invalid delivery date/time' }, { status: 400 });
		}

		if (!items || items.length === 0) {
			orderLogger.warn({ event: 'validation_failed', field: 'items' }, 'At least one item is required');
			return json({ error: 'At least one item is required' }, { status: 400 });
		}

		const trimmedPhone = customerPhone?.trim() || null;
		const trimmedName = customerName?.trim();

		let existingClient = null;

		if (trimmedPhone) {
			const clientsByPhone = await db
				.select()
				.from(client)
				.where(eq(client.phone, trimmedPhone))
				.limit(1);
			existingClient = clientsByPhone.length > 0 ? clientsByPhone[0] : null;
		}

		if (!existingClient && trimmedName) {
			const clientsByName = await db
				.select()
				.from(client)
				.where(eq(client.name, trimmedName))
				.limit(1);
			existingClient = clientsByName.length > 0 ? clientsByName[0] : null;
		}

		if (!existingClient && trimmedName) {
			const newClientId = nanoid();
			await db.insert(client).values({
				id: newClientId,
				name: trimmedName,
				phone: trimmedPhone,
				address: address?.trim() || null
			});
			orderLogger.info({ event: 'client_created', clientId: newClientId, name: trimmedName, phone: trimmedPhone }, 'New client created');
		} else if (existingClient && address?.trim() && !existingClient.address) {
			await db
				.update(client)
				.set({ address: address.trim() })
				.where(eq(client.id, existingClient.id));
			orderLogger.info({ event: 'client_updated', clientId: existingClient.id }, 'Client address updated');
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
				orderLogger.warn({ event: 'menu_item_not_found', menuItemId: item.menuItemId }, 'Menu item not found');
				return json({ error: `Menu item ${item.menuItemId} not found` }, { status: 400 });
			}

			const menuItemData = menuItemRecord[0];

			if (!menuItemData.isAvailable) {
				orderLogger.warn({ event: 'menu_item_unavailable', menuItemId: item.menuItemId, name: menuItemData.name }, 'Menu item not available');
				return json({ error: `Menu item ${menuItemData.name} is not available` }, { status: 400 });
			}

			const itemTotal = menuItemData.price * item.quantity;
			totalAmount += itemTotal;

			orderItems.push({
				id: nanoid(),
				orderId: '',
				menuItemId: item.menuItemId,
				quantity: item.quantity,
				unitPrice: menuItemData.price
			});
		}

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

		const orderItemsWithOrderId = orderItems.map(item => ({
			...item,
			orderId
		}));

		await db.insert(orderItem).values(orderItemsWithOrderId);

		orderLogger.info(
			{
				event: 'order_created',
				orderId,
				userId: locals.user.id,
				customerName,
				customerPhone,
				totalAmount,
				itemCount: orderItems.length,
				deliveryDateTime: parsedDeliveryDateTime
			},
			'Order created successfully'
		);

		return json({
			success: true,
			orderId,
			message: 'Order created successfully'
		});

	} catch (error) {
		orderLogger.error({ event: 'order_creation_error', userId: locals.user.id, error }, 'Error creating order');
		return json({ error: 'Failed to create order' }, { status: 500 });
	}
};