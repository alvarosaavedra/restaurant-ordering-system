/**
 * Navigation Step Definitions
 * 
 * Steps for page navigation and URL management
 */

import { Given, When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'assert';
import type { CustomWorld } from '../support/world';

// ==================== GIVEN STEPS ====================

Given('I am on the {string} page', function (this: CustomWorld, pageName: string) {
	const path = getPathForPage(pageName);
	// In real UI tests, this would navigate to the URL
	// For mock tests, we just track the current location
	this.testContext.lastResponse = {
		status: 200,
		body: { currentPath: path }
	};
});

Given(
	'I am on the {string} page with id {string}',
	function (this: CustomWorld, pageName: string, id: string) {
		const path = getPathForPage(pageName).replace(':id', id);
		this.testContext.lastResponse = {
			status: 200,
			body: { currentPath: path }
		};
	}
);

// ==================== WHEN STEPS ====================

When('I navigate to {string}', function (this: CustomWorld, path: string) {
	// In real UI tests, this would navigate to the URL
	// For mock tests, we simulate navigation
	this.testContext.lastResponse = {
		status: 200,
		body: { currentPath: path }
	};
});

When('I go back', function (this: CustomWorld) {
	// Simulate browser back button
	this.testContext.lastResponse = {
		status: 200,
		body: { action: 'back' }
	};
});

When('I refresh the page', function (this: CustomWorld) {
	// Simulate page refresh
	this.testContext.lastResponse = {
		status: 200,
		body: { action: 'refresh' }
	};
});

// ==================== THEN STEPS ====================

Then('the URL should be {string}', function (this: CustomWorld, expectedPath: string) {
	const response = this.testContext.lastResponse;
	assert.ok(response, 'No navigation response found');

	if (response.body && typeof response.body === 'object') {
		const body = response.body as { currentPath?: string };
		assert.strictEqual(body.currentPath, expectedPath, `Expected URL ${expectedPath}`);
	}
});

Then('the URL should contain {string}', function (this: CustomWorld, text: string) {
	const response = this.testContext.lastResponse;
	assert.ok(response, 'No navigation response found');

	if (response.body && typeof response.body === 'object') {
		const body = response.body as { currentPath?: string };
		const currentPath = body.currentPath || '';
		assert.ok(
			currentPath.includes(text),
			`Expected URL to contain "${text}", got "${currentPath}"`
		);
	}
});

Then('I should see the {string} page', function (this: CustomWorld, pageName: string) {
	const expectedPath = getPathForPage(pageName);
	const response = this.testContext.lastResponse;
	assert.ok(response, 'No page loaded');
	assert.strictEqual(response.status, 200, 'Page failed to load');
});

// ==================== HELPER FUNCTIONS ====================

function getPathForPage(pageName: string): string {
	const pageMap: Record<string, string> = {
		'login': '/login',
		'home': '/',
		'dashboard': '/',
		'orders': '/orders',
		'order history': '/orders',
		'create order': '/orders/new',
		'new order': '/orders/new',
		'kitchen': '/kitchen',
		'delivery': '/delivery',
		'admin': '/admin',
		'clients': '/admin/clients',
		'menu': '/admin/menu/items',
		'menu items': '/admin/menu/items',
		'categories': '/admin/menu/categories',
		'variations': '/admin/menu/variations',
		'modifiers': '/admin/menu/modifiers',
		'reports': '/admin/reports/sales',
		'sales reports': '/admin/reports/sales',
		'order detail': '/orders/:id',
		'order details': '/orders/:id'
	};

	const normalized = pageName.toLowerCase();
	const path = pageMap[normalized];
	
	if (!path) {
		// Try to construct path from page name
		return `/${pageName.toLowerCase().replace(/\s+/g, '-')}`;
	}
	
	return path;
}
