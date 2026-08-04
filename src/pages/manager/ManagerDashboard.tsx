import React from 'react';
import { useManagerDashboard } from '../../hooks/useManagerDashboard';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import {
  BarChart,
  Bar,
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

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#ef4444'];

const statusMap: Record<string, { label: string; color: string }> = {
  Pending:   { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-700' },
  Confirmed: { label: 'Đã xác nhận',  color: 'bg-blue-100 text-blue-700' },
  Completed: { label: 'Hoàn thành',   color: 'bg-emerald-100 text-emerald-700' },
  Cancelled: { label: 'Đã hủy',       color: 'bg-red-100 text-red-700' },
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

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

const ManagerDashboard: React.FC = () => {
  const { stats, recentBookings, loading, dateRange, handleDateChange } = useManagerDashboard();

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
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
        title="Tổng quan khách sạn"
        description="Theo dõi hoạt động kinh doanh hàng ngày"
        action={
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            <input 
              type="date" 
              value={dateRange.fromDate}
              onChange={(e) => handleDateChange(e.target.value, dateRange.toDate)}
              className="text-sm border-none focus:ring-0 text-slate-700 bg-transparent"
            />
            <span className="text-slate-400">-</span>
            <input 
              type="date" 
              value={dateRange.toDate}
              onChange={(e) => handleDateChange(dateRange.fromDate, e.target.value)}
              className="text-sm border-none focus:ring-0 text-slate-700 bg-transparent"
            />
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Doanh thu"
          value={stats.totalRevenue.toLocaleString('vi-VN') + ' VNĐ'}
          subtitle={`Tiền cọc: ${stats.totalDepositCollected.toLocaleString('vi-VN')} VNĐ`}
        />
        <StatCard
          title="Công suất phòng"
          value={(stats.occupancyToday * 100).toFixed(1) + '%'}
          subtitle={`Tổng số phòng: ${stats.totalRooms}`}
        />
        <StatCard
          title="Giao dịch hôm nay"
          value={`${stats.checkInsToday} nhận / ${stats.checkOutsToday} trả`}
          subtitle="Số phòng nhận/trả trong ngày"
        />
        <StatCard
          title="Đơn chờ duyệt"
          value={stats.pendingBookings}
          subtitle="Cần xác nhận sớm"
        />
      </div>

      {/* Alert nếu có đơn chờ duyệt */}
      {stats.pendingBookings > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-amber-800">Có {stats.pendingBookings} đơn đặt phòng đang chờ bạn xác nhận</h3>
            <p className="text-amber-700 text-sm mt-1">Hãy kiểm tra và xác nhận sớm để không làm lỡ chuyến đi của khách hàng.</p>
          </div>
          <a href="/manager/bookings" className="px-4 py-2 bg-amber-600 text-white text-sm font-bold rounded-xl hover:bg-amber-700 transition">
            Xem ngay
          </a>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        
        {/* Doanh thu 6 tháng */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6">Doanh thu 6 tháng qua</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis 
                  tickFormatter={(val) => `${val / 1000000}M`} 
                  tick={{fontSize: 12}} tickLine={false} axisLine={false} 
                />
                <Tooltip 
                  formatter={(val: any) => [`${val.toLocaleString('vi-VN')}đ`, 'Doanh thu']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trạng thái đơn */}
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

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">Đặt phòng gần đây</h3>
        </div>
        <Table
          columns={[
            {
              key: 'customer',
              header: 'Khách hàng',
              render: (b) => <span className="font-medium text-slate-900">{b.guestName}</span>
            },
            {
              key: 'checkIn',
              header: 'Check-in',
              render: (b) => <span className="text-slate-600">{formatDate(b.checkInDate)}</span>
            },
            {
              key: 'checkOut',
              header: 'Check-out',
              render: (b) => <span className="text-slate-600">{formatDate(b.checkOutDate)}</span>
            },
            {
              key: 'rooms',
              header: 'Phòng',
              render: (b) => <span className="text-slate-600">{b.numRooms} phòng</span>
            },
            {
              key: 'total',
              header: 'Tổng tiền',
              render: (b) => <span className="font-bold text-emerald-600">{b.totalPrice.toLocaleString('vi-VN')}đ</span>
            },
            {
              key: 'status',
              header: 'Trạng thái',
              render: (b) => {
                const s = statusMap[b.status] || { label: b.status, color: 'neutral' };
                let v: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'violet' = 'neutral';
                if (b.status === 'Pending') v = 'warning';
                else if (b.status === 'Confirmed') v = 'info';
                else if (b.status === 'Completed') v = 'success';
                else if (b.status === 'Cancelled') v = 'danger';
                return <Badge variant={v}>{s.label}</Badge>;
              }
            }
          ]}
          data={recentBookings.slice(0, 10)}
          keyExtractor={(b) => b.id}
          emptyMessage="Chưa có đặt phòng nào"
        />
      </div>
    </div>
  );
};

export default ManagerDashboard;
