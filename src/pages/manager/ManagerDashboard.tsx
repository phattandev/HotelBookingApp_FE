import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  HomeModernIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface Booking {
  id: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  numRooms: number;
  totalPrice: number;
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const statusMap: Record<string, { label: string; color: string }> = {
  Pending:   { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-700' },
  Confirmed: { label: 'Đã xác nhận',  color: 'bg-blue-100 text-blue-700' },
  Completed: { label: 'Hoàn thành',   color: 'bg-emerald-100 text-emerald-700' },
  Cancelled: { label: 'Đã hủy',       color: 'bg-red-100 text-red-700' },
};

const ManagerDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/manager/bookings')
      .then(res => setBookings(res.data.data || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const pendingCount   = bookings.filter(b => b.status === 'Pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'Confirmed').length;
  const checkInsToday  = bookings.filter(b => b.checkInDate.startsWith(today) && b.status === 'Confirmed').length;
  const totalRevenue   = bookings
    .filter(b => b.status === 'Completed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tổng quan khách sạn</h1>
        <p className="text-slate-500 mt-1 text-sm">Theo dõi lịch đặt phòng và hoạt động hàng ngày</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        {[
          { label: 'Chờ xác nhận', value: pendingCount, icon: <ClockIcon className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50', color: pendingCount > 0 ? 'text-amber-600' : 'text-slate-900' },
          { label: 'Check-in hôm nay', value: checkInsToday, icon: <HomeModernIcon className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'Đang lưu trú', value: confirmedCount, icon: <UserGroupIcon className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50', color: 'text-emerald-600' },
          { label: 'Doanh thu (hoàn tất)', value: null, revenue: totalRevenue, icon: <CheckCircleIcon className="w-5 h-5 text-violet-600" />, bg: 'bg-violet-50', color: 'text-violet-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${s.bg}`}>{s.icon}</div>
              <p className="text-xs font-medium text-slate-500">{s.label}</p>
            </div>
            {s.revenue !== undefined
              ? <p className={`text-xl font-bold ${s.color}`}>{s.revenue.toLocaleString('vi-VN')}đ</p>
              : <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            }
          </div>
        ))}
      </div>

      {/* Pending bookings alert */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClockIcon className="w-5 h-5 text-amber-600" />
            <span className="font-bold text-amber-800">
              Có <span className="underline">{pendingCount} đơn đặt phòng</span> đang chờ bạn xác nhận
            </span>
          </div>
          <a href="/manager/bookings" className="px-4 py-2 bg-amber-600 text-white text-sm font-bold rounded-xl hover:bg-amber-700 transition">
            Xem ngay
          </a>
        </div>
      )}

      {/* Recent bookings */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <CalendarDaysIcon className="w-5 h-5 text-slate-500" />
            Đặt phòng gần đây
          </h3>
          <a href="/manager/bookings" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
            Xem tất cả <ChevronRightIcon className="w-4 h-4" />
          </a>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Đang tải...</div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarDaysIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Chưa có đặt phòng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Khách hàng</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Check-in</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Check-out</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Phòng</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bookings.slice(0, 8).map(b => {
                  const s = statusMap[b.status] || { label: b.status, color: 'bg-slate-100 text-slate-600' };
                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-medium text-slate-900">{b.guestName}</td>
                      <td className="px-6 py-4 text-slate-600">{formatDate(b.checkInDate)}</td>
                      <td className="px-6 py-4 text-slate-600">{formatDate(b.checkOutDate)}</td>
                      <td className="px-6 py-4 text-slate-600">{b.numRooms} phòng</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${s.color}`}>{s.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
