import { getSalesReport, getSalesSummary } from '$lib/server/reports/sales-reports';

export const load = async ({ url }: { url: URL }) => {
	// Get date range from query params or default to today
	const startDate = url.searchParams.get('startDate') || new Date().toISOString().split('T')[0];
	const endDate = url.searchParams.get('endDate') || new Date().toISOString().split('T')[0];

	const [report, summary] = await Promise.all([
		getSalesReport(startDate, endDate),
		getSalesSummary(startDate, endDate)
	]);

	return {
		report,
		summary,
		startDate,
		endDate
	};
};
