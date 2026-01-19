import { db } from '$lib/server/db';
import { category, menuItem } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Ensure user is authenticated before loading menu data
	if (!locals.user) {
		return { categories: [], menuItems: [] };
	}

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
				
				// Add category to each item
				const itemsWithCategory = items.map(item => ({
					...item,
					category: cat
				}));
				
				return {
					id: cat.id,
					name: cat.name,
					displayOrder: cat.displayOrder,
					createdAt: cat.createdAt,
					items: itemsWithCategory
				};
			})
		);

		return {
			categories: menuItemsWithCategories
		};
	} catch (error) {
		console.error('Error fetching menu:', error);
		return { 
			categories: [], 
			menuItems: [],
			error: 'Failed to fetch menu'
		};
	}
};