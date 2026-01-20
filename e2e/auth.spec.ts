import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('should redirect unauthenticated user to login', async ({ page }) => {
		await page.goto('/orders/new');
		await expect(page).toHaveURL('/login');
		await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
	});

	test('should redirect unauthenticated user from kitchen', async ({ page }) => {
		await page.goto('/kitchen');
		await expect(page).toHaveURL('/login');
	});

	test('should redirect unauthenticated user from delivery', async ({ page }) => {
		await page.goto('/delivery');
		await expect(page).toHaveURL('/login');
	});

	test('should login with valid credentials as order taker', async ({ page }) => {
		await page.goto('/login');

		await page.getByLabel('Email').fill('john@bakery.com');
		await page.getByLabel('Password').fill('password123');
		await page.getByRole('button', { name: 'Sign In' }).click();

		await expect(page).toHaveURL('/orders/new');
		await expect(page.getByRole('heading', { name: 'Create New Order' })).toBeVisible();
	});

	test('should login with valid credentials as kitchen staff', async ({ page }) => {
		await page.goto('/login');

		await page.getByLabel('Email').fill('jane@bakery.com');
		await page.getByLabel('Password').fill('password123');
		await page.getByRole('button', { name: 'Sign In' }).click();

		await expect(page).toHaveURL('/kitchen');
		await expect(page.getByRole('heading', { name: 'Kitchen Orders' })).toBeVisible();
	});

	test('should login with valid credentials as delivery', async ({ page }) => {
		await page.goto('/login');

		await page.getByLabel('Email').fill('mike@bakery.com');
		await page.getByLabel('Password').fill('password123');
		await page.getByRole('button', { name: 'Sign In' }).click();

		await expect(page).toHaveURL('/delivery');
		await expect(page.getByRole('heading', { name: 'Delivery Orders' })).toBeVisible();
	});

	test('should show error with invalid email', async ({ page }) => {
		await page.goto('/login');

		await page.getByLabel('Email').fill('invalid@test.com');
		await page.getByLabel('Password').fill('password123');
		await page.getByRole('button', { name: 'Sign In' }).click();

		await expect(page.getByText('Invalid email or password')).toBeVisible();
	});

	test('should show error with invalid password', async ({ page }) => {
		await page.goto('/login');

		await page.getByLabel('Email').fill('john@bakery.com');
		await page.getByLabel('Password').fill('wrongpassword');
		await page.getByRole('button', { name: 'Sign In' }).click();

		await expect(page.getByText('Invalid email or password')).toBeVisible();
	});

	test('should show error with missing fields', async ({ page }) => {
		await page.goto('/login');

		await page.getByRole('button', { name: 'Sign In' }).click();

		await expect(page.getByText('Invalid email or password')).toBeVisible();
	});

	test('should logout successfully', async ({ page }) => {
		await page.goto('/login');

		await page.getByLabel('Email').fill('john@bakery.com');
		await page.getByLabel('Password').fill('password123');
		await page.getByRole('button', { name: 'Sign In' }).click();

		await expect(page).toHaveURL('/orders/new');

		await page.getByRole('button', { name: /Logout/i }).click();

		await expect(page).toHaveURL('/login');
		await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
	});

	test('should redirect to login after logout from dashboard', async ({ page }) => {
		await page.goto('/login');

		await page.getByLabel('Email').fill('john@bakery.com');
		await page.getByLabel('Password').fill('password123');
		await page.getByRole('button', { name: 'Sign In' }).click();

		await page.goto('/');

		await page.getByRole('button', { name: /Logout/i }).click();

		await expect(page).toHaveURL('/login');
	});

	test('should protect all app routes', async ({ page }) => {
		const protectedRoutes = ['/', '/orders', '/orders/new', '/kitchen', '/delivery'];

		for (const route of protectedRoutes) {
			await page.goto(route);
			await expect(page).toHaveURL('/login');
		}
	});

	test('should allow access to login page', async ({ page }) => {
		await page.goto('/login');
		await expect(page).toHaveURL('/login');
		await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
	});

	test('should redirect to role-specific page after login', async ({ page }) => {
		await page.goto('/login');

		await page.getByLabel('Email').fill('jane@bakery.com');
		await page.getByLabel('Password').fill('password123');
		await page.getByRole('button', { name: 'Sign In' }).click();

		await expect(page).toHaveURL('/kitchen');

		await page.getByRole('button', { name: /Logout/i }).click();

		await page.getByLabel('Email').fill('mike@bakery.com');
		await page.getByLabel('Password').fill('password123');
		await page.getByRole('button', { name: 'Sign In' }).click();

		await expect(page).toHaveURL('/delivery');
	});
});
