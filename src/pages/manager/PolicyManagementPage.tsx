import React, { useState } from 'react';
import CancellationPolicyPage from './CancellationPolicyPage';
import DepositPolicyPage from './DepositPolicyPage';

const PolicyManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cancellation' | 'deposit'>('cancellation');

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Quản Lý Chính Sách</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Thiết lập các quy định về đặt cọc và hủy phòng cho khách sạn.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100/50 p-1 rounded-lg border border-slate-200/60 w-max">
        <button
          onClick={() => setActiveTab('cancellation')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'cancellation'
              ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          Chính sách hủy phòng
        </button>
        <button
          onClick={() => setActiveTab('deposit')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'deposit'
              ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          Chính sách đặt cọc
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        {activeTab === 'cancellation' && <CancellationPolicyPage />}
        {activeTab === 'deposit' && <DepositPolicyPage />}
      </div>
    </div>
  );
};

export default PolicyManagementPage;
