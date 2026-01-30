import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup as testingLibraryCleanup } from '@testing-library/svelte';
import SkeletonCard from './SkeletonCard.svelte';

describe('SkeletonCard', () => {
	beforeEach(() => {
		testingLibraryCleanup();
	});

	it('renders skeleton card', async () => {
		const { container } = render(SkeletonCard);

		const card = container.querySelector('.bg-white');
		expect(card).toBeInTheDocument();
	});

	it('shows multiple skeleton items', async () => {
		const { getAllByRole } = render(SkeletonCard);

		const skeletons = getAllByRole('status');
		// Should have multiple skeletons (at least the ones visible in the card)
		expect(skeletons.length).toBeGreaterThan(5);
	});

	it('applies custom classes', async () => {
		const { container } = render(SkeletonCard, {
			class: 'custom-class'
		});

		const card = container.querySelector('.bg-white');
		expect(card).toHaveClass('custom-class');
	});
});
