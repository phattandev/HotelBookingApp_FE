import { forwardRef } from 'react';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import type { DatePickerProps as ReactDatePickerProps } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { vi } from 'date-fns/locale/vi';

// Register Vietnamese locale
registerLocale('vi', vi);

export interface DatePickerProps extends Omit<ReactDatePickerProps, 'onChange' | 'value'> {
  label?: string;
  error?: string;
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  className?: string;
}

const DatePicker = forwardRef<any, DatePickerProps>(
  ({ label, error, value, onChange, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 date-picker-wrapper">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </label>
        )}
        <div className="relative">
          {/* @ts-expect-error - ReactDatePicker complex union types conflict with generic props spreading */}
          <ReactDatePicker
            ref={ref}
            selected={value}
            onChange={(date: any) => onChange && onChange(date)}
            locale="vi"
            dateFormat="dd/MM/yyyy"
            className={`w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed ${
              error ? 'border-red-500 focus:ring-red-500' : ''
            } ${className}`}
            calendarClassName="shadow-xl border-slate-200 rounded-xl overflow-hidden font-sans"
            {...props}
          />
        </div>
        {error && <span className="text-xs font-medium text-red-500 mt-1">{error}</span>}
      </div>
    );
  }
);
DatePicker.displayName = 'DatePicker';

export { DatePicker };
