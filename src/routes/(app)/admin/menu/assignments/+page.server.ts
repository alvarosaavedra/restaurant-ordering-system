import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { category, menuItem, modifierGroup, menuItemModifierGroup } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		error(403, 'Unauthorized - Admin access required');
	}

	try {
		const menuItems = await db
			.select({
				id: menuItem.id,
				categoryId: menuItem.categoryId,
				name: menuItem.name,
				description: menuItem.description,
				price: menuItem.price,
				isAvailable: menuItem.isAvailable,
				createdAt: menuItem.createdAt,
				category: {
					id: category.id,
					name: category.name,
					displayOrder: category.displayOrder,
					createdAt: category.createdAt
				}
			})
			.from(menuItem)
			.leftJoin(category, eq(menuItem.categoryId, category.id))
			.orderBy(category.displayOrder, menuItem.name);

		// Load modifier groups
		const modifierGroups = await db
			.select()
			.from(modifierGroup)
			.orderBy(modifierGroup.displayOrder);

		// Load modifier assignments
		const assignments = await db
			.select()
			.from(menuItemModifierGroup);

		return {
			menuItems,
			modifierGroups,
			assignments
		};
	} catch (err) {
		console.error('Error loading assignments:', err);
		error(500, 'Failed to load assignments');
	}
};
