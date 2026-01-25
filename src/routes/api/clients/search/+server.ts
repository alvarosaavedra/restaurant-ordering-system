import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { client } from '$lib/server/db/schema';
import { like, or } from 'drizzle-orm';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const search = url.searchParams.get('q');

	// Require at least 2 characters to search
	if (!search || search.length < 2) {
		return json([]);
	}

	try {
		const results = await db
			.select({
				id: client.id,
				name: client.name,
				phone: client.phone,
				address: client.address
			})
			.from(client)
			.where(
				or(
					like(client.name, `%${search}%`)
				)
			)
			.orderBy(client.name)
			.limit(10);

		return json(results);
	} catch (error) {
		console.error('Error searching clients:', error);
		return json({ error: 'Search failed' }, { status: 500 });
	}
};
