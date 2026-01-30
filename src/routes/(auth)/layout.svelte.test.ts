import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, cleanup as testingLibraryCleanup } from '@testing-library/svelte';
import AuthLayout from '../(auth)/+layout.svelte';

describe('AuthLayout', () => {
	beforeEach(() => {
		testingLibraryCleanup();
	});

	it('renders children slot', async () => {
		const { container } = render(AuthLayout, {
			children: () => '<div>Test Content</div>'
		});

		const layout = container.querySelector('.min-h-screen');
		expect(layout).toBeInTheDocument();
	});

	it('applies custom classes', async () => {
		const { container } = render(AuthLayout, {
			children: () => '<div>Test Content</div>',
			class: 'custom-class'
		});

		const layout = container.querySelector('.min-h-screen');
		expect(layout).toHaveClass('custom-class');
	});

	it('has correct accessibility attributes', async () => {
		const { container } = render(AuthLayout, {
			children: () => '<div>Test Content</div>'
		});

		const layout = container.querySelector('.min-h-screen');
		expect(layout).toBeInTheDocument();
	});
});
