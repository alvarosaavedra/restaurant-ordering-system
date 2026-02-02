import { db } from '$lib/server/db';
import { order } from '$lib/server/db/schema';
import { sql, and, gte, lte, isNull, eq, count } from 'drizzle-orm';

export interface OrderStatusCount {
	status: 'pending' | 'preparing' | 'ready' | 'delivered';
	count: number;
}

export interface DailyOrderVolume {
	date: string;
	count: number;
}

export interface CompletionTimeMetrics {
	averageMinutes: number;
	minMinutes: number;
	maxMinutes: number;
}

/**
 * Get order statistics grouped by status
 */
export async function getOrderStatistics(
	startDate: string,
	endDate: string
): Promise<OrderStatusCount[]> {
	const startTimestamp = new Date(startDate).getTime();
	const endTimestamp = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1;

	const result = await db
		.select({
			status: order.status,
			count: count(order.id)
		})
		.from(order)
		.where(
			and(
				isNull(order.deletedAt),
				gte(order.createdAt, new Date(startTimestamp)),
				lte(order.createdAt, new Date(endTimestamp))
			)
		)
		.groupBy(order.status);

	return result.map((row) => ({
		status: row.status as 'pending' | 'preparing' | 'ready' | 'delivered',
		count: Number(row.count) || 0
	}));
}

/**
 * Get daily order volume for a date range
 */
export async function getOrderVolume(
	startDate: string,
	endDate: string
): Promise<DailyOrderVolume[]> {
	const startTimestamp = new Date(startDate).getTime();
	const endTimestamp = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1;

	const result = await db
		.select({
			date: sql<string>`date(${order.createdAt} / 1000, 'unixepoch', 'localtime')`,
			count: count(order.id)
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
		count: Number(row.count) || 0
	}));
}

/**
 * Get average completion time (from pending to delivered)
 */
export async function getCompletionTimes(
	startDate: string,
	endDate: string
): Promise<CompletionTimeMetrics | null> {
	const startTimestamp = new Date(startDate).getTime();
	const endTimestamp = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1;

	// Get orders that have been delivered in the date range
	const deliveredOrders = await db
		.select({
			createdAt: order.createdAt,
			updatedAt: order.updatedAt
		})
		.from(order)
		.where(
			and(
				isNull(order.deletedAt),
				eq(order.status, 'delivered'),
				gte(order.createdAt, new Date(startTimestamp)),
				lte(order.createdAt, new Date(endTimestamp))
			)
		);

	if (deliveredOrders.length === 0) {
		return null;
	}

	const completionTimes = deliveredOrders.map((o) => {
		const start = new Date(o.createdAt).getTime();
		const end = new Date(o.updatedAt).getTime();
		return Math.round((end - start) / (1000 * 60)); // Convert to minutes
	});

	const averageMinutes =
		completionTimes.reduce((sum: number, time: number) => sum + time, 0) / completionTimes.length;
	const minMinutes = Math.min(...completionTimes);
	const maxMinutes = Math.max(...completionTimes);

	return {
		averageMinutes: Math.round(averageMinutes),
		minMinutes,
		maxMinutes
	};
}
