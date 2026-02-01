import { getOrderStatistics, getOrderVolume, getCompletionTimes } from '$lib/server/reports/order-reports';

export const load = async ({ url }: { url: URL }) => {
	const startDate = url.searchParams.get('startDate') || new Date().toISOString().split('T')[0];
	const endDate = url.searchParams.get('endDate') || new Date().toISOString().split('T')[0];

	const [statusStats, dailyVolume, completionTimes] = await Promise.all([
		getOrderStatistics(startDate, endDate),
		getOrderVolume(startDate, endDate),
		getCompletionTimes(startDate, endDate)
	]);

	return {
		statusStats,
		dailyVolume,
		completionTimes,
		startDate,
		endDate
	};
};
