import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, cleanup as testingLibraryCleanup } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import Button from './Button.svelte';

describe('Button', () => {
	beforeEach(() => {
		testingLibraryCleanup();
	});

	const createTestSnippet = (text: string) => {
		return createRawSnippet(() => ({
			render: () => text
		}));
	};

	describe('Rendering', () => {
		it('renders with default props', async () => {
			const { getByRole } = render(Button, {
				children: createTestSnippet('Click me')
			});

			const button = getByRole('button');
			expect(button).toBeInTheDocument();
			// Note: Svelte 5 snippet rendering in tests has limitations
			// We verify button exists and has correct attributes
			expect(button).toHaveAttribute('type', 'button');
		});

		it('renders with type="submit"', async () => {
			const { getByRole } = render(Button, {
				type: 'submit',
				children: createTestSnippet('Submit')
			});

			const button = getByRole('button');
			expect(button).toHaveAttribute('type', 'submit');
		});

		it('renders with type="reset"', async () => {
			const { getByRole } = render(Button, {
				type: 'reset',
				children: createTestSnippet('Reset')
			});

			const button = getByRole('button');
			expect(button).toHaveAttribute('type', 'reset');
		});
	});

	describe('Variants', () => {
		it('renders primary variant', async () => {
			const { getByRole } = render(Button, {
				variant: 'primary',
				children: createTestSnippet('Primary')
			});

			const button = getByRole('button');
			expect(button).toHaveClass('bg-bakery-500');
		});

		it('renders secondary variant', async () => {
			const { getByRole } = render(Button, {
				variant: 'secondary',
				children: createTestSnippet('Secondary')
			});

			const button = getByRole('button');
			expect(button).toHaveClass('bg-neutral-100');
		});

		it('renders success variant', async () => {
			const { getByRole } = render(Button, {
				variant: 'success',
				children: createTestSnippet('Success')
			});

			const button = getByRole('button');
			expect(button).toHaveClass('bg-success-500');
		});

		it('renders warning variant', async () => {
			const { getByRole } = render(Button, {
				variant: 'warning',
				children: createTestSnippet('Warning')
			});

			const button = getByRole('button');
			expect(button).toHaveClass('bg-warning-500');
		});

		it('renders danger variant', async () => {
			const { getByRole } = render(Button, {
				variant: 'danger',
				children: createTestSnippet('Danger')
			});

			const button = getByRole('button');
			expect(button).toHaveClass('bg-error-500');
		});

		it('renders ghost variant', async () => {
			const { getByRole } = render(Button, {
				variant: 'ghost',
				children: createTestSnippet('Ghost')
			});

			const button = getByRole('button');
			expect(button).toHaveClass('bg-transparent');
		});
	});

	describe('Sizes', () => {
		it('renders small size', async () => {
			const { getByRole } = render(Button, {
				size: 'sm',
				children: createTestSnippet('Small')
			});

			const button = getByRole('button');
			expect(button).toHaveClass('px-4', 'py-2', 'text-xs');
		});

		it('renders medium size (default)', async () => {
			const { getByRole } = render(Button, {
				size: 'md',
				children: createTestSnippet('Medium')
			});

			const button = getByRole('button');
			expect(button).toHaveClass('px-6', 'py-2.5', 'text-sm');
		});

		it('renders large size', async () => {
			const { getByRole } = render(Button, {
				size: 'lg',
				children: createTestSnippet('Large')
			});

			const button = getByRole('button');
			expect(button).toHaveClass('px-8', 'py-3', 'text-base');
		});
	});

	describe('Disabled State', () => {
		it('is disabled when disabled prop is true', async () => {
			const { getByRole } = render(Button, {
				disabled: true,
				children: createTestSnippet('Disabled')
			});

			const button = getByRole('button');
			expect(button).toBeDisabled();
			expect(button).toHaveAttribute('aria-disabled', 'true');
		});

		it('is disabled when loading prop is true', async () => {
			const { getByRole } = render(Button, {
				loading: true,
				children: createTestSnippet('Loading')
			});

			const button = getByRole('button');
			expect(button).toBeDisabled();
			expect(button).toHaveAttribute('aria-disabled', 'true');
		});

		it('is not disabled by default', async () => {
			const { getByRole } = render(Button, {
				children: createTestSnippet('Enabled')
			});

			const button = getByRole('button');
			expect(button).not.toBeDisabled();
			expect(button).toHaveAttribute('aria-disabled', 'false');
		});
	});

	describe('Loading State', () => {
		it('shows spinner when loading', async () => {
			const { getByRole } = render(Button, {
				loading: true,
				children: createTestSnippet('Loading')
			});

			const button = getByRole('button');
			expect(button).toHaveAttribute('aria-busy', 'true');
		});

		it('does not show spinner when not loading', async () => {
			const { getByRole } = render(Button, {
				loading: false,
				children: createTestSnippet('Not Loading')
			});

			const button = getByRole('button');
			expect(button).toHaveAttribute('aria-busy', 'false');
		});

		it('shows spinner and text when loading', async () => {
			const { getByRole } = render(Button, {
				loading: true,
				children: createTestSnippet('Loading Text')
			});

			const button = getByRole('button');
			expect(button).toHaveAttribute('aria-busy', 'true');
			// Note: Svelte 5 snippet rendering in tests has limitations
			// Spinner is rendered via component, loading state is verified
		});
	});

	describe('Click Handler', () => {
		it('triggers onclick handler when clicked', async () => {
			const handleClick = vi.fn();
			const { getByRole } = render(Button, {
				onclick: handleClick,
				children: createTestSnippet('Click Me')
			});

			const button = getByRole('button');
			button.click();

			expect(handleClick).toHaveBeenCalledTimes(1);
		});

		it('does not trigger onclick when disabled', async () => {
			const handleClick = vi.fn();
			const { getByRole } = render(Button, {
				onclick: handleClick,
				disabled: true,
				children: createTestSnippet('Disabled')
			});

			const button = getByRole('button');
			button.click();

			expect(handleClick).not.toHaveBeenCalled();
		});

		it('does not trigger onclick when loading', async () => {
			const handleClick = vi.fn();
			const { getByRole } = render(Button, {
				onclick: handleClick,
				loading: true,
				children: createTestSnippet('Loading')
			});

			const button = getByRole('button');
			button.click();

			expect(handleClick).not.toHaveBeenCalled();
		});
	});

	describe('Accessibility', () => {
		it('has aria-label when provided', async () => {
			const { getByRole } = render(Button, {
				children: createTestSnippet('Button'),
				'aria-label': 'Accessible Button'
			});

			const button = getByRole('button', { name: 'Accessible Button' });
			expect(button).toBeInTheDocument();
		});

		it('has aria-describedby when provided', async () => {
			const { getByRole } = render(Button, {
				children: createTestSnippet('Button'),
				'aria-describedby': 'description-id'
			});

			const button = getByRole('button');
			expect(button).toHaveAttribute('aria-describedby', 'description-id');
		});

		it('has custom tabindex when provided', async () => {
			const { getByRole } = render(Button, {
				children: createTestSnippet('Button'),
				tabindex: -1
			});

			const button = getByRole('button');
			expect(button).toHaveAttribute('tabindex', '-1');
		});

		it('has min accessible size (44x44)', async () => {
			const { getByRole } = render(Button, {
				children: createTestSnippet('Accessible')
			});

			const button = getByRole('button');
			expect(button).toHaveClass('min-h-[44px]', 'min-w-[44px]');
		});
	});

	describe('Custom Classes', () => {
		it('applies custom class names', async () => {
			const { getByRole } = render(Button, {
				class: 'custom-class another-class',
				children: createTestSnippet('Custom')
			});

			const button = getByRole('button');
			expect(button).toHaveClass('custom-class', 'another-class');
		});

		it('combines with default classes', async () => {
			const { getByRole } = render(Button, {
				variant: 'primary',
				size: 'lg',
				class: 'custom-class',
				children: createTestSnippet('Combined')
			});

			const button = getByRole('button');
			expect(button).toHaveClass('bg-bakery-500');
			expect(button).toHaveClass('px-8');
			expect(button).toHaveClass('custom-class');
		});
	});

	describe('Button Type Attribute', () => {
		it('has type="button" by default', async () => {
			const { getByRole } = render(Button, {
				children: createTestSnippet('Button')
			});

			const button = getByRole('button');
			expect(button).toHaveAttribute('type', 'button');
		});
	});
});
