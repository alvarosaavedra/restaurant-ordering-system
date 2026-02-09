import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { order, orderItem, menuItem, user, client, orderItemVariation, orderItemModifier, variation, modifier } from '$lib/server/db/schema';
import { eq, isNull } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { orderLogger } from '$lib/server/logger';
import type { RequestHandler } from '@sveltejs/kit';

interface OrderItemInput {
	menuItemId: string;
	quantity: number;
	variations?: {
		groupId: string;
		variationId: string;
	}[];
	modifiers?: {
		modifierId: string;
		quantity: number;
	}[];
	discount?: {
		type: 'fixed' | 'percentage';
		value: number;
		reason?: string;
	};
}

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
			.where(isNull(order.deletedAt))
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
		const { customerName, customerPhone, deliveryDateTime, address, comment, items, orderDiscount } = data;

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
		const orderItemsData: {
			orderItemId: string;
			orderItem: typeof orderItem.$inferInsert;
			variations: { groupId: string; variationId: string }[];
			modifiers: { modifierId: string; quantity: number; priceAtOrder: number }[];
		}[] = [];

		for (const item of items as OrderItemInput[]) {
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

			// Calculate base price with variations
			let baseUnitPrice = menuItemData.price;
			const itemVariations: { groupId: string; variationId: string }[] = [];
			
			if (item.variations && item.variations.length > 0) {
				for (const varInput of item.variations) {
					const variationRecord = await db
						.select()
						.from(variation)
						.where(eq(variation.id, varInput.variationId))
						.limit(1);
					
					if (variationRecord && variationRecord.length > 0) {
						baseUnitPrice += variationRecord[0].priceAdjustment;
						itemVariations.push({
							groupId: varInput.groupId,
							variationId: varInput.variationId
						});
					}
				}
			}

			// Calculate modifier prices
			const itemModifiers: { modifierId: string; quantity: number; priceAtOrder: number }[] = [];
			
			if (item.modifiers && item.modifiers.length > 0) {
				for (const modInput of item.modifiers) {
					const modifierRecord = await db
						.select()
						.from(modifier)
						.where(eq(modifier.id, modInput.modifierId))
						.limit(1);
					
					if (modifierRecord && modifierRecord.length > 0 && modifierRecord[0].isAvailable) {
						const modPrice = modifierRecord[0].price;
						baseUnitPrice += modPrice * modInput.quantity;
						itemModifiers.push({
							modifierId: modInput.modifierId,
							quantity: modInput.quantity,
							priceAtOrder: modPrice
						});
					}
				}
			}

			// Calculate item total with quantity
			const itemTotal = baseUnitPrice * item.quantity;
			
			// Apply item discount if present
			let finalPrice = itemTotal;
			let discountAmount = 0;
			
			if (item.discount) {
				if (item.discount.type === 'percentage') {
					discountAmount = itemTotal * (item.discount.value / 100);
				} else {
					discountAmount = item.discount.value;
				}
				finalPrice = Math.max(0, itemTotal - discountAmount);
			}

			totalAmount += finalPrice;

			const orderItemId = nanoid();
			orderItemsData.push({
				orderItemId,
				orderItem: {
					id: orderItemId,
					orderId: '',
					menuItemId: item.menuItemId,
					quantity: item.quantity,
					unitPrice: baseUnitPrice,
					finalPrice: finalPrice,
					...(item.discount && {
						discountType: item.discount.type,
						discountValue: item.discount.value,
						discountAmount: discountAmount,
						discountReason: item.discount.reason
					})
				},
				variations: itemVariations,
				modifiers: itemModifiers
			});
		}

		// Apply order-level discount
		let orderDiscountAmount = 0;
		if (orderDiscount) {
			if (orderDiscount.type === 'percentage') {
				orderDiscountAmount = totalAmount * (orderDiscount.value / 100);
			} else {
				orderDiscountAmount = orderDiscount.value;
			}
			totalAmount = Math.max(0, totalAmount - orderDiscountAmount);
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
			employeeId: locals.user.id,
			...(orderDiscount && {
				discountType: orderDiscount.type,
				discountValue: orderDiscount.value,
				discountAmount: orderDiscountAmount,
				discountReason: orderDiscount.reason
			})
		});

		// Insert order items with orderId
		const orderItemsWithOrderId = orderItemsData.map(({ orderItem: item }) => ({
			...item,
			orderId
		}));

		await db.insert(orderItem).values(orderItemsWithOrderId);

		// Insert variations
		const allVariations: typeof orderItemVariation.$inferInsert[] = [];
		for (const { orderItemId, variations } of orderItemsData) {
			if (variations.length > 0) {
				for (const varData of variations) {
					allVariations.push({
						id: nanoid(),
						orderItemId: orderItemId,
						variationGroupId: varData.groupId,
						variationId: varData.variationId
					});
				}
			}
		}

		if (allVariations.length > 0) {
			await db.insert(orderItemVariation).values(allVariations);
		}

		// Insert modifiers
		const allModifiers: typeof orderItemModifier.$inferInsert[] = [];
		for (const { orderItemId, modifiers } of orderItemsData) {
			if (modifiers.length > 0) {
				for (const modData of modifiers) {
					allModifiers.push({
						id: nanoid(),
						orderItemId: orderItemId,
						modifierId: modData.modifierId,
						quantity: modData.quantity,
						priceAtOrder: modData.priceAtOrder
					});
				}
			}
		}

		if (allModifiers.length > 0) {
			await db.insert(orderItemModifier).values(allModifiers);
		}

		orderLogger.info(
			{
				event: 'order_created',
				orderId,
				userId: locals.user.id,
				customerName,
				customerPhone,
				totalAmount,
				itemCount: orderItemsData.length,
				variationCount: allVariations.length,
				modifierCount: allModifiers.length,
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