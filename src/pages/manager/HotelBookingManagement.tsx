import React, { useCallback, useEffect, useState, useMemo } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useConfirm } from '../../components/ConfirmModal';

interface BookingItem {
  id: string;
  status: string;
  paymentStatus: string;
  depositAmount: number;
  depositDeadline: string;
  checkInDate: string;
  checkOutDate: string;
  numRooms: number;
  totalPrice: number;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  cancelReason: string | null;
  createdAt: string;
  roomTypeName: string;
  hotelName: string;
}

const PAYMENT_MAP: Record<string, { label: string; color: string }> = {
  Unpaid:   { label: 'Chưa cọc',    color: 'bg-orange-100 text-orange-700 border border-orange-200' },
  Paid:     { label: 'Đã cọc',       color: 'bg-green-100 text-green-700 border border-green-200' },
  Refunded: { label: 'Đã hoàn cọc', color: 'bg-purple-100 text-purple-700 border border-purple-200' },
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  Pending:   { label: 'Chờ xác nhận',  color: 'bg-amber-100 text-amber-700 border border-amber-200' },
  Approved:  { label: 'Chờ thanh toán cọc', color: 'bg-blue-100 text-blue-700 border border-blue-200' },
  Confirmed: { label: 'Đã xác nhận',   color: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
  Cancelled: { label: 'Đã hủy',        color: 'bg-red-100 text-red-700 border border-red-200' },
  Completed: { label: 'Hoàn thành',    color: 'bg-slate-100 text-slate-600 border border-slate-200' },
};

const FILTER_TABS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'Pending', label: 'Chờ xác nhận' },
  { value: 'Approved', label: 'Chờ thanh toán cọc' },
  { value: 'Confirmed', label: 'Đã xác nhận' },
  { value: 'Cancelled', label: 'Đã hủy' },
];

const HotelBookingManagement: React.FC = () => {
  const confirm = useConfirm();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [activeFilter, setActiveFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState(''); // filter by check-in date (optional enhancement)

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

  // Client-side filtering for Search & Date
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

  // Pagination logic
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

  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white";

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Quản Lý Đơn Đặt Phòng</h1>
        <p className="text-sm text-slate-500 mt-1">Xem, xác nhận hoặc từ chối các đơn đặt phòng từ khách hàng</p>
      </div>

      {/* Toolbar: Filters */}
      <div className="flex flex-wrap gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Tìm tên khách, email, SĐT..."
          className={`flex-1 min-w-[200px] ${inputCls}`}
        />
        
        <select value={activeFilter} onChange={e => setActiveFilter(e.target.value)} className={`${inputCls} w-auto min-w-[150px]`}>
          {FILTER_TABS.map(tab => (
            <option key={tab.value} value={tab.value}>{tab.label}</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-semibold uppercase">Ngày Check-in:</label>
          <input 
            type="date" 
            value={dateFilter} 
            onChange={e => setDateFilter(e.target.value)} 
            className={`${inputCls} w-auto`}
          />
        </div>

        {(searchQuery || activeFilter || dateFilter) && (
          <button onClick={() => { setSearchQuery(''); setActiveFilter(''); setDateFilter(''); }}
            className="px-3 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
            Xóa lọc
          </button>
        )}
      </div>

      {/* Bảng danh sách */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-slate-400">Đang tải...</div>
        ) : paginatedBookings.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-slate-400 font-medium">Không tìm thấy đơn đặt phòng phù hợp.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Khách hàng</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Loại phòng</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lưu trú</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">SL</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng tiền</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cọc</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedBookings.map(booking => {
                  const status = STATUS_MAP[booking.status] || { label: booking.status, color: '' };
                  const numNights = Math.floor((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / 86400000);
                  return (
                    <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">{booking.guestName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{booking.guestPhone}</p>
                        <p className="text-xs text-slate-400">{booking.guestEmail}</p>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700">{booking.roomTypeName}</td>
                      <td className="px-5 py-4">
                        <p className="text-slate-700 font-medium">{new Date(booking.checkInDate).toLocaleDateString('vi-VN')}</p>
                        <p className="text-slate-400 text-xs">→ {new Date(booking.checkOutDate).toLocaleDateString('vi-VN')}</p>
                        <p className="text-slate-500 text-xs mt-1 font-semibold">{numNights} đêm</p>
                      </td>
                      <td className="px-5 py-4 text-center font-semibold text-slate-700">{booking.numRooms}</td>
                      <td className="px-5 py-4 font-bold text-violet-700">{booking.totalPrice.toLocaleString('vi-VN')}₫</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${status.color}`}>{status.label}</span>
                        {booking.status === 'Cancelled' && booking.cancelReason && (
                          <p className="text-xs text-red-500 mt-1.5 max-w-[180px] line-clamp-2" title={booking.cancelReason}>
                            Lý do: {booking.cancelReason}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {PAYMENT_MAP[booking.paymentStatus] && booking.status !== 'Cancelled' && booking.status !== 'Pending' ? (
                          <div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${PAYMENT_MAP[booking.paymentStatus].color}`}>
                              {PAYMENT_MAP[booking.paymentStatus].label}
                            </span>
                            {booking.paymentStatus === 'Unpaid' && (
                              <p className="text-xs text-orange-500 mt-1">
                                {booking.depositAmount.toLocaleString('vi-VN')}₫
                              </p>
                            )}
                          </div>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        {booking.status === 'Pending' && (
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleApprove(booking.id)} disabled={processing}
                              className="text-xs bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold px-3 py-1.5 rounded-lg transition shadow-sm">
                              Duyệt
                            </button>
                            <button onClick={() => openRejectModal(booking.id, booking.guestName)} disabled={processing}
                              className="text-xs bg-red-50 hover:bg-red-100 disabled:bg-slate-100 text-red-600 font-semibold px-3 py-1.5 rounded-lg transition">
                              Từ chối
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t flex justify-between items-center text-xs">
            <span className="text-slate-500">
              Trang {currentPage} / {totalPages} — {filteredBookings.length} đơn
            </span>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition">
                Trước
              </button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition">
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 animate-fade-in-up">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-lg">Từ chối đơn đặt phòng</h3>
              <button onClick={() => setRejectModal(null)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Bạn đang từ chối đơn của khách hàng <strong className="text-slate-900">{rejectModal.guestName}</strong>. 
                Hệ thống bắt buộc bạn phải nhập lý do (hết phòng, thông tin không hợp lệ...) để thông báo cho khách.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Lý do từ chối (Bắt buộc)</label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do chi tiết..."
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none resize-none"
                  autoFocus
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setRejectModal(null)} disabled={processing}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition">
                Hủy bỏ
              </button>
              <button onClick={handleConfirmReject} disabled={processing}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50 shadow-sm shadow-red-600/20">
                {processing ? 'Đang xử lý...' : 'Gửi Từ Chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelBookingManagement;
