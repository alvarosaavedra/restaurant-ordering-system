import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, cleanup as testingLibraryCleanup } from '@testing-library/svelte';
import MenuItem from './MenuItem.svelte';
import { mockMenuItemWithCategory, mockUnavailableMenuItemWithCategory } from './fixtures';
import { tick } from './__tests__/utils';

describe('MenuItem', () => {
	beforeEach(() => {
		testingLibraryCleanup();
	});

	it('renders menu item details', async () => {
		const { getByText } = render(MenuItem, {
			item: mockMenuItemWithCategory,
			onAdd: vi.fn()
		});

		expect(getByText(mockMenuItemWithCategory.name)).toBeInTheDocument();
		expect(getByText(mockMenuItemWithCategory.description)).toBeInTheDocument();
	});

	it('displays formatted price', async () => {
		const { getByText } = render(MenuItem, {
			item: mockMenuItemWithCategory,
			onAdd: vi.fn()
		});

		expect(getByText('$6')).toBeInTheDocument(); // 5.99 rounded to 6
	});

	it('displays initial quantity as 1', async () => {
		const { getByText } = render(MenuItem, {
			item: mockMenuItemWithCategory,
			onAdd: vi.fn()
		});

		expect(getByText('1')).toBeInTheDocument();
	});

	it('shows out of stock indicator for unavailable item', async () => {
		const { getByText } = render(MenuItem, {
			item: mockUnavailableMenuItemWithCategory,
			onAdd: vi.fn()
		});

		expect(getByText('Out of Stock')).toBeInTheDocument();
	});

	it('shows unavailable indicator when not available', async () => {
		const { getByText } = render(MenuItem, {
			item: mockUnavailableMenuItemWithCategory,
			onAdd: vi.fn()
		});

		expect(getByText('Unavailable')).toBeInTheDocument();
	});

	it('does not show out of stock text for available item', async () => {
		const { queryByText } = render(MenuItem, {
			item: mockMenuItemWithCategory,
			onAdd: vi.fn()
		});

		expect(queryByText('Out of Stock')).not.toBeInTheDocument();
	});

	it('handles add to order button click', async () => {
		const handleAdd = vi.fn();
		const { container } = render(MenuItem, {
			item: mockMenuItemWithCategory,
			onAdd: handleAdd
		});

		// Use aria-label to find the specific Add button
		const addButton = container.querySelector('button[aria-label*="to order"]') as HTMLButtonElement;
		expect(addButton).toBeInTheDocument();

		if (addButton) {
			addButton.click();
			expect(handleAdd).toHaveBeenCalledWith(mockMenuItemWithCategory, 1);
		}
	});

	it('updates quantity with increment button', async () => {
		const { container } = render(MenuItem, {
			item: mockMenuItemWithCategory,
			onAdd: vi.fn()
		});

		const incrementButton = container.querySelector('button[aria-label*="Increase"]') as HTMLButtonElement;
		expect(incrementButton).toBeInTheDocument();

		if (incrementButton) {
			incrementButton.click();
			await tick();
			const quantityDisplay = container.querySelector('[aria-atomic="true"]');
			expect(quantityDisplay?.textContent).toBe('2');
		}
	});

	it('updates quantity with decrement button', async () => {
		const { container } = render(MenuItem, {
			item: mockMenuItemWithCategory,
			onAdd: vi.fn()
		});

		// First increment to 2, then decrement
		const incrementButton = container.querySelector('button[aria-label*="Increase"]') as HTMLButtonElement;
		incrementButton?.click();
		await tick();

		const decrementButton = container.querySelector('button[aria-label*="Decrease"]') as HTMLButtonElement;
		expect(decrementButton).toBeInTheDocument();

		if (decrementButton) {
			decrementButton.click();
			await tick();
			const quantityDisplay = container.querySelector('[aria-atomic="true"]');
			expect(quantityDisplay?.textContent).toBe('1');
		}
	});

	it('disables decrement button at minimum quantity (1)', async () => {
		const { container } = render(MenuItem, {
			item: mockMenuItemWithCategory,
			onAdd: vi.fn()
		});

		const decrementButton = container.querySelector('button[aria-label*="Decrease"]') as HTMLButtonElement;
		expect(decrementButton).toBeDisabled();
	});

	it('shows unavailable text instead of add button when not available', async () => {
		const { container, getByText } = render(MenuItem, {
			item: mockUnavailableMenuItemWithCategory,
			onAdd: vi.fn()
		});

		expect(getByText('Unavailable')).toBeInTheDocument();

		// When unavailable, there should be no add button
		const addButton = container.querySelector('button[type="button"]');
		expect(addButton).not.toBeInTheDocument();
	});

	it('has accessibility attributes', async () => {
		const { container } = render(MenuItem, {
			item: mockMenuItemWithCategory,
			onAdd: vi.fn()
		});

		const itemContainer = container.querySelector('[role="listitem"]');
		expect(itemContainer).toHaveAttribute('role', 'listitem');

		const decrementButton = container.querySelector('button[aria-label*="Decrease"]');
		expect(decrementButton).toHaveAttribute('aria-label');
	});
});
