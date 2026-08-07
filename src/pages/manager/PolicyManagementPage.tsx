import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import CancellationPolicyPage from './CancellationPolicyPage';
import DepositPolicyPage from './DepositPolicyPage';
import { PageHeader } from '../../components/ui/PageHeader';
import { Tabs } from '../../components/ui/Tabs';

const PolicyManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cancellation' | 'deposit'>('cancellation');
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    api.get('/manager/hotel')
      .then(res => setIsPending(res.data.data?.approvalStatus === 'Pending'))
      .catch(() => {});
  }, []);

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Quản Lý Chính Sách"
        description="Thiết lập các quy định về đặt cọc và hủy phòng cho khách sạn."
      />

      {isPending && (
        <div className="p-4 rounded-xl text-sm bg-amber-50 text-amber-700 border border-amber-100">
          <span className="font-medium">Khách sạn đang chờ duyệt. Bạn không thể thiết lập chính sách lúc này.</span>
        </div>
      )}

      <Tabs
        tabs={[
          { value: 'cancellation', label: 'Chính sách hủy phòng' },
          { value: 'deposit', label: 'Chính sách đặt cọc' }
        ]}
        activeTab={activeTab}
        onChange={(val) => setActiveTab(val as 'cancellation' | 'deposit')}
      />

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        {activeTab === 'cancellation' && <CancellationPolicyPage isPending={isPending} />}
        {activeTab === 'deposit' && <DepositPolicyPage isPending={isPending} />}
      </div>
    </div>
  );
};

export default PolicyManagementPage;
