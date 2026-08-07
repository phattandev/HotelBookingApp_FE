import React, { useState } from 'react';
import { useAdminBookingManagement } from '../../hooks/useAdminBookingManagement';
import type { AdminBookingItem, PeriodPreset } from '../../hooks/useAdminBookingManagement';
import { PageHeader } from '../../components/ui/PageHeader';
import { Tabs } from '../../components/ui/Tabs';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

// ── Helper ──
const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between gap-4 text-sm py-1">
    <span className="text-slate-500 shrink-0">{label}</span>
    <span className="text-slate-800 font-medium text-right">{value}</span>
  </div>
);

// ── Maps ──
const STATUS_MAP: Record<string, { label: string; color: "success" | "warning" | "danger" | "info" | "neutral" }> = {
  Pending:   { label: 'Chờ xác nhận',       color: 'warning' },
  Approved:  { label: 'Chờ thanh toán cọc', color: 'info' },
  Confirmed: { label: 'Đã xác nhận',        color: 'success' },
  Cancelled: { label: 'Đã hủy',             color: 'danger' },
  Completed: { label: 'Hoàn thành',         color: 'neutral' },
};

const PAYMENT_MAP: Record<string, { label: string; color: string }> = {
  Unpaid:   { label: 'Chưa cọc',    color: 'text-orange-600' },
  Paid:     { label: 'Đã cọc',      color: 'text-emerald-600' },
  Refunded: { label: 'Đã hoàn cọc', color: 'text-purple-600' },
};

const PERIOD_TABS: { value: PeriodPreset; label: string }[] = [
  { value: 'today',   label: 'Hôm nay' },
  { value: 'week',    label: 'Tuần này' },
  { value: 'month',   label: 'Tháng này' },
  { value: 'quarter', label: 'Quý này' },
  { value: 'year',    label: 'Năm nay' },
  { value: 'custom',  label: 'Tùy chỉnh' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'Pending',   label: 'Chờ xác nhận' },
  { value: 'Approved',  label: 'Chờ thanh toán cọc' },
  { value: 'Confirmed', label: 'Đã xác nhận' },
  { value: 'Cancelled', label: 'Đã hủy' },
  { value: 'Completed', label: 'Hoàn thành' },
];

// ── Helper ──
const fmt = (n: number) => n.toLocaleString('vi-VN');
const fmtMoney = (n: number) => n.toLocaleString('vi-VN') + '₫';

// ── Sub-components ──

const SummaryCard: React.FC<{ label: string; value: string; sub?: string; accent?: string }> = ({
  label, value, sub, accent = 'text-slate-900'
}) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4">
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-2xl font-bold leading-none ${accent}`}>{value}</p>
    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
  </div>
);

const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
  const colors = ['bg-yellow-400 text-yellow-900', 'bg-slate-300 text-slate-700', 'bg-orange-300 text-orange-900'];
  return (
    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${colors[rank - 1] ?? 'bg-slate-100 text-slate-600'}`}>
      {rank}
    </span>
  );
};

