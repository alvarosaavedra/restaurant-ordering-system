import { page } from 'vitest/browser';
import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MenuItem from './MenuItem.svelte';

describe('MenuItem', () => {
	const mockItem = {
		id: '1',
		name: 'Test Item',
		description: 'Test description',
		price: 9.99,
		isAvailable: true,
		categoryId: 'cat1',
		createdAt: new Date(),
		category: {
			id: 'cat1',
			name: 'Test Category',
			displayOrder: 1,
			createdAt: new Date()
		}
	};

	it('renders menu item with available status', async () => {
		render(MenuItem, {
			item: mockItem,
			onAdd: () => {}
		});

		expect(page.getByText('Test Item')).toBeInTheDocument();
		expect(page.getByText('Test description')).toBeInTheDocument();
		expect(page.getByText('$9.99')).toBeInTheDocument();
	});

	it('shows out of stock status when unavailable', async () => {
		const unavailableItem = { ...mockItem, isAvailable: false };
		render(MenuItem, {
			item: unavailableItem,
			onAdd: () => {}
		});

		expect(page.getByText('Out of Stock')).toBeInTheDocument();
		expect(page.getByText('Unavailable')).toBeInTheDocument();
	});

	it('shows quantity selector when available', async () => {
		render(MenuItem, {
			item: mockItem,
			onAdd: () => {}
		});

		expect(page.getByRole('group', { name: 'Quantity selector' })).toBeInTheDocument();
	});

	it('displays initial quantity of 1', async () => {
		render(MenuItem, {
			item: mockItem,
			onAdd: () => {}
		});

		expect(page.getByText('1')).toBeInTheDocument();
	});

	it('disables decrement button at quantity 1', async () => {
		render(MenuItem, {
			item: mockItem,
			onAdd: () => {}
		});

		const decrementButton = page.getByRole('button', { name: 'Decrease quantity for Test Item' });
		await expect.element(decrementButton).toBeDisabled();
	});

	it('enables decrement button above quantity 1', async () => {
		render(MenuItem, {
			item: mockItem,
			onAdd: () => {}
		});

		const incrementButton = page.getByRole('button', { name: 'Increase quantity for Test Item' });
		await incrementButton.click();

		const decrementButton = page.getByRole('button', { name: 'Decrease quantity for Test Item' });
		await expect.element(decrementButton).not.toBeDisabled();
	});

	it('calls onAdd with default quantity of 1', async () => {
		let addedQuantity = 0;

		render(MenuItem, {
			item: mockItem,
			onAdd: (_: any, quantity: number) => {
				addedQuantity = quantity;
			}
		});

		const addButton = page.getByRole('button', { name: 'Add 1 Test Item to order' });
		await addButton.click();

		expect(addedQuantity).toBe(1);
	});

	it('has minimum touch target size for buttons', async () => {
		render(MenuItem, {
			item: mockItem,
			onAdd: () => {}
		});

		const incrementButton = page.getByRole('button', { name: 'Increase quantity for Test Item' });
		const decrementButton = page.getByRole('button', { name: 'Decrease quantity for Test Item' });
		const addButton = page.getByRole('button', { name: /Add.*Test Item to order/ });

		await expect.element(incrementButton).toHaveClass('min-w-[44px]', 'min-h-[44px]');
		await expect.element(decrementButton).toHaveClass('min-w-[44px]', 'min-h-[44px]');
		await expect.element(addButton).toHaveClass('min-h-[44px]');
	});

	it('formats price correctly', async () => {
		render(MenuItem, {
			item: { ...mockItem, price: 1234.5 },
			onAdd: () => {}
		});

		expect(page.getByText('$1234.50')).toBeInTheDocument();
	});
});
