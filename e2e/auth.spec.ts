import { test, expect } from './fixtures/auth';

test.describe('Authentication Workflows', () => {
	test('order_taker can login and is redirected to orders/new', async ({ page, authenticatedAs }) => {
		await authenticatedAs('orderTaker');

		await expect(page).toHaveURL('/orders/new');
		await page.waitForLoadState('networkidle');
		await expect(page.getByText('Create Order')).toBeVisible();
	});

	test('kitchen can login and is redirected to /kitchen', async ({ page, authenticatedAs }) => {
		await authenticatedAs('kitchen');

		await expect(page).toHaveURL('/kitchen');
		await expect(page.getByRole('heading', { name: 'Kitchen Orders' })).toBeVisible();
	});

	test('delivery can login and is redirected to /delivery', async ({ page, authenticatedAs }) => {
		await authenticatedAs('delivery');

		await expect(page).toHaveURL('/delivery');
		await expect(page.getByRole('heading', { name: 'Delivery Orders' })).toBeVisible();
	});

	test('admin can login and is redirected to orders/new', async ({ page, authenticatedAs }) => {
		await authenticatedAs('admin');

		await expect(page).toHaveURL('/orders/new');
		await page.waitForLoadState('networkidle');
		await expect(page.getByText('Create Order')).toBeVisible();
	});

	test('invalid credentials show error message', async ({ page, loginPage }) => {
		await loginPage.goto();

		await loginPage.login('wrong@bakery.com', 'wrongpassword');

		await loginPage.expectErrorMessage('Invalid email or password');
		await expect(page).toHaveURL('/login');
	});

	test('missing fields show validation error', async ({ page, loginPage }) => {
		await loginPage.goto();

		await loginPage.emailInput.fill('test@bakery.com');

		await loginPage.submitButton.click();

		await expect(page).toHaveURL('/login');
	});

	test('already authenticated user is redirected to role-specific page', async ({ page, authenticatedAs }) => {
		await authenticatedAs('orderTaker');
		await expect(page).toHaveURL('/orders/new');

		await page.goto('/login');
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL('/orders/new');
	});

	test('protected routes redirect unauthenticated users to login', async ({ page }) => {
		const protectedRoutes = ['/orders/new', '/orders', '/kitchen', '/delivery', '/admin/menu'];

		for (const route of protectedRoutes) {
			await page.goto(route);
			await expect(page).toHaveURL('/login');
		}
	});

	test('admin route is inaccessible to non-admin users', async ({ page, authenticatedAs }) => {
		await authenticatedAs('orderTaker');

		const response = await page.request.get('/admin/menu');

		expect(response.status()).toBeGreaterThanOrEqual(400);
	});
});
