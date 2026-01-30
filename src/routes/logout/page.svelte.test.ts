import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup as testingLibraryCleanup } from '@testing-library/svelte';
import LogoutPage from './+page.svelte';

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
		const { container } = render(LogoutPage);

		const heading = container.querySelector('h1');
		expect(heading).toBeInTheDocument();
		expect(heading?.textContent).toBe('Logout');
	});

	it('displays logout confirmation text', async () => {
		const { container } = render(LogoutPage);

		expect(container.querySelector('.text-gray-600')).toBeInTheDocument();
	});

	it('shows submit button', async () => {
		const { container } = render(LogoutPage);

		const submitButton = container.querySelector('button[type="submit"]');
		expect(submitButton).toBeInTheDocument();
		expect(submitButton?.textContent).toContain('Logout');
	});

	it('displays cancel button', async () => {
		const { getByText } = render(LogoutPage);

		expect(getByText('Cancel')).toBeInTheDocument();
		const cancelButton = getByText('Cancel');
		expect(cancelButton.tagName).toBe('BUTTON');
	});

	it('has accessibility attributes', async () => {
		const { container } = render(LogoutPage);

		const heading = container.querySelector('h1');
		expect(heading).toBeInTheDocument();

		const submitButton = container.querySelector('button[type="submit"]');
		expect(submitButton).toHaveAttribute('type', 'submit');
	});
});
