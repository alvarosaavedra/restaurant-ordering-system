import { test, expect } from '@playwright/test';

test.describe('Order Taking Flow', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/login');
		await page.getByLabel('Email Address').fill('john@bakery.com');
		await page.getByLabel('Password').fill('password123');
		await page.getByRole('button', { name: 'Sign In' }).click();
		await expect(page).toHaveURL('/orders/new');
		await page.waitForLoadState('networkidle');
	});

	test('should display menu items', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Menu' })).toBeVisible();
	});

	test('should add item to cart', async ({ page }) => {
		const menuItem = page.getByText('Classic Croissant').first();
		await expect(menuItem).toBeVisible();

		await page.getByRole('button').filter({ hasText: 'Add' }).first().click();
		await page.waitForTimeout(500);

		await expect(page.getByText(/1 item/i)).toBeVisible();
	});

	test('should add multiple items to cart', async ({ page }) => {
		const menuItem = page.getByText('Classic Croissant').first();
		const addButton = page.getByRole('button').filter({ hasText: 'Add' }).first();

		await addButton.click();
		await page.waitForTimeout(300);
		await addButton.click();
		await page.waitForTimeout(500);

		await expect(page.getByText(/2 items/i)).toBeVisible();
	});

	test('should display cart summary', async ({ page }) => {
		const menuItem = page.getByText('Classic Croissant').first();
		const addButton = page.getByRole('button').filter({ hasText: 'Add' }).first();
		await addButton.click();
		await page.waitForTimeout(500);

		await expect(page.getByRole('heading', { name: 'Order Summary' })).toBeVisible();
	});

	test('should clear cart items', async ({ page }) => {
		const menuItem = page.getByText('Classic Croissant').first();
		const addButton = page.getByRole('button').filter({ hasText: 'Add' }).first();
		await addButton.click();
		await page.waitForTimeout(500);

		await page.getByRole('button').filter({ hasText: /Remove/i }).first().click();
		await page.waitForTimeout(500);

		await expect(page.getByText('Your cart is empty')).toBeVisible();
	});

	test('should validate customer name', async ({ page }) => {
		const menuItem = page.getByText('Classic Croissant').first();
		const addButton = page.getByRole('button').filter({ hasText: 'Add' }).first();
		await addButton.click();
		await page.waitForTimeout(500);

		const createButton = page.getByRole('button', { name: 'Create Order' });
		await createButton.click();

		await expect(page.getByText('Customer name is required')).toBeVisible();
	});

	test('should validate phone format', async ({ page }) => {
		const menuItem = page.getByText('Classic Croissant').first();
		const addButton = page.getByRole('button').filter({ hasText: 'Add' }).first();
		await addButton.click();
		await page.waitForTimeout(500);

		await page.getByPlaceholder('Enter customer name').fill('Test Customer');
		await page.getByPlaceholder('Enter phone number').fill('invalid-phone');

		const createButton = page.getByRole('button', { name: 'Create Order' });
		await createButton.click();

		await expect(page.getByText('Please enter a valid phone number')).toBeVisible();
	});

	test('should create order', async ({ page }) => {
		const menuItem = page.getByText('Classic Croissant').first();
		const addButton = page.getByRole('button').filter({ hasText: 'Add' }).first();
		await addButton.click();
		await page.waitForTimeout(500);

		await page.getByPlaceholder('Enter customer name').fill('Test Customer');
		await page.getByPlaceholder('Enter phone number').fill('555-1234');

		const createButton = page.getByRole('button', { name: 'Create Order' });
		await createButton.click();

		await expect(page.getByText('Order created successfully!')).toBeVisible();
	});

	test('should show loading state', async ({ page }) => {
		const menuItem = page.getByText('Classic Croissant').first();
		const addButton = page.getByRole('button').filter({ hasText: 'Add' }).first();
		await addButton.click();
		await page.waitForTimeout(500);

		await page.getByPlaceholder('Enter customer name').fill('Test Customer');
		await page.getByPlaceholder('Enter phone number').fill('555-1234');

		const createButton = page.getByRole('button', { name: 'Create Order' });
		await createButton.click();

		await expect(createButton).toBeDisabled();
	});

	test('should navigate to order history', async ({ page }) => {
		const historyLink = page.getByRole('link', { name: /Order History/i });
		await historyLink.click();

		await expect(page).toHaveURL('/orders');
	});
});
