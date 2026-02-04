import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { category, menuItem } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
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

		const menuItems = await db
			.select({
				id: menuItem.id,
				categoryId: menuItem.categoryId,
				name: menuItem.name,
				description: menuItem.description,
				price: menuItem.price,
				isAvailable: menuItem.isAvailable
			})
			.from(menuItem)
			.where(eq(menuItem.isAvailable, true))
			.orderBy(menuItem.name);

		const categoriesWithItems = categories.map((cat) => ({
			...cat,
			items: menuItems.filter((item) => item.categoryId === cat.id)
		}));

		return {
			categories: categoriesWithItems
		};
	} catch (err) {
		console.error('Error loading menu share data:', err);
		error(500, 'Failed to load menu data');
	}
};
