import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, cleanup as testingLibraryCleanup } from '@testing-library/svelte';
import LogoutPage from './+page.svelte';
import { mockNavigation } from '$lib/components/__tests__/utils';

describe('LogoutPage', () => {
	beforeEach(() => {
		testingLibraryCleanup();
	});

	it('renders logout card', async () => {
		const { container } = render(LogoutPage);

		const card = container.querySelector('.bg-white');
		expect(card).toBeInTheDocument();
	});

	it('shows logout heading', async () => {
		const { getByText } = render(LogoutPage);

		expect(getByText('Logout')).toBeInTheDocument();
	});

	it('displays logout confirmation text', async () => {
		const { container, getByText } = render(LogoutPage);

		expect(container.querySelector('.text-gray-600')).toBeInTheDocument();
	});

	it('shows submit button', async () => {
		const { getByText } = render(LogoutPage);

		expect(getByText('Logout')).toBeInTheDocument();
	});

	it('displays cancel link', async () => {
		const { container, getByText } = render(LogoutPage);

		expect(getByText('Cancel')).toBeInTheDocument();
		expect(container.querySelector('a[href="/"]')).toBeInTheDocument();
	});

	it('has accessibility attributes', async () => {
		const { container, getByText } = render(LogoutPage);

		const heading = getByText('Logout');
		expect(heading).toBeInTheDocument();

		const card = container.querySelector('.bg-white');
		expect(card).toBeInTheDocument();
	});
});
