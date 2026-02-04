/**
 * Format price as currency with $ prefix, no decimals, and . as thousand separator
 * Example: 1234.56 -> $1.234
 */
export function formatCurrency(amount: number): string {
	const rounded = Math.round(amount);
	const parts = rounded.toString().split('');
	const formatted = [];
	
	for (let i = 0; i < parts.length; i++) {
		if (i > 0 && (parts.length - i) % 3 === 0) {
			formatted.push('.');
		}
		formatted.push(parts[i]);
	}
	
	return `$${formatted.join('')}`;
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}