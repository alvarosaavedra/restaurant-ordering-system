import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup as testingLibraryCleanup } from '@testing-library/svelte';
import Skeleton from './Skeleton.svelte';

describe('Skeleton', () => {
	beforeEach(() => {
		testingLibraryCleanup();
	});

	it('renders with default size', async () => {
		const { getByRole } = render(Skeleton);

		const skeleton = getByRole('status');
		expect(skeleton).toBeInTheDocument();
		expect(skeleton).toHaveAttribute('aria-label', 'Loading');
	});

	it('renders with custom width and height', async () => {
		const { getByRole } = render(Skeleton, {
			width: '200px',
			height: '50px'
		});

		const skeleton = getByRole('status');
		expect(skeleton).toBeInTheDocument();
		expect(skeleton.style.width).toBe('200px');
		expect(skeleton.style.height).toBe('50px');
	});

	it('renders with circle shape', async () => {
		const { getByRole } = render(Skeleton, {
			variant: 'circle'
		});

		const skeleton = getByRole('status');
		expect(skeleton).toBeInTheDocument();
		expect(skeleton).toHaveClass('rounded-full');
	});

	it('applies custom classes', async () => {
		const { getByRole } = render(Skeleton, {
			class: 'custom-class'
		});

		const skeleton = getByRole('status');
		expect(skeleton).toHaveClass('custom-class');
	});
});
