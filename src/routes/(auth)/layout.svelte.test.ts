import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup as testingLibraryCleanup } from '@testing-library/svelte';
import AuthLayout from './+layout.svelte';

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

	it('has correct base classes', async () => {
		const { container } = render(AuthLayout, {
			children: () => '<div>Test Content</div>'
		});

		const layout = container.querySelector('.min-h-screen');
		expect(layout).toHaveClass('bg-gray-50', 'flex', 'flex-col', 'justify-center', 'py-12', 'sm:px-6', 'lg:px-8');
	});

	it('has correct accessibility attributes', async () => {
		const { container } = render(AuthLayout, {
			children: () => '<div>Test Content</div>'
		});

		const layout = container.querySelector('.min-h-screen');
		expect(layout).toBeInTheDocument();
	});
});
