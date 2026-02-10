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
 * Resets the world state and mock database
 */
Before(async function (this: CustomWorld, scenario) {
	// Reset the world state
	this.reset();
	
	// Log scenario start
	console.log(`\n📝 Scenario: ${scenario.pickle.name}`);
});

/**
 * Hook that runs after each scenario
 * Handles cleanup and reporting
 */
After(async function (this: CustomWorld, scenario) {
	// If scenario failed, you could take screenshots or save state here
	if (scenario.result?.status === Status.FAILED) {
		console.log(`❌ Scenario failed: ${scenario.pickle.name}`);
		
		// Log the error if available
		if (scenario.result.message) {
			console.error('Error:', scenario.result.message);
		}
	} else if (scenario.result?.status === Status.PASSED) {
		console.log(`✅ Scenario passed: ${scenario.pickle.name}`);
	}
	
	// Clean up is automatic via this.reset() in Before hook
	// But we could do additional cleanup here if needed
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
 * Can be used to set up special configuration for smoke tests
 */
Before({ tags: '@smoke' }, async function (this: CustomWorld) {
	// Smoke tests might need specific setup
	console.log('🔥 Running smoke test');
});

/**
 * Hook for @critical tagged scenarios
 * These are the most important tests
 */
Before({ tags: '@critical' }, async function (this: CustomWorld) {
	console.log('🚨 Running critical path test');
});
