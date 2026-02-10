import { 
	getTopSellingItems, 
	getCategoryPerformance, 
	getVariationPopularity, 
	getModifierAttachmentRates, 
	getRevenueBreakdown,
	getPopularCombinations 
} from '$lib/server/reports/menu-reports';

export const load = async ({ url }: { url: URL }) => {
	const startDate = url.searchParams.get('startDate') || new Date().toISOString().split('T')[0];
	const endDate = url.searchParams.get('endDate') || new Date().toISOString().split('T')[0];

	const [topItems, categoryStats, variationStats, modifierStats, revenueBreakdown, popularCombinations] = await Promise.all([
		getTopSellingItems(startDate, endDate),
		getCategoryPerformance(startDate, endDate),
		getVariationPopularity(startDate, endDate),
		getModifierAttachmentRates(startDate, endDate),
		getRevenueBreakdown(startDate, endDate),
		getPopularCombinations(startDate, endDate)
	]);

	return {
		topItems,
		categoryStats,
		variationStats,
		modifierStats,
		revenueBreakdown,
		popularCombinations,
		startDate,
		endDate
	};
};
