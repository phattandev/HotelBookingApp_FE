import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
    <div className="text-center max-w-md">
      {/* Số 404 */}
      <div className="relative mb-8">
        <p className="text-[160px] font-black text-slate-700 leading-none select-none">404</p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-indigo-600/20 backdrop-blur-sm border border-indigo-500/30 flex items-center justify-center">
            <span className="text-4xl">🔍</span>
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-white mb-3">Trang không tồn tại</h1>
      <p className="text-slate-400 text-sm mb-8 leading-relaxed">
        Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/"
          className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition text-sm"
        >
          ← Về trang chủ
        </Link>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 bg-slate-700 text-slate-200 font-bold rounded-xl hover:bg-slate-600 transition text-sm"
        >
          Quay lại trang trước
        </button>
      </div>
    </div>
  </div>
);

export default NotFoundPage;
