import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, cleanup as testingLibraryCleanup } from '@testing-library/svelte';
import DiscountPanel from './DiscountPanel.svelte';
import type { CartItem } from '$lib/stores/cart';

const mockCartItem = (id: string, name: string, price: number, quantity: number = 1, discount?: { type: 'fixed' | 'percentage'; value: number; reason?: string }): CartItem => ({
	item: {
		id,
		name,
		description: 'Test',
		price,
		isAvailable: true,
		category: { id: 'cat-1', name: 'Test', displayOrder: 1, createdAt: new Date() },
		createdAt: new Date()
	},
	quantity,
	discount
});

describe('DiscountPanel', () => {
	beforeEach(() => {
		testingLibraryCleanup();
	});

	describe('rendering', () => {
		it('should render with empty cart', async () => {
			const { container } = render(DiscountPanel, {
				cartItems: [],
				orderDiscount: null,
				totals: {
					subtotal: 0,
					itemDiscounts: 0,
					orderDiscount: 0,
					totalDiscount: 0,
					finalTotal: 0
				},
				onAddDiscount: vi.fn(),
				onRemoveItemDiscount: vi.fn(),
				onRemoveOrderDiscount: vi.fn()
			});

			const panel = container.querySelector('[data-testid="discount-panel"]');
			expect(panel).toBeInTheDocument();
		});

		it('should render add discount button', async () => {
			const { container } = render(DiscountPanel, {
				cartItems: [mockCartItem('1', 'Cake', 25)],
				orderDiscount: null,
				totals: {
					subtotal: 25,
					itemDiscounts: 0,
					orderDiscount: 0,
					totalDiscount: 0,
					finalTotal: 25
				},
				onAddDiscount: vi.fn(),
				onRemoveItemDiscount: vi.fn(),
				onRemoveOrderDiscount: vi.fn()
			});

			const addBtn = container.querySelector('[data-testid="add-discount-btn"]');
			expect(addBtn).toBeInTheDocument();
		});
	});

	describe('item discounts display', () => {
		it('should show item discount badge when item has discount', async () => {
			const { container } = render(DiscountPanel, {
				cartItems: [mockCartItem('1', 'Cake', 25, 1, { type: 'percentage', value: 10, reason: 'Loyalty' })],
				orderDiscount: null,
				totals: {
					subtotal: 25,
					itemDiscounts: 2.5,
					orderDiscount: 0,
					totalDiscount: 2.5,
					finalTotal: 22.5
				},
				onAddDiscount: vi.fn(),
				onRemoveItemDiscount: vi.fn(),
				onRemoveOrderDiscount: vi.fn()
			});

			const discountBadge = container.querySelector('[data-testid="item-discount-1"]');
			expect(discountBadge).toBeInTheDocument();
		});

		it('should show correct discount value for percentage discount', async () => {
			const { container } = render(DiscountPanel, {
				cartItems: [mockCartItem('1', 'Cake', 25, 1, { type: 'percentage', value: 10 })],
				orderDiscount: null,
				totals: {
					subtotal: 25,
					itemDiscounts: 2.5,
					orderDiscount: 0,
					totalDiscount: 2.5,
					finalTotal: 22.5
				},
				onAddDiscount: vi.fn(),
				onRemoveItemDiscount: vi.fn(),
				onRemoveOrderDiscount: vi.fn()
			});

			const discountText = container.textContent;
			expect(discountText).toContain('10%');
		});

		it('should show correct discount value for fixed discount', async () => {
			const { container } = render(DiscountPanel, {
				cartItems: [mockCartItem('1', 'Cake', 25, 1, { type: 'fixed', value: 5 })],
				orderDiscount: null,
				totals: {
					subtotal: 25,
					itemDiscounts: 5,
					orderDiscount: 0,
					totalDiscount: 5,
					finalTotal: 20
				},
				onAddDiscount: vi.fn(),
				onRemoveItemDiscount: vi.fn(),
				onRemoveOrderDiscount: vi.fn()
			});

			const discountText = container.textContent;
			expect(discountText).toContain('$5.00');
		});

		it('should show remove button for item discount', async () => {
			const { container } = render(DiscountPanel, {
				cartItems: [mockCartItem('1', 'Cake', 25, 1, { type: 'percentage', value: 10 })],
				orderDiscount: null,
				totals: {
					subtotal: 25,
					itemDiscounts: 2.5,
					orderDiscount: 0,
					totalDiscount: 2.5,
					finalTotal: 22.5
				},
				onAddDiscount: vi.fn(),
				onRemoveItemDiscount: vi.fn(),
				onRemoveOrderDiscount: vi.fn()
			});

			const removeBtn = container.querySelector('[data-testid="remove-item-discount-1"]');
			expect(removeBtn).toBeInTheDocument();
		});
	});

	describe('order discount display', () => {
		it('should show order discount when present', async () => {
			const { container } = render(DiscountPanel, {
				cartItems: [mockCartItem('1', 'Cake', 25)],
				orderDiscount: { type: 'fixed', value: 5, reason: 'First order' },
				totals: {
					subtotal: 25,
					itemDiscounts: 0,
					orderDiscount: 5,
					totalDiscount: 5,
					finalTotal: 20
				},
				onAddDiscount: vi.fn(),
				onRemoveItemDiscount: vi.fn(),
				onRemoveOrderDiscount: vi.fn()
			});

			const orderDiscount = container.querySelector('[data-testid="order-discount"]');
			expect(orderDiscount).toBeInTheDocument();
		});

		it('should show remove button for order discount', async () => {
			const { container } = render(DiscountPanel, {
				cartItems: [mockCartItem('1', 'Cake', 25)],
				orderDiscount: { type: 'fixed', value: 5 },
				totals: {
					subtotal: 25,
					itemDiscounts: 0,
					orderDiscount: 5,
					totalDiscount: 5,
					finalTotal: 20
				},
				onAddDiscount: vi.fn(),
				onRemoveItemDiscount: vi.fn(),
				onRemoveOrderDiscount: vi.fn()
			});

			const removeBtn = container.querySelector('[data-testid="remove-order-discount"]');
			expect(removeBtn).toBeInTheDocument();
		});
	});

	describe('totals display', () => {
		it('should display subtotal', async () => {
			const { container } = render(DiscountPanel, {
				cartItems: [mockCartItem('1', 'Cake', 25)],
				orderDiscount: null,
				totals: {
					subtotal: 25,
					itemDiscounts: 0,
					orderDiscount: 0,
					totalDiscount: 0,
					finalTotal: 25
				},
				onAddDiscount: vi.fn(),
				onRemoveItemDiscount: vi.fn(),
				onRemoveOrderDiscount: vi.fn()
			});

			const text = container.textContent;
			expect(text).toContain('$25.00');
		});

		it('should display total savings when discounts applied', async () => {
			const { container } = render(DiscountPanel, {
				cartItems: [mockCartItem('1', 'Cake', 25, 1, { type: 'percentage', value: 10 })],
				orderDiscount: { type: 'fixed', value: 2 },
				totals: {
					subtotal: 25,
					itemDiscounts: 2.5,
					orderDiscount: 2,
					totalDiscount: 4.5,
					finalTotal: 20.5
				},
				onAddDiscount: vi.fn(),
				onRemoveItemDiscount: vi.fn(),
				onRemoveOrderDiscount: vi.fn()
			});

			const text = container.textContent;
			expect(text).toContain('You saved');
			expect(text).toContain('$4.50');
		});

		it('should display final total', async () => {
			const { container } = render(DiscountPanel, {
				cartItems: [mockCartItem('1', 'Cake', 25, 1, { type: 'fixed', value: 5 })],
				orderDiscount: null,
				totals: {
					subtotal: 25,
					itemDiscounts: 5,
					orderDiscount: 0,
					totalDiscount: 5,
					finalTotal: 20
				},
				onAddDiscount: vi.fn(),
				onRemoveItemDiscount: vi.fn(),
				onRemoveOrderDiscount: vi.fn()
			});

			const text = container.textContent;
			expect(text).toContain('$20.00');
		});
	});

	describe('interactions', () => {
		it('should call onAddDiscount when add button clicked', async () => {
			const handleAdd = vi.fn();
			const { container } = render(DiscountPanel, {
				cartItems: [mockCartItem('1', 'Cake', 25)],
				orderDiscount: null,
				totals: {
					subtotal: 25,
					itemDiscounts: 0,
					orderDiscount: 0,
					totalDiscount: 0,
					finalTotal: 25
				},
				onAddDiscount: handleAdd,
				onRemoveItemDiscount: vi.fn(),
				onRemoveOrderDiscount: vi.fn()
			});

			const addBtn = container.querySelector('[data-testid="add-discount-btn"]');
			addBtn?.click();

			expect(handleAdd).toHaveBeenCalled();
		});

		it('should call onRemoveItemDiscount when remove item discount clicked', async () => {
			const handleRemove = vi.fn();
			const { container } = render(DiscountPanel, {
				cartItems: [mockCartItem('1', 'Cake', 25, 1, { type: 'percentage', value: 10 })],
				orderDiscount: null,
				totals: {
					subtotal: 25,
					itemDiscounts: 2.5,
					orderDiscount: 0,
					totalDiscount: 2.5,
					finalTotal: 22.5
				},
				onAddDiscount: vi.fn(),
				onRemoveItemDiscount: handleRemove,
				onRemoveOrderDiscount: vi.fn()
			});

			const removeBtn = container.querySelector('[data-testid="remove-item-discount-1"]');
			removeBtn?.click();

			expect(handleRemove).toHaveBeenCalledWith('1');
		});

		it('should call onRemoveOrderDiscount when remove order discount clicked', async () => {
			const handleRemove = vi.fn();
			const { container } = render(DiscountPanel, {
				cartItems: [mockCartItem('1', 'Cake', 25)],
				orderDiscount: { type: 'fixed', value: 5 },
				totals: {
					subtotal: 25,
					itemDiscounts: 0,
					orderDiscount: 5,
					totalDiscount: 5,
					finalTotal: 20
				},
				onAddDiscount: vi.fn(),
				onRemoveItemDiscount: vi.fn(),
				onRemoveOrderDiscount: handleRemove
			});

			const removeBtn = container.querySelector('[data-testid="remove-order-discount"]');
			removeBtn?.click();

			expect(handleRemove).toHaveBeenCalled();
		});
	});

	describe('empty state', () => {
		it('should show empty state message when no discounts', async () => {
			const { container } = render(DiscountPanel, {
				cartItems: [mockCartItem('1', 'Cake', 25)],
				orderDiscount: null,
				totals: {
					subtotal: 25,
					itemDiscounts: 0,
					orderDiscount: 0,
					totalDiscount: 0,
					finalTotal: 25
				},
				onAddDiscount: vi.fn(),
				onRemoveItemDiscount: vi.fn(),
				onRemoveOrderDiscount: vi.fn()
			});

			const text = container.textContent;
			expect(text).toContain('No discounts applied');
		});
	});
});
