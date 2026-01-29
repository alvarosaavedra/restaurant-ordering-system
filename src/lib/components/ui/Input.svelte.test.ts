import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, cleanup as testingLibraryCleanup } from '@testing-library/svelte';
import Input from './Input.svelte';

describe('Input', () => {
	beforeEach(() => {
		testingLibraryCleanup();
	});

	it('renders with default props', async () => {
		const { getByRole } = render(Input, {
			name: 'test-input',
			children: () => {}
		});

		const input = getByRole('textbox');
		expect(input).toBeInTheDocument();
		expect(input).toHaveAttribute('type', 'text');
	});

	it('shows error message', async () => {
		const { getByText } = render(Input, {
			name: 'test-input',
			error: 'This field is required',
			children: () => {}
		});

		expect(getByText('This field is required')).toBeInTheDocument();
	});



	it('handles disabled state', async () => {
		const { getByRole } = render(Input, {
			name: 'test-input',
			disabled: true,
			children: () => {}
		});

		const input = getByRole('textbox');
		expect(input).toBeDisabled();
	});

	it('handles oninput event', async () => {
		const handleInput = vi.fn();
		const { getByRole } = render(Input, {
			name: 'test-input',
			oninput: handleInput,
			children: () => {}
		});

		const input = getByRole('textbox');
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(handleInput).toHaveBeenCalled();
	});

	it('has accessibility attributes', async () => {
		const { getByRole } = render(Input, {
			name: 'test-input',
			'aria-label': 'Test Input',
			'aria-describedby': 'test-description',
			required: true,
			children: () => {}
		});

		const input = getByRole('textbox');
		expect(input).toHaveAttribute('aria-label', 'Test Input');
		expect(input).toHaveAttribute('aria-describedby', 'test-description');
		expect(input).toHaveAttribute('aria-required', 'true');
	});
});
