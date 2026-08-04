import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface BookingItem {
  roomTypeId: string;
  roomTypeName: string;
  roomImageUrl: string | null;
  numRooms: number;
  unitPrice: number;
  subTotal: number;
}

interface BookingDetail {
  id: string;
  status: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  specialRequests: string | null;
  cancelReason: string | null;
  createdAt: string;
  hotelName: string;
  hotelAddress: string;
  paymentStatus: string;
  depositDeadline: string | null;
  items: BookingItem[];
}


const STATUS_MAP: Record<string, { label: string; variant: 'warning' | 'info' | 'success' | 'danger' | 'neutral' }> = {
  Pending: { label: 'Chờ xác nhận', variant: 'warning' },
  Approved: { label: 'Đã duyệt (Chờ cọc)', variant: 'info' },
  Confirmed: { label: 'Đã xác nhận', variant: 'success' },
  Cancelled: { label: 'Đã hủy', variant: 'danger' },
  Completed: { label: 'Hoàn thành', variant: 'neutral' },
};

const BookingConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooking = async () => {
    try {
      const res = await api.get(`/bookings/${id}`);
      setBooking(res.data.data);
    } catch (err) {
      console.error(err);
      setError('Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);


  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center text-slate-400 text-sm">Đang tải...</div>
  );

  if (error || !booking) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-red-500 font-medium mb-4">{error || 'Không tìm thấy lịch sử đặt phòng.'}</p>
      <Link to="/my-bookings">
        <Button variant="primary">Xem tất cả đơn của tôi</Button>
      </Link>
    </div>
  );

  const status = STATUS_MAP[booking.status] || { label: booking.status, color: 'bg-slate-100 text-slate-600' };
  const numNights = Math.floor((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / 86400000);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        {/* Tiêu đề xác nhận */}
        <div className="text-center mb-8">
          {booking.status === 'Cancelled' ? (
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          ) : (
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          <h1 className="text-2xl font-bold text-slate-900">
            {booking.status === 'Pending' ? 'Đặt phòng thành công!' :
              booking.status === 'Approved' ? 'Đơn đã được duyệt!' :
                booking.status === 'Confirmed' ? 'Đơn đã được xác nhận!' :
                  booking.status === 'Cancelled' ? 'Đơn đã bị hủy' : 'Chi tiết lịch sử đặt phòng'}
          </h1>
          {booking.status === 'Pending' && (
            <p className="text-slate-500 mt-2 text-sm">Chúng tôi đã gửi thông tin đến {booking.guestEmail}. Khách sạn sẽ xác nhận sớm.</p>
          )}
        </div>



        {/* Card thông tin đơn */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {/* Ảnh + tên phòng (Lấy ảnh từ item đầu tiên nếu có) */}
          {booking.items && booking.items.length > 0 && booking.items[0].roomImageUrl && (
            <div className="h-48 overflow-hidden">
              <img src={booking.items[0].roomImageUrl} alt={booking.hotelName} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-6 space-y-5">
            {/* Trạng thái và mã đơn */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-400 mb-1">Mã đơn</p>
                <p className="font-mono text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded">{booking.id}</p>
              </div>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>

            {/* Thông tin khách sạn */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Khách sạn</p>
              <p className="font-bold text-slate-900">{booking.hotelName}</p>
              <p className="text-sm text-slate-500">{booking.hotelAddress}</p>
            </div>

            {/* Ngày nhận/trả phòng */}
            <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Nhận phòng</p>
                <p className="font-semibold text-slate-900 text-sm">{new Date(booking.checkInDate).toLocaleDateString('vi-VN')}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400 mb-1">Số đêm</p>
                <p className="font-bold text-indigo-600 text-lg">{numNights}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 mb-1">Trả phòng</p>
                <p className="font-semibold text-slate-900 text-sm">{new Date(booking.checkOutDate).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>

            {/* Các phòng đã đặt */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phòng đã đặt</p>
              {booking.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{item.numRooms}x {item.roomTypeName}</p>
                  </div>
                  <p className="text-slate-700 font-semibold">{item.subTotal.toLocaleString('vi-VN')}₫</p>
                </div>
              ))}
            </div>

            {/* Số phòng và tổng tiền */}
            <div className="flex justify-between items-center bg-indigo-50 rounded-xl p-4 border border-indigo-100 mt-4">
              <div>
                <p className="text-xs text-slate-500">{booking.items?.reduce((sum, i) => sum + i.numRooms, 0) || 0} phòng</p>
                <p className="text-xs text-slate-500">Đặt lúc: {new Date(booking.createdAt).toLocaleString('vi-VN')}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Tổng tiền</p>
                <p className="text-2xl font-bold text-indigo-600">{booking.totalPrice.toLocaleString('vi-VN')}₫</p>
              </div>
            </div>

            {/* Thông tin liên hệ */}
            <div className="border-t border-slate-100 pt-4 space-y-1 text-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Người đặt</p>
              <p className="text-slate-700"><strong>{booking.guestName}</strong></p>
              <p className="text-slate-500">{booking.guestPhone} · {booking.guestEmail}</p>
              {booking.specialRequests && (
                <p className="text-slate-500 italic mt-2">Ghi chú: {booking.specialRequests}</p>
              )}
            </div>

            {/* Lý do hủy (nếu có) */}
            {booking.status === 'Cancelled' && booking.cancelReason && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">Lý do hủy</p>
                <p className="text-sm text-red-700">{booking.cancelReason}</p>
              </div>
            )}
          </div>
        </div>

        {/* Nút điều hướng */}
        <div className="flex gap-3 mt-6">
          <Link to="/my-bookings" className="flex-1">
            <Button variant="primary" className="w-full">
              Xem tất cả đơn của tôi
            </Button>
          </Link>
          <Link to="/hotels" className="flex-1">
            <Button variant="outline" className="w-full">
              Tiếp tục tìm kiếm
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
