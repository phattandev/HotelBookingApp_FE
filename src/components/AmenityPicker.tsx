/**
 * AmenityPicker — Component chọn tiện nghi từ danh sách chuẩn.
 * Dùng trong form đăng ký khách sạn (Hotel) và tạo phòng (RoomType).
 *
 * Props:
 *   selectedIds  — mảng Guid đang chọn
 *   onChange     — callback khi thay đổi
 *   disabled     — khoá khi form đang submit
 */
import { useState, useEffect } from 'react';
import api from '../services/api';

interface Amenity  { id: string; categoryId: string; categoryName: string; name: string; }
interface AmenityPickerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

const AmenityPicker: React.FC<AmenityPickerProps> = ({ selectedIds, onChange, disabled }) => {
  const [amenities, setAmenities]   = useState<Amenity[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activeCat, setActiveCat]   = useState<string>('all');
  const [search, setSearch]         = useState('');

  useEffect(() => {
    api.get('/amenities?isActive=true')
      .then(res => setAmenities(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: string) => {
    if (disabled) return;
    onChange(selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id]);
  };

  // Group by category
  const categories = Array.from(new Map(amenities.map(a => [a.categoryId, a.categoryName])).entries());

  const visible = amenities.filter(a =>
    (activeCat === 'all' || a.categoryId === activeCat) &&
    (search === '' || a.name.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="text-xs text-gray-400 py-2">Đang tải tiện nghi...</div>;
  if (amenities.length === 0) return (
    <div className="text-xs text-amber-600 py-2 border border-amber-200 bg-amber-50 rounded-lg px-3">
      Chưa có tiện nghi nào trong hệ thống. Admin cần thêm trước.
    </div>
  );

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Search + count */}
      <div className="px-3 py-2.5 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm tiện nghi..."
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-red-400 focus:outline-none"
          disabled={disabled}
        />
        {selectedIds.length > 0 && (
          <span className="shrink-0 text-xs text-white bg-red-600 rounded-full px-2 py-0.5 font-semibold">
            {selectedIds.length} đã chọn
          </span>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 px-3 pt-2 pb-1 overflow-x-auto bg-white">
        <button
          onClick={() => setActiveCat('all')}
          disabled={disabled}
          className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-medium transition
            ${activeCat === 'all' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          Tất cả
        </button>
        {categories.map(([catId, catName]) => (
          <button key={catId}
            onClick={() => setActiveCat(catId)}
            disabled={disabled}
            className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-medium transition
              ${activeCat === catId ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {catName}
          </button>
        ))}
      </div>

      {/* Amenity grid */}
      <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
        {visible.length === 0 && (
          <p className="col-span-full text-xs text-gray-400 text-center py-4">Không tìm thấy tiện nghi.</p>
        )}
        {visible.map(a => {
          const checked = selectedIds.includes(a.id);
          return (
            <label key={a.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition
                ${checked ? 'border-red-500 bg-red-50 text-red-700 font-medium' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}
                ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
              <input
                type="checkbox"
                className="accent-red-600 w-3.5 h-3.5 shrink-0"
                checked={checked}
                onChange={() => toggle(a.id)}
                disabled={disabled}
              />
              <span className="truncate">{a.name}</span>
            </label>
          );
        })}
      </div>

      {/* Deselect all shortcut */}
      {selectedIds.length > 0 && (
        <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
          <button onClick={() => onChange([])} disabled={disabled}
            className="text-xs text-gray-500 hover:text-red-600 transition disabled:opacity-50">
            Bỏ chọn tất cả
          </button>
        </div>
      )}
    </div>
  );
};

export default AmenityPicker;