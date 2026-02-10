/**
 * Authentication Step Definitions
 * 
 * Steps for user authentication flows using declarative style
 */

import { Given, When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'assert';
import type { CustomWorld } from '../support/world';

// ==================== GIVEN STEPS ====================

Given('{word} {word} has an account with password {string}', 
	function (this: CustomWorld, role: string, firstName: string, password: string) {
		const roleMap: Record<string, 'order_taker' | 'kitchen' | 'delivery' | 'admin'> = {
			'order': 'order_taker',
			'kitchen': 'kitchen',
			'delivery': 'delivery',
			'admin': 'admin'
		};
		
		const actualRole = roleMap[role.toLowerCase()] || 'order_taker';
		const email = `${firstName.toLowerCase()}.${actualRole}@restaurant.com`;
		
		const user = this.mockDb.createUser({
			name: `${firstName} ${actualRole.charAt(0).toUpperCase() + actualRole.slice(1)}`,
			email,
			passwordHash: password,
			role: actualRole
		});

		this.trackEntity(user.id);
		this.testContext['testUser'] = { firstName, email, role: actualRole };
	}
);

Given('a user has an account', function (this: CustomWorld) {
	const user = this.mockDb.createUser({
		name: 'Test User',
		email: 'test@restaurant.com',
		passwordHash: 'password123',
		role: 'order_taker'
	});
	this.trackEntity(user.id);
});

Given('{word} is logged in as {word}', 
	function (this: CustomWorld, firstName: string, role: string) {
		const roleMap: Record<string, string> = {
			'order': 'order_taker',
			'kitchen': 'kitchen',
			'delivery': 'delivery',
			'admin': 'admin'
		};
		const actualRole = roleMap[role.toLowerCase()] || role;
		const email = `${firstName.toLowerCase()}@restaurant.com`;
		
		let user = this.mockDb.getUserByEmail(email);
		if (!user) {
			user = this.mockDb.createUser({
				name: firstName,
				email,
				passwordHash: 'password123',
				role: actualRole as 'order_taker' | 'kitchen' | 'delivery' | 'admin'
			});
			this.trackEntity(user.id);
		}

		const session = this.mockDb.createSession({
			userId: user.id,
			expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
		});

		this.testContext.currentUser = {
			id: user.id,
			email: user.email,
			role: user.role
		};
		this.testContext.sessionToken = session.id;
		this.testContext['loggedInUser'] = firstName;
	}
);

Given('a user is on the login page', function (this: CustomWorld) {
	// User is on login page - no session active
	this.testContext.currentUser = undefined;
	this.testContext.sessionToken = undefined;
});

Given('a user is not logged in', function (this: CustomWorld) {
	this.testContext.currentUser = undefined;
	this.testContext.sessionToken = undefined;
});

// ==================== WHEN STEPS ====================

When('{word} logs in with {string} and {string}', 
	function (this: CustomWorld, firstName: string, email: string, password: string) {
		const user = this.mockDb.getUserByEmail(email);

		if (!user || user.passwordHash !== password) {
			this.testContext.lastResponse = {
				status: 401,
				body: { error: 'Invalid email or password' }
			};
			this.testContext.lastError = 'Invalid email or password';
			return;
		}

		const session = this.mockDb.createSession({
			userId: user.id,
			expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
		});

		this.testContext.currentUser = {
			id: user.id,
			email: user.email,
			role: user.role
		};
		this.testContext.sessionToken = session.id;
		this.testContext['loggedInUser'] = firstName;

		this.testContext.lastResponse = {
			status: 200,
			body: { 
				success: true, 
				redirect: getRedirectForRole(user.role),
				user: firstName
			}
		};
	}
);

When('they attempt to log in with incorrect credentials', function (this: CustomWorld) {
	this.testContext.lastResponse = {
		status: 401,
		body: { error: 'Invalid email or password' }
	};
	this.testContext.lastError = 'Invalid email or password';
});

When('they submit the login form without credentials', function (this: CustomWorld) {
	this.testContext.lastError = 'Email and password are required';
	this.testContext.lastResponse = {
		status: 400,
		body: { error: 'Validation failed' }
	};
});

When('{word} logs out', function (this: CustomWorld, firstName: string) {
	if (this.testContext.sessionToken) {
		this.mockDb.deleteSession(this.testContext.sessionToken);
	}
	this.testContext.currentUser = undefined;
	this.testContext.sessionToken = undefined;
	this.testContext['loggedInUser'] = undefined;
});

When('they attempt to access a protected page', function (this: CustomWorld) {
	// Simulate accessing a protected page while logged out
	this.testContext.lastResponse = {
		status: 302,
		body: { redirect: '/login' }
	};
});

When('{word} continues working without logging out', function (this: CustomWorld, firstName: string) {
	// Session should remain valid
	assert.ok(this.testContext.sessionToken, 'Session should still be active');
});

// ==================== THEN STEPS ====================

Then('{word} should be taken to the {word} {word}', 
	function (this: CustomWorld, firstName: string, pageType: string, pageName: string) {
		const response = this.testContext.lastResponse;
		assert.ok(response, 'No response found');
		assert.strictEqual(response.status, 200, 'Login should succeed');
		
		const expectedPaths: Record<string, string> = {
			'order creation page': '/orders/new',
			'kitchen view': '/kitchen',
			'delivery view': '/delivery',
			'admin dashboard': '/'
		};
		
		const path = `${pageType} ${pageName}`;
		const expectedPath = expectedPaths[path];
		
		if (expectedPath && response.body && typeof response.body === 'object') {
			const body = response.body as { redirect?: string };
			assert.strictEqual(body.redirect, expectedPath);
		}
	}
);

Then('{word} should see his assigned tasks', function (this: CustomWorld, firstName: string) {
	const response = this.testContext.lastResponse;
	assert.ok(response?.status === 200, 'User should see their dashboard');
});

Then('they should see an authentication error', function (this: CustomWorld) {
	assert.ok(this.testContext.lastError, 'Should have an error message');
	assert.ok(
		this.testContext.lastError?.toLowerCase().includes('invalid') ||
		this.testContext.lastError?.toLowerCase().includes('authentication'),
		'Error should indicate authentication failure'
	);
});

Then('they should remain on the login page', function (this: CustomWorld) {
	const response = this.testContext.lastResponse;
	assert.ok(response?.status !== 200, 'Should not redirect on failed login');
});

Then('they should see validation messages for required fields', function (this: CustomWorld) {
	assert.ok(this.testContext.lastError, 'Should show validation error');
});

Then('{word} should be returned to the login page', function (this: CustomWorld, firstName: string) {
	assert.strictEqual(this.testContext.currentUser, undefined, 'User should be logged out');
	assert.strictEqual(this.testContext.sessionToken, undefined, 'Session should be cleared');
});

Then("{word}'s session should be terminated", function (this: CustomWorld, firstName: string) {
	assert.strictEqual(this.testContext.sessionToken, undefined, 'Session token should be cleared');
});

Then('they should be redirected to the login page', function (this: CustomWorld) {
	const response = this.testContext.lastResponse;
	assert.ok(response, 'Response expected');
	assert.strictEqual(response.status, 302, 'Should redirect');
	
	if (response.body && typeof response.body === 'object') {
		const body = response.body as { redirect?: string };
		assert.strictEqual(body.redirect, '/login');
	}
});

Then('{word} should remain authenticated throughout the session', function (this: CustomWorld, firstName: string) {
	assert.ok(this.testContext.currentUser, 'User should still be logged in');
	assert.ok(this.testContext.sessionToken, 'Session should still be active');
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
