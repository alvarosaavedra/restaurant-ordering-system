import { fail, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { modifierGroup, modifier, menuItemModifierGroup, menuItem } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		error(403, 'Unauthorized - Admin access required');
	}

	try {
		// Load all modifier groups
		const groups = await db
			.select()
			.from(modifierGroup)
			.orderBy(modifierGroup.displayOrder);

		// Load all modifiers
		const modifiers = await db
			.select()
			.from(modifier)
			.orderBy(modifier.displayOrder);

		// Group modifiers by their groups
		const modifierGroupsWithModifiers = groups.map(group => ({
			...group,
			modifiers: modifiers.filter(m => m.groupId === group.id)
		}));

		// Load all menu items for assignment
		const menuItems = await db
			.select({
				id: menuItem.id,
				name: menuItem.name,
				price: menuItem.price
			})
			.from(menuItem)
			.orderBy(menuItem.name);

		// Load current assignments
		const assignments = await db
			.select()
			.from(menuItemModifierGroup);

		return {
			modifierGroups: modifierGroupsWithModifiers,
			menuItems,
			assignments
		};
	} catch (err) {
		console.error('Error loading modifier data:', err);
		error(500, 'Failed to load modifier data');
	}
};

export const actions: Actions = {
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

	// Assignment Actions
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

	updateAssignment: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const isRequired = formData.get('isRequired') === 'true';
		const minSelections = parseInt(formData.get('minSelections')?.toString() || '0');
		const maxSelections = formData.get('maxSelections')?.toString();

		if (!id) {
			return fail(400, { error: 'Assignment ID is required' });
		}

		try {
			await db.update(menuItemModifierGroup)
				.set({
					isRequired,
					minSelections,
					maxSelections: maxSelections ? parseInt(maxSelections) : null
				})
				.where(eq(menuItemModifierGroup.id, id));

			return { success: true, message: 'Assignment updated successfully' };
		} catch (err) {
			console.error('Error updating assignment:', err);
			return fail(500, { error: 'Failed to update assignment' });
		}
	},

	removeAssignment: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'Assignment ID is required' });
		}

		try {
			await db.delete(menuItemModifierGroup).where(eq(menuItemModifierGroup.id, id));
			return { success: true, message: 'Assignment removed successfully' };
		} catch (err) {
			console.error('Error removing assignment:', err);
			return fail(500, { error: 'Failed to remove assignment' });
		}
	}
};
