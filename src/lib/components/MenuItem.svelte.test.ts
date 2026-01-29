import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, cleanup as testingLibraryCleanup } from '@testing-library/svelte';
import MenuItem from './MenuItem.svelte';
import type { MenuItemWithCategory } from '$lib/types/orders';
import { mockMenuItem, mockMenuItem2, mockCategory, mockCategory2 } from '../__tests__/fixtures';

describe('MenuItem', () => {
	beforeEach(() => {
		testingLibraryCleanup();
	});

	it('renders menu item details', async () => {
		const { container, getByText } = render(MenuItem, {
			item: mockMenuItem
			onAdd: vi.fn(),
			quantity: 1
		});

		expect(getByText(mockMenuItem.name)).toBeInTheDocument();
		expect(getByText(mockMenuItem.description)).toBeInTheDocument();
	});

	it('displays category when item has one', async () => {
		const { getByText } = render(MenuItem, {
			item: mockMenuItem
			onAdd: vi.fn(),
			quantity: 1
		});

		expect(getByText(mockMenuItem.category.name)).toBeInTheDocument();
	});

	it('displays formatted price', async () => {
		const { getByText } = render(MenuItem, {
			item: mockMenuItem,
			onAdd: vi.fn(),
			quantity: 1
		});

		expect(getByText(`$${mockMenuItem.price.toFixed(2)}`)).toBeInTheDocument();
	});

	it('displays correct quantity', async () => {
		const { getByText } = render(MenuItem, {
			item: mockMenuItem,
			onAdd: vi.fn(),
			quantity: 5
		});

		expect(getByText('5')).toBeInTheDocument();
	});

	it('shows availability indicator for available item', async () => {
		const { getByText } = render(MenuItem, {
			item: mockMenuItem,
			onAdd: vi.fn(),
			quantity: 1
		});

		expect(getByText('Available')).toBeInTheDocument();
		expect(getByText('Unavailable')).not.toBeInTheDocument();

		const statusBadge = container.querySelector('[role="status"]');
		expect(statusBadge).toHaveAttribute('aria-label', 'Available');
	});

	it('shows out of stock indicator for unavailable item', async () => {
		const { getByText } = render(MenuItem, {
			item: { ...mockMenuItem, isAvailable: false },
			onAdd: vi.fn(),
			quantity: 1
		});

		expect(getByText('Out of Stock')).toBeInTheDocument();
		expect(getByText('Available')).not.toBeInTheDocument();

		const statusBadge = container.querySelector('[role="status"]');
		expect(statusBadge).toHaveAttribute('aria-label', 'Out of Stock');
	});

	it('handles add to order button click', async () => {
		const handleAdd = vi.fn();
		const { container } = render(MenuItem, {
			item: mockMenuItem,
			onAdd: handleAdd,
			quantity: 1
		});

		const addButton = container.querySelector('button');
		expect(addButton).toBeInTheDocument();

		addButton.click();
		expect(handleAdd).toHaveBeenCalledWith(mockMenuItem, 1);
	});

	it('updates quantity with increment button', async () => {
		const { container, getByRole } = render(MenuItem, {
			item: mockMenuItem,
			onAdd: vi.fn(),
			quantity: 1
		});

		const incrementButton = container.querySelector('button[aria-label*="Increase"]');
		expect(incrementButton).toBeInTheDocument();

		incrementButton.click();
		expect(container.querySelector('[aria-atomic="true"]').textContent).toBe('2');
	});

	it('updates quantity with decrement button', async () => {
		const { container, getByRole } = render(MenuItem, {
			item: mockMenuItem,
			onAdd: vi.fn(),
			quantity: 2
		});

		const decrementButton = container.querySelector('button[aria-label*="Decrease"]');
		expect(decrementButton).toBeInTheDocument();

		decrementButton.click();
		expect(container.querySelector('[aria-atomic="true"]').textContent).toBe('1');
	});

	it('disables decrement button at minimum quantity (1)', async () => {
		const { container } = render(MenuItem, {
			item: mockMenuItem,
			onAdd: vi.fn(),
			quantity: 1
		});

		const decrementButton = container.querySelector('button[aria-label*="Decrease"]');
		expect(decrementButton).toBeDisabled();
	});

	it('calculates and displays total price', async () => {
		const { getByText } = render(MenuItem, {
			item: mockMenuItem,
			onAdd: vi.fn(),
			quantity: 3
		});

		expect(getByText(`$${(mockMenuItem.price * 3).toFixed(2)}`)).toBeInTheDocument();
	});

	it('disables add button when not available', async () => {
		const { container } = render(MenuItem, {
			item: { ...mockMenuItem, isAvailable: false },
			onAdd: vi.fn(),
			quantity: 1
		});

		const addButton = container.querySelector('button');
		expect(addButton).toBeDisabled();
	});

	it('applies custom classes', async () => {
		const { container } = render(MenuItem, {
			item: mockMenuItem,
			class: 'custom-class',
			onAdd: vi.fn(),
			quantity: 1
		});

		const itemContainer = container.querySelector('[role="listitem"]');
		expect(itemContainer).toHaveClass('custom-class');
	});

	it('has accessibility attributes', async () => {
		const { container } = render(MenuItem, {
			item: mockMenuItem,
			onAdd: vi.fn(),
			quantity: 1
		});

		const itemContainer = container.querySelector('[role="listitem"]');
		expect(itemContainer).toHaveAttribute('role', 'listitem');

		const decrementButton = container.querySelector('button[aria-label*="Decrease"]');
		expect(decrementButton).toHaveAttribute('aria-label');
	});
});
