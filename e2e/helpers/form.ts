import type { Page, Locator } from '@playwright/test';

export async function fillForm(page: Page, fields: Record<string, string>): Promise<void> {
	for (const [selector, value] of Object.entries(fields)) {
		const locator = page.locator(selector);
		await locator.clear();
		await locator.fill(value);
	}
}

export async function submitForm(formLocator: Locator, method: 'click' | 'press' = 'click'): Promise<void> {
	const submitButton = formLocator.locator('button[type="submit"], input[type="submit"]');

	if (method === 'click') {
		await submitButton.click();
	} else {
		await submitButton.press('Enter');
	}
}
