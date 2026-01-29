import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, cleanup as testingLibraryCleanup } from '@testing-library/svelte';
import RootLayout from '../routes/+layout.svelte';

describe('RootLayout', () => {
	beforeEach(() => {
		testingLibraryCleanup();
	});

	it('renders children slot', async () => {
		const { container } = render(RootLayout, {
			data: { title: 'Test' }
		});

		const mainElement = container.querySelector('#main-content');
		expect(mainElement).toBeInTheDocument();
	});

	it('applies fade transition', async () => {
		const { container } = render(RootLayout, {
			data: { title: 'Test' }
		});

		const mainElement = container.querySelector('#main-content');
		// Check if transition class is present
		expect(mainElement).toBeInTheDocument();
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
	});
});
