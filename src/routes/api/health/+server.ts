import { db } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	try {
		const healthCheck = db
			? {
					status: 'healthy',
					timestamp: new Date().toISOString(),
					database: 'connected',
					uptime: process.uptime()
			  }
			: {
					status: 'unhealthy',
					timestamp: new Date().toISOString(),
					database: 'not_initialized'
			  };

		return json(healthCheck);
	} catch (error) {
		console.error('Health check failed:', error);

		return json(
			{
				status: 'unhealthy',
				timestamp: new Date().toISOString(),
				database: 'error',
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 503 }
		);
	}
};
