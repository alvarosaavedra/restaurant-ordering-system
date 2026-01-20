import { page } from 'vitest/browser';
import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import StatusBadge from './StatusBadge.svelte';

describe('StatusBadge', () => {
	it('renders pending status', async () => {
		render(StatusBadge, { status: 'pending' });

		const badge = page.getByText('Pending');
		await expect.element(badge).toBeInTheDocument();
		await expect.element(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
	});

	it('renders preparing status', async () => {
		render(StatusBadge, { status: 'preparing' });

		const badge = page.getByText('Preparing');
		await expect.element(badge).toBeInTheDocument();
		await expect.element(badge).toHaveClass('bg-blue-100', 'text-blue-800');
	});

	it('renders ready status', async () => {
		render(StatusBadge, { status: 'ready' });

		const badge = page.getByText('Ready');
		await expect.element(badge).toBeInTheDocument();
		await expect.element(badge).toHaveClass('bg-green-100', 'text-green-800');
	});

	it('renders delivered status', async () => {
		render(StatusBadge, { status: 'delivered' });

		const badge = page.getByText('Delivered');
		await expect.element(badge).toBeInTheDocument();
		await expect.element(badge).toHaveClass('bg-gray-100', 'text-gray-800');
	});

	it('has correct styling structure', async () => {
		render(StatusBadge, { status: 'pending' });

		const badge = page.getByText('Pending');
		await expect.element(badge).toHaveClass('inline-flex', 'items-center', 'px-2.5', 'py-0.5', 'rounded-full', 'text-xs', 'font-medium');
	});
});
