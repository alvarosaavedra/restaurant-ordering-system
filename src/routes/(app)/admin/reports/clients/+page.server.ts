import { getTopClients, getClientMetrics } from '$lib/server/reports/client-reports';

export const load = async ({ url }: { url: URL }) => {
	const startDate = url.searchParams.get('startDate') || new Date().toISOString().split('T')[0];
	const endDate = url.searchParams.get('endDate') || new Date().toISOString().split('T')[0];

	const [topClients, metrics] = await Promise.all([
		getTopClients(startDate, endDate),
		getClientMetrics(startDate, endDate)
	]);

	return {
		topClients,
		metrics,
		startDate,
		endDate
	};
};
