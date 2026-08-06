import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

// ── Types ──
export interface BookingRoomItem {
  roomTypeId: string;
  roomTypeName: string;
  numRooms: number;
  unitPrice: number;
  subTotal: number;
  roomImageUrl: string | null;
}

export interface AdminBookingItem {
  id: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  hotelName: string;
  businessName: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  depositAmount: number;
  status: string;
  paymentStatus: string;
  cancelReason: string | null;
  createdAt: string;
  items: BookingRoomItem[];
}

export interface AdminTopHotel {
  hotelId: string;
  hotelName: string;
  businessName: string;
  totalBookings: number;
  revenue: number;
}

export interface AdminTopBusiness {
  businessId: string;
  businessName: string;
  totalBookings: number;
  revenue: number;
}

export interface AdminHotelBookingSummary {
  hotelId: string;
  hotelName: string;
  businessId: string;
  businessName: string;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  totalDeposit: number;
}

export interface AdminBookingStats {
  totalBookings: number;
  totalRevenue: number;
  totalDeposit: number;
  totalCancelled: number;
  topHotels: AdminTopHotel[];
  topBusinesses: AdminTopBusiness[];
  hotelSummaries: AdminHotelBookingSummary[];
  bookings: AdminBookingItem[];
  bookingTotalCount: number;
}

export interface FilterOption { id: string; name: string; businessId?: string; }

// ── Preset periods ──
export type PeriodPreset = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

function getPresetDates(preset: PeriodPreset): { from: string; to: string } {
  const now = new Date();
  // Dùng UTC để đồng bộ với backend (tránh lỗi Kind=Unspecified)
  const toDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
  let fromDay: Date;

  switch (preset) {
    case 'today':
      fromDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
      break;
    case 'week': {
      const dayOfWeek = now.getUTCDay(); // 0=Sun
      const monday = now.getUTCDate() - ((dayOfWeek + 6) % 7);
      fromDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), monday, 0, 0, 0, 0));
      break;
    }
    case 'month':
      fromDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
      break;
    case 'quarter': {
      const quarterStartMonth = Math.floor(now.getUTCMonth() / 3) * 3;
      fromDay = new Date(Date.UTC(now.getUTCFullYear(), quarterStartMonth, 1, 0, 0, 0, 0));
      break;
    }
    case 'year':
      fromDay = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0, 0));
      break;
    default:
      fromDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  }

  // Trả về ISO string (UTC) để gửi lên server
  return {
    from: fromDay.toISOString(),
    to: toDay.toISOString(),
  };
}

// Chuyển ISO UTC string thành giá trị <input type="date"> (yyyy-MM-dd theo local display)
function isoToDateInput(iso: string): string {
  return iso.substring(0, 10);
}

// Chuyển <input type="date"> (yyyy-MM-dd) thành ISO UTC start-of-day
function dateInputToIsoUtc(dateStr: string, endOfDay = false): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = endOfDay
    ? new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999))
    : new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
  return dt.toISOString();
}

// ── Hook ──
export const useAdminBookingManagement = () => {
  // Filter options (dropdown data)
  const [businesses, setBusinesses] = useState<FilterOption[]>([]);
  const [hotels, setHotels] = useState<(FilterOption & { businessId: string })[]>([]);

  // Filters
  const [period, setPeriod] = useState<PeriodPreset>('month');
  const [fromDate, setFromDate] = useState<string>(() => getPresetDates('month').from);
  const [toDate, setToDate] = useState<string>(() => getPresetDates('month').to);
  const [selectedBizId, setSelectedBizId] = useState('');
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Data
  const [stats, setStats] = useState<AdminBookingStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Khi đổi preset → cập nhật fromDate/toDate tự động (trừ custom)
  const handlePeriodChange = useCallback((p: PeriodPreset) => {
    setPeriod(p);
    setPage(1);
    if (p !== 'custom') {
      const { from, to } = getPresetDates(p);
      setFromDate(from);
      setToDate(to);
    }
  }, []);

  // Khi đổi filter options thủ công (custom date)
  const handleFromDateChange = useCallback((val: string) => {
    setPeriod('custom');
    setFromDate(dateInputToIsoUtc(val, false));
    setPage(1);
  }, []);

  const handleToDateChange = useCallback((val: string) => {
    setPeriod('custom');
    setToDate(dateInputToIsoUtc(val, true));
    setPage(1);
  }, []);

  const handleBizChange = useCallback((bizId: string) => {
    setSelectedBizId(bizId);
    setSelectedHotelId(''); // reset hotel khi đổi biz
    setPage(1);
  }, []);

  // Khách sạn được lọc theo doanh nghiệp đã chọn
  const filteredHotels = useMemo(() => {
    if (!selectedBizId) return hotels;
    return hotels.filter(h => h.businessId === selectedBizId);
  }, [hotels, selectedBizId]);

  // Load dropdown options
  const fetchFilterOptions = useCallback(async () => {
    try {
      const res = await api.get('/admin/filter-options');
      setBusinesses(res.data.businesses || []);
      setHotels(res.data.hotels || []);
    } catch {
      toast.error('Không thể tải danh sách lọc.');
    }
  }, []);

  // Load stats
  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        pageSize: PAGE_SIZE,
      };
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (selectedBizId) params.businessId = selectedBizId;
      if (selectedHotelId) params.hotelId = selectedHotelId;
      if (selectedStatus) params.status = selectedStatus;

      const res = await api.get('/admin/booking-stats', { params });
      setStats(res.data.data || null);
    } catch {
      toast.error('Không thể tải thống kê đặt phòng.');
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, selectedBizId, selectedHotelId, selectedStatus, page]);

  useEffect(() => { fetchFilterOptions(); }, [fetchFilterOptions]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const totalPages = stats ? Math.max(1, Math.ceil(stats.bookingTotalCount / PAGE_SIZE)) : 1;

  // Reset page khi filter thay đổi (không phải page)
  const resetPage = useCallback(() => setPage(1), []);

  return {
    // data
    stats,
    loading,
    // filter options
    businesses,
    filteredHotels,
    // filters state
    period,
    fromDate,
    toDate,
    selectedBizId,
    selectedHotelId,
    selectedStatus,
    // filter handlers
    handlePeriodChange,
    handleFromDateChange,
    handleToDateChange,
    handleBizChange,
    setSelectedHotelId: (id: string) => { setSelectedHotelId(id); resetPage(); },
    setSelectedStatus: (s: string) => { setSelectedStatus(s); resetPage(); },
    // pagination
    page,
    setPage,
    totalPages,
    PAGE_SIZE,
    // utils
    isoToDateInput,
    refetch: fetchStats,
  };
};
