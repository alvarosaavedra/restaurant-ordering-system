import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { order, orderItem, menuItem } from '$lib/server/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import type { RequestHandler } from '@sveltejs/kit';
import type { OrderStatus } from '$lib/types/orders';

export const PATCH: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { orderId, status } = await request.json();

		// Validate input
		if (!orderId) {
			return json({ error: 'Order ID is required' }, { status: 400 });
		}

		if (!status || !['pending', 'preparing', 'ready', 'delivered'].includes(status)) {
			return json({ error: 'Invalid status' }, { status: 400 });
		}

		// Check if user has permission to update status
		if (locals.user.role === 'kitchen' && (status === 'delivered' || status === 'pending')) {
			return json({ error: 'Kitchen staff can only update to preparing or ready' }, { status: 403 });
		}

		if (locals.user.role === 'delivery' && (status === 'pending' || status === 'preparing' || status === 'ready')) {
			return json({ error: 'Delivery staff can only update to delivered' }, { status: 403 });
		}

		// Update order status
		await db
			.update(order)
			.set({ status: status as OrderStatus, updatedAt: new Date() })
			.where(eq(order.id, orderId));

		return json({ success: true, message: 'Order status updated' });
	} catch (error) {
		console.error('Error updating order status:', error);
		return json({ error: 'Failed to update order status' }, { status: 500 });
	}
};
