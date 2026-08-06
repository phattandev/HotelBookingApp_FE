import React, { useState } from 'react';
import { useHotelBookingManagement } from '../../hooks/useHotelBookingManagement';
import type { BookingItem } from '../../hooks/useHotelBookingManagement';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Badge } from '../../components/ui/Badge';
import { SidePanel } from '../../components/ui/SidePanel';
import { Textarea } from '../../components/ui/Textarea';
const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between gap-4 text-sm py-1">
    <span className="text-slate-500 shrink-0">{label}</span>
    <span className="text-slate-800 font-medium text-right">{value}</span>
  </div>
);

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
  const {
    loading,
    processing,
    filters,
    pagination,
    paginatedBookings,
    rejectModal, setRejectModal,
    rejectReason, setRejectReason,
    handleApprove,
    openRejectModal,
    handleConfirmReject
  } = useHotelBookingManagement();

  const [detailBooking, setDetailBooking] = useState<BookingItem | null>(null);

  const columns = [
    {
      key: 'customer',
      header: 'Khách hàng',
      render: (b: BookingItem) => (
        <div>
          <p className="font-semibold text-slate-900">{b.guestName}</p>
          <p className="text-xs text-slate-500 mt-0.5">{b.guestPhone}</p>
          <p className="text-xs text-slate-400">{b.guestEmail}</p>
        </div>
      )
    },
    {
      key: 'roomType',
      header: 'Các loại phòng',
      render: (b: BookingItem) => (
        <span className="font-medium text-slate-700">
          {b.items && b.items.length > 0 
            ? b.items[0].roomTypeName + (b.items.length > 1 ? ` và ${b.items.length - 1} loại khác` : '')
            : ''}
        </span>
      )
    },
    {
      key: 'stay',
      header: 'Lưu trú',
      render: (b: BookingItem) => {
        const numNights = Math.floor((new Date(b.checkOutDate).getTime() - new Date(b.checkInDate).getTime()) / 86400000);
        return (
          <div>
            <p className="text-slate-700 font-medium">{new Date(b.checkInDate).toLocaleDateString('vi-VN')}</p>
            <p className="text-slate-400 text-xs">→ {new Date(b.checkOutDate).toLocaleDateString('vi-VN')}</p>
            <p className="text-slate-500 text-xs mt-1 font-semibold">{numNights} đêm</p>
          </div>
        );
      }
    },
    {
      key: 'quantity',
      header: 'SL',
      align: 'center' as const,
      render: (b: BookingItem) => (
        <span className="font-semibold text-slate-700">
          {b.items?.reduce((sum, item) => sum + item.numRooms, 0) || 0}
        </span>
      )
    },
    {
      key: 'total',
      header: 'Tổng tiền',
      render: (b: BookingItem) => <span className="font-bold text-violet-700">{b.totalPrice.toLocaleString('vi-VN')}₫</span>
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (b: BookingItem) => {
        const st = STATUS_MAP[b.status] || { label: b.status, color: '' };
        let variant: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'violet' = 'neutral';
        if (b.status === 'Pending') variant = 'warning';
        else if (b.status === 'Approved') variant = 'info';
        else if (b.status === 'Confirmed') variant = 'success';
        else if (b.status === 'Cancelled') variant = 'danger';

        return (
          <div>
            <Badge variant={variant}>{st.label}</Badge>
            {b.status === 'Cancelled' && b.cancelReason && (
              <p className="text-xs text-red-500 mt-1.5 max-w-[180px] line-clamp-2" title={b.cancelReason}>
                Lý do: {b.cancelReason}
              </p>
            )}
          </div>
        );
      }
    },
    {
      key: 'payment',
      header: 'Cọc',
      render: (b: BookingItem) => {
        if (!PAYMENT_MAP[b.paymentStatus] || b.status === 'Cancelled' || b.status === 'Pending') {
          return <span className="text-slate-300 text-xs">—</span>;
        }
        let pVariant: 'success' | 'warning' | 'info' | 'neutral' = 'neutral';
        if (b.paymentStatus === 'Paid') pVariant = 'success';
        else if (b.paymentStatus === 'Unpaid') pVariant = 'warning';
        else if (b.paymentStatus === 'Refunded') pVariant = 'info';

        return (
          <div>
            <Badge variant={pVariant}>{PAYMENT_MAP[b.paymentStatus].label}</Badge>
            {b.paymentStatus === 'Unpaid' && (
              <p className="text-xs text-orange-500 mt-1">
                {b.depositAmount.toLocaleString('vi-VN')}₫
              </p>
            )}
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'center' as const,
      render: (b: BookingItem) => {
        if (b.status === 'Pending') {
          return (
            <div className="flex items-center justify-center gap-2">
              <Button size="sm" variant="primary" onClick={() => handleApprove(b.id)} isLoading={processing}>
                Duyệt
              </Button>
              <Button size="sm" variant="danger" onClick={() => openRejectModal(b.id, b.guestName)} isLoading={processing}>
                Từ chối
              </Button>
            </div>
          );
        }
        return null;
      }
    },
    {
      key: 'detail',
      header: 'Chi tiết',
      align: 'center' as const,
      render: (b: BookingItem) => (
        <Button size="sm" variant="outline" onClick={() => setDetailBooking(b)}>
          Chi tiết
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <PageHeader
        title="Quản Lý Đơn Đặt Phòng"
        description="Xem, xác nhận hoặc từ chối các đơn đặt phòng từ khách hàng"
      />

      {/* Toolbar: Filters */}
      <div className="flex flex-wrap gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm items-end">
        <div className="flex-1 min-w-[200px]">
          <Input
            label="Tìm kiếm"
            type="text"
            value={filters.searchQuery}
            onChange={e => filters.setSearchQuery(e.target.value)}
            placeholder="Tìm tên khách, email, SĐT..."
          />
        </div>
        
        <div className="w-48">
          <Select 
            label="Trạng thái"
            value={filters.activeFilter} 
            onChange={val => filters.setActiveFilter(val)} 
            options={FILTER_TABS} 
          />
        </div>

        <div className="w-40">
          <Input 
            label="Ngày Check-in"
            type="date" 
            value={filters.dateFilter} 
            onChange={e => filters.setDateFilter(e.target.value)} 
          />
        </div>

        {(filters.searchQuery || filters.activeFilter || filters.dateFilter) && (
          <Button onClick={() => { filters.setSearchQuery(''); filters.setActiveFilter(''); filters.setDateFilter(''); }}
            variant="ghost" className="!bg-slate-100 !text-slate-600 hover:!bg-slate-200 border-none mb-1 shadow-none">
            Xóa lọc
          </Button>
        )}
      </div>

      {/* Bảng danh sách */}
      <Table
        columns={columns}
        data={paginatedBookings}
        keyExtractor={b => b.id}
        isLoading={loading}
        emptyMessage="Không tìm thấy đơn đặt phòng phù hợp."
      />
      
      {/* Pagination Controls */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={pagination.setCurrentPage}
      />

      {/* Reject Modal */}
      <SidePanel
        isOpen={!!rejectModal}
        onClose={() => setRejectModal(null)}
        title="Từ chối đơn đặt phòng"
        width="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setRejectModal(null)} disabled={processing}>
              Hủy bỏ
            </Button>
            <Button variant="danger" onClick={handleConfirmReject} isLoading={processing}>
              Gửi Từ Chối
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Bạn đang từ chối đơn của khách hàng <strong className="text-slate-900">{rejectModal?.guestName}</strong>. 
            Hệ thống bắt buộc bạn phải nhập lý do (hết phòng, thông tin không hợp lệ...) để thông báo cho khách.
          </p>
          <Textarea
            label="Lý do từ chối (Bắt buộc)"
            rows={3}
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Nhập lý do chi tiết..."
          />
        </div>
      </SidePanel>

      {/* ── Detail Modal ── */}
      {detailBooking && (
        <ManagerBookingDetailModal
          booking={detailBooking}
          onClose={() => setDetailBooking(null)}
          onApprove={handleApprove}
          onReject={openRejectModal}
          processing={processing}
        />
      )}
    </div>
  );
};

export default HotelBookingManagement;

// ── Manager Booking Detail Modal ──
const STATUS_MAP_MODAL: Record<string, { label: string; color: string }> = {
  Pending:   { label: 'Chờ xác nhận',       color: 'bg-amber-100 text-amber-700' },
  Approved:  { label: 'Chờ thanh toán cọc', color: 'bg-blue-100 text-blue-700' },
  Confirmed: { label: 'Đã xác nhận',        color: 'bg-emerald-100 text-emerald-700' },
  Cancelled: { label: 'Đã hủy',             color: 'bg-red-100 text-red-700' },
  Completed: { label: 'Hoàn thành',         color: 'bg-slate-100 text-slate-600' },
};

function ManagerBookingDetailModal({
  booking, onClose, onApprove, onReject, processing
}: {
  booking: BookingItem;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, guestName: string) => void;
  processing: boolean;
}) {
  const st = STATUS_MAP_MODAL[booking.status] ?? { label: booking.status, color: '' };
  const nights = Math.round(
    (new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / 86400000
  );
  return (
    <SidePanel
      isOpen={true}
      onClose={onClose}
      title="Chi tiết đơn đặt phòng"
      width="lg"
    >
      <div className="space-y-5">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Khách hàng</p>
          <div className="bg-slate-50 rounded-xl p-4 space-y-1">
            <Row label="Họ tên" value={booking.guestName} />
            <Row label="Số điện thoại" value={booking.guestPhone} />
            <Row label="Email" value={booking.guestEmail} />
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Thông tin đặt phòng</p>
          <div className="bg-slate-50 rounded-xl p-4 space-y-1">
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
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Thanh toán &amp; Trạng thái</p>
          <div className="bg-slate-50 rounded-xl p-4 space-y-1">
            <Row label="Tổng tiền" value={booking.totalPrice.toLocaleString('vi-VN') + '₫'} />
            <Row label="Tiền cọc" value={booking.depositAmount.toLocaleString('vi-VN') + '₫'} />
            <Row label="Trạng thái" value={
              <Badge variant={st.label === 'Chờ xác nhận' ? 'warning' : st.label === 'Chờ thanh toán cọc' ? 'info' : st.label === 'Đã xác nhận' ? 'success' : st.label === 'Đã hủy' ? 'danger' : 'neutral'}>
                {st.label}
              </Badge>
            } />
            {booking.cancelReason && <Row label="Lý do hủy" value={booking.cancelReason} />}
          </div>
        </div>

        {/* Actions for Pending bookings */}
        {booking.status === 'Pending' && (
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hành động</p>
            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={() => { onApprove(booking.id); onClose(); }}
                isLoading={processing}
                className="flex-1"
              >
                Duyệt đơn
              </Button>
              <Button
                variant="danger"
                onClick={() => { onReject(booking.id, booking.guestName); onClose(); }}
                isLoading={processing}
                className="flex-1"
              >
                Từ chối
              </Button>
            </div>
          </div>
        )}
      </div>
    </SidePanel>
  );
}
