import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { category, menuItem } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	try {
		// Fetch all categories with their menu items
		const categories = await db.select().from(category).orderBy(category.displayOrder);
		
		const menuItemsWithCategories = await Promise.all(
			categories.map(async (cat) => {
				const items = await db
					.select()
					.from(menuItem)
					.where(eq(menuItem.categoryId, cat.id))
					.orderBy(menuItem.name);
				
				return {
					...cat,
					items
				};
			})
		);

		return json({
			categories: menuItemsWithCategories
		});
	} catch (error) {
		console.error('Error fetching menu:', error);
		return json({ error: 'Failed to fetch menu' }, { status: 500 });
	}
};