import type { Page, Locator } from '@playwright/test';

export async function takeScreenshot(page: Page, name: string, locator?: Locator): Promise<void> {
	if (locator) {
		await locator.screenshot({ path: `screenshots/${name}.png` });
	} else {
		await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
	}
}
