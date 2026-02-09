import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { category, menuItem } from '$lib/server/db/schema';
import { eq, count } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		error(403, 'Unauthorized - Admin access required');
	}

	try {
		const categories = await db
			.select()
			.from(category)
			.orderBy(category.displayOrder);

		const categoriesWithCount = await Promise.all(
			categories.map(async (cat) => {
				const [result] = await db
					.select({ count: count() })
					.from(menuItem)
					.where(eq(menuItem.categoryId, cat.id));

				return {
					...cat,
					itemCount: result?.count || 0
				};
			})
		);

		return {
			categories: categoriesWithCount
		};
	} catch (err) {
		console.error('Error loading categories:', err);
		error(500, 'Failed to load categories');
	}
};
