import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, cleanup as testingLibraryCleanup } from '@testing-library/svelte';
import DiscountItem from './DiscountItem.svelte';
import type { CartItem } from '$lib/stores/cart';

const mockCategory = {
	id: 'cat-1',
	name: 'Test Category',
	displayOrder: 1,
	createdAt: new Date()
};

const mockCartItem = (discount?: { type: 'fixed' | 'percentage'; value: number; reason?: string }): CartItem => ({
	item: {
		id: 'item-1',
		categoryId: 'cat-1',
		name: 'Chocolate Cake',
		description: 'Delicious chocolate cake',
		price: 25.00,
		isAvailable: true,
		category: mockCategory,
		createdAt: new Date()
	},
	quantity: 2,
	variations: [],
	modifiers: [],
	discount
});

describe('DiscountItem', () => {
	beforeEach(() => {
		testingLibraryCleanup();
	});

	describe('item display', () => {
		it('should display item name and quantity', async () => {
			const { container } = render(DiscountItem, {
				cartItem: mockCartItem(),
				onUpdateDiscount: vi.fn(),
				onRemoveDiscount: vi.fn()
			});

			expect(container.textContent).toContain('Chocolate Cake');
			expect(container.textContent).toContain('2');
		});

		it('should display original price when no discount', async () => {
			const { container } = render(DiscountItem, {
				cartItem: mockCartItem(),
				onUpdateDiscount: vi.fn(),
				onRemoveDiscount: vi.fn()
			});

			expect(container.textContent).toContain('$50'); // 25 * 2
		});
	});

	describe('discount display', () => {
		it('should show discount badge when item has discount', async () => {
			const { container } = render(DiscountItem, {
				cartItem: mockCartItem({ type: 'fixed', value: 5 }),
				onUpdateDiscount: vi.fn(),
				onRemoveDiscount: vi.fn()
			});

			const badge = container.querySelector('[data-testid="discount-badge"]');
			expect(badge).toBeInTheDocument();
		});

		it('should display discounted price', async () => {
			const { container } = render(DiscountItem, {
				cartItem: mockCartItem({ type: 'fixed', value: 5 }),
				onUpdateDiscount: vi.fn(),
				onRemoveDiscount: vi.fn()
			});

			expect(container.textContent).toContain('$45'); // 50 - 5
		});

		it('should show original price with strikethrough', async () => {
			const { container } = render(DiscountItem, {
				cartItem: mockCartItem({ type: 'fixed', value: 5 }),
				onUpdateDiscount: vi.fn(),
				onRemoveDiscount: vi.fn()
			});

			const originalPrice = container.querySelector('[data-testid="original-price"]');
			expect(originalPrice).toBeInTheDocument();
			expect(originalPrice?.className).toContain('line-through');
		});
	});

	describe('interactions', () => {
		it('should call onUpdateDiscount when discount badge clicked', async () => {
			const handleUpdate = vi.fn();
			const { container } = render(DiscountItem, {
				cartItem: mockCartItem({ type: 'fixed', value: 5 }),
				onUpdateDiscount: handleUpdate,
				onRemoveDiscount: vi.fn()
			});

		const badge = container.querySelector('[data-testid="discount-badge"]') as HTMLElement;
		badge?.click();

			expect(handleUpdate).toHaveBeenCalled();
		});

		it('should show add discount button when no discount', async () => {
			const { container } = render(DiscountItem, {
				cartItem: mockCartItem(),
				onUpdateDiscount: vi.fn(),
				onRemoveDiscount: vi.fn()
			});

			const addButton = container.querySelector('[data-testid="add-discount-btn"]');
			expect(addButton).toBeInTheDocument();
		});

		it('should call onUpdateDiscount when add discount clicked', async () => {
			const handleUpdate = vi.fn();
			const { container } = render(DiscountItem, {
				cartItem: mockCartItem(),
				onUpdateDiscount: handleUpdate,
				onRemoveDiscount: vi.fn()
			});

		const addButton = container.querySelector('[data-testid="add-discount-btn"]') as HTMLElement;
		addButton?.click();

			expect(handleUpdate).toHaveBeenCalled();
		});
	});
});
