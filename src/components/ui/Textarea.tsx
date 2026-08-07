import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, ...props }, ref) => {
    const baseStyles = "w-full rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed resize-none";
    const solidStyles = "bg-white border border-slate-200 text-slate-900 focus:ring-violet-500 focus:border-violet-500 placeholder:text-slate-400";
    
    const classes = `${baseStyles} ${solidStyles} ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={classes}
          {...props}
        />
        {error && <span className="text-xs font-medium text-red-500 mt-1">{error}</span>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
