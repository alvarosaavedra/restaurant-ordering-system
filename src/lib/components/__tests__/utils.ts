import { vi, expect, afterEach, type MockedFunction } from 'vitest';
import { cleanup } from '@testing-library/svelte';
import * as matchers from '@testing-library/jest-dom/matchers';
import { goto } from '$app/navigation';
import { toast } from '$lib/utils/toast';

expect.extend(matchers);

afterEach(() => {
	cleanup();
});

export function mockFetch(response: unknown, ok = true) {
	global.fetch = vi.fn(() =>
		Promise.resolve({
			ok,
			json: async () => response,
			status: ok ? 200 : 400,
			statusText: ok ? 'OK' : 'Bad Request'
		})
	) as any;
}

export function mockFetchError(message: string, status = 400) {
	global.fetch = vi.fn(() =>
		Promise.resolve({
			ok: false,
			json: async () => ({ error: message }),
			status,
			statusText: 'Error'
		})
	) as any;
}

export function mockNavigation() {
	const mockGoto = vi.fn();
	(goto as any).mockImplementation(mockGoto);
	return mockGoto;
}

export function mockToast() {
	const successSpy = vi.spyOn(toast, 'success');
	const errorSpy = vi.spyOn(toast, 'error');
	const infoSpy = vi.spyOn(toast, 'info');
	const warningSpy = vi.spyOn(toast, 'warning');

	return {
		successSpy,
		errorSpy,
		infoSpy,
		warningSpy,
		resetMocks: () => {
			successSpy.mockClear();
			errorSpy.mockClear();
			infoSpy.mockClear();
			warningSpy.mockClear();
		}
	};
}

export function expectToastCalled(toastMocks: ReturnType<typeof mockToast>, message: string) {
	expect(toastMocks.successSpy).toHaveBeenCalledWith(message);
}

export function expectErrorToastCalled(toastMocks: ReturnType<typeof mockToast>, message: string) {
	expect(toastMocks.errorSpy).toHaveBeenCalledWith(message);
}

export function resetAllMocks() {
	vi.clearAllMocks();
}

export async function waitFor(condition: () => boolean, timeout = 1000) {
	const start = Date.now();
	while (!condition() && Date.now() - start < timeout) {
		await new Promise((resolve) => setTimeout(resolve, 50));
	}
	if (!condition()) {
		throw new Error(`Condition not met within ${timeout}ms`);
	}
}

export function createMockEvent(value: string) {
	return {
		target: { value },
		preventDefault: vi.fn(),
		stopPropagation: vi.fn()
	} as unknown as Event;
}

export function createMockChangeEvent(value: string) {
	return {
		target: { value }
	} as unknown as Event;
}

export function createMockKeyboardEvent(
	key: string,
	options: {
		ctrlKey?: boolean;
		shiftKey?: boolean;
		altKey?: boolean;
		metaKey?: boolean;
		preventDefault?: () => void;
	} = {}
) {
	return {
		key,
		ctrlKey: options.ctrlKey || false,
		shiftKey: options.shiftKey || false,
		altKey: options.altKey || false,
		metaKey: options.metaKey || false,
		preventDefault: options.preventDefault || vi.fn(),
		stopPropagation: vi.fn()
	} as unknown as KeyboardEvent;
}

export function createMockMouseEvent(options: {
	ctrlKey?: boolean;
	shiftKey?: boolean;
	altKey?: boolean;
	metaKey?: boolean;
	button?: number;
	preventDefault?: () => void;
} = {}) {
	return {
		ctrlKey: options.ctrlKey || false,
		shiftKey: options.shiftKey || false,
		altKey: options.altKey || false,
		metaKey: options.metaKey || false,
		button: options.button || 0,
		preventDefault: options.preventDefault || vi.fn(),
		stopPropagation: vi.fn()
	} as unknown as MouseEvent;
}

export function flushPromises() {
	return new Promise((resolve) => setTimeout(resolve, 0));
}

export async function tick() {
	await flushPromises();
}

export function advanceTimersByTime(ms: number) {
	vi.advanceTimersByTime(ms);
}

export function advanceTimersToNextTimer() {
	vi.advanceTimersToNextTimer();
}

export function useFakeTimers() {
	vi.useFakeTimers();
}

export function restoreRealTimers() {
	vi.useRealTimers();
}

export function runAllTimers() {
	vi.runAllTimers();
}

export function runOnlyPendingTimers() {
	vi.runOnlyPendingTimers();
}

export type MockFetchCalls = Array<{
	url: string;
	options?: RequestInit;
}>;

export function getFetchCalls(): MockFetchCalls {
	return (global.fetch as MockedFunction<typeof fetch>).mock.calls.map(([url, options]) => ({
		url: url as string,
		options
	}));
}

export function expectFetchCalled(url: string, options?: RequestInit) {
	expect(global.fetch).toHaveBeenCalledWith(url, options);
}

export function expectFetchCalledTimes(times: number) {
	expect(global.fetch).toHaveBeenCalledTimes(times);
}

export function expectFetchNotCalled() {
	expect(global.fetch).not.toHaveBeenCalled();
}

export function getLastFetchCall() {
	const calls = (global.fetch as MockedFunction<typeof fetch>).mock.calls;
	const lastCall = calls[calls.length - 1];
	if (!lastCall) {
		return null;
	}
	return {
		url: lastCall[0] as string,
		options: lastCall[1]
	};
}

export function createMockFormData(data: Record<string, string>) {
	const formData = new FormData();
	Object.entries(data).forEach(([key, value]) => {
		formData.append(key, value);
	});
	return formData;
}

export function mockWindowLocation(href = 'http://localhost:5173/') {
	Object.defineProperty(window, 'location', {
		writable: true,
		value: {
			href,
			origin: 'http://localhost:5173',
			protocol: 'http:',
			host: 'localhost:5173',
			hostname: 'localhost',
			port: '5173',
			pathname: '/',
			search: '',
			hash: '',
			assign: vi.fn(),
			reload: vi.fn(),
			replace: vi.fn()
		}
	});
}

export function mockLocalStorage() {
	const store: Record<string, string> = {};

	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value;
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			Object.keys(store).forEach((key) => delete store[key]);
		},
		clearStore: () => {
			Object.keys(store).forEach((key) => delete store[key]);
		}
	};
}

export function mockIntersectionObserver() {
	const mockIntersectionObserver = vi.fn();
	mockIntersectionObserver.mockReturnValue({
		observe: () => null,
		unobserve: () => null,
		disconnect: () => null
	});
	global.IntersectionObserver = mockIntersectionObserver as any;
}

export function mockResizeObserver() {
	const mockResizeObserver = vi.fn();
	mockResizeObserver.mockReturnValue({
		observe: () => null,
		unobserve: () => null,
		disconnect: () => null
	});
	global.ResizeObserver = mockResizeObserver as any;
}

export function mockMediaQuery(matches = false) {
	const mockMediaQueryList = {
		matches,
		media: '(max-width: 768px)',
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn()
	};
	window.matchMedia = vi.fn().mockReturnValue(mockMediaQueryList);
	return mockMediaQueryList;
}

export function setupTestEnvironment() {
	useFakeTimers();
	mockIntersectionObserver();
	mockResizeObserver();
}

export function cleanupTestEnvironment() {
	restoreRealTimers();
	cleanup();
	resetAllMocks();
}

export async function act(callback: () => void | Promise<void>) {
	await callback();
	await tick();
}

export function createMockProps<T extends Record<string, unknown>>(props: T): T {
	return props;
}
