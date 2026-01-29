import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, cleanup as testingLibraryCleanup } from '@testing-library/svelte';
import MenuItemCard from './MenuItemCard.svelte';
import type { MenuItemWithCategory } from '$lib/types/orders';
import { mockMenuItem, mockMenuItem2 } from '../fixtures';

describe('MenuItemCard', () => {
	beforeEach(() => {
		testingLibraryCleanup();
	});

	it('renders menu item details', async () => {
		const { getByText } = render(MenuItemCard, {
			item: mockMenuItem
		});

		expect(getByText(mockMenuItem.name)).toBeInTheDocument();
		expect(getByText(mockMenuItem.description)).toBeInTheDocument();
	});

	it('shows category when item has one', async () => {
		const { getByText } = render(MenuItemCard, {
			item: mockMenuItem
		});

		expect(getByText(mockMenuItem.category.name)).toBeInTheDocument();
	});

	it('displays correct price with formatting', async () => {
		const { getByText } = render(MenuItemCard, {
			item: mockMenuItem
		});

		expect(getByText(`$${mockMenuItem.price.toFixed(2)}`)).toBeInTheDocument();
	});

	it('shows availability indicator', async () => {
		const { container, getByText } = render(MenuItemCard, {
			item: mockMenuItem
		});

		if (mockMenuItem.isAvailable) {
			expect(getByText('Available')).toBeInTheDocument();
			expect(getByText('Unavailable')).not.toBeInTheDocument();

			const statusBadge = container.querySelector('.bg-green-500');
			expect(statusBadge).toHaveAttribute('aria-label', 'Available');
		} else {
			expect(getByText('Out of Stock')).toBeInTheDocument();
			expect(getByText('Available')).not.toBeInTheDocument();

			const statusBadge = container.querySelector('.bg-red-500');
			expect(statusBadge).toHaveAttribute('aria-label', 'Out of Stock');
		}
	});

	it('handles edit button click', async () => {
		const handleEdit = vi.fn();
		const { container } = render(MenuItemCard, {
			item: mockMenuItem,
			onedit: handleEdit
		});

		const editButton = container.querySelector('button[aria-label*="Edit"]');
		expect(editButton).toBeInTheDocument();

		editButton.click();
		expect(handleEdit).toHaveBeenCalledWith(mockMenuItem);
	});

	it('handles delete button click', async () => {
		const handleDelete = vi.fn();
		const { container } = render(MenuItemCard, {
			item: mockMenuItem,
			ondelete: handleDelete
		});

		const deleteButton = container.querySelector('button[aria-label*="Delete"]');
		expect(deleteButton).toBeInTheDocument();

		deleteButton.click();
		expect(handleDelete).toHaveBeenCalledWith(mockMenuItem);
	});

	it('applies custom classes', async () => {
		const { container } = render(MenuItemCard, {
			item: mockMenuItem,
			class: 'custom-class'
		});

		const card = container.querySelector('.bg-white');
		expect(card).toHaveClass('custom-class');
	});

	it('has accessibility attributes', async () => {
		const { container } = render(MenuItemCard, {
			item: mockMenuItem
		});

		const card = container.querySelector('.bg-white');
		expect(card).toHaveAttribute('role', 'listitem');
	});
});
