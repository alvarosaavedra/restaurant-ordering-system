import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, cleanup as testingLibraryCleanup } from '@testing-library/svelte';
import Toast from './Toast.svelte';

describe('Toast', () => {
	beforeEach(() => {
		testingLibraryCleanup();
	});

	afterEach(() => {
		testingLibraryCleanup();
		vi.restoreAllMocks();
	});

	it('renders all variants', async () => {
		const successToast = render(Toast, {
			id: 'toast-1',
			message: 'Success message',
			type: 'success',
			duration: 3000
		});
		expect(successToast.container.querySelector('.bg-success-50')).toBeInTheDocument();

		testingLibraryCleanup();

		const errorToast = render(Toast, {
			id: 'toast-2',
			message: 'Error message',
			type: 'error',
			duration: 3000
		});
		expect(errorToast.container.querySelector('.bg-error-50')).toBeInTheDocument();

		testingLibraryCleanup();

		const infoToast = render(Toast, {
			id: 'toast-3',
			message: 'Info message',
			type: 'info',
			duration: 3000
		});
		expect(infoToast.container.querySelector('.bg-info-50')).toBeInTheDocument();

		testingLibraryCleanup();

		const warningToast = render(Toast, {
			id: 'toast-4',
			message: 'Warning message',
			type: 'warning',
			duration: 3000
		});
		expect(warningToast.container.querySelector('.bg-warning-50')).toBeInTheDocument();
	});

	it('shows message content', async () => {
		const { container } = render(Toast, {
			id: 'toast-1',
			message: 'Test message',
			type: 'success',
			duration: 3000
		});

		const toastDiv = container.querySelector('.bg-success-50');
		expect(toastDiv).toBeInTheDocument();
		expect(toastDiv?.textContent).toContain('Test message');
	});

	it('closes on dismiss button click', async () => {
		const onRemove = vi.fn();
		const { container } = render(Toast, {
			id: 'toast-1',
			message: 'Test message',
			type: 'success',
			onRemove: onRemove,
			duration: 3000
		});

		const dismissButton = container.querySelector('button[aria-label="Close"]');
		expect(dismissButton).toBeInTheDocument();

		dismissButton.click();

		// Small delay to allow animation to process
		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(onRemove).toHaveBeenCalledWith('toast-1');
	});

	it('applies custom classes', async () => {
		const { container } = render(Toast, {
			id: 'toast-1',
			message: 'Test message',
			type: 'success',
			class: 'custom-toast',
			duration: 3000
		});

		const toastElement = container.querySelector('.inline-flex');
		expect(toastElement?.className).toContain('custom-toast');
	});

	it('has dismiss button', async () => {
		const { getByRole } = render(Toast, {
			id: 'toast-1',
			message: 'Test message',
			type: 'success',
			duration: 3000
		});

		const button = getByRole('button');
		expect(button).toBeInTheDocument();
		expect(button).toHaveAttribute('aria-label', 'Close');
	});
});
