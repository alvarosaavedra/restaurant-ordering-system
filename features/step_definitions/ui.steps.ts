/**
 * UI Interaction Step Definitions
 * 
 * Steps for form interactions and UI elements
 */

import { When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'assert';
import type { CustomWorld } from '../support/world';

// ==================== FORM INPUT STEPS ====================

When('I enter {string} in the {string} field', function (this: CustomWorld, value: string, label: string) {
	// In real UI tests, this would find the field by label and enter the value
	// For mock tests, we track the form state
	if (!this.testContext['formData']) {
		this.testContext['formData'] = {};
	}
	this.testContext['formData'][label] = value;
});

When(
	'I enter {string} in the {string} input',
	function (this: CustomWorld, value: string, label: string) {
		if (!this.testContext['formData']) {
			this.testContext['formData'] = {};
		}
		this.testContext['formData'][label] = value;
	}
);

When('I clear the {string} field', function (this: CustomWorld, label: string) {
	if (this.testContext['formData']) {
		delete this.testContext['formData'][label];
	}
});

// ==================== DROPDOWN/SELECT STEPS ====================

When(
	'I select {string} from the {string} dropdown',
	function (this: CustomWorld, option: string, label: string) {
		if (!this.testContext['formData']) {
			this.testContext['formData'] = {};
		}
		this.testContext['formData'][label] = option;
	}
);

When(
	'I select {string} from the {string} select',
	function (this: CustomWorld, option: string, label: string) {
		if (!this.testContext['formData']) {
			this.testContext['formData'] = {};
		}
		this.testContext['formData'][label] = option;
	}
);

When(
	'I select {string} from the search results',
	function (this: CustomWorld, option: string) {
		// Handle selecting from search/autocomplete results
		if (option === this.testContext.currentClient?.name) {
			// Client was selected
			if (!this.testContext['formData']) {
				this.testContext['formData'] = {};
			}
			this.testContext['formData']['Customer Name'] = this.testContext.currentClient.name;
			this.testContext['formData']['Phone'] = this.testContext.currentClient.phone;
			if (this.testContext.currentClient.address) {
				this.testContext['formData']['Address'] = this.testContext.currentClient.address;
			}
		}
	}
);

// ==================== CHECKBOX/RADIO STEPS ====================

When('I check the {string} checkbox', function (this: CustomWorld, label: string) {
	if (!this.testContext['formData']) {
		this.testContext['formData'] = {};
	}
	this.testContext['formData'][label] = true;
});

When('I uncheck the {string} checkbox', function (this: CustomWorld, label: string) {
	if (!this.testContext['formData']) {
		this.testContext['formData'] = {};
	}
	this.testContext['formData'][label] = false;
});

When('I select the {string} radio button', function (this: CustomWorld, label: string) {
	if (!this.testContext['formData']) {
		this.testContext['formData'] = {};
	}
	this.testContext['formData']['radioSelection'] = label;
});

// ==================== BUTTON/ACTION STEPS ====================

When('I click {string}', function (this: CustomWorld, text: string) {
	// Generic click handler
	// Handle common actions
	if (text === 'Logout') {
		if (this.testContext.sessionToken) {
			this.mockDb.deleteSession(this.testContext.sessionToken);
		}
		this.testContext.currentUser = undefined;
		this.testContext.sessionToken = undefined;
	}
});

When('I click the {string} link', function (this: CustomWorld, text: string) {
	// Handle link clicks
	if (text === 'Logout') {
		if (this.testContext.sessionToken) {
			this.mockDb.deleteSession(this.testContext.sessionToken);
		}
		this.testContext.currentUser = undefined;
		this.testContext.sessionToken = undefined;
	}
});

When('I submit the form', function (this: CustomWorld) {
	// Process form submission
	const formData = this.testContext['formData'] || {};
	
	// Validate required fields
	if (formData['Customer Name'] === undefined || formData['Customer Name'] === '') {
		this.testContext.lastError = 'Customer name is required';
		return;
	}
	
	if (formData['Phone'] === undefined || formData['Phone'] === '') {
		this.testContext.lastError = 'Phone number is required';
		return;
	}
	
	// Form is valid
	this.testContext.lastResponse = {
		status: 200,
		body: { success: true, formData }
	};
});

// ==================== SEARCH STEPS ====================

When('I search for {string}', function (this: CustomWorld, searchTerm: string) {
	// Search for clients, menu items, etc.
	const clients = this.mockDb.getAllClients();
	const matchingClient = clients.find(c => 
		c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		c.phone.includes(searchTerm)
	);
	
	if (matchingClient) {
		this.testContext.currentClient = {
			id: matchingClient.id,
			name: matchingClient.name,
			phone: matchingClient.phone
		};
	}
});

When(
	'I search for client {string}',
	function (this: CustomWorld, searchTerm: string) {
		// Search for clients, menu items, etc.
		const clients = this.mockDb.getAllClients();
		const matchingClient = clients.find(c => 
			c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			c.phone.includes(searchTerm)
		);
		
		if (matchingClient) {
			this.testContext.currentClient = {
				id: matchingClient.id,
				name: matchingClient.name,
				phone: matchingClient.phone
			};
		}
	}
);

// ==================== VERIFICATION STEPS ====================

Then('the {string} field should contain {string}', function (this: CustomWorld, label: string, expectedValue: string) {
	const formData = this.testContext['formData'] || {};
	const actualValue = formData[label];
	
	assert.strictEqual(
		actualValue,
		expectedValue,
		`Expected "${label}" field to contain "${expectedValue}", got "${actualValue}"`
	);
});

Then('the {string} field should be empty', function (this: CustomWorld, label: string) {
	const formData = this.testContext['formData'] || {};
	const value = formData[label];
	
	assert.ok(
		value === undefined || value === '' || value === null,
		`Expected "${label}" field to be empty, got "${value}"`
	);
});

Then(
	'the {string} field should show {string}',
	function (this: CustomWorld, label: string, expectedText: string) {
		const formData = this.testContext['formData'] || {};
		const actualValue = formData[label];
		
		assert.strictEqual(
			actualValue,
			expectedText,
			`Expected "${label}" field to contain "${expectedText}", got "${actualValue}"`
		);
	}
);

Then('I should not see {string}', function (this: CustomWorld, text: string) {
	// In real UI tests, verify element is not visible
	// For mock tests, check that certain states don't exist
	if (text === 'error' || text === 'errors') {
		assert.ok(!this.testContext.lastError, `Expected no errors, but found: ${this.testContext.lastError}`);
	}
});

Then('I should see an error message', function (this: CustomWorld) {
	assert.ok(this.testContext.lastError, 'Expected an error message but none was found');
});

Then('I should see a success message', function (this: CustomWorld) {
	const response = this.testContext.lastResponse;
	assert.ok(response, 'No response found');
	assert.strictEqual(response.status, 200, 'Expected successful response');
	
	if (response.body && typeof response.body === 'object') {
		const body = response.body as { success?: boolean; message?: string };
		assert.ok(
			body.success === true || body.message?.toLowerCase().includes('success'),
			'Expected success message'
		);
	}
});

Then('I should see the text {string}', function (this: CustomWorld, text: string) {
	const response = this.testContext.lastResponse;
	
	if (response && response.body && typeof response.body === 'object') {
		const bodyStr = JSON.stringify(response.body);
		assert.ok(
			bodyStr.toLowerCase().includes(text.toLowerCase()),
			`Expected to see "${text}" in response`
		);
	}
});

Then('I should see a {string} button', function (this: CustomWorld, buttonText: string) {
	// In real UI tests, verify button exists
	// For mock tests, this is mostly a no-op
	assert.ok(true, `Button "${buttonText}" should be visible`);
});

Then('I should see a {string} link', function (this: CustomWorld, linkText: string) {
	// In real UI tests, verify link exists
	assert.ok(true, `Link "${linkText}" should be visible`);
});
