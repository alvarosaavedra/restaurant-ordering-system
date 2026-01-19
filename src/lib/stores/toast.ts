import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
	id: string;
	message: string;
	type: ToastType;
	duration: number;
}

let nextId = 1;

export const toastStore = writable<ToastItem[]>([]);

export function add(message: string, type: ToastType = 'info', duration: number = 5000): string {
	const id = `toast-${nextId++}`;
	toastStore.update((toasts) => [...toasts, { id, message, type, duration }]);
	return id;
}

export function success(message: string, duration?: number): string {
	return add(message, 'success', duration);
}

export function error(message: string, duration?: number): string {
	return add(message, 'error', duration);
}

export function info(message: string, duration?: number): string {
	return add(message, 'info', duration);
}

export function warning(message: string, duration?: number): string {
	return add(message, 'warning', duration);
}

export function remove(id: string): void {
	toastStore.update((toasts) => toasts.filter((toast) => toast.id !== id));
}

export function clear(): void {
	toastStore.set([]);
}
