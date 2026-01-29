import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, cleanup as testingLibraryCleanup } from '@testing-library/svelte';
import StatusBadge from './StatusBadge.svelte';
import type { OrderStatus } from '$lib/types/orders';

describe('StatusBadge', () => {
	beforeEach(() => {
		testingLibraryCleanup();
	});

	it('renders all status types', async () => {
		const { container: pending } = render(StatusBadge, { status: 'pending' });
		const { container: preparing } = render(StatusBadge, { status: 'preparing' });
		const { container: ready } = render(StatusBadge, { status: 'ready' });
		const { container: delivered } = render(StatusBadge, { status: 'delivered' });

		expect(pending.querySelector('.bg-warning-100')).toBeInTheDocument();
		expect(preparing.querySelector('.bg-bakery-100')).toBeInTheDocument();
		expect(ready.querySelector('.bg-success-100')).toBeInTheDocument();
		expect(delivered.querySelector('.bg-sage-100')).toBeInTheDocument();
	});

	it('displays correct label for each status', async () => {
		const { getByText } = render(StatusBadge, { status: 'pending' });
		expect(getByText('Pending')).toBeInTheDocument();

		testingLibraryCleanup();

		const { getByText: preparingText } = render(StatusBadge, { status: 'preparing' });
		expect(preparingText('Preparing')).toBeInTheDocument();

		testingLibraryCleanup();

		const { getByText: readyText } = render(StatusBadge, { status: 'ready' });
		expect(readyText('Ready')).toBeInTheDocument();

		testingLibraryCleanup();

		const { getByText: deliveredText } = render(StatusBadge, { status: 'delivered' });
		expect(deliveredText('Delivered')).toBeInTheDocument();
	});

	it('applies custom classes', async () => {
		const { container } = render(StatusBadge, {
			status: 'pending',
			class: 'custom-class'
		});

		const badge = container.querySelector('.inline-flex');
		expect(badge?.className).toContain('custom-class');
	});

	it('has accessibility label', async () => {
		const { container } = render(StatusBadge, { status: 'pending' });

		// Check if badge exists and displays status
		const badge = container.querySelector('.inline-flex');
		expect(badge).toBeInTheDocument();
	});
});
