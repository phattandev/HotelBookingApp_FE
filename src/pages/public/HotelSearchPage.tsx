import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';

interface HotelCard {
  id: string;
  name: string;
  addressLine: string;
  provinceName: string;
  wardName: string;
  starRating: number | null;
  primaryImageUrl: string | null;
  minPrice: number | null;
}

interface AmenityItem {
  id: string;
  name: string;
  categoryName: string;
  categoryApplicableTo?: string;
}

// Checkbox list component với thanh cuộn và ô tìm kiếm
const CheckboxList = ({
  items, selected, onToggle, emptyText, searchPlaceholder = "Tìm kiếm..."
}: {
  items: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
  emptyText: string;
  searchPlaceholder?: string;
}) => {
  const [query, setQuery] = useState('');
  const filteredItems = items.filter(i => i.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-2">
      <input 
        type="text" 
        placeholder={searchPlaceholder} 
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <div className="space-y-1 pr-1">
        {filteredItems.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">{emptyText}</p>
        ) : filteredItems.map(item => (
          <label key={item.id} className="flex items-center gap-2 cursor-pointer group py-0.5">
            <input
              type="checkbox"
              checked={selected.includes(item.id)}
              onChange={() => onToggle(item.id)}
              className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span className="text-xs text-slate-600 group-hover:text-slate-900 leading-tight">{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

const HotelSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState<HotelCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ---- Data for filters ----
  const [hotelAmenities, setHotelAmenities] = useState<AmenityItem[]>([]);
  const [roomAmenities, setRoomAmenities] = useState<AmenityItem[]>([]);
  const [roomTypeNames, setRoomTypeNames] = useState<string[]>([]);

  // ---- Search bar local state (chỉ commit khi nhấn Tìm kiếm) ----
  const [localQ, setLocalQ] = useState(searchParams.get('q') || '');
  const [localCheckIn, setLocalCheckIn] = useState(searchParams.get('checkIn') || '');
  const [localCheckOut, setLocalCheckOut] = useState(searchParams.get('checkOut') || '');
  const [localGuests, setLocalGuests] = useState(searchParams.get('guests') || '2');

  // ---- Sidebar filter local state (chỉ commit khi nhấn Áp dụng) ----
  const [localMinPrice, setLocalMinPrice] = useState(searchParams.get('minPrice') || '');
  const [localMaxPrice, setLocalMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [selectedHotelAmenities, setSelectedHotelAmenities] = useState<string[]>(
    searchParams.getAll('hotelAmenityIds')
  );
  const [selectedRoomAmenities, setSelectedRoomAmenities] = useState<string[]>(
    searchParams.getAll('roomAmenityIds')
  );
  const [selectedRoomTypeNames, setSelectedRoomTypeNames] = useState<string[]>(
    searchParams.getAll('roomTypeNames')
  );

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // ---- Committed values (từ URL params) ----
  const q = searchParams.get('q') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = searchParams.get('guests') || '2';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const hotelAmenityIds = searchParams.getAll('hotelAmenityIds');
  const roomAmenityIds = searchParams.getAll('roomAmenityIds');
  const roomTypeNamesParam = searchParams.getAll('roomTypeNames');
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // Load filter data từ API (amenities + room type names)
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const [amenRes, roomTypeRes] = await Promise.all([
          api.get('/amenities', { params: { isActive: true } }),
          api.get('/hotels/room-type-names'),
        ]);
        const allAmenities: AmenityItem[] = amenRes.data.data || [];
        // Phân loại tiện nghi theo category applicableTo
        // Category "hotel" hoặc "both" → hotel amenities
        // Category "room" hoặc "both" → room amenities
        // Vì GetAmenitiesQuery trả về categoryName, cần group bằng cách gọi amenity-categories
        setHotelAmenities(allAmenities.filter(a => {
          const cat = a.categoryName?.toLowerCase() || '';
          // Heuristic: nếu category name chứa "phòng" hoặc "room" → room amenity
          return !cat.includes('phòng') && !cat.includes('room');
        }));
        setRoomAmenities(allAmenities.filter(a => {
          const cat = a.categoryName?.toLowerCase() || '';
          return cat.includes('phòng') || cat.includes('room');
        }));
        setRoomTypeNames(roomTypeRes.data.data || []);
      } catch {
        // ignore
      }
    };
    loadFilterData();
  }, []);

  // Gọi API tìm kiếm mỗi khi params URL thay đổi
  const fetchHotels = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | string[]> = {};
      if (q) params.q = q;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (hotelAmenityIds.length > 0) params.hotelAmenityIds = hotelAmenityIds;
      if (roomAmenityIds.length > 0) params.roomAmenityIds = roomAmenityIds;
      if (roomTypeNamesParam.length > 0) params.roomTypeNames = roomTypeNamesParam;
      params.page = pageParam.toString();

      const res = await api.get('/hotels/search', { params });
      setHotels(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      setHotels([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [q, minPrice, maxPrice, hotelAmenityIds.join(','), roomAmenityIds.join(','), roomTypeNamesParam.join(',')]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels, pageParam]);

  // Commit search bar → cập nhật URL params
  const handleSearch = () => {
    // Validate dates
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    if (localCheckIn && localCheckIn < todayStr) {
      toast.error('Ngày nhận phòng không thể là ngày trong quá khứ!');
      return;
    }
    if (localCheckIn && localCheckOut && localCheckOut <= localCheckIn) {
      toast.error('Ngày trả phòng phải sau ngày nhận phòng!');
      return;
    }
    const newParams = new URLSearchParams(searchParams);
    if (localQ) newParams.set('q', localQ); else newParams.delete('q');
    if (localCheckIn) newParams.set('checkIn', localCheckIn); else newParams.delete('checkIn');
    if (localCheckOut) newParams.set('checkOut', localCheckOut); else newParams.delete('checkOut');
    if (localGuests) newParams.set('guests', localGuests); else newParams.delete('guests');
    newParams.delete('page'); // Reset to page 1 on new search
    setSearchParams(newParams);
  };

  // Commit filter sidebar → cập nhật URL params
  const handleApplyFilter = () => {
    const newParams = new URLSearchParams();
    // Giữ lại search bar params
    if (q) newParams.set('q', q);
    if (checkIn) newParams.set('checkIn', checkIn);
    if (checkOut) newParams.set('checkOut', checkOut);
    if (guests) newParams.set('guests', guests);
    // Apply filter values
    if (localMinPrice) newParams.set('minPrice', localMinPrice);
    if (localMaxPrice) newParams.set('maxPrice', localMaxPrice);
    selectedHotelAmenities.forEach(id => newParams.append('hotelAmenityIds', id));
    selectedRoomAmenities.forEach(id => newParams.append('roomAmenityIds', id));
    selectedRoomTypeNames.forEach(n => newParams.append('roomTypeNames', n));
    newParams.delete('page'); // Reset to page 1 on new filter
    setSearchParams(newParams);
  };

  // Reset tất cả filter
  const handleResetFilter = () => {
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setSelectedHotelAmenities([]);
    setSelectedRoomAmenities([]);
    setSelectedRoomTypeNames([]);
    const newParams = new URLSearchParams();
    if (q) newParams.set('q', q);
    if (checkIn) newParams.set('checkIn', checkIn);
    if (checkOut) newParams.set('checkOut', checkOut);
    if (guests) newParams.set('guests', guests);
    setSearchParams(newParams);
  };

  const toggleHotelAmenity = (id: string) => {
    setSelectedHotelAmenities(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };
  const toggleRoomAmenity = (id: string) => {
    setSelectedRoomAmenities(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };
  const toggleRoomTypeName = (name: string) => {
    setSelectedRoomTypeNames(prev =>
      prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
    );
  };

  const hasActiveFilters = minPrice || maxPrice || hotelAmenityIds.length > 0 || roomAmenityIds.length > 0 || roomTypeNamesParam.length > 0;

  // Khi click vào card → chuyển sang trang chi tiết
  const handleClickHotel = (id: string) => {
    const detailParams = new URLSearchParams();
    if (checkIn) detailParams.set('checkIn', checkIn);
    if (checkOut) detailParams.set('checkOut', checkOut);
    if (guests) detailParams.set('guests', guests);
    navigate(`/hotels/${id}?${detailParams.toString()}`);
  };

  const renderStars = (count: number | null) => {
    if (!count) return null;
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} className={`w-3.5 h-3.5 ${i < count ? 'text-amber-400' : 'text-slate-200'}`}
            fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-slate-50">
      {/* Search bar cố định trên cùng */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-wrap gap-2 items-center">
            <input
              ref={searchInputRef}
              type="text"
              value={localQ}
              onChange={e => setLocalQ(e.target.value)}
              placeholder="Tên khách sạn, thành phố..."
              className="flex-1 min-w-[180px] border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
            />
            <div className="flex items-center gap-1">
              <label className="text-xs text-slate-500">Nhận phòng</label>
              <input type="date" value={localCheckIn}
                min={format(new Date(), 'yyyy-MM-dd')}
                onChange={e => { setLocalCheckIn(e.target.value); if (localCheckOut && localCheckOut <= e.target.value) setLocalCheckOut(''); }}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="flex items-center gap-1">
              <label className="text-xs text-slate-500">Trả phòng</label>
              <input type="date" value={localCheckOut}
                min={localCheckIn ? format(addDays(new Date(localCheckIn), 1), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                onChange={e => setLocalCheckOut(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <select value={localGuests} onChange={e => setLocalGuests(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} khách</option>)}
            </select>
            <button
              onClick={handleSearch}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition shadow-sm">
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6 items-start">
        {/* Nút hiện filter trên mobile */}
        <div className="lg:hidden w-full flex justify-end mb-2">
          <button 
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            Bộ lọc
          </button>
        </div>

        {/* Sidebar bộ lọc */}
        <aside className="hidden lg:flex w-64 shrink-0 sticky top-24 h-[calc(100vh-120px)] flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Bộ lọc</h3>
              {hasActiveFilters && (
                <button onClick={handleResetFilter}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                  Xóa tất cả
                </button>
              )}
            </div>

            {/* Lọc giá */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Khoảng giá / đêm</h4>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Từ (VNĐ)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={localMinPrice}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setLocalMinPrice(val);
                    }}
                    placeholder="0"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Đến (VNĐ)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={localMaxPrice}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setLocalMaxPrice(val);
                    }}
                    placeholder="10,000,000"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Lọc loại phòng */}
            {roomTypeNames.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Loại phòng</h4>
                <CheckboxList
                  items={roomTypeNames.map(n => ({ id: n, label: n }))}
                  selected={selectedRoomTypeNames}
                  onToggle={toggleRoomTypeName}
                  emptyText="Không có loại phòng"
                  searchPlaceholder="Tìm loại phòng..."
                />
              </div>
            )}

            {/* Tiện nghi khách sạn */}
            {hotelAmenities.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Tiện nghi khách sạn</h4>
                <CheckboxList
                  items={hotelAmenities.map(a => ({ id: a.id, label: a.name }))}
                  selected={selectedHotelAmenities}
                  onToggle={toggleHotelAmenity}
                  emptyText="Không có tiện nghi"
                  searchPlaceholder="Tìm tiện nghi..."
                />
              </div>
            )}

            {/* Tiện nghi phòng */}
            {roomAmenities.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Tiện nghi phòng</h4>
                <CheckboxList
                  items={roomAmenities.map(a => ({ id: a.id, label: a.name }))}
                  selected={selectedRoomAmenities}
                  onToggle={toggleRoomAmenity}
                  emptyText="Không có tiện nghi"
                  searchPlaceholder="Tìm tiện nghi..."
                />
              </div>
            )}

          </div>
          
          {/* Nút áp dụng luôn hiển thị ở dưới cùng */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <button
              onClick={handleApplyFilter}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-semibold transition shadow-sm">
              Áp dụng bộ lọc
            </button>
          </div>
        </aside>

        {/* Mobile Filter Modal */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex bg-black/50">
            <div className="w-4/5 max-w-sm bg-white h-full flex flex-col animate-fade-in-right">
              <div className="flex justify-between items-center p-4 border-b border-slate-100 shrink-0">
                <h3 className="font-bold text-slate-800 text-lg">Bộ lọc</h3>
                <button onClick={() => setIsMobileFilterOpen(false)} className="text-gray-500 text-2xl leading-none">&times;</button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
              {/* Lọc giá */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Khoảng giá / đêm</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Từ (VNĐ)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={localMinPrice}
                      onChange={e => setLocalMinPrice(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="0"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Đến (VNĐ)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={localMaxPrice}
                      onChange={e => setLocalMaxPrice(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="10,000,000"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Lọc loại phòng */}
              {roomTypeNames.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Loại phòng</h4>
                  <CheckboxList
                    items={roomTypeNames.map(n => ({ id: n, label: n }))}
                    selected={selectedRoomTypeNames}
                    onToggle={toggleRoomTypeName}
                    emptyText="Không có loại phòng"
                    searchPlaceholder="Tìm loại phòng..."
                  />
                </div>
              )}

              {/* Tiện nghi khách sạn */}
              {hotelAmenities.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Tiện nghi khách sạn</h4>
                  <CheckboxList
                    items={hotelAmenities.map(a => ({ id: a.id, label: a.name }))}
                    selected={selectedHotelAmenities}
                    onToggle={toggleHotelAmenity}
                    emptyText="Không có tiện nghi"
                    searchPlaceholder="Tìm tiện nghi..."
                  />
                </div>
              )}

              {/* Tiện nghi phòng */}
              {roomAmenities.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Tiện nghi phòng</h4>
                  <CheckboxList
                    items={roomAmenities.map(a => ({ id: a.id, label: a.name }))}
                    selected={selectedRoomAmenities}
                    onToggle={toggleRoomAmenity}
                    emptyText="Không có tiện nghi"
                    searchPlaceholder="Tìm tiện nghi..."
                  />
                </div>
              )}

              </div>
              
              <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                <button
                  onClick={() => { handleApplyFilter(); setIsMobileFilterOpen(false); }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg text-sm font-semibold transition"
                >
                  Áp dụng bộ lọc
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setIsMobileFilterOpen(false)}></div>
          </div>
        )}

        {/* Kết quả tìm kiếm */}
        <main className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-5">
            <p className="text-slate-600 text-sm font-medium">
              {loading ? 'Đang tìm...' : `Tìm thấy ${hotels.length} khách sạn`}
              {q && <span className="text-slate-400"> cho "<strong className="text-slate-700">{q}</strong>"</span>}
            </p>
            {hasActiveFilters && (
              <span className="text-xs bg-indigo-50 text-indigo-600 font-medium px-2.5 py-1 rounded-full border border-indigo-100">
                Đang lọc
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                  <div className="h-48 bg-slate-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-4 bg-slate-200 rounded w-1/3 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : hotels.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-slate-400 text-lg font-medium">Không tìm thấy khách sạn phù hợp</p>
              <p className="text-slate-400 text-sm mt-2">Thử thay đổi từ khóa hoặc bộ lọc</p>
              <Link to="/" className="inline-block mt-6 bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
                Quay lại trang chủ
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {hotels.map((hotel) => (
                <div
                  key={hotel.id}
                  onClick={() => handleClickHotel(hotel.id)}
                  className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                >
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    {hotel.primaryImageUrl ? (
                      <img src={hotel.primaryImageUrl} alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                        <span className="text-slate-400 text-sm">Chưa có ảnh</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 leading-tight line-clamp-2 text-sm flex-1">{hotel.name}</h3>
                      {renderStars(hotel.starRating)}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                      {hotel.addressLine}, {hotel.wardName}, {hotel.provinceName}
                    </p>

                    <div className="flex items-end justify-between mt-3 pt-3 border-t border-slate-100">
                      {hotel.minPrice ? (
                        <div>
                          <span className="text-[10px] text-slate-400">Từ</span>
                          <p className="text-indigo-600 font-bold text-base leading-none">
                            {hotel.minPrice.toLocaleString('vi-VN')}₫
                          </p>
                          <span className="text-[10px] text-slate-400">/đêm</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">Liên hệ</span>
                      )}
                      <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-3 py-1 rounded-full">
                        Xem phòng
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <button
                disabled={pageParam <= 1}
                onClick={() => {
                  const p = new URLSearchParams(searchParams);
                  p.set('page', (pageParam - 1).toString());
                  setSearchParams(p);
                }}
                className="px-3 py-1.5 border border-slate-200 rounded text-sm text-slate-600 disabled:opacity-50"
              >
                Trang trước
              </button>
              <span className="text-sm font-medium text-slate-700">
                Trang {pageParam} / {totalPages}
              </span>
              <button
                disabled={pageParam >= totalPages}
                onClick={() => {
                  const p = new URLSearchParams(searchParams);
                  p.set('page', (pageParam + 1).toString());
                  setSearchParams(p);
                }}
                className="px-3 py-1.5 border border-slate-200 rounded text-sm text-slate-600 disabled:opacity-50"
              >
                Trang sau
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HotelSearchPage;
