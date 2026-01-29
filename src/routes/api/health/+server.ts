import { db } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';

export const GET: RequestHandler = async () => {
	try {
		db.all(sql`SELECT 1 as test`);

		return json({
			status: 'healthy',
			timestamp: new Date().toISOString(),
			database: 'connected',
			uptime: process.uptime()
		});
	} catch (error) {
		console.error('Health check failed:', error);

		return json(
			{
				status: 'unhealthy',
				timestamp: new Date().toISOString(),
				database: 'disconnected',
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 503 }
		);
	}
};
