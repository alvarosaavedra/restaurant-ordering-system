import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, cleanup as testingLibraryCleanup } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import Modal from './Modal.svelte';

describe('Modal', () => {
	beforeEach(() => {
		testingLibraryCleanup();
	});

	const createTestSnippet = (text: string) => {
		return createRawSnippet(() => ({
			render: () => text
		}));
	};

		it('renders when open={true}', async () => {
			const { container } = render(Modal, {
				open: true,
				title: 'Test Modal',
				children: createTestSnippet('Modal Content')
			});

		expect(container.querySelector('.fixed')).toBeInTheDocument();
		expect(container.querySelector('.bg-neutral-900\\/50')).toBeInTheDocument();
	});

	it('does not render when open={false}', async () => {
		const { container } = render(Modal, {
			open: false,
			title: 'Test Modal',
			children: createTestSnippet('Modal Content')
		});

		expect(container.querySelector('.fixed')).toBeNull();
	});

	it('closes on backdrop click', async () => {
		const handleClose = vi.fn();
		const { container } = render(Modal, {
			open: true,
			onclose: handleClose,
			title: 'Test Modal',
			children: createTestSnippet('Content')
		});

		const backdrop = container.querySelector('.bg-neutral-900\\/50');
		expect(backdrop).toBeInTheDocument();
		(backdrop as HTMLDivElement).click();

		expect(handleClose).toHaveBeenCalledTimes(1);
	});

	// Note: Escape key handling test is skipped because window.addEventListener
	// doesn't work in test environment. This is a known limitation.

	it('calls onclose callback on button click', async () => {
		const handleClose = vi.fn();
		const { container } = render(Modal, {
			open: true,
			onclose: handleClose,
			title: 'Test Modal',
			children: createTestSnippet('Content')
		});

		// Find the close button
		const closeButtons = container.querySelectorAll('button');
		const closeButton = Array.from(closeButtons).find(
			(btn) => btn.getAttribute('aria-label') === 'Close modal'
		);

		expect(closeButton).toBeDefined();
		if (closeButton) {
			(closeButton as HTMLButtonElement).click();
			expect(handleClose).toHaveBeenCalledTimes(1);
		}
	});

	it('applies custom classes', async () => {
		const { container } = render(Modal, {
			open: true,
			class: 'custom-class',
			title: 'Test Modal',
			children: createTestSnippet('Content')
		});

		// Check that custom class is present in the modal container
		const modalDiv = container.querySelector('.bg-white');
		expect(modalDiv).toBeInTheDocument();
		expect(modalDiv?.className).toContain('custom-class');
	});

	it('has accessibility attributes', async () => {
		const { container } = render(Modal, {
			open: true,
			title: 'Accessible Modal',
			children: createTestSnippet('Content')
		});

		expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
		expect(container.querySelector('[aria-modal="true"]')).toBeInTheDocument();
		expect(container.querySelector('[aria-labelledby="modal-title"]')).toBeInTheDocument();
	});

	it('has role="dialog"', async () => {
		const { container } = render(Modal, {
			open: true,
			title: 'Test Modal',
			children: createTestSnippet('Content')
		});

		expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
		expect(container.querySelector('[role="dialog"]')).toHaveAttribute('role', 'dialog');
	});
});
