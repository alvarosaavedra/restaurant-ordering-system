import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, cleanup as testingLibraryCleanup } from '@testing-library/svelte';
import ClientCard from './ClientCard.svelte';
import { mockClientWithOrderCount, mockClientWithSingleOrder } from './fixtures';

describe('ClientCard', () => {
	beforeEach(() => {
		testingLibraryCleanup();
	});

	it('renders client details', async () => {
		const { getByText } = render(ClientCard, {
			client: mockClientWithOrderCount,
			onedit: vi.fn(),
			ondelete: vi.fn()
		});

		expect(getByText(mockClientWithOrderCount.name)).toBeInTheDocument();
		expect(getByText(mockClientWithOrderCount.phone)).toBeInTheDocument();
	});

	it('shows address when client has one', async () => {
		const { getByText } = render(ClientCard, {
			client: mockClientWithOrderCount,
			onedit: vi.fn(),
			ondelete: vi.fn()
		});

		expect(getByText(mockClientWithOrderCount.address as string)).toBeInTheDocument();
	});

	it('shows address when present', async () => {
		const { getByText } = render(ClientCard, {
			client: mockClientWithOrderCount,
			onedit: vi.fn(),
			ondelete: vi.fn()
		});

		// Find the address text (may be split across multiple elements)
		expect(getByText((content) => content.includes('123 Main St'))).toBeInTheDocument();
	});

	it('displays order count', async () => {
		const { container } = render(ClientCard, {
			client: mockClientWithOrderCount,
			onedit: vi.fn(),
			ondelete: vi.fn()
		});

		// Use container query to find the order count span
		const orderCountSpan = container.querySelector('span');
		expect(orderCountSpan?.textContent).toContain(mockClientWithOrderCount.orderCount.toString());
	});

	it('shows singular "order" when count is 1', async () => {
		const { getByText } = render(ClientCard, {
			client: mockClientWithSingleOrder,
			onedit: vi.fn(),
			ondelete: vi.fn()
		});

		// Use a function matcher to find text even if broken up by multiple elements
		expect(getByText((content) => content.includes('1 order'))).toBeInTheDocument();
	});

	it('handles edit button click', async () => {
		const handleEdit = vi.fn();
		const { container } = render(ClientCard, {
			client: mockClientWithOrderCount,
			onedit: handleEdit,
			ondelete: vi.fn()
		});

		const editButton = container.querySelector('button[aria-label*="Edit"]') as HTMLButtonElement;
		expect(editButton).toBeInTheDocument();

		if (editButton) {
			editButton.click();
			expect(handleEdit).toHaveBeenCalledWith(mockClientWithOrderCount);
		}
	});

	it('handles delete button click', async () => {
		const handleDelete = vi.fn();
		const { container } = render(ClientCard, {
			client: mockClientWithOrderCount,
			onedit: vi.fn(),
			ondelete: handleDelete
		});

		const deleteButton = container.querySelector('button[aria-label*="Delete"]') as HTMLButtonElement;
		expect(deleteButton).toBeInTheDocument();

		if (deleteButton) {
			deleteButton.click();
			expect(handleDelete).toHaveBeenCalledWith(mockClientWithOrderCount);
		}
	});

	it('has accessibility attributes', async () => {
		const { container } = render(ClientCard, {
			client: mockClientWithOrderCount,
			onedit: vi.fn(),
			ondelete: vi.fn()
		});

		const editButton = container.querySelector('button[aria-label*="Edit"]');
		expect(editButton).toHaveAttribute('aria-label');

		const deleteButton = container.querySelector('button[aria-label*="Delete"]');
		expect(deleteButton).toHaveAttribute('aria-label');
	});
});
