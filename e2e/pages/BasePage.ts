import type { Page } from '@playwright/test';

export class BasePage {
	readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async waitForPageLoad(): Promise<void> {
		await this.page.waitForLoadState('networkidle');
	}

	async goto(url: string): Promise<void> {
		await this.page.goto(url);
		await this.waitForPageLoad();
	}
}
