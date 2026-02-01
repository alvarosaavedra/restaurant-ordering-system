import { getEmployeePerformance } from '$lib/server/reports/employee-reports';

export const load = async ({ url }: { url: URL }) => {
	const startDate = url.searchParams.get('startDate') || new Date().toISOString().split('T')[0];
	const endDate = url.searchParams.get('endDate') || new Date().toISOString().split('T')[0];

	const performance = await getEmployeePerformance(startDate, endDate);

	return {
		performance,
		startDate,
		endDate
	};
};