// ── Main Page ──
const AdminBookingManagement: React.FC = () => {
  const {
    stats, loading,
    businesses, filteredHotels,
    period, fromDate, toDate,
    selectedBizId, selectedHotelId, selectedStatus,
    handlePeriodChange, handleFromDateChange, handleToDateChange,
    handleBizChange, setSelectedHotelId, setSelectedStatus,
    page, setPage, totalPages, PAGE_SIZE,
    isoToDateInput,
  } = useAdminBookingManagement();

  const [detailBooking, setDetailBooking] = useState<AdminBookingItem | null>(null);

  return (
    <div className="space-y-6 w-full">
      {/* ── Header ── */}
      <PageHeader 
        title="Quản Lý Đặt Phòng Toàn Nền Tảng" 
        description="Tổng quan đơn đặt phòng, doanh thu và dữ liệu hoa hồng theo kỳ" 
      />

      {/* ── Toolbar ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
        {/* Period tabs */}
        <div>
          <Tabs 
            tabs={PERIOD_TABS} 
            activeTab={period} 
            onChange={(val) => handlePeriodChange(val as PeriodPreset)} 
            variant="pill" 
          />
        </div>

        {/* Custom date range + dropdowns */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex items-center gap-3">
            <div className="w-36">
              <Input
                label="Từ ngày"
                type="date"
                value={isoToDateInput(fromDate)}
                onChange={e => handleFromDateChange(e.target.value)}
              />
            </div>
            <span className="text-slate-400 mt-6">—</span>
            <div className="w-36">
              <Input
                label="Đến ngày"
                type="date"
                value={isoToDateInput(toDate)}
                onChange={e => handleToDateChange(e.target.value)}
              />
            </div>
          </div>

          <div className="min-w-[200px]">
            <Select 
              label="Doanh nghiệp"
              value={selectedBizId} 
              onChange={val => handleBizChange(val)} 
              options={[
                { value: '', label: 'Tất cả doanh nghiệp' },
                ...businesses.map(b => ({ value: b.id, label: b.name }))
              ]} 
            />
          </div>

          <div className="min-w-[200px]">
            <Select 
              label="Khách sạn"
              value={selectedHotelId} 
              onChange={val => setSelectedHotelId(val)} 
              options={[
                { value: '', label: 'Tất cả khách sạn' },
                ...filteredHotels.map(h => ({ value: h.id, label: h.name }))
              ]} 
            />
          </div>

          <div className="min-w-[180px]">
            <Select 
              label="Trạng thái"
              value={selectedStatus} 
              onChange={val => setSelectedStatus(val)} 
              options={STATUS_OPTIONS} 
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-32 text-slate-400 text-sm">Đang tải dữ liệu...</div>
      )}

      {!loading && stats && (
        <>
          {/* ── Summary Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard label="Tổng đơn đặt phòng" value={fmt(stats.totalBookings)} />
            <SummaryCard
              label="Doanh thu thực tế"
              value={fmtMoney(stats.totalRevenue)}
              sub="Các đơn Hoàn thành"
              accent="text-violet-700"
            />
            <SummaryCard
              label="Tổng tiền cọc đã thu"
              value={fmtMoney(stats.totalDeposit)}
              sub="PaymentStatus = Paid"
              accent="text-emerald-700"
            />
            <SummaryCard
              label="Đơn đã hủy"
              value={fmt(stats.totalCancelled)}
              accent="text-red-600"
            />
          </div>

          {/* ── Top 5 Rankings ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 5 Hotels */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-800">Top 5 Khách Sạn Doanh Thu Cao Nhất</h2>
                <p className="text-xs text-slate-400 mt-0.5">Trong kỳ lọc, chỉ tính đơn Hoàn thành</p>
              </div>
              <div className="divide-y divide-slate-50">
                {stats.topHotels.length === 0 ? (
                  <p className="p-6 text-center text-slate-400 text-sm">Chưa có dữ liệu</p>
                ) : stats.topHotels.map((h, i) => (
                  <div key={h.hotelId} className="flex items-center gap-3 px-5 py-3">
                    <RankBadge rank={i + 1} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{h.hotelName}</p>
                      <p className="text-xs text-slate-400">{h.businessName} · {fmt(h.totalBookings)} đơn</p>
                    </div>
                    <span className="text-sm font-bold text-violet-700 whitespace-nowrap">{fmtMoney(h.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 Businesses */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-800">Top 5 Doanh Nghiệp Doanh Thu Cao Nhất</h2>
                <p className="text-xs text-slate-400 mt-0.5">Tổng tất cả khách sạn thuộc doanh nghiệp đó</p>
              </div>
              <div className="divide-y divide-slate-50">
                {stats.topBusinesses.length === 0 ? (
                  <p className="p-6 text-center text-slate-400 text-sm">Chưa có dữ liệu</p>
                ) : stats.topBusinesses.map((b, i) => (
                  <div key={b.businessId} className="flex items-center gap-3 px-5 py-3">
                    <RankBadge rank={i + 1} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{b.businessName}</p>
                      <p className="text-xs text-slate-400">{fmt(b.totalBookings)} đơn hoàn thành</p>
                    </div>
                    <span className="text-sm font-bold text-violet-700 whitespace-nowrap">{fmtMoney(b.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Bảng tổng hợp theo khách sạn (Hoa hồng) ── */}
          {stats.hotelSummaries.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-800">Tổng Hợp Theo Khách Sạn</h2>
                <p className="text-xs text-slate-400 mt-0.5">Dữ liệu để tính hoa hồng định kỳ</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Khách sạn</th>
                      <th className="px-4 py-3">Doanh nghiệp</th>
                      <th className="px-4 py-3 text-center">Tổng đơn</th>
                      <th className="px-4 py-3 text-center">Hoàn thành</th>
                      <th className="px-4 py-3 text-center">Đã hủy</th>
                      <th className="px-4 py-3 text-right">Doanh thu (Completed)</th>
                      <th className="px-4 py-3 text-right">Tiền cọc đã thu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {stats.hotelSummaries.map(h => (
                      <tr key={h.hotelId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-800">{h.hotelName}</td>
                        <td className="px-4 py-3 text-slate-500">{h.businessName}</td>
                        <td className="px-4 py-3 text-center font-medium text-slate-700">{fmt(h.totalBookings)}</td>
                        <td className="px-4 py-3 text-center text-emerald-600 font-medium">{fmt(h.completedBookings)}</td>
                        <td className="px-4 py-3 text-center text-red-500 font-medium">{fmt(h.cancelledBookings)}</td>
                        <td className="px-4 py-3 text-right font-bold text-violet-700">{fmtMoney(h.totalRevenue)}</td>
                        <td className="px-4 py-3 text-right text-emerald-700 font-semibold">{fmtMoney(h.totalDeposit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Bảng chi tiết booking ── */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Danh Sách Đơn Đặt Phòng</h2>
                <p className="text-xs text-slate-400 mt-0.5">{fmt(stats.bookingTotalCount)} đơn — trang {page}/{totalPages}</p>
              </div>
            </div>

            {stats.bookings.length === 0 ? (
              <div className="p-16 text-center text-slate-400 text-sm">Không có đơn nào phù hợp với bộ lọc.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Khách hàng</th>
                      <th className="px-4 py-3">Khách sạn / Doanh nghiệp</th>
                      <th className="px-4 py-3">Loại phòng</th>
                      <th className="px-4 py-3">Lưu trú</th>
                      <th className="px-4 py-3 text-center">SL</th>
                      <th className="px-4 py-3 text-right">Tổng tiền</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3">Cọc</th>
                      <th className="px-4 py-3">Ngày tạo</th>
                      <th className="px-4 py-3 text-center">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {stats.bookings.map(b => {
                      const st = STATUS_MAP[b.status] ?? { label: b.status, color: '' };
                      const pt = PAYMENT_MAP[b.paymentStatus];
                      const nights = Math.round(
                        (new Date(b.checkOutDate).getTime() - new Date(b.checkInDate).getTime()) / 86400000
                      );
                      return (
                        <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-800">{b.guestName}</p>
                            <p className="text-xs text-slate-400">{b.guestPhone}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-700">{b.hotelName}</p>
                            <p className="text-xs text-slate-400">{b.businessName}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {b.items && b.items.length > 0 
                              ? b.items[0].roomTypeName + (b.items.length > 1 ? ` và ${b.items.length - 1} loại khác` : '')
                              : ''}
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-slate-700 font-medium">
                              {new Date(b.checkInDate).toLocaleDateString('vi-VN')}
                            </p>
                            <p className="text-xs text-slate-400">
                              → {new Date(b.checkOutDate).toLocaleDateString('vi-VN')} · {nights}đ
                            </p>
                          </td>
                          <td className="px-4 py-3 text-center text-slate-700 font-medium">
                            {b.items?.reduce((sum, item) => sum + item.numRooms, 0) || 0}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-violet-700">{fmtMoney(b.totalPrice)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${st.color}`}>{st.label}</span>
                          </td>
                          <td className="px-4 py-3">
                            {pt ? (
                              <span className={`text-xs font-semibold ${pt.color}`}>{pt.label}</span>
                            ) : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">
                            {new Date(b.createdAt).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => setDetailBooking(b)}
                              className="text-xs px-3 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium border border-slate-200 transition"
                            >
                              Chi tiết
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-500">
                  Hiển thị {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, stats.bookingTotalCount)} / {fmt(stats.bookingTotalCount)} đơn
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition"
                  >
                    Trước
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Booking Detail Modal ── */}
      {detailBooking && (
        <BookingDetailModal booking={detailBooking} onClose={() => setDetailBooking(null)} />
      )}
    </div>
  );
};

export default AdminBookingManagement;

// ── Booking Detail Modal (tách để dễ đọc) ──
function BookingDetailModal({ booking, onClose }: { booking: AdminBookingItem; onClose: () => void }) {
  const STATUS_MAP: Record<string, { label: string; color: string }> = {
    Pending:   { label: 'Chờ xác nhận',       color: 'bg-amber-100 text-amber-700' },
    Approved:  { label: 'Chờ thanh toán cọc', color: 'bg-blue-100 text-blue-700' },
    Confirmed: { label: 'Đã xác nhận',        color: 'bg-emerald-100 text-emerald-700' },
    Cancelled: { label: 'Đã hủy',             color: 'bg-red-100 text-red-700' },
    Completed: { label: 'Hoàn thành',         color: 'bg-slate-100 text-slate-600' },
  };
  const st = STATUS_MAP[booking.status] ?? { label: booking.status, color: '' };
  const nights = Math.round(
    (new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / 86400000
  );
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-bold text-slate-900">Chi tiết đơn đặt phòng</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6 space-y-5">
          {/* Khách hàng */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Khách hàng</p>
            <div className="bg-slate-50 rounded-xl p-4 space-y-1">
              <Row label="Họ tên" value={booking.guestName} />
              <Row label="Số điện thoại" value={booking.guestPhone} />
              <Row label="Email" value={booking.guestEmail} />
            </div>
          </div>
          {/* Đặt phòng */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Thông tin đặt phòng</p>
            <div className="bg-slate-50 rounded-xl p-4 space-y-1">
              <Row label="Khách sạn" value={booking.hotelName} />
              <Row label="Doanh nghiệp" value={booking.businessName} />
              <Row 
                label="Các loại phòng" 
                value={
                  <ul className="text-right">
                    {booking.items?.map((item, idx) => (
                      <li key={idx}>
                        {item.roomTypeName} <span className="text-slate-400">x{item.numRooms}</span>
                      </li>
                    ))}
                  </ul>
                } 
              />
              <Row label="Check-in" value={new Date(booking.checkInDate).toLocaleDateString('vi-VN')} />
              <Row label="Check-out" value={new Date(booking.checkOutDate).toLocaleDateString('vi-VN')} />
              <Row label="Số đêm" value={`${nights} đêm`} />
            </div>
          </div>
          {/* Thanh toán */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Thanh toán</p>
            <div className="bg-slate-50 rounded-xl p-4 space-y-1">
              <Row label="Tổng tiền" value={booking.totalPrice.toLocaleString('vi-VN') + '₫'} />
              <Row label="Tiền cọc" value={booking.depositAmount.toLocaleString('vi-VN') + '₫'} />
              <Row label="Trạng thái đơn" value={
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${st.color}`}>{st.label}</span>
              } />
              <Row label="Thanh toán cọc" value={booking.paymentStatus} />
              {booking.cancelReason && <Row label="Lý do hủy" value={booking.cancelReason} />}
            </div>
          </div>
          {/* Meta */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Thông tin khác</p>
            <div className="bg-slate-50 rounded-xl p-4 space-y-1">
              <Row label="Ngày tạo" value={new Date(booking.createdAt).toLocaleString('vi-VN')} />
              <Row label="Mã đơn" value={booking.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
