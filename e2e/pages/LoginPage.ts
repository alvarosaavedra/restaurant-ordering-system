import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
	readonly emailInput = this.page.getByLabel('Email Address');
	readonly passwordInput = this.page.getByLabel('Password');
	readonly submitButton = this.page.getByRole('button', { name: 'Sign In' });
	readonly errorMessage = this.page.locator('.bg-error-50');

	constructor(page: Page) {
		super(page);
	}

	async goto(): Promise<void> {
		await super.goto('/login');
	}

	async login(email: string, password: string): Promise<void> {
		await this.emailInput.fill(email);
		await this.passwordInput.fill(password);
		await this.submitButton.click();
	}

	async expectErrorMessage(message: string): Promise<void> {
		await expect(this.errorMessage).toContainText(message);
	}

	async expectLoginSuccess(): Promise<void> {
		await this.page.waitForURL(url => url.pathname !== '/login');
	}
}
