import { getTopSellingItems, getCategoryPerformance } from '$lib/server/reports/menu-reports';

export const load = async ({ url }: { url: URL }) => {
	const startDate = url.searchParams.get('startDate') || new Date().toISOString().split('T')[0];
	const endDate = url.searchParams.get('endDate') || new Date().toISOString().split('T')[0];

	const [topItems, categoryStats] = await Promise.all([
		getTopSellingItems(startDate, endDate),
		getCategoryPerformance(startDate, endDate)
	]);

	return {
		topItems,
		categoryStats,
		startDate,
		endDate
	};
};
