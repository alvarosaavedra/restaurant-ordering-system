import { fail, error, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { category, menuItem, variationGroup, variation, modifierGroup, modifier, menuItemModifierGroup } from '$lib/server/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		error(403, 'Unauthorized - Admin access required');
	}

	// Redirect to items page
	redirect(302, '/admin/menu/items');
};

export const actions: Actions = {
	addMenuItem: async ({ request }) => {
		const formData = await request.formData();
		console.log('Add Menu Item - Form data received:', Array.from(formData.entries()));
		const name = formData.get('name')?.toString().trim();
		const description = formData.get('description')?.toString().trim() || null;
		const price = formData.get('price');
		const categoryId = formData.get('categoryId')?.toString();
		const isAvailable = formData.get('isAvailable') === 'true';

		if (!name || !price || !categoryId || categoryId === '') {
			return fail(400, {
				error: 'Name, price, and category are required'
			});
		}

		const parsedPrice = parseFloat(price.toString());
		if (isNaN(parsedPrice) || parsedPrice < 0) {
			return fail(400, {
				error: 'Invalid price value'
			});
		}

		try {
			await db.insert(menuItem).values({
				id: crypto.randomUUID(),
				name,
				description,
				price: parsedPrice,
				categoryId,
				isAvailable
			});

			return { success: true, message: 'Menu item added successfully' };
		} catch (err) {
			console.error('Error adding menu item:', err);
			return fail(500, {
				error: 'Failed to add menu item'
			});
		}
	},

	updateMenuItem: async ({ request }) => {
		const formData = await request.formData();
		console.log('Update Menu Item - Form data received:', Array.from(formData.entries()));
		const id = formData.get('id')?.toString();
		const name = formData.get('name')?.toString().trim();
		const description = formData.get('description')?.toString().trim() || null;
		const price = formData.get('price');
		const categoryId = formData.get('categoryId')?.toString();
		const isAvailable = formData.get('isAvailable') === 'true';

		if (!id || !name || !price || !categoryId || categoryId === '') {
			return fail(400, {
				error: 'ID, name, price, and category are required'
			});
		}

		const parsedPrice = parseFloat(price.toString());
		if (isNaN(parsedPrice) || parsedPrice < 0) {
			return fail(400, {
				error: 'Invalid price value'
			});
		}

		try {
			const [existing] = await db
				.select()
				.from(menuItem)
				.where(eq(menuItem.id, id));

			if (!existing) {
				return fail(404, {
					error: 'Menu item not found'
				});
			}

			await db
				.update(menuItem)
				.set({
					name,
					description,
					price: parsedPrice,
					categoryId,
					isAvailable
				})
				.where(eq(menuItem.id, id));

			return { success: true, message: 'Menu item updated successfully' };
		} catch (err) {
			console.error('Error updating menu item:', err);
			return fail(500, {
				error: 'Failed to update menu item'
			});
		}
	},

	deleteMenuItem: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, {
				error: 'Menu item ID is required'
			});
		}

		try {
			const [existing] = await db
				.select()
				.from(menuItem)
				.where(eq(menuItem.id, id));

			if (!existing) {
				return fail(404, {
					error: 'Menu item not found'
				});
			}

			await db.delete(menuItem).where(eq(menuItem.id, id));

			return { success: true, message: 'Menu item deleted successfully' };
		} catch (err) {
			console.error('Error deleting menu item:', err);
			return fail(500, {
				error: 'Failed to delete menu item'
			});
		}
	},

	addCategory: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name')?.toString().trim();
		const displayOrder = formData.get('displayOrder');

		if (!name) {
			return fail(400, {
				error: 'Category name is required'
			});
		}

		try {
			const [maxOrder] = await db
				.select({ maxOrder: category.displayOrder })
				.from(category)
				.orderBy(desc(category.displayOrder))
				.limit(1);

			const nextDisplayOrder = displayOrder
				? parseInt(displayOrder.toString())
				: (maxOrder?.maxOrder ?? 0) + 1;

			await db.insert(category).values({
				id: crypto.randomUUID(),
				name,
				displayOrder: nextDisplayOrder
			});

			return { success: true, message: 'Category added successfully' };
		} catch (err) {
			console.error('Error adding category:', err);
			return fail(500, {
				error: 'Failed to add category'
			});
		}
	},

	updateCategory: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const name = formData.get('name')?.toString().trim();
		const displayOrder = formData.get('displayOrder');

		if (!id || !name || displayOrder === null || displayOrder === '') {
			return fail(400, {
				error: 'ID, name, and display order are required'
			});
		}

		try {
			const [existing] = await db
				.select()
				.from(category)
				.where(eq(category.id, id));

			if (!existing) {
				return fail(404, {
					error: 'Category not found'
				});
			}

			await db
				.update(category)
				.set({
					name,
					displayOrder: parseInt(displayOrder.toString())
				})
				.where(eq(category.id, id));

			return { success: true, message: 'Category updated successfully' };
		} catch (err) {
			console.error('Error updating category:', err);
			return fail(500, {
				error: 'Failed to update category'
			});
		}
	},

	deleteCategory: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, {
				error: 'Category ID is required'
			});
		}

		try {
			const [existing] = await db
				.select()
				.from(category)
				.where(eq(category.id, id));

			if (!existing) {
				return fail(404, {
					error: 'Category not found'
				});
			}

			const [itemCount] = await db
				.select({ count: count() })
				.from(menuItem)
				.where(eq(menuItem.categoryId, id));

			if (itemCount && itemCount.count > 0) {
				return fail(400, {
					error: 'Cannot delete category with menu items. Please delete or reassign items first.'
				});
			}

			await db.delete(category).where(eq(category.id, id));

			return { success: true, message: 'Category deleted successfully' };
		} catch (err) {
			console.error('Error deleting category:', err);
			return fail(500, {
				error: 'Failed to delete category'
			});
		}
	},

	// Variation Group Actions
	addVariationGroup: async ({ request }) => {
		const formData = await request.formData();
		const menuItemId = formData.get('menuItemId')?.toString();
		const name = formData.get('name')?.toString().trim();
		const isRequired = formData.get('isRequired') === 'true';
		const minSelections = parseInt(formData.get('minSelections')?.toString() || '1');
		const maxSelections = parseInt(formData.get('maxSelections')?.toString() || '1');

		if (!menuItemId || !name) {
			return fail(400, { error: 'Menu item ID and group name are required' });
		}

		try {
			await db.insert(variationGroup).values({
				id: crypto.randomUUID(),
				menuItemId,
				name,
				isRequired,
				minSelections,
				maxSelections
			});

			return { success: true, message: 'Variation group added successfully' };
		} catch (err) {
			console.error('Error adding variation group:', err);
			return fail(500, { error: 'Failed to add variation group' });
		}
	},

	updateVariationGroup: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const name = formData.get('name')?.toString().trim();
		const isRequired = formData.get('isRequired') === 'true';
		const minSelections = parseInt(formData.get('minSelections')?.toString() || '1');
		const maxSelections = parseInt(formData.get('maxSelections')?.toString() || '1');

		if (!id || !name) {
			return fail(400, { error: 'Group ID and name are required' });
		}

		try {
			await db.update(variationGroup)
				.set({ name, isRequired, minSelections, maxSelections })
				.where(eq(variationGroup.id, id));

			return { success: true, message: 'Variation group updated successfully' };
		} catch (err) {
			console.error('Error updating variation group:', err);
			return fail(500, { error: 'Failed to update variation group' });
		}
	},

	deleteVariationGroup: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'Group ID is required' });
		}

		try {
			await db.delete(variationGroup).where(eq(variationGroup.id, id));
			return { success: true, message: 'Variation group deleted successfully' };
		} catch (err) {
			console.error('Error deleting variation group:', err);
			return fail(500, { error: 'Failed to delete variation group' });
		}
	},

	// Variation Actions
	addVariation: async ({ request }) => {
		const formData = await request.formData();
		const groupId = formData.get('groupId')?.toString();
		const name = formData.get('name')?.toString().trim();
		const priceAdjustment = parseFloat(formData.get('priceAdjustment')?.toString() || '0');
		const isDefault = formData.get('isDefault') === 'true';
		const displayOrder = parseInt(formData.get('displayOrder')?.toString() || '0');

		if (!groupId || !name) {
			return fail(400, { error: 'Group ID and variation name are required' });
		}

		try {
			await db.insert(variation).values({
				id: crypto.randomUUID(),
				groupId,
				name,
				priceAdjustment,
				isDefault,
				displayOrder
			});

			return { success: true, message: 'Variation added successfully' };
		} catch (err) {
			console.error('Error adding variation:', err);
			return fail(500, { error: 'Failed to add variation' });
		}
	},

	updateVariation: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const name = formData.get('name')?.toString().trim();
		const priceAdjustment = parseFloat(formData.get('priceAdjustment')?.toString() || '0');
		const isDefault = formData.get('isDefault') === 'true';
		const displayOrder = parseInt(formData.get('displayOrder')?.toString() || '0');

		if (!id || !name) {
			return fail(400, { error: 'Variation ID and name are required' });
		}

		try {
			await db.update(variation)
				.set({ name, priceAdjustment, isDefault, displayOrder })
				.where(eq(variation.id, id));

			return { success: true, message: 'Variation updated successfully' };
		} catch (err) {
			console.error('Error updating variation:', err);
			return fail(500, { error: 'Failed to update variation' });
		}
	},

	deleteVariation: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'Variation ID is required' });
		}

		try {
			await db.delete(variation).where(eq(variation.id, id));
			return { success: true, message: 'Variation deleted successfully' };
		} catch (err) {
			console.error('Error deleting variation:', err);
			return fail(500, { error: 'Failed to delete variation' });
		}
	},

	// Modifier Group Actions
	addModifierGroup: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name')?.toString().trim();
		const minSelections = parseInt(formData.get('minSelections')?.toString() || '0');
		const maxSelections = formData.get('maxSelections')?.toString();

		if (!name) {
			return fail(400, { error: 'Group name is required' });
		}

		try {
			await db.insert(modifierGroup).values({
				id: crypto.randomUUID(),
				name,
				minSelections,
				maxSelections: maxSelections ? parseInt(maxSelections) : null
			});

			return { success: true, message: 'Modifier group added successfully' };
		} catch (err) {
			console.error('Error adding modifier group:', err);
			return fail(500, { error: 'Failed to add modifier group' });
		}
	},

	updateModifierGroup: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const name = formData.get('name')?.toString().trim();
		const minSelections = parseInt(formData.get('minSelections')?.toString() || '0');
		const maxSelections = formData.get('maxSelections')?.toString();

		if (!id || !name) {
			return fail(400, { error: 'Group ID and name are required' });
		}

		try {
			await db.update(modifierGroup)
				.set({
					name,
					minSelections,
					maxSelections: maxSelections ? parseInt(maxSelections) : null
				})
				.where(eq(modifierGroup.id, id));

			return { success: true, message: 'Modifier group updated successfully' };
		} catch (err) {
			console.error('Error updating modifier group:', err);
			return fail(500, { error: 'Failed to update modifier group' });
		}
	},

	deleteModifierGroup: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'Group ID is required' });
		}

		try {
			await db.delete(modifierGroup).where(eq(modifierGroup.id, id));
			return { success: true, message: 'Modifier group deleted successfully' };
		} catch (err) {
			console.error('Error deleting modifier group:', err);
			return fail(500, { error: 'Failed to delete modifier group' });
		}
	},

	// Modifier Actions
	addModifier: async ({ request }) => {
		const formData = await request.formData();
		const groupId = formData.get('groupId')?.toString();
		const name = formData.get('name')?.toString().trim();
		const price = parseFloat(formData.get('price')?.toString() || '0');
		const isAvailable = formData.get('isAvailable') === 'true';
		const displayOrder = parseInt(formData.get('displayOrder')?.toString() || '0');

		if (!groupId || !name) {
			return fail(400, { error: 'Group ID and modifier name are required' });
		}

		try {
			await db.insert(modifier).values({
				id: crypto.randomUUID(),
				groupId,
				name,
				price,
				isAvailable,
				displayOrder
			});

			return { success: true, message: 'Modifier added successfully' };
		} catch (err) {
			console.error('Error adding modifier:', err);
			return fail(500, { error: 'Failed to add modifier' });
		}
	},

	updateModifier: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const name = formData.get('name')?.toString().trim();
		const price = parseFloat(formData.get('price')?.toString() || '0');
		const isAvailable = formData.get('isAvailable') === 'true';
		const displayOrder = parseInt(formData.get('displayOrder')?.toString() || '0');

		if (!id || !name) {
			return fail(400, { error: 'Modifier ID and name are required' });
		}

		try {
			await db.update(modifier)
				.set({ name, price, isAvailable, displayOrder })
				.where(eq(modifier.id, id));

			return { success: true, message: 'Modifier updated successfully' };
		} catch (err) {
			console.error('Error updating modifier:', err);
			return fail(500, { error: 'Failed to update modifier' });
		}
	},

	deleteModifier: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'Modifier ID is required' });
		}

		try {
			await db.delete(modifier).where(eq(modifier.id, id));
			return { success: true, message: 'Modifier deleted successfully' };
		} catch (err) {
			console.error('Error deleting modifier:', err);
			return fail(500, { error: 'Failed to delete modifier' });
		}
	},

	// Modifier Assignment Actions
	assignModifierGroup: async ({ request }) => {
		const formData = await request.formData();
		const menuItemId = formData.get('menuItemId')?.toString();
		const modifierGroupId = formData.get('modifierGroupId')?.toString();
		const isRequired = formData.get('isRequired') === 'true';
		const minSelections = parseInt(formData.get('minSelections')?.toString() || '0');
		const maxSelections = formData.get('maxSelections')?.toString();

		if (!menuItemId || !modifierGroupId) {
			return fail(400, { error: 'Menu item ID and modifier group ID are required' });
		}

		try {
			await db.insert(menuItemModifierGroup).values({
				id: crypto.randomUUID(),
				menuItemId,
				modifierGroupId,
				isRequired,
				minSelections,
				maxSelections: maxSelections ? parseInt(maxSelections) : null
			});

			return { success: true, message: 'Modifier group assigned successfully' };
		} catch (err) {
			console.error('Error assigning modifier group:', err);
			return fail(500, { error: 'Failed to assign modifier group' });
		}
	},

	unassignModifierGroup: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'Assignment ID is required' });
		}

		try {
			await db.delete(menuItemModifierGroup).where(eq(menuItemModifierGroup.id, id));
			return { success: true, message: 'Modifier group unassigned successfully' };
		} catch (err) {
			console.error('Error unassigning modifier group:', err);
			return fail(500, { error: 'Failed to unassign modifier group' });
		}
	}
};
