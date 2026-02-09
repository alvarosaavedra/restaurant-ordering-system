import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { modifierGroup, modifier } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		error(403, 'Unauthorized - Admin access required');
	}

	try {
		// Load modifier groups
		const modifierGroups = await db
			.select()
			.from(modifierGroup)
			.orderBy(modifierGroup.displayOrder);

		const modifiers = await db
			.select()
			.from(modifier)
			.orderBy(modifier.displayOrder);

		const modifierGroupsWithModifiers = modifierGroups.map(group => ({
			...group,
			modifiers: modifiers.filter(m => m.groupId === group.id)
		}));

		return {
			modifierGroups: modifierGroupsWithModifiers
		};
	} catch (err) {
		console.error('Error loading modifiers:', err);
		error(500, 'Failed to load modifiers');
	}
};
