import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, cleanup as testingLibraryCleanup } from '@testing-library/svelte';
import RootLayout from './+layout.svelte';

describe('RootLayout', () => {
	beforeEach(() => {
		testingLibraryCleanup();
	});

	it('renders children content', async () => {
		const { container } = render(RootLayout, {
			data: { title: 'Test' }
		});

		// The layout has a div with transition for children
		const contentDiv = container.querySelector('div');
		expect(contentDiv).toBeInTheDocument();
	});

	it('includes skip link to main content', async () => {
		const { getByText } = render(RootLayout, {
			data: { title: 'Test' }
		});

		expect(getByText('Skip to main content')).toBeInTheDocument();
	});

	it('has correct accessibility attributes', async () => {
		const { getByText } = render(RootLayout, {
			data: { title: 'Test' }
		});

		const link = getByText('Skip to main content');
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute('href', '#main-content');
		expect(link).toHaveClass('skip-link');
	});
});
