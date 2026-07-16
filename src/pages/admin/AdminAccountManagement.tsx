import React, { useState } from 'react';
import AdminAccountList from './AdminAccountList';
import BusinessApproval from './BusinessApproval';

const AdminAccountManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'accounts' | 'business'>('accounts');

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Quản lý tài khoản & Doanh nghiệp</h1>
        <p className="text-sm text-slate-500 mt-1">
          Quản lý danh sách người dùng và xét duyệt đăng ký doanh nghiệp mới.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100/50 p-1 rounded-lg border border-slate-200/60 w-max">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'accounts'
              ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          Danh sách tài khoản
        </button>
        <button
          onClick={() => setActiveTab('business')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'business'
              ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          Duyệt doanh nghiệp
        </button>
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {activeTab === 'accounts' && <AdminAccountList />}
        {activeTab === 'business' && <BusinessApproval />}
      </div>
    </div>
  );
};

export default AdminAccountManagement;
