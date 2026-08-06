import { useCallback, useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useConfirm } from '../components/ConfirmModal';

export interface BookingRoomItem {
  roomTypeId: string;
  roomTypeName: string;
  numRooms: number;
  unitPrice: number;
  subTotal: number;
  roomImageUrl: string | null;
}

export interface BookingItem {
  id: string;
  status: string;
  paymentStatus: string;
  depositAmount: number;
  depositDeadline: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  cancelReason: string | null;
  createdAt: string;
  hotelName: string;
  items: BookingRoomItem[];
}

export const useHotelBookingManagement = () => {
  const confirm = useConfirm();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [activeFilter, setActiveFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modal từ chối
  const [rejectModal, setRejectModal] = useState<{ id: string; guestName: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (activeFilter) params.status = activeFilter;
      const res = await api.get('/manager/bookings', { params });
      setBookings(res.data.data || []);
    } catch {
      toast.error('Lỗi khi tải danh sách đơn đặt phòng');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !searchQuery || 
        b.guestName.toLowerCase().includes(q) || 
        b.guestEmail.toLowerCase().includes(q) ||
        b.guestPhone.includes(q);
      
      const matchDate = !dateFilter || b.checkInDate.startsWith(dateFilter);
      
      return matchSearch && matchDate;
    });
  }, [bookings, searchQuery, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / itemsPerPage));
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(start, start + itemsPerPage);
  }, [filteredBookings, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, activeFilter, dateFilter]);

  const handleApprove = async (bookingId: string) => {
    const ok = await confirm({
      title: 'Duyệt đơn đặt phòng',
      message: 'Xác nhận duyệt đơn này? Hệ thống sẽ gửi email yêu cầu đặt cọc cho khách hàng.',
      confirmText: 'Duyệt',
      variant: 'info',
    });
    if (!ok) return;
    setProcessing(true);
    try {
      await api.put(`/manager/bookings/${bookingId}/status`, { action: 'approve' });
      toast.success('Đã duyệt đơn. Hệ thống đã gửi yêu cầu cọc cho khách.');
      fetchBookings();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Thao tác thất bại.');
    } finally {
      setProcessing(false);
    }
  };

  const openRejectModal = (id: string, guestName: string) => {
    setRejectModal({ id, guestName });
    setRejectReason('');
  };

  const handleConfirmReject = async () => {
    if (!rejectModal) return;
    if (!rejectReason.trim()) { toast.error('Vui lòng nhập lý do từ chối.'); return; }
    setProcessing(true);
    try {
      await api.put(`/manager/bookings/${rejectModal.id}/status`, {
        action: 'reject',
        cancelReason: rejectReason,
      });
      toast.success('Đã từ chối đơn đặt phòng.');
      setRejectModal(null);
      fetchBookings();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Thao tác thất bại.');
    } finally {
      setProcessing(false);
    }
  };

  return {
    loading,
    processing,
    
    filters: {
      activeFilter, setActiveFilter,
      searchQuery, setSearchQuery,
      dateFilter, setDateFilter
    },
    
    pagination: {
      currentPage, setCurrentPage,
      totalPages, itemsPerPage
    },
    
    filteredBookings,
    paginatedBookings,
    
    rejectModal, setRejectModal,
    rejectReason, setRejectReason,
    
    handleApprove,
    openRejectModal,
    handleConfirmReject
  };
};
