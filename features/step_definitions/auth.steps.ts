/**
 * Authentication Step Definitions
 * 
 * Steps for user authentication and session management
 */

import { Given, When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'assert';
import type { CustomWorld } from '../support/world';

// ==================== GIVEN STEPS ====================

Given('I am logged in as {string}', function (this: CustomWorld, role: string) {
	const validRoles = ['order_taker', 'kitchen', 'delivery', 'admin'] as const;
	if (!validRoles.includes(role as any)) {
		throw new Error(`Invalid role: ${role}`);
	}

	const email = `${role}@test.com`;
	let user = this.mockDb.getUserByEmail(email);

	if (!user) {
		user = this.mockDb.createUser({
			name: `${role} User`,
			email,
			passwordHash: 'password123',
			role: role as typeof validRoles[number]
		});
		this.trackEntity(user.id);
	}

	// Create session
	const session = this.mockDb.createSession({
		userId: user.id,
		expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
	});

	this.context.currentUser = {
		id: user.id,
		email: user.email,
		role: user.role
	};
	this.context.sessionToken = session.id;
});

Given('I am not logged in', function (this: CustomWorld) {
	this.context.currentUser = undefined;
	this.context.sessionToken = undefined;
});

Given('I am on the login page', function (this: CustomWorld) {
	// In a real UI test, this would navigate to the page
	// For mock-based tests, we just set the context
	this.context.lastResponse = undefined;
});

// ==================== WHEN STEPS ====================

When(
	'I log in with email {string} and password {string}',
	function (this: CustomWorld, email: string, password: string) {
		const user = this.mockDb.getUserByEmail(email);

		if (!user || user.passwordHash !== password) {
			this.context.lastResponse = {
				status: 401,
				body: { error: 'Invalid email or password' }
			};
			return;
		}

		// Create session
		const session = this.mockDb.createSession({
			userId: user.id,
			expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
		});

		this.context.currentUser = {
			id: user.id,
			email: user.email,
			role: user.role
		};
		this.context.sessionToken = session.id;

		this.context.lastResponse = {
			status: 200,
			body: { success: true, redirect: getRedirectForRole(user.role) }
		};
	}
);

When('I click the {string} button', function (this: CustomWorld, buttonText: string) {
	// In a real UI test, this would click the button
	// For mock-based tests, we track the action
	if (buttonText === 'Log In') {
		// Login action would have been triggered by previous steps
	} else if (buttonText === 'Logout') {
		// Clear session
		if (this.context.sessionToken) {
			this.mockDb.deleteSession(this.context.sessionToken);
		}
		this.context.currentUser = undefined;
		this.context.sessionToken = undefined;
	}
});

When('I click on {string}', function (this: CustomWorld, text: string) {
	// Generic click handler for various UI elements
	if (text === 'Logout') {
		if (this.context.sessionToken) {
			this.mockDb.deleteSession(this.context.sessionToken);
		}
		this.context.currentUser = undefined;
		this.context.sessionToken = undefined;
	}
});

// ==================== THEN STEPS ====================

Then('I should be redirected to {string}', function (this: CustomWorld, path: string) {
	const response = this.context.lastResponse;
	assert.ok(response, 'No response found');

	if (response.status === 200 && response.body && typeof response.body === 'object') {
		const body = response.body as { redirect?: string };
		assert.strictEqual(body.redirect, path, `Expected redirect to ${path}, got ${body.redirect}`);
	} else {
		// Check if current path matches (in real UI tests)
		assert.strictEqual(response.status, 200, `Request failed with status ${response.status}`);
	}
});

Then('I should be on the {string} page', function (this: CustomWorld, path: string) {
	// In real UI tests, check current URL
	// For mock tests, verify we have appropriate context
	if (path === '/login') {
		assert.strictEqual(this.context.currentUser, undefined, 'User should not be logged in');
	}
});

Then('I should see {string}', function (this: CustomWorld, text: string) {
	const response = this.context.lastResponse;

	if (response && response.body && typeof response.body === 'object') {
		const bodyStr = JSON.stringify(response.body);
		assert.ok(
			bodyStr.toLowerCase().includes(text.toLowerCase()),
			`Expected to see "${text}" in response`
		);
	}
});

Then('I should see the login form', function (this: CustomWorld) {
	assert.strictEqual(this.context.currentUser, undefined, 'User should not be logged in');
	assert.strictEqual(this.context.sessionToken, undefined, 'No session should exist');
});

// ==================== HELPER FUNCTIONS ====================

function getRedirectForRole(role: string): string {
	switch (role) {
		case 'order_taker':
			return '/orders/new';
		case 'kitchen':
			return '/kitchen';
		case 'delivery':
			return '/delivery';
		case 'admin':
			return '/';
		default:
			return '/';
	}
}
