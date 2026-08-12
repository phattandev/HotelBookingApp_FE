import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SidePanel } from '../../components/ui/SidePanel';

interface BookingItem {
  id: string;
  status: string;
  paymentStatus: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  depositAmount: number;
  depositDeadline: string | null;
  guestName: string;
  guestEmail: string;
  cancelReason: string | null;
  createdAt: string;
  hotelName: string;
  hotelId: string;
  hotelAddress: string;
  hasReview?: boolean;
  items: {
    roomTypeName: string;
    roomImageUrl: string | null;
    numRooms: number;
  }[];
}

const STATUS_MAP: Record<string, { label: string; variant: 'warning' | 'info' | 'success' | 'danger' | 'neutral' }> = {
  Pending: { label: 'Chờ xác nhận', variant: 'warning' },
  Approved: { label: 'Đã duyệt (Chờ cọc)', variant: 'info' },
  Confirmed: { label: 'Đã xác nhận', variant: 'success' },
  Cancelled: { label: 'Đã hủy', variant: 'danger' },
  Completed: { label: 'Hoàn thành', variant: 'neutral' },
};

const PAYMENT_MAP: Record<string, { label: string; variant: 'warning' | 'success' | 'violet' }> = {
  Unpaid: { label: 'Chưa cọc', variant: 'warning' },
  Paid: { label: 'Đã cọc', variant: 'success' },
  Refunded: { label: 'Đã hoàn cọc', variant: 'violet' },
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
  { key: 'scoreSpace', label: 'Không gian' },
  { key: 'scoreService', label: 'Dịch vụ' },
  { key: 'scoreExperience', label: 'Trải nghiệm' },
  { key: 'scoreSafety', label: 'An toàn' },
  { key: 'scoreCleanliness', label: 'Vệ sinh' },
  { key: 'scoreView', label: 'View & Vị trí' },
  { key: 'scoreRoomQuality', label: 'Chất lượng phòng' },
  { key: 'scoreFood', label: 'Ẩm thực' },
  { key: 'scoreQuietness', label: 'Yên tĩnh' },
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
        <PageHeader
          title="Lịch sử đặt phòng của tôi"
          description="Quản lý và theo dõi các đơn đặt phòng"
          action={
            <Link to="/hotels">
              <Button variant="primary">Tìm khách sạn mới</Button>
            </Link>
          }
        />

        {/* Bộ lọc trạng thái */}
        <div className="flex gap-2 flex-wrap mb-6 bg-white p-1.5 rounded-xl border border-slate-200 w-fit">
          {FILTER_TABS.map(tab => (
            <button key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeFilter === tab.value
                ? 'bg-violet-600 text-white shadow-sm'
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
            <Link to="/hotels" className="inline-block mt-6">
              <Button variant="primary">Tìm khách sạn</Button>
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
              // eslint-disable-next-line react-hooks/purity
              const isDeadlineNear = canPay && hasValidDeadline && (deadline!.getTime() - Date.now()) < 3 * 3600000; // < 3h

              return (
                <div key={booking.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition">
                  <div className="sm:flex">
                    {/* Ảnh phòng */}
                    <div className="sm:w-48 h-40 sm:h-auto bg-slate-100 shrink-0 overflow-hidden">
                      {booking.items && booking.items.length > 0 && booking.items[0].roomImageUrl ? (
                        <img src={booking.items[0].roomImageUrl} alt={booking.hotelName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Chưa có ảnh</div>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="flex justify-between gap-3 flex-wrap">
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 text-base leading-tight">{booking.hotelName}</p>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {booking.items?.[0]?.roomTypeName}
                            {booking.items && booking.items.length > 1 ? ` và ${booking.items.length - 1} phòng khác` : ''}
                          </p>
                          <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
                            <span>Nhận: <strong className="text-slate-700">{new Date(booking.checkInDate).toLocaleDateString('vi-VN')}</strong></span>
                            <span>Trả: <strong className="text-slate-700">{new Date(booking.checkOutDate).toLocaleDateString('vi-VN')}</strong></span>
                            <span>{numNights} đêm · {booking.items?.reduce((sum, item) => sum + item.numRooms, 0) || 0} phòng</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <Badge variant={status.variant}>{status.label}</Badge>
                          {payment && booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
                            <Badge variant={payment.variant}>{payment.label}</Badge>
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
                          <p className="font-bold text-violet-600 text-lg">{booking.totalPrice.toLocaleString('vi-VN')}₫</p>
                          {booking.depositAmount > 0 && booking.status !== 'Cancelled' && (
                            <p className="text-xs text-slate-400">Cần cọc: {booking.depositAmount.toLocaleString('vi-VN')}₫</p>
                          )}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Link to={`/booking/${booking.id}`}>
                            <Button size="sm" variant="outline">Xem chi tiết</Button>
                          </Link>
                          {/* Nút thanh toán cọc */}
                          {canPay && (
                            <Button size="sm" variant="primary" onClick={() => setDepositModal(booking)}>
                              💳 Thanh toán cọc
                            </Button>
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
                            <Button size="sm" variant="danger" onClick={() => { setCancelModal({ id: booking.id, hotelName: booking.hotelName }); setCancelReason(''); setCancelError(''); }}>
                              Hủy đơn
                            </Button>
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
      <SidePanel
        isOpen={!!depositModal}
        onClose={() => setDepositModal(null)}
        title="💳 Thanh toán đặt cọc"
        width="md"
        footer={
          <Button
            onClick={() => depositModal && handleVnPayPayment(depositModal.id)}
            disabled={paying}
            variant="primary"
            className="w-full"
          >
            {paying ? '⏳ Đang chuyển hướng...' : 'Thanh toán ngay qua VNPAY'}
          </Button>
        }
      >
        {depositModal && (
          <div className="space-y-4">
            <div className="bg-violet-50 rounded-xl p-4">
              <p className="text-sm text-slate-600">Đơn: <strong>{depositModal.hotelName}</strong></p>
              <p className="text-2xl font-bold text-violet-600 mt-1">{depositModal.depositAmount.toLocaleString('vi-VN')}₫</p>
              <p className="text-xs text-slate-400 mt-1">Mã đơn: #{depositModal.id.slice(0, 8).toUpperCase()}</p>
            </div>

            {/* VNPay Logo & Info */}
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700 mb-3">Thanh toán an toàn qua cổng VNPAY</p>
              <div className="mt-3 text-xs text-slate-500 space-y-1 bg-slate-50 p-3 rounded-lg text-left">
                <p>✓ Hỗ trợ thẻ ATM nội địa & Tài khoản ngân hàng</p>
                <p>✓ Hỗ trợ thẻ thanh toán quốc tế (Visa, MasterCard, JCB, UnionPay)</p>
                <p>✓ Hỗ trợ quét mã VNPAY-QR qua ứng dụng Mobile Banking</p>
              </div>
            </div>
          </div>
        )}
      </SidePanel>

      {/* ── MODAL hủy đơn ── */}
      <SidePanel
        isOpen={!!cancelModal}
        onClose={() => setCancelModal(null)}
        title="Hủy đơn đặt phòng"
        width="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setCancelModal(null)} className="flex-1">Quay lại</Button>
            <Button variant="danger" onClick={handleConfirmCancel} disabled={cancelling} className="flex-1">
              {cancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
            </Button>
          </>
        }
      >
        {cancelModal && (
          <div>
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
          </div>
        )}
      </SidePanel>

      {/* ── MODAL đánh giá ── */}
      <SidePanel
        isOpen={!!reviewModal}
        onClose={() => setReviewModal(null)}
        title="⭐ Đánh giá khách sạn"
        width="xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setReviewModal(null)} className="flex-1">Hủy</Button>
            <Button variant="primary" onClick={handleSubmitReview} disabled={submittingReview} className="flex-1">
              {submittingReview ? 'Đang gửi...' : '⭐ Gửi đánh giá'}
            </Button>
          </>
        }
      >
        {reviewModal && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">{reviewModal.hotelName}</p>
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
                        <button onClick={() => setReviewScores(s => { const n = { ...s }; delete n[criterion.key]; return n; })}
                          className="text-xs text-slate-400 hover:text-red-500">✕</button>
                      )}
                    </div>
                  </div>
                  <input
                    type="range" min={1} max={10} step={1}
                    value={score ?? 5}
                    onChange={e => setReviewScores(s => ({ ...s, [criterion.key]: +e.target.value }))}
                    onMouseDown={() => { if (score == null) setReviewScores(s => ({ ...s, [criterion.key]: 5 })); }}
                    className="w-full accent-violet-500 cursor-pointer"
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
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
          </div>
        )}
      </SidePanel>
    </div>
  );
};

export default MyBookingsPage;
