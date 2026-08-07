import React from 'react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, className = '' }) => {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50 rounded-b-xl ${className}`}>
      <span className="text-xs font-medium text-slate-500">
        Trang <span className="text-slate-900 font-semibold">{currentPage}</span> / {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
        >
          Trước
        </button>
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
        >
          Sau
        </button>
      </div>
    </div>
  );
};

export { Pagination };
