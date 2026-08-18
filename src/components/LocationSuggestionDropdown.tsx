import React, { useCallback, useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { FaMapMarkerAlt, FaCity } from 'react-icons/fa';

interface LocationSuggestion {
  displayName: string;
  value: string;
  type: 'province' | 'ward';
  hotelCount: number;
}

interface Props {
  query: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

/**
 * Dropdown gợi ý địa điểm cho ô tìm kiếm.
 * Hiển thị khi `query` >= 1 ký tự, ẩn khi chọn hoặc blur.
 * Debounce 300ms để tránh gọi API quá nhiều.
 */
const LocationSuggestionDropdown: React.FC<Props> = ({ query, onSelect, onClose }) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions với debounce 300ms
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 1) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/hotels/location-suggestions', { params: { q, limit: 8 } });
      setSuggestions(res.data.data || []);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 1) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (query.trim().length < 1) return null;
  if (!loading && suggestions.length === 0) return null;

  const provinces = suggestions.filter(s => s.type === 'province');
  const wards = suggestions.filter(s => s.type === 'ward');

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fade-in w-max min-w-[100%] max-w-[90vw] sm:max-w-[400px]"
    >
      {loading ? (
        <div className="flex items-center gap-2 px-4 py-3 text-slate-400 text-sm">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Đang tìm kiếm...
        </div>
      ) : (
        <div className="py-1.5">
          {/* Province group */}
          {provinces.length > 0 && (
            <div>
              {provinces.map((s, i) => (
                <button
                  key={`province-${i}`}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Ngăn blur input trước khi chọn
                    onSelect(s.value);
                    onClose();
                  }}
                  className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-indigo-50 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-200 transition-colors">
                    <FaMapMarkerAlt className="text-indigo-500 text-xs" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800 break-words">{s.displayName}</p>
                    <p className="text-xs text-slate-400">{s.hotelCount} khách sạn</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Divider */}
          {provinces.length > 0 && wards.length > 0 && (
            <div className="mx-4 my-1 border-t border-slate-100" />
          )}

          {/* Ward group */}
          {wards.length > 0 && (
            <div>
              {wards.map((s, i) => (
                <button
                  key={`ward-${i}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSelect(s.value);
                    onClose();
                  }}
                  className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-emerald-50 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-200 transition-colors">
                    <FaMapMarkerAlt className="text-emerald-500 text-xs" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700 break-words">{s.displayName}</p>
                    <p className="text-xs text-slate-400">{s.hotelCount} khách sạn</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSuggestionDropdown;
