import { page } from 'vitest/browser';
import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Input from './Input.svelte';

describe('Input', () => {
	it('renders with default props', async () => {
		render(Input);

		const input = page.getByRole('textbox');
		await expect.element(input).toBeInTheDocument();
		await expect.element(input).toHaveAttribute('type', 'text');
	});

	it('renders with placeholder', async () => {
		render(Input, { placeholder: 'Enter text' });

		const input = page.getByPlaceholder('Enter text');
		await expect.element(input).toBeInTheDocument();
	});

	it('renders with required attribute', async () => {
		render(Input, { required: true });

		const input = page.getByRole('textbox');
		await expect.element(input).toBeRequired();
		await expect.element(input).toHaveAttribute('aria-required', 'true');
	});

	it('renders disabled state', async () => {
		render(Input, { disabled: true });

		const input = page.getByRole('textbox');
		await expect.element(input).toBeDisabled();
	});

	it('renders with custom class', async () => {
		render(Input, { class: 'custom-class' });

		const input = page.getByRole('textbox');
		await expect.element(input).toHaveClass('custom-class');
	});

	it('renders with error state', async () => {
		render(Input, {
			id: 'test-input',
			error: 'This field is required'
		});

		const input = page.getByRole('textbox');
		await expect.element(input).toHaveClass('border-error-500', 'focus:ring-error-500');
		await expect.element(input).toHaveAttribute('aria-invalid', 'true');

		const error = page.getByText('This field is required');
		await expect.element(error).toBeInTheDocument();
		await expect.element(error).toHaveClass('text-error-600');
		await expect.element(error).toHaveAttribute('role', 'alert');
	});

	it('combines aria-describedby with error id', async () => {
		render(Input, {
			id: 'test-input',
			error: 'Error message',
			'aria-describedby': 'original-desc'
		});

		const input = page.getByRole('textbox');
		await expect.element(input).toHaveAttribute('aria-describedby', 'original-desc test-input-error');
	});

	it('renders with autocomplete attribute', async () => {
		render(Input, { autocomplete: 'email' });

		const input = page.getByRole('textbox');
		await expect.element(input).toHaveAttribute('autocomplete', 'email');
	});

	it('renders with minimum touch target size', async () => {
		render(Input);

		const input = page.getByRole('textbox');
		await expect.element(input).toHaveClass('min-h-[44px]');
	});

	it('does not show error when error prop is undefined', async () => {
		render(Input, { id: 'test-input', error: undefined });

		const input = page.getByRole('textbox');
		await expect.element(input).not.toHaveClass('border-error-500');
		await expect.element(input).toHaveAttribute('aria-invalid', 'false');

		const error = page.getByRole('alert');
		await expect.element(error).not.toBeInTheDocument();
	});
});
