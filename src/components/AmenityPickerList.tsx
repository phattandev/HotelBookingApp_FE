import React, { useMemo, useState } from 'react';

interface AmenityItem {
  id: string;
  name: string;
  categoryName: string;
}

interface Props {
  /** Toàn bộ danh sách tiện nghi từ server */
  allAmenities: AmenityItem[];
  /** Set ID hoặc mảng ID các tiện nghi đang được chọn */
  selectedIds: Set<string> | string[];
  /** Callback khi toggle một tiện nghi */
  onToggle: (id: string) => void;
  /** 
   * Nếu true: list dùng flex-1 min-h-0 để fill toàn bộ chiều cao còn lại 
   * (dành cho trang HotelInfo - không sinh scrollbar ngoài)
   * Nếu false: dùng maxHeight cố định (mặc định cho modal)
   */
  fillHeight?: boolean;
  /** Chiều cao tối đa (chỉ dùng khi fillHeight = false) */
  maxHeight?: string;
}

const AmenityItemRow = React.memo(({ 
  a, 
  isSelected, 
  onToggle 
}: { 
  a: AmenityItem; 
  isSelected: boolean; 
  onToggle: (id: string) => void 
}) => {
  return (
    <label
      htmlFor={`amenity-${a.id}`}
      className={`relative flex items-center gap-3 px-4 py-2.5 cursor-pointer select-none transition-colors
        ${isSelected
          ? 'bg-emerald-50 hover:bg-emerald-100/70'
          : 'hover:bg-slate-50'
        }`}
    >
      <div
        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border-2 transition-all
          ${isSelected
            ? 'bg-emerald-600 border-emerald-600'
            : 'bg-white border-slate-300'
          }`}
      >
        {isSelected && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      <span className={`text-sm flex-1 ${isSelected ? 'text-emerald-800 font-medium' : 'text-slate-700'}`}>
        {a.name}
      </span>

      <input
        type="checkbox"
        id={`amenity-${a.id}`}
        checked={isSelected}
        onChange={() => onToggle(a.id)}
        className="opacity-0 absolute inset-0 z-10 cursor-pointer"
      />
    </label>
  );
});

/**
 * Component danh sách tiện nghi với checkbox, phân nhóm theo danh mục và ô tìm kiếm.
 * Thiết kế dạng list cuộn dọc, phù hợp nhúng vào sidebar hoặc modal.
 */
const AmenityPickerList: React.FC<Props> = ({
  allAmenities,
  selectedIds,
  onToggle,
  fillHeight = false,
  maxHeight = '300px',
}) => {
  const [search, setSearch] = useState('');

  // Chuẩn hoá selectedIds thành Set để kiểm tra O(1)
  const selectedSet = useMemo(
    () => (selectedIds instanceof Set ? selectedIds : new Set(selectedIds)),
    [selectedIds]
  );

  // Lọc theo từ khoá tìm kiếm, không phân biệt hoa/thường và dấu
  const filteredAmenities = useMemo(() => {
    if (!search.trim()) return allAmenities;
    const keyword = search
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    return allAmenities.filter((a) => {
      const name = a.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      return name.includes(keyword);
    });
  }, [allAmenities, search]);

  // Nhóm theo danh mục
  const grouped = useMemo(() => {
    return filteredAmenities.reduce<Record<string, AmenityItem[]>>((acc, a) => {
      (acc[a.categoryName] ||= []).push(a);
      return acc;
    }, {});
  }, [filteredAmenities]);

  const selectedCount = selectedSet.size;
  const hasResults = filteredAmenities.length > 0;

  return (
    <div className={`flex flex-col gap-2 ${fillHeight ? 'flex-1 min-h-0' : ''}`}>
      {/* Header: đếm số đã chọn + ô tìm kiếm */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none"
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tiện nghi..."
            className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm font-bold"
            >
              ×
            </button>
          )}
        </div>
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md whitespace-nowrap shrink-0">
          {selectedCount} đã chọn
        </span>
      </div>

      {/* Danh sách cuộn: flex-1 min-h-0 khi fillHeight, maxHeight cố định khi dùng trong modal */}
      <div
        className={`overflow-y-auto rounded-xl border border-slate-200 bg-white ${
          fillHeight ? 'flex-1 min-h-0' : ''
        }`}
        style={fillHeight ? undefined : { maxHeight }}
      >
        {!hasResults ? (
          <div className="p-8 text-center text-xs text-slate-400 italic">
            {allAmenities.length === 0
              ? 'Chưa có tiện nghi nào trong hệ thống.'
              : `Không tìm thấy tiện nghi nào khớp với "${search}".`}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                {/* Tiêu đề danh mục - sticky trong vùng scroll */}
                <div className="sticky top-0 z-10 bg-slate-50 px-4 py-2 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {category}
                    <span className="ml-2 font-normal normal-case text-slate-300">
                      ({items.filter((i) => selectedSet.has(i.id)).length}/{items.length})
                    </span>
                  </p>
                </div>

                {/* Danh sách item */}
                {items.map((a) => (
                  <AmenityItemRow
                    key={a.id}
                    a={a}
                    isSelected={selectedSet.has(a.id)}
                    onToggle={onToggle}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AmenityPickerList;
