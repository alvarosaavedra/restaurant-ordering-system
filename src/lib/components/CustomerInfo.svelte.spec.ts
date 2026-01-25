import { page } from 'vitest/browser';
import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CustomerInfo from './CustomerInfo.svelte';

describe('CustomerInfo', () => {
	it('renders with initial values', async () => {
		render(CustomerInfo, {
			customerName: 'John Doe',
			customerPhone: '123-456-7890',
			deliveryDateTime: '2025-01-01T12:00',
			address: '123 Main St',
			comment: 'Leave at door',
			onUpdate: () => {}
		});

		expect(page.getByText('Customer Information')).toBeInTheDocument();
	});

	it('shows name error when empty and showErrors is true', async () => {
		render(CustomerInfo, {
			customerName: '   ',
			customerPhone: '',
			deliveryDateTime: '',
			address: '',
			comment: '',
			onUpdate: () => {},
			showErrors: true
		});

		expect(page.getByText('Customer name is required')).toBeInTheDocument();
	});

	it('shows delivery date error when empty', async () => {
		render(CustomerInfo, {
			customerName: 'John',
			customerPhone: '',
			deliveryDateTime: '',
			address: '',
			comment: '',
			onUpdate: () => {},
			showErrors: true
		});

		expect(page.getByText('Delivery date/time is required')).toBeInTheDocument();
	});

	it('shows phone error for invalid format', async () => {
		render(CustomerInfo, {
			customerName: 'John',
			customerPhone: 'abc123',
			deliveryDateTime: '2025-01-01T12:00',
			address: '',
			comment: '',
			onUpdate: () => {},
			showErrors: true
		});

		expect(page.getByText('Please enter a valid phone number')).toBeInTheDocument();
	});

	it('does not show phone error when phone is empty', async () => {
		render(CustomerInfo, {
			customerName: 'John',
			customerPhone: '',
			deliveryDateTime: '2025-01-01T12:00',
			address: '',
			comment: '',
			onUpdate: () => {},
			showErrors: true
		});

		expect(page.getByText('Please enter a valid phone number')).not.toBeInTheDocument();
	});

	it('has correct placeholder text', async () => {
		render(CustomerInfo, {
			customerName: '',
			customerPhone: '',
			deliveryDateTime: '',
			address: '',
			comment: '',
			onUpdate: () => {}
		});

		const nameInput = page.getByPlaceholder('Enter customer name');
		const phoneInput = page.getByPlaceholder('Enter phone number (optional)');

		await expect.element(nameInput).toBeInTheDocument();
		await expect.element(phoneInput).toBeInTheDocument();
	});
});
