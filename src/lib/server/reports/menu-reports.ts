import { db } from '$lib/server/db';
import { order, orderItem, menuItem, category, orderItemVariation, orderItemModifier, variation, modifier } from '$lib/server/db/schema';
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

export interface VariationPopularity {
	variationId: string;
	variationName: string;
	groupName: string;
	menuItemId: string;
	menuItemName: string;
	selectionCount: number;
	revenue: number;
}

export interface ModifierAttachment {
	modifierId: string;
	modifierName: string;
	groupName: string;
	attachmentCount: number;
	totalQuantity: number;
	revenue: number;
	attachmentRate: number; // percentage of orders that include this modifier
}

export interface RevenueBreakdown {
	baseRevenue: number;
	variationRevenue: number;
	modifierRevenue: number;
	totalRevenue: number;
	basePercentage: number;
	variationPercentage: number;
	modifierPercentage: number;
}

export interface PopularCombination {
	menuItemId: string;
	menuItemName: string;
	combination: string;
	count: number;
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

/**
 * Get variation popularity - which variations are selected most often
 */
export async function getVariationPopularity(
	startDate: string,
	endDate: string,
	limit: number = 10
): Promise<VariationPopularity[]> {
	const startTimestamp = new Date(startDate).getTime();
	const endTimestamp = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1;

	const result = await db
		.select({
			variationId: variation.id,
			variationName: variation.name,
			groupName: sql<string>`(SELECT name FROM variation_group WHERE id = ${variation.groupId})`,
			menuItemId: sql<string>`(SELECT menu_item_id FROM variation_group WHERE id = ${variation.groupId})`,
			menuItemName: sql<string>`(SELECT name FROM menu_item WHERE id = (SELECT menu_item_id FROM variation_group WHERE id = ${variation.groupId}))`,
			selectionCount: count(orderItemVariation.id),
			revenue: sql<number>`SUM(${variation.priceAdjustment} * ${orderItem.quantity})`
		})
		.from(orderItemVariation)
		.innerJoin(orderItem, eq(orderItemVariation.orderItemId, orderItem.id))
		.innerJoin(order, eq(orderItem.orderId, order.id))
		.innerJoin(variation, eq(orderItemVariation.variationId, variation.id))
		.where(
			and(
				isNull(order.deletedAt),
				gte(order.createdAt, new Date(startTimestamp)),
				lte(order.createdAt, new Date(endTimestamp))
			)
		)
		.groupBy(variation.id, variation.name, variation.groupId)
		.orderBy(desc(count(orderItemVariation.id)))
		.limit(limit);

	return result.map((row) => ({
		variationId: row.variationId,
		variationName: row.variationName,
		groupName: row.groupName,
		menuItemId: row.menuItemId,
		menuItemName: row.menuItemName,
		selectionCount: Number(row.selectionCount) || 0,
		revenue: Number(row.revenue) || 0
	}));
}

/**
 * Get modifier attachment rates
 */
export async function getModifierAttachmentRates(
	startDate: string,
	endDate: string,
	limit: number = 10
): Promise<ModifierAttachment[]> {
	const startTimestamp = new Date(startDate).getTime();
	const endTimestamp = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1;

	// Get total order items count for attachment rate calculation
	const totalItemsResult = await db
		.select({
			totalCount: count(orderItem.id)
		})
		.from(orderItem)
		.innerJoin(order, eq(orderItem.orderId, order.id))
		.where(
			and(
				isNull(order.deletedAt),
				gte(order.createdAt, new Date(startTimestamp)),
				lte(order.createdAt, new Date(endTimestamp))
			)
		);

	const totalOrderItems = Number(totalItemsResult[0]?.totalCount) || 1;

	const result = await db
		.select({
			modifierId: modifier.id,
			modifierName: modifier.name,
			groupName: sql<string>`(SELECT name FROM modifier_group WHERE id = ${modifier.groupId})`,
			attachmentCount: count(sql`DISTINCT ${orderItemModifier.orderItemId}`),
			totalQuantity: sql<number>`SUM(${orderItemModifier.quantity})`,
			revenue: sql<number>`SUM(${orderItemModifier.priceAtOrder} * ${orderItemModifier.quantity})`
		})
		.from(orderItemModifier)
		.innerJoin(orderItem, eq(orderItemModifier.orderItemId, orderItem.id))
		.innerJoin(order, eq(orderItem.orderId, order.id))
		.innerJoin(modifier, eq(orderItemModifier.modifierId, modifier.id))
		.where(
			and(
				isNull(order.deletedAt),
				gte(order.createdAt, new Date(startTimestamp)),
				lte(order.createdAt, new Date(endTimestamp))
			)
		)
		.groupBy(modifier.id, modifier.name, modifier.groupId)
		.orderBy(desc(count(sql`DISTINCT ${orderItemModifier.orderItemId}`)))
		.limit(limit);

	return result.map((row) => ({
		modifierId: row.modifierId,
		modifierName: row.modifierName,
		groupName: row.groupName,
		attachmentCount: Number(row.attachmentCount) || 0,
		totalQuantity: Number(row.totalQuantity) || 0,
		revenue: Number(row.revenue) || 0,
		attachmentRate: Math.round((Number(row.attachmentCount) / totalOrderItems) * 100)
	}));
}

/**
 * Get revenue breakdown: base items vs variations vs modifiers
 */
export async function getRevenueBreakdown(
	startDate: string,
	endDate: string
): Promise<RevenueBreakdown> {
	const startTimestamp = new Date(startDate).getTime();
	const endTimestamp = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1;

	// Get base revenue (menu item prices without adjustments)
	const baseRevenueResult = await db
		.select({
			revenue: sql<number>`SUM(${orderItem.quantity} * (${orderItem.unitPrice} - COALESCE((SELECT SUM(${variation.priceAdjustment}) FROM order_item_variation oiv JOIN variation v ON oiv.variation_id = v.id WHERE oiv.order_item_id = ${orderItem.id}), 0) - COALESCE((SELECT SUM(${orderItemModifier.priceAtOrder} * ${orderItemModifier.quantity}) FROM order_item_modifier oim WHERE oim.order_item_id = ${orderItem.id}), 0)))`
		})
		.from(orderItem)
		.innerJoin(order, eq(orderItem.orderId, order.id))
		.where(
			and(
				isNull(order.deletedAt),
				gte(order.createdAt, new Date(startTimestamp)),
				lte(order.createdAt, new Date(endTimestamp))
			)
		);

	// Get variation revenue
	const variationRevenueResult = await db
		.select({
			revenue: sql<number>`SUM(${variation.priceAdjustment} * ${orderItem.quantity})`
		})
		.from(orderItemVariation)
		.innerJoin(orderItem, eq(orderItemVariation.orderItemId, orderItem.id))
		.innerJoin(order, eq(orderItem.orderId, order.id))
		.innerJoin(variation, eq(orderItemVariation.variationId, variation.id))
		.where(
			and(
				isNull(order.deletedAt),
				gte(order.createdAt, new Date(startTimestamp)),
				lte(order.createdAt, new Date(endTimestamp))
			)
		);

	// Get modifier revenue
	const modifierRevenueResult = await db
		.select({
			revenue: sql<number>`SUM(${orderItemModifier.priceAtOrder} * ${orderItemModifier.quantity})`
		})
		.from(orderItemModifier)
		.innerJoin(orderItem, eq(orderItemModifier.orderItemId, orderItem.id))
		.innerJoin(order, eq(orderItem.orderId, order.id))
		.where(
			and(
				isNull(order.deletedAt),
				gte(order.createdAt, new Date(startTimestamp)),
				lte(order.createdAt, new Date(endTimestamp))
			)
		);

	const baseRevenue = Number(baseRevenueResult[0]?.revenue) || 0;
	const variationRevenue = Number(variationRevenueResult[0]?.revenue) || 0;
	const modifierRevenue = Number(modifierRevenueResult[0]?.revenue) || 0;
	const totalRevenue = baseRevenue + variationRevenue + modifierRevenue;

	// Avoid division by zero
	const safeTotal = totalRevenue || 1;

	return {
		baseRevenue,
		variationRevenue,
		modifierRevenue,
		totalRevenue,
		basePercentage: Math.round((baseRevenue / safeTotal) * 100),
		variationPercentage: Math.round((variationRevenue / safeTotal) * 100),
		modifierPercentage: Math.round((modifierRevenue / safeTotal) * 100)
	};
}

/**
 * Get most popular variation combinations
 */
export async function getPopularCombinations(
	startDate: string,
	endDate: string,
	limit: number = 5
): Promise<PopularCombination[]> {
	const startTimestamp = new Date(startDate).getTime();
	const endTimestamp = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1;

	// This is a complex query that groups by menu item and variations
	const result = await db
		.select({
			menuItemId: menuItem.id,
			menuItemName: menuItem.name,
			variationNames: sql<string>`GROUP_CONCAT(${variation.name}, ', ')`,
			count: count(sql`DISTINCT ${orderItem.id}`),
			revenue: sql<number>`SUM(${orderItem.quantity} * ${orderItem.unitPrice})`
		})
		.from(orderItem)
		.innerJoin(order, eq(orderItem.orderId, order.id))
		.innerJoin(menuItem, eq(orderItem.menuItemId, menuItem.id))
		.innerJoin(orderItemVariation, eq(orderItemVariation.orderItemId, orderItem.id))
		.innerJoin(variation, eq(orderItemVariation.variationId, variation.id))
		.where(
			and(
				isNull(order.deletedAt),
				gte(order.createdAt, new Date(startTimestamp)),
				lte(order.createdAt, new Date(endTimestamp))
			)
		)
		.groupBy(menuItem.id, menuItem.name, orderItem.id)
		.orderBy(desc(count(sql`DISTINCT ${orderItem.id}`)))
		.limit(limit);

	return result.map((row) => ({
		menuItemId: row.menuItemId,
		menuItemName: row.menuItemName,
		combination: row.variationNames,
		count: Number(row.count) || 0,
		revenue: Number(row.revenue) || 0
	}));
}
