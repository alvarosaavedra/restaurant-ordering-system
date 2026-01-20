import { test, expect } from '@playwright/test';

test.describe('Order Taking Flow', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/login');
		await page.getByLabel('Email').fill('john@bakery.com');
		await page.getByLabel('Password').fill('password123');
		await page.getByRole('button', { name: 'Sign In' }).click();
		await expect(page).toHaveURL('/orders/new');
	});

	test('should display menu items by category', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Bakery Items' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Beverages' })).toBeVisible();
	});

	test('should add item to cart', async ({ page }) => {
		const firstItem = page.getByRole('listitem').filter({ hasText: 'Classic Croissant' }).first();
		await firstItem.getByRole('button', { name: /Add.*Classic Croissant to order/ }).click();

		await expect(page.getByText('1 item in cart')).toBeVisible();
	});

	test('should add multiple items with different quantities', async ({ page }) => {
		const firstItem = page.getByRole('listitem').filter({ hasText: 'Classic Croissant' }).first();

		await firstItem.getByRole('button', { name: 'Increase quantity for Classic Croissant' }).click();
		await firstItem.getByRole('button', { name: 'Increase quantity for Classic Croissant' }).click();
		await firstItem.getByRole('button', { name: /Add.*Classic Croissant to order/ }).click();

		await expect(page.getByText('3 items in cart')).toBeVisible();
	});

	test('should display cart summary', async ({ page }) => {
		const firstItem = page.getByRole('listitem').filter({ hasText: 'Classic Croissant' }).first();
		await firstItem.getByRole('button', { name: /Add.*Classic Croissant to order/ }).click();

		await expect(page.getByText('Cart Summary')).toBeVisible();
		await expect(page.getByRole('list', { name: 'Order items' })).toBeVisible();
	});

	test('should update cart total when adding items', async ({ page }) => {
		const firstItem = page.getByRole('listitem').filter({ hasText: 'Classic Croissant' }).first();

		await firstItem.getByRole('button', { name: /Add.*Classic Croissant to order/ }).click();
		let total = await page.getByTestId('cart-total').textContent();
		const initialTotal = parseFloat(total || '0');

		await firstItem.getByRole('button', { name: 'Increase quantity for Classic Croissant' }).click();
		await firstItem.getByRole('button', { name: /Add.*Classic Croissant to order/ }).click();

		total = await page.getByTestId('cart-total').textContent();
		const newTotal = parseFloat(total || '0');

		expect(newTotal).toBeGreaterThan(initialTotal);
	});

	test('should remove item from cart', async ({ page }) => {
		const firstItem = page.getByRole('listitem').filter({ hasText: 'Classic Croissant' }).first();
		await firstItem.getByRole('button', { name: /Add.*Classic Croissant to order/ }).click();

		await page.getByRole('button', { name: /Remove.*Classic Croissant/ }).click();

		await expect(page.getByText('Your cart is empty')).toBeVisible();
	});

	test('should validate customer name is required', async ({ page }) => {
		await page.getByRole('button', { name: 'Create Order' }).click();

		await expect(page.getByText('Customer name is required')).toBeVisible();
	});

	test('should validate phone format', async ({ page }) => {
		const firstItem = page.getByRole('listitem').filter({ hasText: 'Classic Croissant' }).first();
		await firstItem.getByRole('button', { name: /Add.*Classic Croissant to order/ }).click();

		await page.getByLabel('Customer Name').fill('John Doe');
		await page.getByLabel('Phone Number').fill('invalid-phone');
		await page.getByRole('button', { name: 'Create Order' }).click();

		await expect(page.getByText('Please enter a valid phone number')).toBeVisible();
	});

	test('should create order successfully', async ({ page }) => {
		const firstItem = page.getByRole('listitem').filter({ hasText: 'Classic Croissant' }).first();
		await firstItem.getByRole('button', { name: /Add.*Classic Croissant to order/ }).click();

		await page.getByLabel('Customer Name').fill('Test Customer');
		await page.getByLabel('Phone Number').fill('555-1234');
		await page.getByRole('button', { name: 'Create Order' }).click();

		await expect(page.getByText('Order created successfully!')).toBeVisible();
	});

	test('should show loading state during order creation', async ({ page }) => {
		const firstItem = page.getByRole('listitem').filter({ hasText: 'Classic Croissant' }).first();
		await firstItem.getByRole('button', { name: /Add.*Classic Croissant to order/ }).click();

		await page.getByLabel('Customer Name').fill('Test Customer');
		await page.getByLabel('Phone Number').fill('555-1234');

		const createButton = page.getByRole('button', { name: 'Create Order' });
		await createButton.click();

		await expect(createButton).toBeDisabled();
	});

	test('should clear cart after successful order', async ({ page }) => {
		const firstItem = page.getByRole('listitem').filter({ hasText: 'Classic Croissant' }).first();
		await firstItem.getByRole('button', { name: /Add.*Classic Croissant to order/ }).click();

		await page.getByLabel('Customer Name').fill('Test Customer');
		await page.getByLabel('Phone Number').fill('555-1234');
		await page.getByRole('button', { name: 'Create Order' }).click();

		await page.waitForURL('/orders/new');
		await expect(page.getByText('Your cart is empty')).toBeVisible();
	});

	test('should show out of stock items', async ({ page }) => {
		await expect(page.getByText('Out of Stock')).toBeVisible();
	});

	test('should disable add button for out of stock items', async ({ page }) => {
		const unavailableItem = page.getByRole('listitem').filter({ hasText: 'Out of Stock' }).first();
		const addButton = unavailableItem.getByRole('button').filter({ hasText: 'Add' }).first();

		await expect(addButton).not.toBeVisible();
		await expect(unavailableItem.getByText('Unavailable')).toBeVisible();
	});

	test('should increment quantity before adding', async ({ page }) => {
		const firstItem = page.getByRole('listitem').filter({ hasText: 'Classic Croissant' }).first();

		await firstItem.getByRole('button', { name: 'Increase quantity for Classic Croissant' }).click();
		await firstItem.getByRole('button', { name: 'Increase quantity for Classic Croissant' }).click();
		await firstItem.getByRole('button', { name: /Add.*Classic Croissant to order/ }).click();

		await expect(page.getByText('3 items in cart')).toBeVisible();
	});

	test('should display item price correctly', async ({ page }) => {
		const firstItem = page.getByRole('listitem').filter({ hasText: 'Classic Croissant' }).first();
		const priceText = await firstItem.getByText(/^\$\d+\.\d{2}$/).textContent();
		expect(priceText).toBeTruthy();
	});

	test('should navigate to order history', async ({ page }) => {
		await page.getByRole('link', { name: /Order History/i }).click();

		await expect(page).toHaveURL('/orders');
		await expect(page.getByRole('heading', { name: 'Order History' })).toBeVisible();
	});
});
