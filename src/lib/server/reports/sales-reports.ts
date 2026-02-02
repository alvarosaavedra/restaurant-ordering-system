import { db } from '$lib/server/db';
import { order, orderItem } from '$lib/server/db/schema';
import { sql, and, gte, lte, isNull, eq, count } from 'drizzle-orm';

export interface SalesReportItem {
	date: string;
	grossRevenue: number;
	totalDiscounts: number;
	netRevenue: number;
	orderCount: number;
	avgOrderValue: number;
}

export interface SalesSummary {
	totalRevenue: number;
	totalDiscounts: number;
	netRevenue: number;
	totalOrders: number;
	avgOrderValue: number;
	totalItemsSold: number;
}

/**
 * Get daily sales report for a date range
 */
export async function getSalesReport(
	startDate: string,
	endDate: string
): Promise<SalesReportItem[]> {
	// Convert date strings to timestamps for comparison
	const startTimestamp = new Date(startDate).getTime();
	const endTimestamp = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1; // End of day

	const result = await db
		.select({
			date: sql<string>`date(${order.createdAt} / 1000, 'unixepoch', 'localtime')`,
			grossRevenue: sql<number>`SUM(${order.totalAmount})`,
			totalDiscounts: sql<number>`COALESCE(SUM(${order.discountAmount}), 0)`,
			netRevenue: sql<number>`SUM(${order.totalAmount}) - COALESCE(SUM(${order.discountAmount}), 0)`,
			orderCount: count(order.id),
			avgOrderValue: sql<number>`AVG(${order.totalAmount})`
		})
		.from(order)
		.where(
			and(
				isNull(order.deletedAt),
				gte(order.createdAt, new Date(startTimestamp)),
				lte(order.createdAt, new Date(endTimestamp))
			)
		)
		.groupBy(sql`date(${order.createdAt} / 1000, 'unixepoch', 'localtime')`)
		.orderBy(sql`date(${order.createdAt} / 1000, 'unixepoch', 'localtime')`);

	return result.map((row) => ({
		date: row.date,
		grossRevenue: Number(row.grossRevenue) || 0,
		totalDiscounts: Number(row.totalDiscounts) || 0,
		netRevenue: Number(row.netRevenue) || 0,
		orderCount: Number(row.orderCount) || 0,
		avgOrderValue: Number(row.avgOrderValue) || 0
	}));
}

/**
 * Get overall sales summary for a date range
 */
export async function getSalesSummary(
	startDate: string,
	endDate: string
): Promise<SalesSummary> {
	// Convert date strings to timestamps for comparison
	const startTimestamp = new Date(startDate).getTime();
	const endTimestamp = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1; // End of day

	const [orderResult] = await db
		.select({
			totalRevenue: sql<number>`SUM(${order.totalAmount})`,
			totalDiscounts: sql<number>`COALESCE(SUM(${order.discountAmount}), 0)`,
			totalOrders: count(order.id),
			avgOrderValue: sql<number>`AVG(${order.totalAmount})`
		})
		.from(order)
		.where(
			and(
				isNull(order.deletedAt),
				gte(order.createdAt, new Date(startTimestamp)),
				lte(order.createdAt, new Date(endTimestamp))
			)
		);

	const [itemResult] = await db
		.select({
			totalItems: sql<number>`SUM(${orderItem.quantity})`
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

	const totalRevenue = Number(orderResult?.totalRevenue) || 0;
	const totalDiscounts = Number(orderResult?.totalDiscounts) || 0;

	return {
		totalRevenue,
		totalDiscounts,
		netRevenue: totalRevenue - totalDiscounts,
		totalOrders: Number(orderResult?.totalOrders) || 0,
		avgOrderValue: Number(orderResult?.avgOrderValue) || 0,
		totalItemsSold: Number(itemResult?.totalItems) || 0
	};
}
