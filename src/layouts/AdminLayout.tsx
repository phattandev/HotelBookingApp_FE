import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/admin', label: 'Thống kê tổng quát', exact: true },
  { to: '/admin/provinces', label: 'Quản lý Địa điểm' },
  { to: '/admin/amenities', label: 'Quản lý Tiện nghi' },
  { to: '/admin/hotels', label: 'Quản lý Khách sạn' },
  { to: '/admin/bookings', label: 'Quản lý Đặt Phòng' },
  { to: '/admin/accounts', label: 'Quản lý Tài khoản' },
  { to: '/admin/profile', label: 'Quản lý hồ sơ cá nhân' },
];

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 flex flex-col shrink-0">
        {/* Brand */}
        <div className="px-5 py-6 border-b border-slate-800">
          <Link to="/admin" className="block">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Hệ thống</span>
            <div className="text-white font-bold text-lg mt-0.5 leading-tight">Quản trị viên</div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const active = (item as any).exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active
                  ? 'bg-violet-600/20 text-violet-300 border-l-2 border-violet-500 pl-[10px]'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="pt-4 mt-2 border-t border-slate-800">
            <Link
              to="/"
              className="flex items-center px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition"
            >
              ← Về trang chủ
            </Link>
          </div>
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-violet-600/30 text-violet-300 flex items-center justify-center text-sm font-bold uppercase shrink-0">
            {user?.Username?.charAt(0) ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-200 text-sm font-medium truncate">{user?.Username}</p>
            <p className="text-slate-500 text-xs">Admin</p>
          </div>
          <button
            onClick={logout}
            className="text-slate-400 hover:text-red-400 transition text-xs shrink-0"
            title="Đăng xuất"
          >
            Thoát
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 h-14 flex items-center px-6 justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="text-slate-300">/</span>
            <span className="font-medium text-slate-700">
              {navItems.find(n => (n as any).exact ? location.pathname === n.to || location.pathname === n.to + '/' : location.pathname.startsWith(n.to))?.label ?? 'Admin Panel'}
            </span>
          </div>
          <span className="text-[11px] bg-violet-100 text-violet-700 font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
            Admin
          </span>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;