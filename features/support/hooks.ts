/**
 * Cucumber Hooks
 * 
 * Lifecycle hooks for BDD test scenarios.
 */

import { Before, After, BeforeAll, AfterAll, Status } from '@cucumber/cucumber';
import type { CustomWorld } from './world';

/**
 * Hook that runs once before all tests start
 */
BeforeAll(async function () {
	console.log('🚀 Starting BDD test suite...');
});

/**
 * Hook that runs before each scenario
 * Resets the world state and initializes browser
 */
Before(async function (this: CustomWorld, scenario) {
	// Reset the world state
	this.reset();
	
	// Initialize browser for UI testing
	await this.initBrowser();
	
	// Log scenario start
	console.log(`\n📝 Scenario: ${scenario.pickle.name}`);
});

/**
 * Hook that runs after each scenario
 * Handles cleanup and reporting
 */
After(async function (this: CustomWorld, scenario) {
	// If scenario failed, take screenshot
	if (scenario.result?.status === Status.FAILED && this.page) {
		console.log(`❌ Scenario failed: ${scenario.pickle.name}`);
		
		// Take screenshot on failure
		const screenshotPath = `reports/screenshots/failed-${scenario.pickle.name.replace(/\s+/g, '-').toLowerCase()}.png`;
		await this.page.screenshot({ path: screenshotPath, fullPage: true });
		console.log(`📸 Screenshot saved: ${screenshotPath}`);
		
		// Log the error if available
		if (scenario.result.message) {
			console.error('Error:', scenario.result.message);
		}
	} else if (scenario.result?.status === Status.PASSED) {
		console.log(`✅ Scenario passed: ${scenario.pickle.name}`);
	}
	
	// Close browser
	await this.closeBrowser();
});

/**
 * Hook that runs once after all tests complete
 */
AfterAll(async function () {
	console.log('\n🏁 BDD test suite complete!');
});

/**
 * Hook for @wip tagged scenarios
 * Can be used to skip or specially handle work-in-progress tests
 */
Before({ tags: '@wip' }, async function (this: CustomWorld, scenario) {
	console.log(`⚠️  Running WIP scenario: ${scenario.pickle.name}`);
});

/**
 * Hook for @smoke tagged scenarios
 */
Before({ tags: '@smoke' }, async function (this: CustomWorld) {
	console.log('🔥 Running smoke test');
});

/**
 * Hook for @critical tagged scenarios
 */
Before({ tags: '@critical' }, async function (this: CustomWorld) {
	console.log('🚨 Running critical path test');
});
