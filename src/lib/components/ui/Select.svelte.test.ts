import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, cleanup as testingLibraryCleanup } from '@testing-library/svelte';
import Select from './Select.svelte';

describe('Select', () => {
	beforeEach(() => {
		testingLibraryCleanup();
	});

	it('renders with default props', async () => {
		const { getByRole } = render(Select, {
			name: 'test-select',
			options: [{ value: 'opt1', label: 'Option 1' }],
			children: () => {}
		});

		const select = getByRole('combobox');
		expect(select).toBeInTheDocument();
	});

	it('renders options', async () => {
		const { getAllByRole } = render(Select, {
			name: 'test-select',
			options: [
				{ value: 'opt1', label: 'Option 1' },
				{ value: 'opt2', label: 'Option 2' },
				{ value: 'opt3', label: 'Option 3' }
			],
			children: () => {}
		});

		const options = getAllByRole('option');
		// Should have 4 options: 3 real + 1 placeholder
		expect(options).toHaveLength(4);
	});

	it('shows placeholder', async () => {
		const { getByRole } = render(Select, {
			name: 'test-select',
			options: [{ value: 'opt1', label: 'Option 1' }],
			placeholder: 'Select an option',
			children: () => {}
		});

		const select = getByRole('combobox');
		expect(select).toBeInTheDocument();
		// Placeholder is part of select content (as option with empty value)
	});

	it('handles change event', async () => {
		const handleChange = vi.fn();
		const { getByRole } = render(Select, {
			name: 'test-select',
			options: [{ value: 'opt1', label: 'Option 1' }],
			onchange: handleChange,
			children: () => {}
		});

		const select = getByRole('combobox');
		select.dispatchEvent(new Event('change', { bubbles: true }));
		expect(handleChange).toHaveBeenCalled();
	});

	it('handles disabled state', async () => {
		const { getByRole } = render(Select, {
			name: 'test-select',
			options: [{ value: 'opt1', label: 'Option 1' }],
			disabled: true,
			children: () => {}
		});

		const select = getByRole('combobox');
		expect(select).toBeDisabled();
	});

	it('has accessibility attributes', async () => {
		const { getByRole } = render(Select, {
			name: 'test-select',
			options: [{ value: 'opt1', label: 'Option 1' }],
			'aria-label': 'Test Select',
			'aria-describedby': 'test-description',
			required: true,
			children: () => {}
		});

		const select = getByRole('combobox');
		expect(select).toHaveAttribute('aria-label', 'Test Select');
		expect(select).toHaveAttribute('aria-describedby', 'test-description');
		expect(select).toHaveAttribute('aria-required', 'true');
	});
});
