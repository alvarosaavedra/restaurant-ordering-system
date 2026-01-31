import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:4173';
const SCREENSHOT_DIR = 'e2e/screenshots';

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
	fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function loginAndGoToOrderPage(page) {
	// Login
	await page.goto(`${BASE_URL}/login`);
	await page.fill('input[type="email"]', 'order@restaurant.com');
	await page.fill('input[type="password"]', 'password123');
	await page.click('button[type="submit"]');
	
	// Wait for navigation to complete
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(1000);
	
	// Navigate to order page if not already there
	if (!page.url().includes('/orders/new')) {
		await page.goto(`${BASE_URL}/orders/new`);
		await page.waitForTimeout(1000);
	}
}

async function takeScreenshots() {
	console.log('🚀 Starting screenshot capture...\n');

	const browser = await chromium.launch();

	try {
		// Screenshot 1: Mobile Discount Panel (iPhone SE size)
		console.log('📱 Taking screenshot: Mobile Discount Panel');
		const context1 = await browser.newContext({
			viewport: { width: 320, height: 568 }
		});
		const page1 = await context1.newPage();
		
		await loginAndGoToOrderPage(page1);
		
		// Add item to cart (button says "Add" not "Add to Order")
		const addButtons = await page1.locator('button:has-text("Add")').all();
		if (addButtons.length > 0) {
			await addButtons[0].click();
			await page1.waitForTimeout(1000);
		}
		
		// Wait for discount panel and scroll to order summary
		await page1.waitForSelector('[data-testid="discount-panel"]', { timeout: 10000 });
		await page1.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		await page1.waitForTimeout(500);
		
		await page1.screenshot({
			path: path.join(SCREENSHOT_DIR, '01-mobile-discount-panel.png'),
			fullPage: false
		});
		await context1.close();
		console.log('   ✅ Saved: 01-mobile-discount-panel.png\n');

		// Screenshot 2: Mobile Discount Sheet Open
		console.log('📱 Taking screenshot: Mobile Discount Sheet');
		const context2 = await browser.newContext({
			viewport: { width: 375, height: 667 }
		});
		const page2 = await context2.newPage();
		
		await loginAndGoToOrderPage(page2);
		
		// Add item (button says "Add" not "Add to Order")
		const addButtons2 = await page2.locator('button:has-text("Add")').all();
		if (addButtons2.length > 0) {
			await addButtons2[0].click();
			await page2.waitForTimeout(1000);
		}
		
		// Wait for discount panel to be visible and click add discount button
		await page2.waitForSelector('[data-testid="discount-panel"]', { timeout: 10000 });
		await page2.click('[data-testid="add-discount-btn"]');
		await page2.waitForTimeout(800);
		
		await page2.screenshot({
			path: path.join(SCREENSHOT_DIR, '02-mobile-discount-sheet.png'),
			fullPage: false
		});
		await context2.close();
		console.log('   ✅ Saved: 02-mobile-discount-sheet.png\n');

		// Screenshot 3: Order with Multiple Discounts
		console.log('📱 Taking screenshot: Order with Discounts Applied');
		const context3 = await browser.newContext({
			viewport: { width: 428, height: 926 }
		});
		const page3 = await context3.newPage();
		
		await loginAndGoToOrderPage(page3);
		
		// Add multiple items (button says "Add" not "Add to Order")
		const allAddButtons = await page3.locator('button:has-text("Add")').all();
		if (allAddButtons.length >= 2) {
			await allAddButtons[0].click();
			await page3.waitForTimeout(600);
			await allAddButtons[1].click();
			await page3.waitForTimeout(1000);
		}
		
		// Wait for discount panel and scroll to bottom
		await page3.waitForSelector('[data-testid="discount-panel"]', { timeout: 10000 });
		await page3.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		await page3.waitForTimeout(500);
		
		await page3.screenshot({
			path: path.join(SCREENSHOT_DIR, '03-mobile-order-with-discounts.png'),
			fullPage: false
		});
		await context3.close();
		console.log('   ✅ Saved: 03-mobile-order-with-discounts.png\n');

		// Screenshot 4: Desktop View
		console.log('💻 Taking screenshot: Desktop Order Page');
		const context4 = await browser.newContext({
			viewport: { width: 1280, height: 800 }
		});
		const page4 = await context4.newPage();
		
		await loginAndGoToOrderPage(page4);
		
		// Add items (button says "Add" not "Add to Order")
		const desktopAddButtons = await page4.locator('button:has-text("Add")').all();
		if (desktopAddButtons.length >= 2) {
			await desktopAddButtons[0].click();
			await page4.waitForTimeout(600);
			await desktopAddButtons[1].click();
			await page4.waitForTimeout(1000);
		}
		
		// Wait for discount panel to be visible
		await page4.waitForSelector('[data-testid="discount-panel"]', { timeout: 10000 });
		await page4.waitForTimeout(500);
		
		await page4.screenshot({
			path: path.join(SCREENSHOT_DIR, '04-desktop-order-page.png'),
			fullPage: false
		});
		await context4.close();
		console.log('   ✅ Saved: 04-desktop-order-page.png\n');

		console.log('🎉 All screenshots captured successfully!');
		console.log(`📁 Location: ${path.resolve(SCREENSHOT_DIR)}\n`);

	} catch (error) {
		console.error('❌ Error taking screenshots:', error);
		process.exit(1);
	} finally {
		await browser.close();
	}
}

takeScreenshots();
