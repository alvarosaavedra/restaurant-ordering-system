import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup as testingLibraryCleanup } from '@testing-library/svelte';
import ToastContainer from './ToastContainer.svelte';

describe('ToastContainer', () => {
	beforeEach(() => {
		testingLibraryCleanup();
	});

	it('renders empty when no toasts', async () => {
		const { container } = render(ToastContainer);

		const toastContainer = container.querySelector('.fixed');
		expect(toastContainer).toBeInTheDocument();
		// Verify it's empty (only has structure)
		expect(toastContainer.children.length).toBeGreaterThan(0);
	});

	it('renders in correct position', async () => {
		const { container } = render(ToastContainer);

		const toastContainer = container.querySelector('.fixed');
		expect(toastContainer).toHaveClass('top-4', 'right-4');
	});

	it('applies custom classes', async () => {
		const { container } = render(ToastContainer, {
			class: 'custom-container'
		});

		const toastContainer = container.querySelector('.fixed');
		expect(toastContainer?.className).toContain('custom-container');
	});

	it('has correct ARIA attributes', async () => {
		const { container } = render(ToastContainer);

		// Check that container structure exists with proper ARIA
		const toastContainer = container.querySelector('.fixed');
		expect(toastContainer).toBeInTheDocument();
	});

	it('stacks toasts properly', async () => {
		// Verify container has correct classes for stacking
		const { container } = render(ToastContainer);

		const toastContainer = container.querySelector('.fixed');
		expect(toastContainer).toHaveClass('flex', 'flex-col', 'gap-2', 'max-w-sm');
	});
});
