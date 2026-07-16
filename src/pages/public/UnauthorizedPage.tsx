import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-red-950 via-slate-900 to-slate-900 flex items-center justify-center p-6">
    <div className="text-center max-w-md">
      <div className="relative mb-8">
        <p className="text-[160px] font-black text-red-900/60 leading-none select-none">403</p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-red-600/20 backdrop-blur-sm border border-red-500/30 flex items-center justify-center">
            <span className="text-4xl">🚫</span>
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-white mb-3">Truy cập bị từ chối</h1>
      <p className="text-slate-400 text-sm mb-8 leading-relaxed">
        Bạn không có quyền truy cập khu vực này. Vui lòng đăng nhập bằng tài khoản có quyền hạn phù hợp.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/login"
          className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition text-sm"
        >
          Đăng nhập lại
        </Link>
        <Link
          to="/"
          className="px-6 py-3 bg-slate-700 text-slate-200 font-bold rounded-xl hover:bg-slate-600 transition text-sm"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  </div>
);

export default UnauthorizedPage;
