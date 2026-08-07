import React from 'react';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (item: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  emptyMessage?: string;
  isLoading?: boolean;
}

function Table<T>({ 
  columns, 
  data, 
  keyExtractor, 
  emptyMessage = 'Không có dữ liệu',
  isLoading = false
}: TableProps<T>) {
  
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-xl border border-slate-200 p-8 flex justify-center items-center">
        <span className="text-sm text-slate-500">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center justify-center text-slate-500">
        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
           {/* SVG Empty icon */}
           <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
           </svg>
        </div>
        <p className="text-sm font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            {columns.map((col, idx) => (
              <th 
                key={`col-${idx}-${col.key}`} 
                className={`px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item, rowIdx) => (
            <tr key={keyExtractor(item, rowIdx)} className="hover:bg-slate-50 transition-colors group">
              {columns.map((col) => (
                <td 
                  key={`${rowIdx}-${col.key}`} 
                  className={`px-5 py-3 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
                >
                  {col.render ? col.render(item, rowIdx) : (item as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { Table };
