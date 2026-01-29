import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { order } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { orderLogger } from '$lib/server/logger';
import type { RequestHandler } from '@sveltejs/kit';
import type { OrderStatus } from '$lib/types/orders';

export const PATCH: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		orderLogger.warn({ event: 'unauthorized_status_update' }, 'Unauthorized status update attempt');
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { orderId, status } = await request.json();

		if (!orderId) {
			orderLogger.warn({ event: 'validation_failed', field: 'orderId' }, 'Order ID is required');
			return json({ error: 'Order ID is required' }, { status: 400 });
		}

		if (!status || !['pending', 'preparing', 'ready', 'delivered'].includes(status)) {
			orderLogger.warn({ event: 'validation_failed', field: 'status', value: status }, 'Invalid status');
			return json({ error: 'Invalid status' }, { status: 400 });
		}

		orderLogger.info(
			{
				event: 'status_update_attempt',
				orderId,
				newStatus: status,
				userId: locals.user.id,
				userRole: locals.user.role
			},
			'Status update attempt'
		);

		if (locals.user.role === 'kitchen' && (status === 'delivered' || status === 'pending')) {
			orderLogger.warn({ event: 'permission_denied', userId: locals.user.id, role: locals.user.role, requestedStatus: status }, 'Kitchen staff can only update to preparing or ready');
			return json({ error: 'Kitchen staff can only update to preparing or ready' }, { status: 403 });
		}

		if (locals.user.role === 'delivery' && (status === 'pending' || status === 'preparing' || status === 'ready')) {
			orderLogger.warn({ event: 'permission_denied', userId: locals.user.id, role: locals.user.role, requestedStatus: status }, 'Delivery staff can only update to delivered');
			return json({ error: 'Delivery staff can only update to delivered' }, { status: 403 });
		}

		const [orderRecord] = await db
			.select()
			.from(order)
			.where(eq(order.id, orderId));

		if (!orderRecord) {
			return json({ error: 'Order not found' }, { status: 404 });
		}

		if (orderRecord.deletedAt) {
			return json({ error: 'Cannot update status of deleted order' }, { status: 400 });
		}

		await db
			.update(order)
			.set({ status: status as OrderStatus, updatedAt: new Date() })
			.where(eq(order.id, orderId));

		orderLogger.info(
			{
				event: 'status_updated',
				orderId,
				newStatus: status,
				userId: locals.user.id,
				userRole: locals.user.role
			},
			'Order status updated'
		);

		return json({ success: true, message: 'Order status updated' });
	} catch (error) {
		orderLogger.error({ event: 'status_update_error', userId: locals.user.id, error }, 'Error updating order status');
		return json({ error: 'Failed to update order status' }, { status: 500 });
	}
};
