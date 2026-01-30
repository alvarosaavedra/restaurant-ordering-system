import { vi, expect, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Mock SvelteKit navigation
vi.mock('$app/navigation', () => ({
	goto: vi.fn(),
	invalidate: vi.fn(),
	invalidateAll: vi.fn()
}));

// Mock toast notifications
vi.mock('$lib/utils/toast', () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		info: vi.fn(),
		warning: vi.fn()
	}
}));

// Mock SvelteKit stores
vi.mock('$app/stores', () => ({
	getPage: vi.fn(() => ({
		url: new URL('http://localhost'),
		params: {},
		route: { id: '' },
		status: 200,
		error: null,
		data: {},
		form: undefined
	})),
	navigating: vi.fn(() => ({
		from: null,
		to: null,
		willUnload: false,
		type: null,
		delta: null
	}))
}));

// Setup global fetch mock (only for Node/server environment)
if (typeof global !== 'undefined') {
	global.fetch = vi.fn();
}

// Cleanup after each test
afterEach(() => {
	vi.clearAllMocks();
});
