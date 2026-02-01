import { db } from '$lib/server/db';
import { order, client } from '$lib/server/db/schema';
import { sql, and, gte, lte, isNull, eq, count, desc } from 'drizzle-orm';

export interface TopClient {
	clientId: string;
	name: string;
	phone: string;
	orderCount: number;
	totalSpent: number;
	averageOrderValue: number;
}

export interface ClientMetrics {
	totalClients: number;
	activeClients: number;
	newClients: number;
}

/**
 * Get top clients by revenue
 */
export async function getTopClients(
	startDate: string,
	endDate: string,
	limit: number = 10
): Promise<TopClient[]> {
	const startTimestamp = new Date(startDate).getTime();
	const endTimestamp = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1;

	const result = await db
		.select({
			clientId: client.id,
			name: client.name,
			phone: client.phone,
			orderCount: count(order.id),
			totalSpent: sql<number>`SUM(${order.totalAmount})`,
			averageOrderValue: sql<number>`AVG(${order.totalAmount})`
		})
		.from(order)
		.innerJoin(client, eq(order.customerPhone, client.phone))
		.where(
			and(
				isNull(order.deletedAt),
				gte(order.createdAt, new Date(startTimestamp)),
				lte(order.createdAt, new Date(endTimestamp))
			)
		)
		.groupBy(client.id, client.name, client.phone)
		.orderBy(desc(sql<number>`SUM(${order.totalAmount})`))
		.limit(limit);

	return result.map((row) => ({
		clientId: row.clientId,
		name: row.name,
		phone: row.phone,
		orderCount: Number(row.orderCount) || 0,
		totalSpent: Number(row.totalSpent) || 0,
		averageOrderValue: Number(row.averageOrderValue) || 0
	}));
}

/**
 * Get client metrics for a date range
 */
export async function getClientMetrics(
	startDate: string,
	endDate: string
): Promise<ClientMetrics> {
	const startTimestamp = new Date(startDate).getTime();
	const endTimestamp = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1;

	// Get total unique clients who have orders in this period
	const activeClientsResult = await db
		.select({
			count: count(sql`DISTINCT ${order.customerPhone}`)
		})
		.from(order)
		.where(
			and(
				isNull(order.deletedAt),
				gte(order.createdAt, new Date(startTimestamp)),
				lte(order.createdAt, new Date(endTimestamp))
			)
		);

	// Get total clients in database
	const totalClientsResult = await db.select({ count: count(client.id) }).from(client);

	// Get new clients (created within date range)
	const newClientsResult = await db
		.select({
			count: count(client.id)
		})
		.from(client)
		.where(
			and(
				gte(client.createdAt, new Date(startTimestamp)),
				lte(client.createdAt, new Date(endTimestamp))
			)
		);

	return {
		totalClients: Number(totalClientsResult[0]?.count) || 0,
		activeClients: Number(activeClientsResult[0]?.count) || 0,
		newClients: Number(newClientsResult[0]?.count) || 0
	};
}
