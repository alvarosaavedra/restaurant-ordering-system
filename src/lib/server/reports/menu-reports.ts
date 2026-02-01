import { db } from '$lib/server/db';
import { order, orderItem, menuItem, category } from '$lib/server/db/schema';
import { sql, and, gte, lte, isNull, eq, count, desc } from 'drizzle-orm';

export interface TopSellingItem {
	menuItemId: string;
	name: string;
	categoryName: string;
	quantity: number;
	revenue: number;
}

export interface CategoryPerformance {
	categoryId: string;
	categoryName: string;
	itemCount: number;
	quantitySold: number;
	revenue: number;
}

/**
 * Get top selling menu items
 */
export async function getTopSellingItems(
	startDate: string,
	endDate: string,
	limit: number = 10
): Promise<TopSellingItem[]> {
	const startTimestamp = new Date(startDate).getTime();
	const endTimestamp = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1;

	const result = await db
		.select({
			menuItemId: menuItem.id,
			name: menuItem.name,
			categoryName: category.name,
			quantity: sql<number>`SUM(${orderItem.quantity})`,
			revenue: sql<number>`SUM(${orderItem.quantity} * ${orderItem.unitPrice})`
		})
		.from(orderItem)
		.innerJoin(order, eq(orderItem.orderId, order.id))
		.innerJoin(menuItem, eq(orderItem.menuItemId, menuItem.id))
		.innerJoin(category, eq(menuItem.categoryId, category.id))
		.where(
			and(
				isNull(order.deletedAt),
				gte(order.createdAt, new Date(startTimestamp)),
				lte(order.createdAt, new Date(endTimestamp))
			)
		)
		.groupBy(menuItem.id, menuItem.name, category.name)
		.orderBy(desc(sql<number>`SUM(${orderItem.quantity})`))
		.limit(limit);

	return result.map((row) => ({
		menuItemId: row.menuItemId,
		name: row.name,
		categoryName: row.categoryName,
		quantity: Number(row.quantity) || 0,
		revenue: Number(row.revenue) || 0
	}));
}

/**
 * Get category performance metrics
 */
export async function getCategoryPerformance(
	startDate: string,
	endDate: string
): Promise<CategoryPerformance[]> {
	const startTimestamp = new Date(startDate).getTime();
	const endTimestamp = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1;

	const result = await db
		.select({
			categoryId: category.id,
			categoryName: category.name,
			itemCount: count(sql`DISTINCT ${menuItem.id}`),
			quantitySold: sql<number>`SUM(${orderItem.quantity})`,
			revenue: sql<number>`SUM(${orderItem.quantity} * ${orderItem.unitPrice})`
		})
		.from(orderItem)
		.innerJoin(order, eq(orderItem.orderId, order.id))
		.innerJoin(menuItem, eq(orderItem.menuItemId, menuItem.id))
		.innerJoin(category, eq(menuItem.categoryId, category.id))
		.where(
			and(
				isNull(order.deletedAt),
				gte(order.createdAt, new Date(startTimestamp)),
				lte(order.createdAt, new Date(endTimestamp))
			)
		)
		.groupBy(category.id, category.name)
		.orderBy(desc(sql<number>`SUM(${orderItem.quantity})`));

	return result.map((row) => ({
		categoryId: row.categoryId,
		categoryName: row.categoryName,
		itemCount: Number(row.itemCount) || 0,
		quantitySold: Number(row.quantitySold) || 0,
		revenue: Number(row.revenue) || 0
	}));
}
