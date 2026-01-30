import { describe, it, expect, vi } from 'vitest';
import {
	mockFetch,
	mockFetchError,
	mockNavigation,
	mockToast,
	expectToastCalled,
	expectErrorToastCalled,
	resetAllMocks,
	flushPromises,
	advanceTimersByTime,
	useFakeTimers,
	restoreRealTimers
} from './utils';
import { goto } from '$app/navigation';
import { toast } from '$lib/utils/toast';
import {
	mockOrder,
	mockUser,
	mockMenuItem,
	mockCategory,
	mockClient,
	createMockOrders,
	createMockOrderItems
} from '../fixtures';

describe('Test Utilities', () => {
	describe('mockFetch', () => {
		it('mocks fetch with successful response', async () => {
			mockFetch({ data: 'test' });

			const response = await fetch('/api/test');
			const data = await response.json();

			expect(data).toEqual({ data: 'test' });
			expect(response.ok).toBe(true);
		});

		it('mocks fetch with error response', async () => {
			mockFetchError('Not found', 404);

			const response = await fetch('/api/test');
			const data = await response.json();

			expect(data).toEqual({ error: 'Not found' });
			expect(response.ok).toBe(false);
			expect(response.status).toBe(404);
		});
	});

	describe('mockNavigation', () => {
		it('mocks goto function', () => {
			const mockGoto = mockNavigation();

			// eslint-disable-next-line svelte/no-navigation-without-resolve
			goto('/test-page');

			expect(mockGoto).toHaveBeenCalledWith('/test-page');
		});
	});

	describe('mockToast', () => {
		it('mocks toast functions', () => {
			const toastMocks = mockToast();

			toast.success('Success message');
			toast.error('Error message');

			expect(toastMocks.successSpy).toHaveBeenCalledWith('Success message');
			expect(toastMocks.errorSpy).toHaveBeenCalledWith('Error message');

			toastMocks.resetMocks();
		});
	});

	describe('expectToastCalled', () => {
		it('asserts toast was called with message', () => {
			const toastMocks = mockToast();

			toast.success('Test message');

			expectToastCalled(toastMocks, 'Test message');
		});
	});

	describe('expectErrorToastCalled', () => {
		it('asserts error toast was called with message', () => {
			const toastMocks = mockToast();

			toast.error('Error message');

			expectErrorToastCalled(toastMocks, 'Error message');
		});
	});

	describe('resetAllMocks', () => {
		it('clears all mocks', () => {
			const mockFn = vi.fn();
			mockFn();
			expect(mockFn).toHaveBeenCalled();
			resetAllMocks();
			expect(mockFn).not.toHaveBeenCalled();
		});
	});

	describe('flushPromises', () => {
		it('resolves all pending promises', async () => {
			let resolved = false;
			Promise.resolve().then(() => {
				resolved = true;
			});

			expect(resolved).toBe(false);
			await flushPromises();
			expect(resolved).toBe(true);
		});
	});

	describe('advanceTimersByTime', () => {
		it('advances fake timers', () => {
			useFakeTimers();

			let callbackCalled = false;
			const callback = vi.fn(() => {
				callbackCalled = true;
			});

			setTimeout(callback, 1000);
			expect(callbackCalled).toBe(false);

			advanceTimersByTime(1000);
			expect(callbackCalled).toBe(true);
			expect(callback).toHaveBeenCalledTimes(1);

			restoreRealTimers();
		});
	});
});

describe('Test Fixtures', () => {
	describe('mockUser', () => {
		it('provides mock user data', () => {
			expect(mockUser).toHaveProperty('id');
			expect(mockUser).toHaveProperty('name');
			expect(mockUser).toHaveProperty('email');
			expect(mockUser).toHaveProperty('role');
			expect(mockUser.role).toBe('order_taker');
		});
	});

	describe('mockOrder', () => {
		it('provides mock order data', () => {
			expect(mockOrder).toHaveProperty('id');
			expect(mockOrder).toHaveProperty('customerName');
			expect(mockOrder).toHaveProperty('status');
			expect(mockOrder).toHaveProperty('items');
			expect(mockOrder.items).toBeInstanceOf(Array);
			expect(mockOrder.items.length).toBeGreaterThan(0);
		});
	});

	describe('mockMenuItem', () => {
		it('provides mock menu item data', () => {
			expect(mockMenuItem).toHaveProperty('id');
			expect(mockMenuItem).toHaveProperty('name');
			expect(mockMenuItem).toHaveProperty('price');
			expect(mockMenuItem).toHaveProperty('isAvailable');
			expect(mockMenuItem.price).toBe(5.99);
		});
	});

	describe('mockCategory', () => {
		it('provides mock category data', () => {
			expect(mockCategory).toHaveProperty('id');
			expect(mockCategory).toHaveProperty('name');
			expect(mockCategory).toHaveProperty('displayOrder');
			expect(mockCategory.name).toBe('Breads');
		});
	});

	describe('mockClient', () => {
		it('provides mock client data', () => {
			expect(mockClient).toHaveProperty('id');
			expect(mockClient).toHaveProperty('name');
			expect(mockClient).toHaveProperty('phone');
			expect(mockClient).toHaveProperty('address');
			expect(mockClient.phone).toBe('555-1234');
		});
	});

	describe('createMockOrders', () => {
		it('creates array of mock orders', () => {
			const orders = createMockOrders(5);

			expect(orders).toBeInstanceOf(Array);
			expect(orders.length).toBe(5);
			orders.forEach((order) => {
				expect(order).toHaveProperty('id');
				expect(order).toHaveProperty('customerName');
				expect(order).toHaveProperty('status');
			});
		});

		it('filters orders by status', () => {
			const pendingOrders = createMockOrders(3, 'pending');

			expect(pendingOrders.length).toBe(3);
			pendingOrders.forEach((order) => {
				expect(order.status).toBe('pending');
			});
		});
	});

	describe('createMockOrderItems', () => {
		it('creates array of mock order items', () => {
			const items = createMockOrderItems(5);

			expect(items).toBeInstanceOf(Array);
			expect(items.length).toBe(5);
			items.forEach((item) => {
				expect(item).toHaveProperty('id');
				expect(item).toHaveProperty('quantity');
				expect(item).toHaveProperty('unitPrice');
				expect(item).toHaveProperty('menuItemId');
			});
		});
	});
});
