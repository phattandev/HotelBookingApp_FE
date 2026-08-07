import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', label, description, checked, ...props }, ref) => {
    return (
      <label className="group flex items-start gap-3 cursor-pointer select-none">
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            type="checkbox"
            className="peer sr-only"
            ref={ref}
            checked={checked}
            {...props}
          />
          {/* Custom box */}
          <div className="w-5 h-5 rounded border-2 border-slate-300 bg-white transition-all peer-checked:bg-indigo-600 peer-checked:border-indigo-600 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-focus-visible:ring-offset-2 peer-disabled:bg-slate-100 peer-disabled:border-slate-200">
            {checked && (
              <div className="absolute top-[45%] left-1/2 w-1.5 h-2.5 border-r-2 border-b-2 border-white -translate-x-1/2 -translate-y-1/2 rotate-45 transform" />
            )}
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-sm font-medium text-slate-800 group-hover:text-indigo-900 transition-colors">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-slate-500 mt-0.5">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
