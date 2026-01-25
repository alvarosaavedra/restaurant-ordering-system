import { page } from 'vitest/browser';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import OrderCard from './OrderCard.svelte';

describe('OrderCard', () => {
	const mockOrder = {
		id: 'order-123',
		customerName: 'John Doe',
		customerPhone: '555-1234',
		deliveryDateTime: new Date('2024-01-15T12:30:00'),
		address: '123 Main St',
		comment: 'Leave at door',
		totalAmount: 29.99,
		status: 'pending' as const,
		createdAt: new Date('2024-01-15T10:30:00'),
		items: [
			{
				id: 'item-1',
				quantity: 2,
				unitPrice: 9.99,
				menuItemId: 'menu-1',
				menuItem: {
					id: 'menu-1',
					name: 'Burger',
					categoryId: 'cat-1'
				}
			}
		]
	};

	beforeEach(() => {
		vi.stubGlobal('fetch', () => Promise.resolve({
			ok: true,
			json: () => Promise.resolve({ success: true })
		} as Response));
	});

	it('renders order information', async () => {
		render(OrderCard, {
			order: mockOrder
		});

		expect(page.getByText('John Doe')).toBeInTheDocument();
		expect(page.getByText('$29.99')).toBeInTheDocument();
	});

	it('renders order items', async () => {
		render(OrderCard, {
			order: mockOrder
		});

		expect(page.getByText('×2')).toBeInTheDocument();
		expect(page.getByText('Burger')).toBeInTheDocument();
		expect(page.getByText('$19.98')).toBeInTheDocument();
	});

	it('displays correct button for pending status', async () => {
		render(OrderCard, {
			order: mockOrder
		});

		expect(page.getByRole('button', { name: 'Start Preparing' })).toBeInTheDocument();
	});

	it('has correct ARIA attributes', async () => {
		render(OrderCard, {
			order: mockOrder
		});

		const article = page.getByRole('article');
		await expect.element(article).toHaveAttribute('aria-labelledby', 'order-order-123-title');

		const heading = page.getByRole('heading', { name: 'John Doe' });
		await expect.element(heading).toHaveAttribute('id', 'order-order-123-title');
	});

	it('has minimum touch target size for action buttons', async () => {
		render(OrderCard, {
			order: mockOrder
		});

		const button = page.getByRole('button', { name: 'Start Preparing' });
		await expect.element(button).toHaveClass('min-h-[44px]', 'min-w-[44px]');
	});
});
