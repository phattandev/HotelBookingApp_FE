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
              <span className="text-white font-bold text-base">BookNow</span>
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
              <li><Link to="/register-partner" className="hover:text-white transition">Đăng ký khách sạn</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Đăng nhập doanh nghiệp</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
