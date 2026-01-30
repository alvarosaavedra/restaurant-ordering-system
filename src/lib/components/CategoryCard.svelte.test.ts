import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, cleanup as testingLibraryCleanup } from '@testing-library/svelte';
import CategoryCard from './CategoryCard.svelte';
import { mockCategoryWithCount, mockCategory2WithCount } from './fixtures';

describe('CategoryCard', () => {
	beforeEach(() => {
		testingLibraryCleanup();
	});

	it('renders category details', async () => {
		const { getByText } = render(CategoryCard, {
			category: mockCategoryWithCount,
			onedit: vi.fn(),
			ondelete: vi.fn()
		});

		expect(getByText(mockCategoryWithCount.name)).toBeInTheDocument();
	});

	it('displays item count', async () => {
		const { getByText } = render(CategoryCard, {
			category: mockCategoryWithCount,
			onedit: vi.fn(),
			ondelete: vi.fn()
		});

		expect(getByText(`${mockCategoryWithCount.itemCount} items`)).toBeInTheDocument();
	});

	it('shows singular "item" when count is 1', async () => {
		const categoryWithOneItem = { ...mockCategory2WithCount, itemCount: 1 };
		const { getByText } = render(CategoryCard, {
			category: categoryWithOneItem,
			onedit: vi.fn(),
			ondelete: vi.fn()
		});

		expect(getByText(`1 item`)).toBeInTheDocument();
	});

	it('shows display order', async () => {
		const { getByText } = render(CategoryCard, {
			category: mockCategoryWithCount,
			onedit: vi.fn(),
			ondelete: vi.fn()
		});

		expect(getByText(`Display Order: ${mockCategoryWithCount.displayOrder}`)).toBeInTheDocument();
	});

	it('handles edit button click', async () => {
		const handleEdit = vi.fn();
		const { container } = render(CategoryCard, {
			category: mockCategoryWithCount,
			onedit: handleEdit,
			ondelete: vi.fn()
		});

		const editButton = container.querySelector('button[aria-label*="Edit"]') as HTMLButtonElement;
		expect(editButton).toBeInTheDocument();

		if (editButton) {
			editButton.click();
			expect(handleEdit).toHaveBeenCalledWith(mockCategoryWithCount);
		}
	});

	it('handles delete button click when category has no items', async () => {
		const handleDelete = vi.fn();
		const { container } = render(CategoryCard, {
			category: mockCategory2WithCount,
			onedit: vi.fn(),
			ondelete: handleDelete
		});

		const deleteButton = container.querySelector('button[aria-label*="Delete"]') as HTMLButtonElement;
		expect(deleteButton).toBeInTheDocument();
		expect(deleteButton).not.toBeDisabled();

		if (deleteButton) {
			deleteButton.click();
			expect(handleDelete).toHaveBeenCalledWith(mockCategory2WithCount);
		}
	});

	it('disables delete button when category has items', async () => {
		const { container } = render(CategoryCard, {
			category: mockCategoryWithCount,
			onedit: vi.fn(),
			ondelete: vi.fn()
		});

		// Find the second button (delete button comes after edit button)
		const buttons = container.querySelectorAll('button');
		const deleteButton = buttons[1] as HTMLButtonElement;
		expect(deleteButton).toBeInTheDocument();
		expect(deleteButton).toBeDisabled();
	});

	it('has correct aria-label for delete button with items', async () => {
		const { container } = render(CategoryCard, {
			category: mockCategoryWithCount,
			onedit: vi.fn(),
			ondelete: vi.fn()
		});

		// Find the second button (delete button)
		const buttons = container.querySelectorAll('button');
		const deleteButton = buttons[1] as HTMLButtonElement;
		expect(deleteButton).toBeInTheDocument();
		expect(deleteButton).toHaveAttribute('aria-label', `Cannot delete ${mockCategoryWithCount.name} - has ${mockCategoryWithCount.itemCount} items`);
	});

	it('has correct aria-label for delete button without items', async () => {
		const { container } = render(CategoryCard, {
			category: mockCategory2WithCount,
			onedit: vi.fn(),
			ondelete: vi.fn()
		});

		// Find the second button (delete button)
		const buttons = container.querySelectorAll('button');
		const deleteButton = buttons[1] as HTMLButtonElement;
		expect(deleteButton).toBeInTheDocument();
		expect(deleteButton).toHaveAttribute('aria-label', `Delete ${mockCategory2WithCount.name}`);
	});
});
