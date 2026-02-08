import { db } from '$lib/server/db';
import { category, menuItem, variationGroup, variation, modifierGroup, modifier, menuItemModifierGroup } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Ensure user is authenticated before loading menu data
	if (!locals.user) {
		return { categories: [], menuItems: [] };
	}

		try {
		// Fetch all categories with their menu items
		const categories = await db.select().from(category).orderBy(category.displayOrder);
		
		// Load all variations
		const variationGroups = await db
			.select()
			.from(variationGroup)
			.orderBy(variationGroup.displayOrder);
		
		const variations = await db
			.select()
			.from(variation)
			.orderBy(variation.displayOrder);
		
		// Load all modifiers
		const modifierGroups = await db
			.select()
			.from(modifierGroup)
			.orderBy(modifierGroup.displayOrder);
		
		const modifiers = await db
			.select()
			.from(modifier)
			.orderBy(modifier.displayOrder);
		
		// Load modifier assignments
		const assignments = await db
			.select()
			.from(menuItemModifierGroup);
		
		const menuItemsWithCategories = await Promise.all(
			categories.map(async (cat) => {
				const items = await db
					.select()
					.from(menuItem)
					.where(eq(menuItem.categoryId, cat.id))
					.orderBy(menuItem.name);
				
				// Add category and variations to each item
				const itemsWithDetails = items.map(item => {
					const itemVariationGroups = variationGroups
						.filter(vg => vg.menuItemId === item.id)
						.map(vg => ({
							...vg,
							variations: variations.filter(v => v.groupId === vg.id)
						}));
					
					const itemModifierGroupIds = assignments
						.filter(a => a.menuItemId === item.id)
						.map(a => a.modifierGroupId);
					
					const itemModifierGroups = modifierGroups
						.filter(mg => itemModifierGroupIds.includes(mg.id))
						.map(mg => ({
							...mg,
							modifiers: modifiers.filter(m => m.groupId === mg.id && m.isAvailable)
						}));
					
					return {
						...item,
						category: cat,
						variationGroups: itemVariationGroups,
						modifierGroups: itemModifierGroups,
						hasCustomizations: itemVariationGroups.length > 0 || itemModifierGroups.length > 0
					};
				});
				
				return {
					id: cat.id,
					name: cat.name,
					displayOrder: cat.displayOrder,
					createdAt: cat.createdAt,
					items: itemsWithDetails
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
