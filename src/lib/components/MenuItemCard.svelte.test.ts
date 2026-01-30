import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, cleanup as testingLibraryCleanup } from '@testing-library/svelte';
import MenuItemCard from './MenuItemCard.svelte';
import type { MenuItemWithCategory } from '$lib/types/orders';
import { mockMenuItemWithCategory, mockMenuItem2WithCategory } from './fixtures';

describe('MenuItemCard', () => {
	beforeEach(() => {
		testingLibraryCleanup();
	});

	it('renders menu item details', async () => {
		const { getByText } = render(MenuItemCard, {
			item: mockMenuItemWithCategory,
			onedit: vi.fn(),
			ondelete: vi.fn()
		});

		expect(getByText(mockMenuItemWithCategory.name)).toBeInTheDocument();
		expect(getByText(mockMenuItemWithCategory.description)).toBeInTheDocument();
	});

	it('shows category when item has one', async () => {
		const { getByText } = render(MenuItemCard, {
			item: mockMenuItemWithCategory,
			onedit: vi.fn(),
			ondelete: vi.fn()
		});

		expect(getByText(mockMenuItemWithCategory.category.name)).toBeInTheDocument();
	});

	it('displays correct price with formatting', async () => {
		const { getByText } = render(MenuItemCard, {
			item: mockMenuItemWithCategory,
			onedit: vi.fn(),
			ondelete: vi.fn()
		});

		expect(getByText(`$${mockMenuItemWithCategory.price.toFixed(2)}`)).toBeInTheDocument();
	});

	it('shows availability indicator', async () => {
		const { container } = render(MenuItemCard, {
			item: mockMenuItemWithCategory,
			onedit: vi.fn(),
			ondelete: vi.fn()
		});

		if (mockMenuItemWithCategory.isAvailable) {
			const statusBadge = container.querySelector('.bg-green-500');
			expect(statusBadge).toBeInTheDocument();
			expect(statusBadge).toHaveAttribute('aria-label', 'Available');

			const unavailableBadge = container.querySelector('.bg-red-500');
			expect(unavailableBadge).not.toBeInTheDocument();
		} else {
			const statusBadge = container.querySelector('.bg-red-500');
			expect(statusBadge).toBeInTheDocument();
			expect(statusBadge).toHaveAttribute('aria-label', 'Unavailable');

			const availableBadge = container.querySelector('.bg-green-500');
			expect(availableBadge).not.toBeInTheDocument();
		}
	});

	it('handles edit button click', async () => {
		const handleEdit = vi.fn();
		const { container } = render(MenuItemCard, {
			item: mockMenuItemWithCategory,
			onedit: handleEdit,
			ondelete: vi.fn()
		});

		const editButton = container.querySelector('button[aria-label*="Edit"]') as HTMLButtonElement;
		expect(editButton).toBeInTheDocument();

		if (editButton) {
			editButton.click();
			expect(handleEdit).toHaveBeenCalledWith(mockMenuItemWithCategory);
		}
	});

	it('handles delete button click', async () => {
		const handleDelete = vi.fn();
		const { container } = render(MenuItemCard, {
			item: mockMenuItemWithCategory,
			onedit: vi.fn(),
			ondelete: handleDelete
		});

		const deleteButton = container.querySelector('button[aria-label*="Delete"]') as HTMLButtonElement;
		expect(deleteButton).toBeInTheDocument();

		if (deleteButton) {
			deleteButton.click();
			expect(handleDelete).toHaveBeenCalledWith(mockMenuItemWithCategory);
		}
	});

});
