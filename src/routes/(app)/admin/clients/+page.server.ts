import { fail, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { client, order } from '$lib/server/db/schema';
import { eq, desc, count, and, isNull } from 'drizzle-orm';
import { adminLogger } from '$lib/server/logger';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		adminLogger.warn({ event: 'access_denied', userId: locals.user?.id, role: locals.user?.role }, 'Unauthorized access to admin clients');
		error(403, 'Unauthorized - Admin access required');
	}

	try {
		adminLogger.debug({ event: 'fetching_clients', userId: locals.user.id }, 'Fetching clients');

		const clients = await db.select().from(client).orderBy(desc(client.createdAt));

		const clientsWithOrderCount = await Promise.all(
			clients.map(async (c) => {
				const [result] = await db
					.select({ count: count() })
					.from(order)
					.where(and(isNull(order.deletedAt), eq(order.customerPhone, c.phone)));

				return {
					...c,
					orderCount: result?.count || 0
				};
			})
		);

		adminLogger.info({ event: 'clients_fetched', userId: locals.user.id, count: clients.length }, 'Clients fetched');

		return {
			clients: clientsWithOrderCount
		};
	} catch (err) {
		adminLogger.error({ event: 'fetch_clients_error', userId: locals.user.id, error: err }, 'Error loading admin clients data');
		error(500, 'Failed to load clients data');
	}
};

export const actions: Actions = {
	addClient: async ({ request, locals }) => {
		if (!locals.user) {
			adminLogger.warn({ event: 'unauthorized', action: 'addClient' }, 'Unauthorized add client attempt');
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const name = formData.get('name')?.toString().trim();
		const phone = formData.get('phone')?.toString().trim();
		const address = formData.get('address')?.toString().trim() || null;

		if (!name || !phone) {
			adminLogger.warn({ event: 'validation_failed', action: 'addClient', fields: ['name', 'phone'] }, 'Name and phone number are required');
			return fail(400, {
				error: 'Name and phone number are required'
			});
		}

		if (!/^\+?[\d\s-()]+$/.test(phone)) {
			adminLogger.warn({ event: 'validation_failed', action: 'addClient', field: 'phone', value: phone }, 'Invalid phone number format');
			return fail(400, {
				error: 'Invalid phone number format'
			});
		}

		try {
			const [existing] = await db
				.select()
				.from(client)
				.where(eq(client.phone, phone));

			if (existing) {
				adminLogger.warn({ event: 'client_already_exists', phone }, 'A client with this phone number already exists');
				return fail(400, {
					error: 'A client with this phone number already exists'
				});
			}

			const clientId = crypto.randomUUID();
			await db.insert(client).values({
				id: clientId,
				name,
				phone,
				address
			});

			adminLogger.info({ event: 'client_added', clientId, name, phone, userId: locals.user.id }, 'Client added successfully');

			return { success: true, message: 'Client added successfully' };
		} catch (err) {
			adminLogger.error({ event: 'add_client_error', userId: locals.user.id, error: err }, 'Error adding client');
			return fail(500, {
				error: 'Failed to add client'
			});
		}
	},

	updateClient: async ({ request, locals }) => {
		if (!locals.user) {
			adminLogger.warn({ event: 'unauthorized', action: 'updateClient' }, 'Unauthorized update client attempt');
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const name = formData.get('name')?.toString().trim();
		const phone = formData.get('phone')?.toString().trim();
		const address = formData.get('address')?.toString().trim() || null;

		if (!id || !name || !phone) {
			adminLogger.warn({ event: 'validation_failed', action: 'updateClient', fields: ['id', 'name', 'phone'] }, 'ID, name, and phone number are required');
			return fail(400, {
				error: 'ID, name, and phone number are required'
			});
		}

		if (!/^\+?[\d\s-()]+$/.test(phone)) {
			adminLogger.warn({ event: 'validation_failed', action: 'updateClient', field: 'phone', value: phone }, 'Invalid phone number format');
			return fail(400, {
				error: 'Invalid phone number format'
			});
		}

		try {
			const [existing] = await db
				.select()
				.from(client)
				.where(eq(client.id, id));

			if (!existing) {
				adminLogger.warn({ event: 'client_not_found', clientId: id }, 'Client not found');
				return fail(404, {
					error: 'Client not found'
				});
			}

			const [phoneExists] = await db
				.select()
				.from(client)
				.where(eq(client.phone, phone));

			if (phoneExists && phoneExists.id !== id) {
				adminLogger.warn({ event: 'phone_already_exists', phone, clientId: id }, 'A client with this phone number already exists');
				return fail(400, {
					error: 'A client with this phone number already exists'
				});
			}

			await db
				.update(client)
				.set({
					name,
					phone,
					address,
					updatedAt: new Date()
				})
				.where(eq(client.id, id));

			adminLogger.info({ event: 'client_updated', clientId: id, name, phone, userId: locals.user.id }, 'Client updated successfully');

			return { success: true, message: 'Client updated successfully' };
		} catch (err) {
			adminLogger.error({ event: 'update_client_error', clientId: id, userId: locals.user.id, error: err }, 'Error updating client');
			return fail(500, {
				error: 'Failed to update client'
			});
		}
	},

	deleteClient: async ({ request, locals }) => {
		if (!locals.user) {
			adminLogger.warn({ event: 'unauthorized', action: 'deleteClient' }, 'Unauthorized delete client attempt');
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			adminLogger.warn({ event: 'validation_failed', action: 'deleteClient', field: 'id' }, 'Client ID is required');
			return fail(400, {
				error: 'Client ID is required'
			});
		}

		try {
			const [existing] = await db
				.select()
				.from(client)
				.where(eq(client.id, id));

			if (!existing) {
				adminLogger.warn({ event: 'client_not_found', clientId: id }, 'Client not found');
				return fail(404, {
					error: 'Client not found'
				});
			}

const [orderCount] = await db
			.select({ count: count() })
			.from(order)
			.where(and(isNull(order.deletedAt), eq(order.customerPhone, existing.phone)));

			if (orderCount && orderCount.count > 0) {
				adminLogger.warn({ event: 'delete_blocked', clientId: id, reason: 'has_orders', orderCount: orderCount.count }, 'Cannot delete client with existing orders');
				return fail(400, {
					error: 'Cannot delete client with existing orders'
				});
			}

			await db.delete(client).where(eq(client.id, id));

			adminLogger.info({ event: 'client_deleted', clientId: id, name: existing.name, phone: existing.phone, userId: locals.user.id }, 'Client deleted successfully');

			return { success: true, message: 'Client deleted successfully' };
		} catch (err) {
			adminLogger.error({ event: 'delete_client_error', clientId: id, userId: locals.user.id, error: err }, 'Error deleting client');
			return fail(500, {
				error: 'Failed to delete client'
			});
		}
	}
};
