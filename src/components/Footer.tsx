import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </div>
              <span className="text-white font-bold text-base">StayNow</span>
            </div>
            <p className="text-sm leading-relaxed">
              Nền tảng kết nối khách sạn và du khách trên toàn Việt Nam. Đơn giản, nhanh chóng và tin cậy.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Khám phá</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition">Trang chủ</Link></li>
              <li><Link to="/hotels" className="hover:text-white transition">Danh sách khách sạn</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Đăng ký / Đăng nhập</Link></li>
            </ul>
          </div>

          {/* Partner */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Đối tác</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white transition">Đăng ký khách sạn</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Đăng nhập doanh nghiệp</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} StayNow Marketplace. Bảo lưu mọi quyền.
        </div>
      </div>
    </footer>
  );
};

export default Footer;