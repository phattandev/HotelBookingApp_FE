import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

interface BookingDetail {
  id: string;
  status: string;
  checkInDate: string;
  checkOutDate: string;
  numRooms: number;
  totalPrice: number;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  specialRequests: string | null;
  cancelReason: string | null;
  createdAt: string;
  roomTypeName: string;
  hotelName: string;
  hotelAddress: string;
  roomImageUrl: string | null;
  paymentStatus: string;
  depositDeadline: string | null;
}

// Helper: Tính thời gian còn lại
const getTimeLeft = (deadline: string) => {
  const diff = new Date(deadline).getTime() - new Date().getTime();
  if (diff <= 0) return 'Đã quá hạn';
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `Còn ${hours} giờ ${mins} phút`;
  return `Còn ${mins} phút`;
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  Pending:   { label: 'Chờ xác nhận',  color: 'bg-amber-100 text-amber-700 border border-amber-200' },
  Approved:  { label: 'Đã duyệt (Chờ cọc)', color: 'bg-blue-100 text-blue-700 border border-blue-200' },
  Confirmed: { label: 'Đã xác nhận',   color: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
  Cancelled: { label: 'Đã hủy',        color: 'bg-red-100 text-red-700 border border-red-200' },
  Completed: { label: 'Hoàn thành',    color: 'bg-slate-100 text-slate-600 border border-slate-200' },
};

const BookingConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const res = await api.get(`/bookings/${id}`);
      setBooking(res.data.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || 'Không thể tải thông tin đơn đặt phòng.');
    } finally {
      setLoading(false);
    }
  };

  const handleMockPayment = async () => {
    if (!id) return;
    setPaying(true);
    try {
      await api.post(`/bookings/${id}/mock-payment`);
      fetchBooking(); // Refresh dữ liệu sau khi thanh toán
    } catch (e) {
      // Bỏ qua lỗi
    } finally {
      setPaying(false);
    }
  };

  const getVietQrUrl = (b: BookingDetail) => {
    const bankBin = '970422';
    const accountNo = '0123456789';
    const amount = Math.round(b.totalPrice / 2); // Cọc 50%
    const content = encodeURIComponent(`COC ${b.id.slice(0, 8).toUpperCase()}`);
    return `https://img.vietqr.io/image/${bankBin}-${accountNo}-compact.png?amount=${amount}&addInfo=${content}&accountName=HotelBooking+Platform`;
  };

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center text-slate-400 text-sm">Đang tải...</div>
  );

  if (error || !booking) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-red-500 font-medium mb-4">{error || 'Không tìm thấy đơn đặt phòng.'}</p>
      <Link to="/my-bookings" className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm hover:bg-indigo-700 transition">
        Xem tất cả đơn của tôi
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
             booking.status === 'Cancelled' ? 'Đơn đã bị hủy' : 'Chi tiết đơn đặt phòng'}
          </h1>
          {booking.status === 'Pending' && (
            <p className="text-slate-500 mt-2 text-sm">Chúng tôi đã gửi thông tin đến {booking.guestEmail}. Khách sạn sẽ xác nhận sớm.</p>
          )}
        </div>

        {/* Cảnh báo thanh toán cọc */}
        {booking.paymentStatus === 'Unpaid' && booking.status === 'Approved' && booking.depositDeadline && (
          <div className="mb-6 bg-amber-50 border border-amber-200 p-6 rounded-xl animate-fade-in text-center">
            <p className="text-base text-amber-800 font-bold mb-2">Vui lòng thanh toán cọc để giữ phòng</p>
            <p className="text-sm text-amber-700 mb-4">
              Hạn chót: <strong>{new Date(booking.depositDeadline).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, day: '2-digit', month: '2-digit', year: 'numeric' }).replace(',', '')}</strong>
              {' '}· <strong>{getTimeLeft(booking.depositDeadline)}</strong>
            </p>
            
            <div className="bg-white p-4 rounded-lg border border-amber-100 inline-block">
              <p className="text-sm font-semibold text-slate-700 mb-2">Quét mã QR để thanh toán {(booking.totalPrice / 2).toLocaleString('vi-VN')}₫</p>
              <img
                src={getVietQrUrl(booking)}
                alt="VietQR"
                className="w-48 h-48 mx-auto rounded-lg border border-slate-200 shadow-sm"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="mt-3 text-xs text-slate-600 space-y-1">
                <p>Ngân hàng: <strong>MB Bank</strong> · STK: <strong>0123456789</strong></p>
                <p>Nội dung: <strong className="text-indigo-600">COC {booking.id.slice(0, 8).toUpperCase()}</strong></p>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={handleMockPayment}
                disabled={paying}
                className="bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white font-semibold py-2.5 px-6 rounded-xl transition text-sm"
              >
                {paying ? 'Đang xử lý...' : 'Tôi đã chuyển khoản thành công'}
              </button>
            </div>
          </div>
        )}

        {/* Card thông tin đơn */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {/* Ảnh + tên phòng */}
          {booking.roomImageUrl && (
            <div className="h-48 overflow-hidden">
              <img src={booking.roomImageUrl} alt={booking.roomTypeName} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-6 space-y-5">
            {/* Trạng thái và mã đơn */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-400 mb-1">Mã đơn</p>
                <p className="font-mono text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded">{booking.id}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>{status.label}</span>
            </div>

            {/* Thông tin khách sạn */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Khách sạn</p>
              <p className="font-bold text-slate-900">{booking.hotelName}</p>
              <p className="text-sm text-slate-500">{booking.hotelAddress}</p>
              <p className="text-sm font-medium text-slate-700 mt-1">{booking.roomTypeName}</p>
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

            {/* Số phòng và tổng tiền */}
            <div className="flex justify-between items-center bg-indigo-50 rounded-xl p-4 border border-indigo-100">
              <div>
                <p className="text-xs text-slate-500">{booking.numRooms} phòng</p>
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
          <Link to="/my-bookings"
            className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition text-sm">
            Xem tất cả đơn của tôi
          </Link>
          <Link to="/hotels"
            className="flex-1 text-center bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-xl border border-slate-200 transition text-sm">
            Tiếp tục tìm kiếm
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
