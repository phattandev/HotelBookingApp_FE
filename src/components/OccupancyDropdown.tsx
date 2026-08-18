import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FaUserFriends, FaChevronDown, FaPlus, FaMinus } from 'react-icons/fa';

export interface Occupancy {
  rooms: number;
  adults: number;
  children: number;
}

export interface OccupancyDropdownProps {
  value: Occupancy;
  onChange: (value: Occupancy) => void;
  className?: string;
}

export interface OccupancyDropdownRef {
  open: () => void;
  close: () => void;
  focus: () => void;
}

const OccupancyDropdown = forwardRef<OccupancyDropdownRef, OccupancyDropdownProps>(({ value, onChange, className = '' }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    focus: () => buttonRef.current?.focus()
  }));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleIncrement = (field: keyof Occupancy) => {
    onChange({ ...value, [field]: value[field] + 1 });
  };

  const handleDecrement = (field: keyof Occupancy, min: number) => {
    if (value[field] > min) {
      onChange({ ...value, [field]: value[field] - 1 });
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-full flex items-center justify-between bg-transparent border-none text-slate-900 py-3 px-4 focus:outline-none transition-all"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <FaUserFriends className="text-gray-400 flex-shrink-0" />
          <span className="truncate text-sm sm:text-[13px]">
            {value.adults} người lớn · {value.children} trẻ em · {value.rooms} phòng
          </span>
        </div>
        <FaChevronDown className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[280px] sm:min-w-[320px] bg-white rounded-xl shadow-2xl border border-gray-100 z-50 p-5">
          <div className="space-y-5">
            {/* Rooms */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">Phòng</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDecrement('rooms', 1)}
                  disabled={value.rooms <= 1}
                  className="w-10 h-10 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-indigo-600 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaMinus size={12} />
                </button>
                <span className="w-8 text-center font-medium text-slate-900 text-lg sm:text-base">{value.rooms}</span>
                <button
                  type="button"
                  onClick={() => handleIncrement('rooms')}
                  className="w-10 h-10 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-indigo-600 hover:text-indigo-600 transition-colors"
                >
                  <FaPlus size={12} />
                </button>
              </div>
            </div>

            {/* Adults */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">Người lớn</p>
                <p className="text-sm text-gray-500">Từ 13 tuổi trở lên</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDecrement('adults', 1)}
                  disabled={value.adults <= 1}
                  className="w-10 h-10 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-indigo-600 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaMinus size={12} />
                </button>
                <span className="w-8 text-center font-medium text-slate-900 text-lg sm:text-base">{value.adults}</span>
                <button
                  type="button"
                  onClick={() => handleIncrement('adults')}
                  className="w-10 h-10 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-indigo-600 hover:text-indigo-600 transition-colors"
                >
                  <FaPlus size={12} />
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">Trẻ em</p>
                <p className="text-sm text-gray-500">Độ tuổi 0 - 12</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDecrement('children', 0)}
                  disabled={value.children <= 0}
                  className="w-10 h-10 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-indigo-600 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaMinus size={12} />
                </button>
                <span className="w-8 text-center font-medium text-slate-900 text-lg sm:text-base">{value.children}</span>
                <button
                  type="button"
                  onClick={() => handleIncrement('children')}
                  className="w-10 h-10 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-indigo-600 hover:text-indigo-600 transition-colors"
                >
                  <FaPlus size={12} />
                </button>
              </div>
            </div>
            
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

OccupancyDropdown.displayName = 'OccupancyDropdown';

export default OccupancyDropdown;
