import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { category, menuItem, variationGroup, variation } from '$lib/server/db/schema';
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

		// Load variation groups with their variations
		const variationGroups = await db
			.select()
			.from(variationGroup)
			.orderBy(variationGroup.displayOrder);

		const variations = await db
			.select()
			.from(variation)
			.orderBy(variation.displayOrder);

		// Group variations by their groups
		const variationGroupsWithVariations = variationGroups.map(group => ({
			...group,
			variations: variations.filter(v => v.groupId === group.id)
		}));

		return {
			menuItems,
			variationGroups: variationGroupsWithVariations
		};
	} catch (err) {
		console.error('Error loading variations:', err);
		error(500, 'Failed to load variations');
	}
};
