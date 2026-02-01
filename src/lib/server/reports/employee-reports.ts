import { db } from '$lib/server/db';
import { order, user } from '$lib/server/db/schema';
import { sql, and, gte, lte, isNull, eq, count, desc } from 'drizzle-orm';

export interface EmployeePerformance {
	employeeId: string;
	name: string;
	role: string;
	orderCount: number;
	totalRevenue: number;
	averageOrderValue: number;
}

/**
 * Get employee performance metrics
 */
export async function getEmployeePerformance(
	startDate: string,
	endDate: string
): Promise<EmployeePerformance[]> {
	const startTimestamp = new Date(startDate).getTime();
	const endTimestamp = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1;

	const result = await db
		.select({
			employeeId: user.id,
			name: user.name,
			role: user.role,
			orderCount: count(order.id),
			totalRevenue: sql<number>`SUM(${order.totalAmount})`,
			averageOrderValue: sql<number>`AVG(${order.totalAmount})`
		})
		.from(order)
		.innerJoin(user, eq(order.employeeId, user.id))
		.where(
			and(
				isNull(order.deletedAt),
				gte(order.createdAt, new Date(startTimestamp)),
				lte(order.createdAt, new Date(endTimestamp))
			)
		)
		.groupBy(user.id, user.name, user.role)
		.orderBy(desc(sql<number>`SUM(${order.totalAmount})`));

	return result.map((row) => ({
		employeeId: row.employeeId,
		name: row.name,
		role: row.role,
		orderCount: Number(row.orderCount) || 0,
		totalRevenue: Number(row.totalRevenue) || 0,
		averageOrderValue: Number(row.averageOrderValue) || 0
	}));
}
