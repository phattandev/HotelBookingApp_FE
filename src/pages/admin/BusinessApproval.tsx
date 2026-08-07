import React, { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useConfirm, usePrompt } from '../../components/ConfirmModal';
import { PageHeader } from '../../components/ui/PageHeader';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { SidePanel } from '../../components/ui/SidePanel';

interface PendingBusiness {
  id: string;
  ownerId: string;
  businessName: string;
  taxCode: string;
  businessAddress: string;
  representativeName: string;
  position: string;
  ownerEmail: string;
  ownerUsername: string;
  ownerPhone: string;
}

const BusinessApproval: React.FC = () => {
  const confirm = useConfirm();
  const prompt = usePrompt();
  const [businesses, setBusinesses] = useState<PendingBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<PendingBusiness | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await api.get('/adminbusiness/pending'); // Giao tiếp với AdminBusinessController
      setBusinesses(res.data.data || []);
    } catch {
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleReview = async (id: string, action: 'Approve' | 'Reject') => {
    let rejectionReason = null;
    
    if (action === 'Reject') {
      const reason = await prompt({
        title: 'Từ chối Doanh nghiệp',
        message: 'Vui lòng nhập lý do từ chối để thông báo cho đối tác:',
        confirmText: 'Từ chối',
        variant: 'danger',
        promptPlaceholder: 'VD: Thông tin không hợp lệ, thiếu giấy tờ...',
      });
      if (!reason) return;
      rejectionReason = reason;
    } else {
      const ok = await confirm({
        title: 'Phê duyệt Doanh nghiệp',
        message: 'Bạn có chắc muốn phê duyệt doanh nghiệp này?',
        confirmText: 'Phê duyệt',
        variant: 'info',
      });
      if (!ok) return;
    }

    setProcessing(id);
    try {
      await api.put(`/adminbusiness/${id}/review`, { action, rejectionReason });
      toast.success(`Đã ${action === 'Approve' ? 'phê duyệt' : 'từ chối'} doanh nghiệp thành công!`);
      setSelectedBusiness(null);
      await fetchPending();
    } catch {
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setProcessing(null);
    }
  };

  // Filtered + Paginated
  const filteredBusinesses = useMemo(() => {
    if (!searchQuery.trim()) return businesses;
    const q = searchQuery.toLowerCase();
    return businesses.filter(b =>
      b.businessName.toLowerCase().includes(q) ||
      b.taxCode.toLowerCase().includes(q) ||
      b.ownerEmail.toLowerCase().includes(q) ||
      b.representativeName.toLowerCase().includes(q)
    );
  }, [businesses, searchQuery]);

  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);
  const paginatedBusinesses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBusinesses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBusinesses, currentPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Đang tải danh sách...
      </div>
    );
  }

  const columns = [
    {
      key: 'business',
      header: 'Doanh nghiệp',
      render: (b: PendingBusiness) => (
        <div>
          <p className="font-semibold text-slate-900">{b.businessName}</p>
          <p className="text-xs text-slate-500 mt-0.5">MST: {b.taxCode}</p>
        </div>
      )
    },
    {
      key: 'representative',
      header: 'Người đại diện',
      render: (b: PendingBusiness) => (
        <div>
          <p className="font-medium text-slate-700">{b.representativeName}</p>
          <p className="text-xs text-slate-500 mt-0.5">{b.position}</p>
        </div>
      )
    },
    {
      key: 'account',
      header: 'Tài khoản',
      align: 'center' as const,
      render: (b: PendingBusiness) => (
        <p className="text-sm font-medium text-slate-900">{b.ownerUsername}</p>
      )
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'center' as const,
      render: (b: PendingBusiness) => (
        <Button size="sm" variant="outline" onClick={() => setSelectedBusiness(b)}>
          Xem chi tiết
        </Button>
      )
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Phê duyệt Doanh nghiệp"
        description="Duyệt hồ sơ đăng ký doanh nghiệp mới từ Đối tác"
      />
      
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-end gap-3">
        <div className="w-64">
          <Input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Tìm theo tên, MST, email..."
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={paginatedBusinesses}
        keyExtractor={b => b.id}
        isLoading={loading}
        emptyMessage="Không có doanh nghiệp chờ duyệt. Tất cả hồ sơ đăng ký đã được xử lý."
      />
      
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Modal Chi tiết */}
      <SidePanel
        isOpen={!!selectedBusiness}
        onClose={() => setSelectedBusiness(null)}
        title="Hồ sơ đăng ký Doanh nghiệp"
        width="lg"
        footer={
          selectedBusiness ? (
            <>
              <Button
                variant="danger"
                onClick={() => handleReview(selectedBusiness.id, 'Reject')}
                disabled={processing === selectedBusiness.id}
              >
                Từ chối
              </Button>
              <Button
                variant="primary"
                onClick={() => handleReview(selectedBusiness.id, 'Approve')}
                isLoading={processing === selectedBusiness.id}
              >
                Phê duyệt Doanh nghiệp
              </Button>
            </>
          ) : null
        }
      >
        {selectedBusiness && (
          <div className="space-y-6">
            {/* Thông tin Doanh nghiệp */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Pháp nhân Doanh nghiệp</h3>
              <div className="bg-violet-50/50 rounded-xl p-4 border border-violet-100 grid grid-cols-2 gap-4 text-sm">
                <div className="col-span-2">
                  <p className="text-slate-500 mb-1">Tên Doanh nghiệp</p>
                  <p className="font-bold text-violet-900 text-base">{selectedBusiness.businessName}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Mã số thuế</p>
                  <p className="font-medium text-slate-900">{selectedBusiness.taxCode}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Người đại diện pháp luật</p>
                  <p className="font-medium text-slate-900">{selectedBusiness.representativeName} ({selectedBusiness.position})</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-500 mb-1">Địa chỉ trụ sở</p>
                  <p className="font-medium text-slate-900">{selectedBusiness.businessAddress}</p>
                </div>
              </div>
            </div>

            {/* Thông tin Tài khoản Chủ */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Thông tin Tài khoản Quản trị (Chủ)</h3>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Username</p>
                  <p className="font-medium text-slate-900">{selectedBusiness.ownerUsername}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Email</p>
                  <p className="font-medium text-slate-900">{selectedBusiness.ownerEmail}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Số điện thoại</p>
                  <p className="font-medium text-slate-900">{selectedBusiness.ownerPhone || 'Chưa cung cấp'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidePanel>
    </div>
  );
};

export default BusinessApproval;
