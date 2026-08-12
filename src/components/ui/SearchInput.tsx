import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className = '', label, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type="text"
            className={`w-full rounded-lg pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 text-slate-900 focus:ring-violet-500 focus:border-violet-500 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${className}`}
            {...props}
          />
          {/* Magnifying Glass Icon (CSS drawn) */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5">
            <div className="absolute top-0 left-0 w-3 h-3 border-2 border-slate-400 rounded-full" />
            <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-t-2 border-slate-400 transform rotate-45 origin-bottom-left translate-x-0.5 translate-y-0.5" />
          </div>
        </div>
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export { SearchInput };
