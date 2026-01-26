import type { Page, Locator } from '@playwright/test';

export async function waitForNetworkIdle(page: Page, timeout = 1000): Promise<void> {
	await page.waitForLoadState('networkidle', { timeout });
}

export async function waitForText(locator: Locator, text: string, timeout = 5000): Promise<void> {
	await locator.waitFor({ state: 'visible', timeout });
	await locator.getByText(text).waitFor({ state: 'visible', timeout });
}

export async function waitForNavigation(page: Page, url?: string): Promise<void> {
	if (url) {
		await page.waitForURL(url);
	} else {
		await page.waitForLoadState('networkidle');
	}
}
