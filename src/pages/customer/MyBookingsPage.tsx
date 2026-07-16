import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface BookingItem {
  id: string;
  status: string;
  paymentStatus: string;
  checkInDate: string;
  checkOutDate: string;
  numRooms: number;
  totalPrice: number;
  depositAmount: number;
  depositDeadline: string | null;
  guestName: string;
  guestEmail: string;
  cancelReason: string | null;
  createdAt: string;
  roomTypeName: string;
  hotelName: string;
  hotelId: string;
  hotelAddress: string;
  roomImageUrl: string | null;
  hasReview?: boolean;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  Pending:   { label: 'Chờ xác nhận',  color: 'bg-amber-100 text-amber-700 border border-amber-200' },
  Approved:  { label: 'Đã duyệt (Chờ cọc)', color: 'bg-blue-100 text-blue-700 border border-blue-200' },
  Confirmed: { label: 'Đã xác nhận',   color: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
  Cancelled: { label: 'Đã hủy',        color: 'bg-red-100 text-red-700 border border-red-200' },
  Completed: { label: 'Hoàn thành',    color: 'bg-slate-100 text-slate-600 border border-slate-200' },
};

const PAYMENT_MAP: Record<string, { label: string; color: string }> = {
  Unpaid:   { label: 'Chưa cọc',   color: 'bg-orange-100 text-orange-700 border border-orange-200' },
  Paid:     { label: 'Đã cọc',      color: 'bg-green-100 text-green-700 border border-green-200' },
  Refunded: { label: 'Đã hoàn cọc', color: 'bg-purple-100 text-purple-700 border border-purple-200' },
};

const FILTER_TABS = [
  { value: '', label: 'Tất cả' },
  { value: 'Pending', label: 'Chờ xác nhận' },
  { value: 'Approved', label: 'Đã duyệt' },
  { value: 'Confirmed', label: 'Đã xác nhận' },
  { value: 'Cancelled', label: 'Đã hủy' },
  { value: 'Completed', label: 'Hoàn thành' },
];

// ── Review criteria ──
const REVIEW_CRITERIA = [
  { key: 'scoreSpace',             label: 'Không gian' },
  { key: 'scoreService',           label: 'Dịch vụ' },
  { key: 'scoreExperience',        label: 'Trải nghiệm' },
  { key: 'scoreSafety',            label: 'An toàn' },
  { key: 'scoreCleanliness',       label: 'Vệ sinh' },
  { key: 'scoreView',              label: 'View & Vị trí' },
  { key: 'scoreRoomQuality',       label: 'Chất lượng phòng' },
  { key: 'scoreFood',              label: 'Ẩm thực' },
  { key: 'scoreQuietness',         label: 'Yên tĩnh' },
  { key: 'scoreStaffFriendliness', label: 'Thân thiện của nhân viên' },
] as const;

// Tính thời gian còn lại đến deadline
function getTimeLeft(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return 'Đã hết hạn';
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `Còn ${hours}h ${minutes}p`;
  return `Còn ${minutes} phút`;
}

const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('');

  // Modal hủy đơn
  const [cancelModal, setCancelModal] = useState<{ id: string; hotelName: string } | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Modal thanh toán cọc
  const [depositModal, setDepositModal] = useState<BookingItem | null>(null);
  const [paying, setPaying] = useState(false);

  // Modal đánh giá
  const [reviewModal, setReviewModal] = useState<BookingItem | null>(null);
  const [reviewScores, setReviewScores] = useState<Record<string, number | null>>({});
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (activeFilter) params.status = activeFilter;
      const res = await api.get('/bookings/my', { params });
      const data: BookingItem[] = res.data.data || [];
      setBookings(data);
      return data;
    } catch {
      setBookings([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => { 
    fetchBookings().then(fetchedBookings => {
      // Handle VNPAY Return
      const paymentStatus = searchParams.get('payment');
      const bookingId = searchParams.get('bookingId');
      
      if (paymentStatus) {
        if (paymentStatus === '00') {
          // Xác minh xem booking có thực sự được cập nhật thành Paid hay không (tránh spoofing)
          const paidBooking = fetchedBookings.find(b => b.id === bookingId && b.paymentStatus === 'Paid');
          if (paidBooking) {
            toast.success('Thanh toán thành công! Trạng thái đơn đã được cập nhật.');
          } else {
            toast.error('Giao dịch chưa được ghi nhận trên hệ thống hoặc thanh toán thất bại.');
          }
        } else if (paymentStatus === 'invalid_signature') {
          toast.error('Giao dịch không hợp lệ (Sai chữ ký bảo mật).');
        } else {
          toast.error('Thanh toán thất bại hoặc đã bị hủy.');
        }
        
        // Remove query param
        searchParams.delete('payment');
        searchParams.delete('bookingId');
        setSearchParams(searchParams, { replace: true });
      }
    });
  }, [fetchBookings, searchParams, setSearchParams]);

  // Xử lý hủy đơn
  const handleConfirmCancel = async () => {
    if (!cancelModal) return;
    if (!cancelReason.trim()) { setCancelError('Vui lòng nhập lý do hủy đơn.'); return; }
    setCancelling(true);
    setCancelError('');
    try {
      const res = await api.put(`/bookings/${cancelModal.id}/cancel`, { cancelReason });
      toast.success(res.data?.message || 'Đã hủy đơn thành công!');
      setCancelModal(null);
      setCancelReason('');
      fetchBookings();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setCancelError(err.response?.data?.message || 'Hủy đơn thất bại.');
    } finally {
      setCancelling(false);
    }
  };

  // Gọi API tạo URL thanh toán VNPAY
  const handleVnPayPayment = async (bookingId: string) => {
    setPaying(true);
    try {
      const res = await api.post('/payment/create-url', { bookingId });
      // Redirect sang VNPay
      window.location.href = res.data.data;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { Message?: string } } };
      toast.error(err.response?.data?.Message || 'Khởi tạo thanh toán thất bại!');
      setPaying(false);
    }
  };

  // Xử lý gửi đánh giá
  const handleSubmitReview = async () => {
    if (!reviewModal) return;
    setSubmittingReview(true);
    try {
      const payload: Record<string, unknown> = {
        bookingId: reviewModal.id,
        comment: reviewComment || null,
      };
      REVIEW_CRITERIA.forEach(c => {
        payload[c.key] = reviewScores[c.key] ?? null;
      });
      await api.post('/reviews', payload);
      toast.success('Cảm ơn bạn đã đánh giá! Nhận xét đã được ghi nhận.');
      setReviewModal(null);
      setReviewScores({});
      setReviewComment('');
      fetchBookings();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gửi đánh giá thất bại!');
    } finally {
      setSubmittingReview(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Đơn đặt phòng của tôi</h1>
            <p className="text-slate-500 text-sm mt-1">Quản lý và theo dõi các đơn đặt phòng</p>
          </div>
          <Link to="/hotels" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
            Tìm khách sạn mới
          </Link>
        </div>

        {/* Bộ lọc trạng thái */}
        <div className="flex gap-2 flex-wrap mb-6 bg-white p-1.5 rounded-xl border border-slate-200 w-fit">
          {FILTER_TABS.map(tab => (
            <button key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeFilter === tab.value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Danh sách đơn */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 h-40 animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-400 font-medium text-lg">Không có đơn đặt phòng nào</p>
            <p className="text-slate-400 text-sm mt-2">
              {activeFilter ? 'Thử chọn bộ lọc khác' : 'Bắt đầu tìm kiếm khách sạn để đặt phòng'}
            </p>
            <Link to="/hotels" className="inline-block mt-6 bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
              Tìm khách sạn
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => {
              const status = STATUS_MAP[booking.status] || { label: booking.status, color: 'bg-slate-100 text-slate-600' };
              const payment = PAYMENT_MAP[booking.paymentStatus];
              const numNights = Math.floor((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / 86400000);
              const canPay = booking.paymentStatus === 'Unpaid' && ['Approved', 'Confirmed'].includes(booking.status) && Number(booking.depositAmount) > 0;
              const canReview = booking.status === 'Completed' && !booking.hasReview;
              // Kiểm tra deadline hợp lệ (không phải null, không phải epoch)
              const deadlineRaw = booking.depositDeadline;
              const deadline = deadlineRaw ? new Date(deadlineRaw) : null;
              const hasValidDeadline = deadline !== null && deadline.getFullYear() > 1971;
              const isDeadlineNear = canPay && hasValidDeadline && (deadline!.getTime() - Date.now()) < 3 * 3600000; // < 3h

              return (
                <div key={booking.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition">
                  <div className="sm:flex">
                    {/* Ảnh phòng */}
                    <div className="sm:w-48 h-40 sm:h-auto bg-slate-100 shrink-0 overflow-hidden">
                      {booking.roomImageUrl ? (
                        <img src={booking.roomImageUrl} alt={booking.roomTypeName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Chưa có ảnh</div>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="flex justify-between gap-3 flex-wrap">
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 text-base leading-tight">{booking.hotelName}</p>
                          <p className="text-sm text-slate-500 mt-0.5">{booking.roomTypeName}</p>
                          <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
                            <span>Nhận: <strong className="text-slate-700">{new Date(booking.checkInDate).toLocaleDateString('vi-VN')}</strong></span>
                            <span>Trả: <strong className="text-slate-700">{new Date(booking.checkOutDate).toLocaleDateString('vi-VN')}</strong></span>
                            <span>{numNights} đêm · {booking.numRooms} phòng</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>{status.label}</span>
                          {payment && booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${payment.color}`}>{payment.label}</span>
                          )}
                        </div>
                      </div>

                      {/* Cảnh báo hết hạn thanh toán */}
                      {canPay && hasValidDeadline && (
                        <div className={`mt-3 text-xs rounded-lg px-3 py-2 ${isDeadlineNear ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                          <span>
                            Vui lòng thanh toán cọc {booking.depositAmount.toLocaleString('vi-VN')}₫ trước{' '}
                            <strong>{deadline!.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, day: '2-digit', month: '2-digit', year: 'numeric' }).replace(',', '')}</strong>
                            {' '}· <strong>{getTimeLeft(deadlineRaw!)}</strong>
                          </span>
                        </div>
                      )}

                      {/* Lý do hủy */}
                      {booking.status === 'Cancelled' && booking.cancelReason && (
                        <div className="mt-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                          Lý do: {booking.cancelReason}
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 flex-wrap gap-2">
                        <div>
                          <p className="font-bold text-indigo-600 text-lg">{booking.totalPrice.toLocaleString('vi-VN')}₫</p>
                          {booking.depositAmount > 0 && booking.status !== 'Cancelled' && (
                            <p className="text-xs text-slate-400">Cần cọc: {booking.depositAmount.toLocaleString('vi-VN')}₫</p>
                          )}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Link to={`/booking/${booking.id}`}
                            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg transition">
                            Xem chi tiết
                          </Link>
                          {/* Nút thanh toán cọc */}
                          {canPay && (
                            <button onClick={() => setDepositModal(booking)}
                              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded-lg transition">
                              💳 Thanh toán cọc
                            </button>
                          )}
                          {/* Nút đánh giá */}
                          {canReview && (
                            <button onClick={() => { setReviewModal(booking); setReviewScores({}); setReviewComment(''); }}
                              className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 font-semibold px-3 py-1.5 rounded-lg transition">
                              ⭐ Đánh giá
                            </button>
                          )}
                          {booking.status === 'Completed' && booking.hasReview && (
                            <span className="text-xs text-green-600 font-semibold px-3 py-1.5">✓ Đã đánh giá</span>
                          )}
                          {/* Nút hủy */}
                          {(booking.status === 'Pending' || booking.status === 'Confirmed') && (
                            <button onClick={() => { setCancelModal({ id: booking.id, hotelName: booking.hotelName }); setCancelReason(''); setCancelError(''); }}
                              className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-3 py-1.5 rounded-lg transition">
                              Hủy đơn
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODAL thanh toán cọc ── */}
      {depositModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="font-bold text-slate-900 text-lg">💳 Thanh toán đặt cọc</h3>
              <button onClick={() => setDepositModal(null)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-indigo-50 rounded-xl p-4">
                <p className="text-sm text-slate-600">Đơn: <strong>{depositModal.hotelName}</strong></p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{depositModal.depositAmount.toLocaleString('vi-VN')}₫</p>
                <p className="text-xs text-slate-400 mt-1">Mã đơn: #{depositModal.id.slice(0, 8).toUpperCase()}</p>
              </div>

              {/* VNPay Logo & Info */}
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700 mb-3">Thanh toán an toàn qua cổng VNPAY</p>
                <img
                  src="https://vnpay.vn/s1/statics.vnpay.vn/2023/6/oxwq2cvjvweg_logo-vi-wallet.svg"
                  alt="VNPAY"
                  className="h-12 mx-auto object-contain mb-4"
                />
                <div className="mt-3 text-xs text-slate-500 space-y-1 bg-slate-50 p-3 rounded-lg text-left">
                  <p>✓ Hỗ trợ thẻ ATM nội địa & Tài khoản ngân hàng</p>
                  <p>✓ Hỗ trợ thẻ thanh toán quốc tế (Visa, MasterCard, JCB, UnionPay)</p>
                  <p>✓ Hỗ trợ quét mã VNPAY-QR qua ứng dụng Mobile Banking</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <button
                  onClick={() => handleVnPayPayment(depositModal.id)}
                  disabled={paying}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold py-3 rounded-xl transition text-sm flex items-center justify-center gap-2"
                >
                  {paying ? '⏳ Đang chuyển hướng...' : 'Thanh toán ngay qua VNPAY'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL hủy đơn ── */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-slate-900 text-lg mb-1">Hủy đơn đặt phòng</h3>
            <p className="text-slate-500 text-sm mb-4">
              Bạn đang hủy đơn tại <strong>{cancelModal.hotelName}</strong>. Hành động này không thể hoàn tác.
            </p>
            <div className="mb-4">
              <label className="text-sm font-semibold text-slate-700 block mb-2">
                Lý do hủy <span className="text-red-500">*</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={e => { setCancelReason(e.target.value); setCancelError(''); }}
                placeholder="Vui lòng mô tả lý do bạn muốn hủy đơn..."
                rows={3}
                className={`w-full border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400 ${cancelError ? 'border-red-400' : 'border-slate-200'}`}
              />
              {cancelError && <p className="text-red-500 text-xs mt-1">{cancelError}</p>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCancelModal(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl transition text-sm">
                Quay lại
              </button>
              <button onClick={handleConfirmCancel} disabled={cancelling}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-semibold py-2.5 rounded-xl transition text-sm">
                {cancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL đánh giá ── */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4 py-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b bg-amber-50">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">⭐ Đánh giá khách sạn</h3>
                <p className="text-sm text-slate-500">{reviewModal.hotelName}</p>
              </div>
              <button onClick={() => setReviewModal(null)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
            </div>
            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              <p className="text-sm text-slate-500">Kéo thanh để chấm điểm từ 1-10. Bỏ trống nếu không muốn đánh giá tiêu chí đó.</p>
              {REVIEW_CRITERIA.map(criterion => {
                const score = reviewScores[criterion.key];
                return (
                  <div key={criterion.key}>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-sm font-medium text-slate-700">{criterion.label}</label>
                      <div className="flex items-center gap-2">
                        {score != null ? (
                          <span className={`text-sm font-bold w-8 text-right ${score >= 8 ? 'text-green-600' : score >= 5 ? 'text-amber-600' : 'text-red-600'}`}>{score}/10</span>
                        ) : (
                          <span className="text-xs text-slate-400 w-16 text-right">Bỏ qua</span>
                        )}
                        {score != null && (
                          <button onClick={() => setReviewScores(s => { const n = {...s}; delete n[criterion.key]; return n; })}
                            className="text-xs text-slate-400 hover:text-red-500">✕</button>
                        )}
                      </div>
                    </div>
                    <input
                      type="range" min={1} max={10} step={1}
                      value={score ?? 5}
                      onChange={e => setReviewScores(s => ({ ...s, [criterion.key]: +e.target.value }))}
                      onMouseDown={() => { if (score == null) setReviewScores(s => ({ ...s, [criterion.key]: 5 })); }}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-slate-400 -mt-1">
                      <span>1</span><span>5</span><span>10</span>
                    </div>
                  </div>
                );
              })}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Nhận xét (tùy chọn)</label>
                <textarea
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Chia sẻ cảm nhận của bạn về khách sạn..."
                  rows={4}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
            <div className="p-5 border-t flex gap-3">
              <button onClick={() => setReviewModal(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl transition text-sm">
                Hủy
              </button>
              <button onClick={handleSubmitReview} disabled={submittingReview}
                className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white font-semibold py-2.5 rounded-xl transition text-sm">
                {submittingReview ? 'Đang gửi...' : '⭐ Gửi đánh giá'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
