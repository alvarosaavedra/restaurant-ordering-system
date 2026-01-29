import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup as testingLibraryCleanup } from '@testing-library/svelte';
import Spinner from './Spinner.svelte';

describe('Spinner', () => {
	beforeEach(() => {
		testingLibraryCleanup();
	});

	it('renders with default size', async () => {
		const { getByRole } = render(Spinner);

		const spinner = getByRole('status');
		expect(spinner).toBeInTheDocument();
		expect(spinner).toHaveAttribute('aria-label', 'Loading');
	});

	it('renders small size', async () => {
		const { getByRole } = render(Spinner, { size: 'sm' });
		const spinner = getByRole('status');
		expect(spinner).toHaveClass('w-4', 'h-4', 'border-2');
	});

	it('renders medium size', async () => {
		const { getByRole } = render(Spinner, { size: 'md' });
		const spinner = getByRole('status');
		expect(spinner).toHaveClass('w-8', 'h-8', 'border-3');
	});

	it('renders large size', async () => {
		const { getByRole } = render(Spinner, { size: 'lg' });
		const spinner = getByRole('status');
		expect(spinner).toHaveClass('w-12', 'h-12', 'border-4');
	});

	it('renders with custom color', async () => {
		const { getByRole } = render(Spinner, {
			color: 'success'
		});

		const spinner = getByRole('status');
		expect(spinner).toHaveClass('border-success-500');
	});

	it('applies custom classes', async () => {
		const { getByRole } = render(Spinner, {
			class: 'custom-class'
		});

		const spinner = getByRole('status');
		expect(spinner).toHaveClass('custom-class');
	});
});
