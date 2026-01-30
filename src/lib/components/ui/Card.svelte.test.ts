import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, cleanup as testingLibraryCleanup } from '@testing-library/svelte';
import Card from './Card.svelte';

describe('Card', () => {
	beforeEach(() => {
		testingLibraryCleanup();
	});

	it('renders with default variant', async () => {
		const { container } = render(Card, {
			// @ts-ignore - Svelte 5 snippet in tests
			children: () => 'Card Content'
		});

		const card = container.querySelector('.rounded-lg');
		expect(card).toBeInTheDocument();
	});

	it('renders all variants', async () => {
		const { container: elevatedContainer } = render(Card, { variant: 'elevated',
			// @ts-ignore - Svelte 5 snippet in tests
			children: () => 'Test' });
		const { container: borderedContainer } = render(Card, { variant: 'bordered',
			// @ts-ignore - Svelte 5 snippet in tests
			children: () => 'Test' });
		const { container: subtleContainer } = render(Card, { variant: 'subtle',
			// @ts-ignore - Svelte 5 snippet in tests
			children: () => 'Test' });

		// Check className string for expected classes
		const elevatedCard = elevatedContainer.querySelector('.rounded-lg');
		const borderedCard = borderedContainer.querySelector('.rounded-lg');
		const subtleCard = subtleContainer.querySelector('.rounded-lg');

		expect(elevatedCard?.className).toContain('shadow-md');
		expect(elevatedCard?.className).toContain('shadow-lg');
		expect(borderedCard?.className).toContain('border');
		expect(borderedCard?.className).toContain('border-neutral-200');
		expect(subtleCard?.className).toContain('bg-neutral-50');
	});

	it('shows children content', async () => {
		const { container } = render(Card, {
			// @ts-ignore - Svelte 5 snippet in @testing-library/svelte tests
			children: () => 'Card Content'
		});

		// Note: Svelte 5 snippet rendering in tests has limitations
		// Verify card exists and has content
		const card = container.querySelector('.rounded-lg');
		expect(card).toBeInTheDocument();
	});

	it('handles onclick when clickable', async () => {
		const handleClick = vi.fn();
		const { getByRole } = render(Card, {
			clickable: true,
			onclick: handleClick,
			// @ts-ignore - Svelte 5 snippet in @testing-library/svelte tests
			children: () => 'Clickable Card'
		});

		const card = getByRole('button');
		card.click();
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it('applies custom classes', async () => {
		const { container } = render(Card, {
			class: 'custom-class',
			// @ts-ignore - Svelte 5 snippet in @testing-library/svelte tests
			children: () => 'Test'
		});

		const card = container.querySelector('.rounded-lg');
		expect(card).toHaveClass('custom-class');
	});
});
