import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  HomeModernIcon,
  UsersIcon,
  CalendarDaysIcon,
  PlusCircleIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface HotelSummary {
  id: string;
  name: string;
  approvalStatus: string;
  isActive: boolean;
  starRating?: number;
}

const statusBadge = (status: string, isActive: boolean) => {
  if (status === 'Approved' && isActive)
    return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700">Đang hoạt động</span>;
  if (status === 'Approved' && !isActive)
    return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-600">Tạm dừng</span>;
  if (status === 'Pending')
    return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-700">Chờ duyệt</span>;
  return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700">Bị từ chối</span>;
};

const PartnerDashboard: React.FC = () => {
  const [hotels, setHotels] = useState<HotelSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/hotels/my')
      .then(res => setHotels(res.data.data || []))
      .catch(() => setHotels([]))
      .finally(() => setLoading(false));
  }, []);

  const activeHotels = hotels.filter(h => h.isActive && h.approvalStatus === 'Approved').length;
  const pendingHotels = hotels.filter(h => h.approvalStatus === 'Pending').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bảng điều khiển</h1>
          <p className="text-slate-500 mt-1 text-sm">Tổng quan hoạt động doanh nghiệp của bạn</p>
        </div>
        <a
          href="/partner/hotels"
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition"
        >
          <PlusCircleIcon className="w-4 h-4" />
          Đăng ký khách sạn mới
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: 'Tổng khách sạn', value: hotels.length, icon: <HomeModernIcon className="w-6 h-6 text-indigo-600" />, bg: 'bg-indigo-50' },
          { label: 'Đang hoạt động', value: activeHotels, icon: <CalendarDaysIcon className="w-6 h-6 text-emerald-600" />, bg: 'bg-emerald-50' },
          { label: 'Chờ phê duyệt', value: pendingHotels, icon: <UsersIcon className="w-6 h-6 text-amber-600" />, bg: 'bg-amber-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${s.bg}`}>{s.icon}</div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Hotel list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Danh sách khách sạn</h3>
          <a href="/partner/hotels" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            Xem tất cả <ChevronRightIcon className="w-4 h-4" />
          </a>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Đang tải...</div>
        ) : hotels.length === 0 ? (
          <div className="p-12 text-center">
            <HomeModernIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Chưa có khách sạn nào</p>
            <p className="text-slate-400 text-sm mt-1">Đăng ký khách sạn đầu tiên của bạn để bắt đầu</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {hotels.slice(0, 8).map(hotel => (
              <div key={hotel.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition">
                <div>
                  <p className="font-medium text-slate-900">{hotel.name}</p>
                  {hotel.starRating && (
                    <p className="text-xs text-amber-500 mt-0.5">{'★'.repeat(hotel.starRating)}</p>
                  )}
                </div>
                {statusBadge(hotel.approvalStatus, hotel.isActive)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { href: '/partner/staff', label: 'Quản lý nhân viên', desc: 'Xem và quản lý danh sách nhân viên' },
          { href: '/partner/assignments', label: 'Phân công nhân viên', desc: 'Giao vai trò quản lý khách sạn' },
        ].map(link => (
          <a
            key={link.href}
            href={link.href}
            className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition group"
          >
            <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition">{link.label} →</p>
            <p className="text-sm text-slate-500 mt-1">{link.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
};

export default PartnerDashboard;
