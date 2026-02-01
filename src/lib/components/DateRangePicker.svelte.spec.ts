import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import DateRangePicker from './DateRangePicker.svelte';

describe('DateRangePicker', () => {
	const mockOnChange = vi.fn();

	beforeEach(() => {
		mockOnChange.mockClear();
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-02-01T12:00:00Z'));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('Predefined Range Selection', () => {
		it('should render with default "Today" preset selected', () => {
			render(DateRangePicker, {
				props: {
					onChange: mockOnChange
				}
			});

			const select = screen.getByLabelText('Time Period');
			expect(select).toHaveValue('today');
		});

		it('should have all preset options available', () => {
			render(DateRangePicker, {
				props: {
					onChange: mockOnChange
				}
			});

			const select = screen.getByLabelText('Time Period');
			const options = Array.from(select.querySelectorAll('option'));
			const optionValues = options.map((opt) => opt.value);

			expect(optionValues).toContain('today');
			expect(optionValues).toContain('week');
			expect(optionValues).toContain('month');
			expect(optionValues).toContain('custom');
		});

		it('should call onChange with today\'s date range when "Today" is selected', async () => {
			render(DateRangePicker, {
				props: {
					onChange: mockOnChange
				}
			});

			const select = screen.getByLabelText('Time Period');
			await fireEvent.change(select, { target: { value: 'today' } });

			expect(mockOnChange).toHaveBeenCalledWith({
				range: 'today',
				startDate: '2026-02-01',
				endDate: '2026-02-01'
			});
		});

		it('should call onChange with this week\'s date range when "This Week" is selected', async () => {
			render(DateRangePicker, {
				props: {
					onChange: mockOnChange
				}
			});

			const select = screen.getByLabelText('Time Period');
			await fireEvent.change(select, { target: { value: 'week' } });

			expect(mockOnChange).toHaveBeenCalledWith({
				range: 'week',
				startDate: '2026-01-26',
				endDate: '2026-02-01'
			});
		});

		it('should call onChange with this month\'s date range when "This Month" is selected', async () => {
			render(DateRangePicker, {
				props: {
					onChange: mockOnChange
				}
			});

			const select = screen.getByLabelText('Time Period');
			await fireEvent.change(select, { target: { value: 'month' } });

			expect(mockOnChange).toHaveBeenCalledWith({
				range: 'month',
				startDate: '2026-02-01',
				endDate: '2026-02-28'
			});
		});
	});

	describe('Custom Date Range', () => {
		it('should show custom date inputs when "Custom" is selected', async () => {
			render(DateRangePicker, {
				props: {
					onChange: mockOnChange
				}
			});

			const select = screen.getByLabelText('Time Period');
			await fireEvent.change(select, { target: { value: 'custom' } });

			const startInput = screen.getByLabelText('Start Date');
			const endInput = screen.getByLabelText('End Date');

			expect(startInput).toBeInTheDocument();
			expect(endInput).toBeInTheDocument();
		});

		it('should not show custom date inputs for preset ranges', () => {
			render(DateRangePicker, {
				props: {
					onChange: mockOnChange
				}
			});

			const startInput = screen.queryByLabelText('Start Date');
			const endInput = screen.queryByLabelText('End Date');

			expect(startInput).not.toBeInTheDocument();
			expect(endInput).not.toBeInTheDocument();
		});

		it('should call onChange with custom dates when both dates are set', async () => {
			render(DateRangePicker, {
				props: {
					onChange: mockOnChange
				}
			});

			const select = screen.getByLabelText('Time Period');
			await fireEvent.change(select, { target: { value: 'custom' } });

			const startInput = screen.getByLabelText('Start Date');
			const endInput = screen.getByLabelText('End Date');

			await fireEvent.input(startInput, { target: { value: '2026-01-15' } });
			await fireEvent.input(endInput, { target: { value: '2026-01-20' } });

			expect(mockOnChange).toHaveBeenCalledWith({
				range: 'custom',
				startDate: '2026-01-15',
				endDate: '2026-01-20'
			});
		});

		it('should enforce end date not before start date', async () => {
			render(DateRangePicker, {
				props: {
					onChange: mockOnChange
				}
			});

			const select = screen.getByLabelText('Time Period');
			await fireEvent.change(select, { target: { value: 'custom' } });

			const startInput = screen.getByLabelText('Start Date');
			const endInput = screen.getByLabelText('End Date');

			await fireEvent.input(startInput, { target: { value: '2026-01-20' } });
			await fireEvent.input(endInput, { target: { value: '2026-01-15' } });

			// Should adjust end date to match start date
			expect(endInput).toHaveValue('2026-01-20');
		});

		it('should limit custom range to maximum 365 days', async () => {
			render(DateRangePicker, {
				props: {
					onChange: mockOnChange
				}
			});

			const select = screen.getByLabelText('Time Period');
			await fireEvent.change(select, { target: { value: 'custom' } });

			const startInput = screen.getByLabelText('Start Date');
			const endInput = screen.getByLabelText('End Date');

			await fireEvent.input(startInput, { target: { value: '2026-01-01' } });
			await fireEvent.input(endInput, { target: { value: '2026-12-31' } });

			// Should clamp end date to 365 days from start
			expect(endInput).toHaveValue('2027-01-01');
		});
	});

	describe('Initial Value', () => {
		it('should accept initial range value', () => {
			render(DateRangePicker, {
				props: {
					value: { range: 'week', startDate: '2026-01-26', endDate: '2026-02-01' },
					onChange: mockOnChange
				}
			});

			const select = screen.getByLabelText('Time Period');
			expect(select).toHaveValue('week');
		});

		it('should show custom inputs when initial value is custom', () => {
			render(DateRangePicker, {
				props: {
					value: { range: 'custom', startDate: '2026-01-15', endDate: '2026-01-20' },
					onChange: mockOnChange
				}
			});

			const startInput = screen.getByLabelText('Start Date');
			const endInput = screen.getByLabelText('End Date');

			expect(startInput).toHaveValue('2026-01-15');
			expect(endInput).toHaveValue('2026-01-20');
		});
	});

	describe('Display Labels', () => {
		it('should display formatted date range for preset selections', () => {
			render(DateRangePicker, {
				props: {
					onChange: mockOnChange
				}
			});

			const dateDisplay = screen.getByTestId('date-range-display');
			expect(dateDisplay).toHaveTextContent('Feb 1, 2026');
		});

		it('should display formatted date range for week selection', async () => {
			render(DateRangePicker, {
				props: {
					onChange: mockOnChange
				}
			});

			const select = screen.getByLabelText('Time Period');
			await fireEvent.change(select, { target: { value: 'week' } });

			const dateDisplay = screen.getByTestId('date-range-display');
			expect(dateDisplay).toHaveTextContent('Jan 26 - Feb 1, 2026');
		});
	});
});
