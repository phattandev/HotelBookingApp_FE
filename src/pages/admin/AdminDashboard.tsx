import React from 'react';
import { useAdminDashboard, type HotelRevenueSummary } from '../../hooks/useAdminDashboard';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { PageHeader } from '../../components/ui/PageHeader';
import { Table } from '../../components/ui/Table';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#ef4444'];

const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
}> = ({ title, value, subtitle }) => (
  <div className="bg-white rounded-lg border border-slate-200 p-5">
    <div>
      <p className="text-sm font-semibold text-slate-600">{title}</p>
      <p className="text-2xl font-bold mt-2 text-slate-900">{value}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-2 border-t border-slate-100 pt-2">{subtitle}</p>}
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const { stats, loading, dateRange, handleDateChange } = useAdminDashboard();

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!stats) return (
    <div className="p-8 text-center text-slate-400">Không thể tải dữ liệu thống kê.</div>
  );

  const pieData = Object.entries(stats.bookingStatusBreakdown).map(([key, val]) => ({
    name: key,
    value: val
  }));

  return (
    <div className="space-y-8">
      {/* Header & Filter */}
      <PageHeader
        title="Tổng quan hệ thống"
        description="Thống kê hoạt động toàn hệ thống"
        action={
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            <input
              type="date" 
              value={dateRange.fromDate}
              onChange={(e) => handleDateChange(e.target.value, dateRange.toDate)}
              className="text-sm border-none focus:ring-0 text-slate-700 bg-transparent outline-none cursor-pointer"
            />
            <span className="text-slate-400">-</span>
            <input 
              type="date" 
              value={dateRange.toDate}
              onChange={(e) => handleDateChange(dateRange.fromDate, e.target.value)}
              className="text-sm border-none focus:ring-0 text-slate-700 bg-transparent outline-none cursor-pointer"
            />
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Tổng doanh thu"
          value={stats.totalRevenue.toLocaleString('vi-VN') + ' VNĐ'}
          subtitle={`Tiền cọc: ${stats.totalDepositCollected.toLocaleString('vi-VN')} VNĐ`}
        />
        <StatCard
          title="Doanh nghiệp chờ duyệt"
          value={stats.pendingBusinesses}
          subtitle={`Tổng số: ${stats.totalBusinesses} / Đã duyệt: ${stats.approvedBusinesses}`}
        />
        <StatCard
          title="Khách sạn chờ duyệt"
          value={stats.pendingHotels}
          subtitle={`Tổng số: ${stats.totalHotels} / Đang hoạt động: ${stats.activeHotels}`}
        />
        <StatCard
          title="Đơn đặt phòng hôm nay"
          value={stats.bookingsToday}
          subtitle={`Tổng số đơn: ${stats.totalBookings}`}
        />
      </div>

      {/* Alert nếu có pending items */}
      {(stats.pendingBusinesses > 0 || stats.pendingHotels > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <h3 className="font-bold text-amber-800 mb-3">Cần xử lý</h3>
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6">Xu hướng đặt phòng</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.bookingsTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="count" name="Số đơn" stroke="#6366f1" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6">Trạng thái đặt phòng</h3>
          <div className="h-72">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">Chưa có dữ liệu</div>
            )}
          </div>
        </div>
      </div>

      {/* Top 5 Hotels */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Top 5 Khách sạn theo Doanh thu</h3>
        </div>
        <Table
          columns={[
            {
              key: 'hotel',
              header: 'Khách sạn',
              render: (h: HotelRevenueSummary, i: number) => (
                <div className="font-medium text-slate-900">
                  <span className="text-slate-400 mr-3">#{i + 1}</span>
                  {h.hotelName}
                </div>
              )
            },
            {
              key: 'revenue',
              header: 'Doanh thu',
              align: 'right',
              render: (h: HotelRevenueSummary) => (
                <span className="font-bold text-emerald-600">
                  {h.revenue.toLocaleString('vi-VN')}đ
                </span>
              )
            }
          ]}
          data={stats.topHotelsByRevenue}
          keyExtractor={(h) => h.hotelId}
          emptyMessage="Chưa có doanh thu trong khoảng thời gian này"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
