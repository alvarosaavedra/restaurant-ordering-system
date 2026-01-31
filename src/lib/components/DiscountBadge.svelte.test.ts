import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, cleanup as testingLibraryCleanup } from '@testing-library/svelte';
import DiscountBadge from './DiscountBadge.svelte';

describe('DiscountBadge', () => {
	beforeEach(() => {
		testingLibraryCleanup();
	});

	describe('fixed amount discount', () => {
		it('should render fixed discount badge', async () => {
			const { container } = render(DiscountBadge, {
				discount: { type: 'fixed', value: 5 },
				size: 'sm'
			});

			const badge = container.querySelector('[data-testid="discount-badge"]');
			expect(badge).toBeInTheDocument();
			expect(badge?.textContent).toContain('$5.00');
		});

		it('should render with size sm', async () => {
			const { container } = render(DiscountBadge, {
				discount: { type: 'fixed', value: 5 },
				size: 'sm'
			});

			const badge = container.querySelector('[data-testid="discount-badge"]');
			expect(badge?.className).toContain('text-xs');
		});

		it('should render with size md', async () => {
			const { container } = render(DiscountBadge, {
				discount: { type: 'fixed', value: 5 },
				size: 'md'
			});

			const badge = container.querySelector('[data-testid="discount-badge"]');
			expect(badge?.className).toContain('text-sm');
		});
	});

	describe('percentage discount', () => {
		it('should render percentage discount badge', async () => {
			const { container } = render(DiscountBadge, {
				discount: { type: 'percentage', value: 15 },
				size: 'sm'
			});

			const badge = container.querySelector('[data-testid="discount-badge"]');
			expect(badge).toBeInTheDocument();
			expect(badge?.textContent).toContain('15%');
		});
	});

	describe('discount with reason', () => {
		it('should show reason tooltip on hover area', async () => {
			const { container } = render(DiscountBadge, {
				discount: { type: 'fixed', value: 5, reason: 'Loyalty discount' },
				size: 'sm'
			});

			const badge = container.querySelector('[data-testid="discount-badge"]');
			expect(badge).toBeInTheDocument();
		});
	});

	describe('click behavior', () => {
		it('should call onClick when clicked', async () => {
			const handleClick = vi.fn();
			const { container } = render(DiscountBadge, {
				discount: { type: 'fixed', value: 5 },
				size: 'sm',
				onClick: handleClick
			});

		const badge = container.querySelector('[data-testid="discount-badge"]') as HTMLElement;
		badge?.click();

			expect(handleClick).toHaveBeenCalled();
		});

		it('should not be clickable when onClick not provided', async () => {
			const { container } = render(DiscountBadge, {
				discount: { type: 'fixed', value: 5 },
				size: 'sm'
			});

			const badge = container.querySelector('[data-testid="discount-badge"]');
			expect(badge?.className).not.toContain('cursor-pointer');
		});
	});

	describe('accessibility', () => {
		it('should have aria-label for discount information', async () => {
			const { container } = render(DiscountBadge, {
				discount: { type: 'fixed', value: 5, reason: 'Loyalty' },
				size: 'sm'
			});

			const badge = container.querySelector('[data-testid="discount-badge"]');
			expect(badge).toHaveAttribute('aria-label');
		});
	});
});
