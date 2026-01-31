import { test } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test.describe('Discount Feature Mobile Screenshots', () => {
	test.beforeEach(async ({ page }) => {
		// Login as order_taker
		await page.goto('/login');
		await page.fill('input[name="email"]', 'order@restaurant.com');
		await page.fill('input[name="password"]', 'password123');
		await page.click('button[type="submit"]');
		await page.waitForURL('/');
	});

	test('mobile order page with discount panel - iPhone SE', async ({ page }) => {
		// Navigate to new order page
		await page.goto('/orders/new');
		
		// Add some items to cart
		await page.click('text=Chocolate Cake');
		await page.click('text=Add to Order');
		
		// Add item discount
		await page.click('[data-testid="add-discount-btn"]');
		await page.click('[data-testid="type-fixed"]');
		await page.fill('input[name="amount"]', '5');
		await page.fill('input[type="text"]', 'Loyalty discount');
		await page.click('[data-testid="save-btn"]');
		
		// Add order discount
		await page.click('text=Add Order Discount');
		await page.click('[data-testid="type-percentage"]');
		await page.fill('input[name="amount"]', '10');
		await page.fill('input[type="text"]', 'First order');
		await page.click('[data-testid="save-btn"]');
		
		// Take screenshot of the discount panel
		await page.screenshot({
			path: 'e2e/screenshots/mobile-iphone-se-discount-panel.png',
			fullPage: false
		});
	});

	test('mobile discount sheet open - iPhone 12', async ({ page }) => {
		await page.goto('/orders/new');
		
		// Add item to cart
		await page.click('text=Chocolate Cake');
		await page.click('text=Add to Order');
		
		// Open discount sheet
		await page.click('[data-testid="add-discount-btn"]');
		
		// Wait for sheet to be visible
		await page.waitForSelector('[data-testid="mobile-discount-sheet"]', { state: 'visible' });
		
		// Take screenshot of discount sheet
		await page.screenshot({
			path: 'e2e/screenshots/mobile-iphone-12-discount-sheet.png',
			fullPage: false
		});
	});

	test('mobile order summary with discounts - Pixel 5', async ({ page }) => {
		await page.goto('/orders/new');
		
		// Add multiple items
		await page.click('text=Chocolate Cake');
		await page.click('text=Add to Order');
		await page.click('text=Vanilla Cupcake');
		await page.click('text=Add to Order');
		
		// Add discounts
		await page.click('[data-testid="add-discount-btn"]:first-of-type');
		await page.click('[data-testid="type-fixed"]');
		await page.fill('input[name="amount"]', '3');
		await page.click('[data-testid="save-btn"]');
		
		// Take screenshot of order summary
		await page.screenshot({
			path: 'e2e/screenshots/mobile-pixel-5-order-summary.png',
			fullPage: false
		});
	});

	test('order detail with discounts - iPhone 14 Pro', async ({ page }) => {
		// Navigate to orders list
		await page.goto('/orders');
		
		// Click on first order
		await page.click('text=View Details:first-of-type');
		
		// Wait for order detail page
		await page.waitForSelector('text=Order Details');
		
		// Take screenshot
		await page.screenshot({
			path: 'e2e/screenshots/mobile-iphone-14-pro-order-detail.png',
			fullPage: true
		});
	});
});
