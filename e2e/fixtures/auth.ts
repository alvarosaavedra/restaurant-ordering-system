import { test as base, type Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { createOrder } from './database';

export { createOrder };

export const TEST_USERS = {
	orderTaker: { email: 'john@bakery.com', password: 'password123', role: 'order_taker' },
	kitchen: { email: 'jane@bakery.com', password: 'password123', role: 'kitchen' },
	delivery: { email: 'mike@bakery.com', password: 'password123', role: 'delivery' },
	admin: { email: 'admin@bakery.com', password: 'password123', role: 'admin' }
} as const;

export type UserRole = keyof typeof TEST_USERS;

export const test = base.extend<{
	loginPage: LoginPage;
	authenticatedAs: (role: UserRole) => Promise<void>;
}>({
	loginPage: async ({ page }, use) => {
		await use(new LoginPage(page));
	},

	authenticatedAs: async ({ page }, use) => {
		const authenticate = async (role: UserRole) => {
			const user = TEST_USERS[role];
			const loginPage = new LoginPage(page);

			await loginPage.goto();
			await loginPage.login(user.email, user.password);
			await loginPage.expectLoginSuccess();
		};

		await use(authenticate);
	}
});

export { expect } from '@playwright/test';
