import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { DatePicker } from '../../components/ui/DatePicker';
import { Checkbox } from '../../components/ui/Checkbox';
import OccupancyDropdown from '../../components/OccupancyDropdown';
import { FaStar, FaMapMarkerAlt, FaCheck } from 'react-icons/fa';

interface HotelCard {
  id: string;
  name: string;
  addressLine: string;
  provinceName: string;
  wardName: string;
  starRating: number | null;
  primaryImageUrl: string | null;
  minPrice: number | null;
  description?: string;
  roomTypes?: { name: string; basePrice: number }[];
  amenities?: { name: string }[];
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
    <div className="space-y-3">
      <Input
        type="text"
        placeholder={searchPlaceholder}
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <div className="space-y-2 pr-1 max-h-48 overflow-y-auto custom-scrollbar">
        {filteredItems.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">{emptyText}</p>
        ) : filteredItems.map(item => (
          <Checkbox
            key={item.id}
            checked={selected.includes(item.id)}
            onChange={() => onToggle(item.id)}
            label={item.label}
          />
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
  const [localOccupancy, setLocalOccupancy] = useState({
    rooms: parseInt(searchParams.get('rooms') || '1', 10),
    adults: parseInt(searchParams.get('adults') || '2', 10),
    children: parseInt(searchParams.get('children') || '0', 10),
  });

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
  const rooms = searchParams.get('rooms') || '1';
  const adults = searchParams.get('adults') || '2';
  const children = searchParams.get('children') || '0';
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
      if (checkIn) params.checkIn = checkIn;
      if (checkOut) params.checkOut = checkOut;
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
  }, [q, checkIn, checkOut, minPrice, maxPrice, hotelAmenityIds.join(','), roomAmenityIds.join(','), roomTypeNamesParam.join(','), pageParam]);

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
    if (localOccupancy.rooms > 0) newParams.set('rooms', localOccupancy.rooms.toString()); else newParams.delete('rooms');
    if (localOccupancy.adults > 0) newParams.set('adults', localOccupancy.adults.toString()); else newParams.delete('adults');
    if (localOccupancy.children > 0) newParams.set('children', localOccupancy.children.toString()); else newParams.delete('children');
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
    if (rooms) newParams.set('rooms', rooms);
    if (adults) newParams.set('adults', adults);
    if (children) newParams.set('children', children);
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
    if (rooms) newParams.set('rooms', rooms);
    if (adults) newParams.set('adults', adults);
    if (children) newParams.set('children', children);
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
    if (rooms) detailParams.set('rooms', rooms);
    if (adults) detailParams.set('adults', adults);
    if (children) detailParams.set('children', children);
    navigate(`/hotels/${id}?${detailParams.toString()}`);
  };

  const parseDateString = (dateStr: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  };
  const formatDateString = (d: Date | null) => d ? format(d, 'yyyy-MM-dd') : '';

  const renderStars = (count: number | null) => {
    if (!count) return null;
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: count }).map((_, i) => (
          <FaStar key={i} className="text-yellow-400 w-3.5 h-3.5" />
        ))}
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-slate-50">
      {/* Search bar cố định trên cùng */}
      <div className="bg-indigo-600 border-b border-indigo-700 sticky top-0 z-20 shadow-sm pb-4 pt-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-indigo-400 p-1 rounded-lg flex flex-col lg:flex-row gap-1 shadow-lg max-w-[1000px] mx-auto">
            {/* Điểm đến */}
            <div className="flex-1 bg-white rounded flex items-center relative overflow-hidden">
              <input
                ref={searchInputRef}
                type="text"
                value={localQ}
                onChange={e => setLocalQ(e.target.value)}
                placeholder="Tên khách sạn, thành phố..."
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                className="w-full bg-transparent border-none text-slate-900 font-medium px-4 py-3 focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>

            {/* Nhận phòng */}
            <div className="w-full lg:w-[180px] bg-white rounded flex flex-col justify-center relative px-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase px-2 pt-1">Nhận phòng</label>
              <DatePicker
                value={parseDateString(localCheckIn)}
                minDate={new Date()}
                onChange={(date: Date | null) => {
                  const str = formatDateString(date);
                  setLocalCheckIn(str);
                  if (localCheckOut && str && localCheckOut <= str) setLocalCheckOut('');
                }}
                placeholderText="Chọn ngày"
                className="w-full border-none bg-transparent p-0 text-slate-900 font-medium focus:ring-0 shadow-none px-2 pb-1 placeholder:font-normal placeholder:text-slate-400"
              />
            </div>

            {/* Trả phòng */}
            <div className="w-full lg:w-[180px] bg-white rounded flex flex-col justify-center relative px-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase px-2 pt-1">Trả phòng</label>
              <DatePicker
                value={parseDateString(localCheckOut)}
                minDate={localCheckIn ? addDays(parseDateString(localCheckIn)!, 1) : new Date()}
                onChange={(date: Date | null) => setLocalCheckOut(formatDateString(date))}
                placeholderText="Chọn ngày"
                className="w-full border-none bg-transparent p-0 text-slate-900 font-medium focus:ring-0 shadow-none px-2 pb-1 placeholder:font-normal placeholder:text-slate-400"
              />
            </div>

            {/* Số người / Phòng */}
            <div className="w-full lg:w-[240px] bg-white rounded flex items-center relative">
              <OccupancyDropdown
                value={localOccupancy}
                onChange={setLocalOccupancy}
                className="w-full"
              />
            </div>

            {/* Button tìm kiếm */}
            <div className="flex items-stretch shrink-0 w-full lg:w-auto">
              <Button onClick={handleSearch} className="w-full lg:w-auto px-8 font-bold text-lg h-full py-3.5 lg:py-0 bg-indigo-700 hover:bg-indigo-800 rounded">
                Tìm kiếm
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6 items-start">
        {/* Nút hiện filter trên mobile */}
        <div className="lg:hidden w-full mb-4">
          <Button
            variant="secondary"
            onClick={() => setIsMobileFilterOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-300 shadow-sm text-slate-700 font-bold text-base hover:bg-slate-50 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Bộ lọc nâng cao
          </Button>
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
                <Input
                  label="Từ (VNĐ)"
                  type="text"
                  inputMode="numeric"
                  value={localMinPrice}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setLocalMinPrice(val);
                  }}
                  placeholder="0"
                />
                <Input
                  label="Đến (VNĐ)"
                  type="text"
                  inputMode="numeric"
                  value={localMaxPrice}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setLocalMaxPrice(val);
                  }}
                  placeholder="10,000,000"
                />
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
            <Button onClick={handleApplyFilter} className="w-full">
              Áp dụng bộ lọc
            </Button>
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
                    <Input
                      label="Từ (VNĐ)"
                      type="text"
                      inputMode="numeric"
                      value={localMinPrice}
                      onChange={e => setLocalMinPrice(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="0"
                    />
                    <Input
                      label="Đến (VNĐ)"
                      type="text"
                      inputMode="numeric"
                      value={localMaxPrice}
                      onChange={e => setLocalMaxPrice(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="10,000,000"
                    />
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
            <div className="flex flex-col gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse flex flex-col sm:flex-row h-[220px]">
                  <div className="w-full sm:w-64 bg-slate-200 h-48 sm:h-full shrink-0" />
                  <div className="p-5 flex-1 space-y-4">
                    <div className="h-6 bg-slate-200 rounded w-1/3" />
                    <div className="h-4 bg-slate-100 rounded w-1/4" />
                    <div className="h-4 bg-slate-200 rounded w-1/2 mt-4" />
                    <div className="flex justify-end mt-auto pt-6">
                      <div className="h-10 bg-slate-200 rounded w-32" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : hotels.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-xl border border-slate-200">
              <p className="text-slate-400 text-lg font-medium">Không tìm thấy khách sạn phù hợp</p>
              <p className="text-slate-400 text-sm mt-2">Thử thay đổi từ khóa hoặc bộ lọc</p>
              <Link to="/" className="inline-block mt-6 bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
                Quay lại trang chủ
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {hotels.map((hotel) => (
                <div
                  key={hotel.id}
                  onClick={() => handleClickHotel(hotel.id)}
                  className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col sm:flex-row"
                >
                  <div className="relative w-full sm:w-72 shrink-0 h-48 sm:h-auto bg-slate-100 overflow-hidden">
                    {hotel.primaryImageUrl ? (
                      <img src={hotel.primaryImageUrl} alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                        <span className="text-slate-400 text-sm">Chưa có ảnh</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 sm:p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-xl leading-tight mb-1 group-hover:text-indigo-600 transition-colors">{hotel.name}</h3>
                        {renderStars(hotel.starRating)}
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mb-3 flex items-start gap-1">
                      <FaMapMarkerAlt className="mt-1 text-indigo-500 shrink-0" />
                      <span className="line-clamp-2">{hotel.addressLine}, {hotel.wardName}, {hotel.provinceName}</span>
                    </p>

                    {/* Mô tả khách sạn */}
                    {hotel.description && (
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                        {hotel.description}
                      </p>
                    )}

                    {/* Tiện nghi nổi bật */}
                    {hotel.amenities && hotel.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {hotel.amenities.map((amenity, idx) => (
                          <span key={idx} className="text-xs border border-slate-200 text-slate-600 px-2 py-1 rounded-md bg-slate-50">
                            {amenity.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Các loại phòng */}
                    {hotel.roomTypes && hotel.roomTypes.length > 0 && (
                      <div className="space-y-2 mb-2 border-t border-slate-100 pt-4">
                        <p className="text-xs font-semibold text-slate-800 uppercase tracking-wide">Tùy chọn phòng</p>
                        {hotel.roomTypes.slice(0, 2).map((rt, idx) => (
                          <div key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                            <div>
                              <span className="font-semibold text-slate-700">{rt.name}</span>
                              <p className="text-xs text-slate-500 mt-0.5">Giá từ {rt.basePrice.toLocaleString('vi-VN')}₫</p>
                            </div>
                          </div>
                        ))}
                        {hotel.roomTypes.length > 2 && (
                          <p className="text-xs text-indigo-600 font-medium pl-6 pt-1">
                            + Xem thêm {hotel.roomTypes.length - 2} loại phòng khác...
                          </p>
                        )}
                      </div>
                    )}

                    <div className="mt-auto flex items-end justify-end">
                      <div className="text-right">
                        {hotel.minPrice ? (
                          <>
                            <span className="text-xs text-slate-500 block mb-1">Giá mỗi đêm từ</span>
                            <p className="text-slate-900 font-bold text-2xl leading-none mb-3">
                              {hotel.minPrice.toLocaleString('vi-VN')}₫
                            </p>
                          </>
                        ) : (
                          <span className="text-slate-400 text-sm block mb-4">Vui lòng liên hệ</span>
                        )}
                        <span className="inline-block bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm group-hover:bg-indigo-700 transition shadow-md">
                          Xem chỗ trống
                        </span>
                      </div>
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
