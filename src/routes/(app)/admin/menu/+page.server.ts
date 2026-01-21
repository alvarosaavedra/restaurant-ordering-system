import { fail, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { category, menuItem } from '$lib/server/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

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
			menuItems,
			categories: categoriesWithCount
		};
	} catch (err) {
		console.error('Error loading admin menu data:', err);
		error(500, 'Failed to load menu data');
	}
};

export const actions: Actions = {
	addMenuItem: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString().trim();
		const description = data.get('description')?.toString().trim() || null;
		const price = data.get('price');
		const categoryId = data.get('categoryId')?.toString();
		const isAvailable = data.get('isAvailable') === 'true';

		if (!name || !price || !categoryId) {
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
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const name = data.get('name')?.toString().trim();
		const description = data.get('description')?.toString().trim() || null;
		const price = data.get('price');
		const categoryId = data.get('categoryId')?.toString();
		const isAvailable = data.get('isAvailable') === 'true';

		if (!id || !name || !price || !categoryId) {
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
		const data = await request.formData();
		const id = data.get('id')?.toString();

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
		const data = await request.formData();
		const name = data.get('name')?.toString().trim();
		const displayOrder = data.get('displayOrder');

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
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const name = data.get('name')?.toString().trim();
		const displayOrder = data.get('displayOrder');

		if (!id || !name || displayOrder === null) {
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
		const data = await request.formData();
		const id = data.get('id')?.toString();

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
	}
};
