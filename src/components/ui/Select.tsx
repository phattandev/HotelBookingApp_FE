import { useState, useRef, useEffect } from 'react';

export interface Option {
  value: string;
  label: string;
}

export interface SelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  className?: string;
  label?: string;
  error?: string;
}

const Select: React.FC<SelectProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Chọn...', 
  disabled = false,
  searchable = false,
  className = '',
  label,
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={wrapperRef} className={`relative w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </label>
      )}
      <div
        className={`w-full px-3 py-2 bg-white border ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-violet-500'} rounded-lg text-sm flex justify-between items-center transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-50 focus:ring-2'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!disabled) setIsOpen(!isOpen);
            }
        }}
      >
        <span className={selectedOption ? 'text-slate-900 font-medium' : 'text-slate-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {/* CSS Arrow without SVG/Text */}
        <div className={`w-2 h-2 border-b-2 border-r-2 border-slate-400 transform transition-transform duration-200 ${isOpen ? '-rotate-135 -translate-y-0.5' : 'rotate-45 -translate-y-0.5'}`} />
      </div>
      
      {error && <span className="text-xs font-medium text-red-500 mt-1">{error}</span>}

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-hidden flex flex-col top-full left-0">
          {searchable && (
            <div className="p-2 border-b border-slate-100">
              <input
                type="text"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          )}
          <ul className="overflow-y-auto custom-scrollbar p-1 space-y-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <li
                  key={opt.value}
                  className={`px-3 py-2 text-sm rounded-md cursor-pointer transition-colors ${opt.value === value ? 'bg-violet-600 text-white font-medium' : 'text-slate-700 hover:bg-slate-100'}`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  {opt.label}
                </li>
              ))
            ) : (
              <li className="px-3 py-4 text-sm text-center text-slate-400">Không tìm thấy kết quả</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export { Select };
