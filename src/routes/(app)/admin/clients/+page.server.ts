import { fail, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { client, order } from '$lib/server/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		error(403, 'Unauthorized - Admin access required');
	}

	try {
		const clients = await db.select().from(client).orderBy(desc(client.createdAt));

		const clientsWithOrderCount = await Promise.all(
			clients.map(async (c) => {
				const [result] = await db
					.select({ count: count() })
					.from(order)
					.where(eq(order.customerPhone, c.phone));

				return {
					...c,
					orderCount: result?.count || 0
				};
			})
		);

		return {
			clients: clientsWithOrderCount
		};
	} catch (err) {
		console.error('Error loading admin clients data:', err);
		error(500, 'Failed to load clients data');
	}
};

export const actions: Actions = {
	addClient: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name')?.toString().trim();
		const phone = formData.get('phone')?.toString().trim();
		const address = formData.get('address')?.toString().trim() || null;

		if (!name || !phone) {
			return fail(400, {
				error: 'Name and phone number are required'
			});
		}

		if (!/^\+?[\d\s-()]+$/.test(phone)) {
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
				return fail(400, {
					error: 'A client with this phone number already exists'
				});
			}

			await db.insert(client).values({
				id: crypto.randomUUID(),
				name,
				phone,
				address
			});

			return { success: true, message: 'Client added successfully' };
		} catch (err) {
			console.error('Error adding client:', err);
			return fail(500, {
				error: 'Failed to add client'
			});
		}
	},

	updateClient: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const name = formData.get('name')?.toString().trim();
		const phone = formData.get('phone')?.toString().trim();
		const address = formData.get('address')?.toString().trim() || null;

		if (!id || !name || !phone) {
			return fail(400, {
				error: 'ID, name, and phone number are required'
			});
		}

		if (!/^\+?[\d\s-()]+$/.test(phone)) {
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
				return fail(404, {
					error: 'Client not found'
				});
			}

			const [phoneExists] = await db
				.select()
				.from(client)
				.where(eq(client.phone, phone));

			if (phoneExists && phoneExists.id !== id) {
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

			return { success: true, message: 'Client updated successfully' };
		} catch (err) {
			console.error('Error updating client:', err);
			return fail(500, {
				error: 'Failed to update client'
			});
		}
	},

	deleteClient: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
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
				return fail(404, {
					error: 'Client not found'
				});
			}

			const [orderCount] = await db
				.select({ count: count() })
				.from(order)
				.where(eq(order.customerPhone, existing.phone));

			if (orderCount && orderCount.count > 0) {
				return fail(400, {
					error: 'Cannot delete client with existing orders'
				});
			}

			await db.delete(client).where(eq(client.id, id));

			return { success: true, message: 'Client deleted successfully' };
		} catch (err) {
			console.error('Error deleting client:', err);
			return fail(500, {
				error: 'Failed to delete client'
			});
		}
	}
};
