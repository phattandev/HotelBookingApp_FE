import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Trang chủ' },
    { to: '/hotels', label: 'Khám phá' },
    { to: '/about', label: 'Giới thiệu' },
    { to: '/contact', label: 'Liên hệ' },
    { to: '/register-partner', label: 'Đăng ký đối tác' },
  ];

  const roleLink = () => {
    if (!user) return null;
    const role = user.Role.toLowerCase();
    if (role === 'admin') return { to: '/admin', label: 'Admin', color: 'bg-violet-100 text-violet-700' };
    if (role === 'partner') return { to: '/partner', label: 'Partner', color: 'bg-sky-100 text-sky-700' };
    if (role === 'manager') return { to: '/manager', label: 'Manager', color: 'bg-emerald-100 text-emerald-700' };
    return null;
  };

  const panel = roleLink();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="font-bold text-slate-900 text-lg tracking-tight">BookNow</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.to
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <>
              {panel && (
                <Link
                  to={panel.to}
                  className={`hidden sm:block text-xs font-semibold px-2.5 py-1 rounded-md ${panel.color} transition hover:opacity-80`}
                >
                  {panel.label} Panel
                </Link>
              )}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold uppercase">
                    {user.Username.charAt(0)}
                  </div>
                  <span className="text-sm text-slate-700 font-medium hidden sm:block">{user.Username}</span>
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-lg py-1 z-50">
                    <Link
                      to={user.Role.toLowerCase() === 'customer' ? '/profile' : `/${user.Role.toLowerCase()}/profile`}
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition font-medium"
                    >
                      Hồ sơ của tôi
                    </Link>
                    {user.Role.toLowerCase() === 'customer' && (
                      <Link
                        to="/my-bookings"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition font-medium"
                      >
                        Đơn đặt phòng
                      </Link>
                    )}
                    <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition font-medium border-t border-slate-100">
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Đăng nhập
            </button>
          )}

          {/* Hamburger button for mobile */}
          <button 
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg ml-1"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileNavOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileNavOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-xl py-4 px-4 flex flex-col gap-2 z-40">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileNavOpen(false)}
              className={`px-4 py-3 rounded-xl text-base font-medium transition-colors ${location.pathname === link.to
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-700 hover:bg-slate-50'
                }`}
            >
              {link.label}
            </Link>
          ))}
          {!isAuthenticated && (
            <button
              onClick={() => { setMobileNavOpen(false); navigate('/login'); }}
              className="mt-2 w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition"
            >
              Đăng nhập
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
