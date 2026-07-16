import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  BuildingOfficeIcon,
  HomeModernIcon,
  CalendarDaysIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface AdminStats {
  totalBusinesses: number;
  pendingBusinesses: number;
  approvedBusinesses: number;
  totalHotels: number;
  pendingHotels: number;
  activeHotels: number;
  totalBookings: number;
  bookingsToday: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalUsers: number;
  totalCustomers: number;
}

const StatCard: React.FC<{
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}> = ({ title, value, subtitle, icon, color, bgColor }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{value.toLocaleString()}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${bgColor}`}>
        {icon}
      </div>
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/adminbusiness/stats')
      .then(res => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!stats) return (
    <div className="p-8 text-center text-slate-400">Không thể tải dữ liệu thống kê.</div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tổng quan hệ thống</h1>
        <p className="text-slate-500 mt-1 text-sm">Thống kê hoạt động toàn hệ thống theo thời gian thực</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Doanh nghiệp chờ duyệt"
          value={stats.pendingBusinesses}
          subtitle={`${stats.totalBusinesses} tổng / ${stats.approvedBusinesses} đã duyệt`}
          icon={<BuildingOfficeIcon className="w-6 h-6 text-amber-600" />}
          color={stats.pendingBusinesses > 0 ? 'text-amber-600' : 'text-slate-900'}
          bgColor="bg-amber-50"
        />
        <StatCard
          title="Khách sạn chờ duyệt"
          value={stats.pendingHotels}
          subtitle={`${stats.totalHotels} tổng / ${stats.activeHotels} đang hoạt động`}
          icon={<HomeModernIcon className="w-6 h-6 text-blue-600" />}
          color={stats.pendingHotels > 0 ? 'text-blue-600' : 'text-slate-900'}
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Đặt phòng hôm nay"
          value={stats.bookingsToday}
          subtitle={`${stats.pendingBookings} chờ xác nhận · ${stats.confirmedBookings} đã xác nhận`}
          icon={<CalendarDaysIcon className="w-6 h-6 text-emerald-600" />}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <StatCard
          title="Tổng tài khoản"
          value={stats.totalUsers}
          subtitle={`${stats.totalCustomers} khách hàng`}
          icon={<UsersIcon className="w-6 h-6 text-violet-600" />}
          color="text-violet-600"
          bgColor="bg-violet-50"
        />
      </div>

      {/* Alert nếu có pending items */}
      {(stats.pendingBusinesses > 0 || stats.pendingHotels > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
            <ClockIcon className="w-5 h-5" />
            Cần xử lý
          </h3>
          <div className="space-y-2">
            {stats.pendingBusinesses > 0 && (
              <a href="/admin/businesses" className="flex items-center gap-3 text-sm text-amber-700 hover:text-amber-900 group">
                <span className="font-bold bg-amber-600 text-white px-2.5 py-0.5 rounded-full text-xs">{stats.pendingBusinesses}</span>
                Hồ sơ doanh nghiệp đang chờ phê duyệt
                <span className="text-amber-500 group-hover:translate-x-1 transition-transform">→</span>
              </a>
            )}
            {stats.pendingHotels > 0 && (
              <a href="/admin/approvals" className="flex items-center gap-3 text-sm text-amber-700 hover:text-amber-900 group">
                <span className="font-bold bg-amber-600 text-white px-2.5 py-0.5 rounded-full text-xs">{stats.pendingHotels}</span>
                Khách sạn đang chờ phê duyệt
                <span className="text-amber-500 group-hover:translate-x-1 transition-transform">→</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Tổng booking overview */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
          Tình trạng đặt phòng
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Chờ xác nhận', val: stats.pendingBookings, color: 'bg-amber-100 text-amber-700' },
            { label: 'Đã xác nhận', val: stats.confirmedBookings, color: 'bg-emerald-100 text-emerald-700' },
            { label: 'Tổng cộng', val: stats.totalBookings, color: 'bg-violet-100 text-violet-700' },
          ].map(item => (
            <div key={item.label} className={`rounded-xl p-4 ${item.color}`}>
              <p className="text-2xl font-bold">{item.val.toLocaleString()}</p>
              <p className="text-xs font-medium mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
