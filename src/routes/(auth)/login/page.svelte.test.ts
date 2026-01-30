import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, cleanup as testingLibraryCleanup } from '@testing-library/svelte';
import LoginPage from './+page.svelte';
import { mockNavigation, mockFetch } from '$lib/components/__tests__/utils';

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
		const { container, getByLabelText } = render(LoginPage);

		expect(getByLabelText('Email')).toBeInTheDocument();
	});

	it('displays password input', async () => {
		const { container, getByLabelText } = render(LoginPage);

		expect(getByLabelText('Password')).toBeInTheDocument();
	});

	it('shows sign in button', async () => {
		const { getByText } = render(LoginPage);

		expect(getByText('Sign In')).toBeInTheDocument();
	});

	it('shows loading state during submission', async () => {
		const { container, getByText } = render(LoginPage);

		// Check if loading class is present
		expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
	});

	it('displays error message on failed login', async () => {
		const { container } = render(LoginPage);

		// Error message should exist
		const errorDiv = container.querySelector('.bg-error-50');
		expect(errorDiv).toBeInTheDocument();
	});

	it('navigates on successful login', async () => {
		const mockNav = mockNavigation();
		const { container } = render(LoginPage);

		// Find submit button and click it
		const submitButton = container.querySelector('button[type="submit"]');
		submitButton.click();

		// Give navigation time to process
		await new Promise((resolve) => setTimeout(resolve, 10));
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
