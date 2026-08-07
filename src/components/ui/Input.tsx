import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: 'solid' | 'glass';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, variant = 'solid', ...props }, ref) => {
    const baseInputStyles = "w-full rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const solidStyles = "bg-white border border-slate-200 text-slate-900 focus:ring-violet-500 focus:border-violet-500 placeholder:text-slate-400";
    const glassStyles = "bg-white/10 border border-white/20 text-white focus:ring-white/50 focus:border-transparent placeholder:text-white/50";
    
    const inputClasses = `${baseInputStyles} ${variant === 'glass' ? glassStyles : solidStyles} ${error ? (variant === 'glass' ? 'border-red-400 focus:ring-red-400' : 'border-red-500 focus:ring-red-500') : ''} ${className}`;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className={`text-xs font-semibold uppercase tracking-wider ${variant === 'glass' ? 'text-white/90' : 'text-slate-500'}`}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
        {error && <span className="text-xs font-medium text-red-500 mt-1">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
