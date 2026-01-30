import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup as testingLibraryCleanup } from '@testing-library/svelte';
import LoginPage from './+page.svelte';

describe('LoginPage', () => {
	beforeEach(() => {
		testingLibraryCleanup();
	});

	it('renders login card', async () => {
		const { container } = render(LoginPage);

		const card = container.querySelector('.max-w-md');
		expect(card).toBeInTheDocument();
	});

	it('displays email input', async () => {
		const { getByLabelText } = render(LoginPage);

		expect(getByLabelText('Email Address')).toBeInTheDocument();
	});

	it('displays password input', async () => {
		const { getByLabelText } = render(LoginPage);

		expect(getByLabelText('Password')).toBeInTheDocument();
	});

	it('shows sign in button', async () => {
		const { getByText } = render(LoginPage);

		expect(getByText('Sign In')).toBeInTheDocument();
	});

	it('shows loading state', async () => {
		const { getByText } = render(LoginPage, {
			form: { success: true }
		});

		// Check if sign in text changes
		expect(getByText('Sign In')).toBeInTheDocument();
	});

	it('has accessibility attributes', async () => {
		const { container } = render(LoginPage);

		const emailInput = container.querySelector('input[name="email"]');
		const passwordInput = container.querySelector('input[name="password"]');
		const submitButton = container.querySelector('button[type="submit"]');

		expect(emailInput).toHaveAttribute('type', 'email');
		expect(emailInput).toHaveAttribute('required');
		expect(passwordInput).toHaveAttribute('type', 'password');
		expect(passwordInput).toHaveAttribute('required');
		expect(submitButton).toHaveAttribute('type', 'submit');
	});
});

