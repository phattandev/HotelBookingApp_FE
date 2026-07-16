import React, { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useConfirm, usePrompt } from '../../components/ConfirmModal';

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

  return (
    <div>
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-end gap-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Tìm theo tên, MST, email..."
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 w-64"
          />
        </div>
      </div>

      {filteredBusinesses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="text-slate-500 font-medium">Không có doanh nghiệp chờ duyệt</p>
          <p className="text-slate-400 text-sm mt-1">Tất cả hồ sơ đăng ký đã được xử lý</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 border-b border-slate-100">
                <th className="text-left px-5 py-3 font-medium">Doanh nghiệp</th>
                <th className="text-left px-5 py-3 font-medium">Người đại diện</th>
                <th className="text-center px-5 py-3 font-medium">Tài khoản</th>
                <th className="text-center px-5 py-3 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedBusinesses.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-slate-900">{b.businessName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">MST: {b.taxCode}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-700">{b.representativeName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{b.position}</p>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <p className="text-sm font-medium text-slate-900">{b.ownerUsername}</p>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => setSelectedBusiness(b)}
                      className="text-xs px-3 py-1.5 font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-md transition"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-xs text-slate-500">
                Trang {currentPage} / {totalPages}
              </span>
              <div className="flex gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-md disabled:opacity-50 transition"
                >
                  Trước
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-md disabled:opacity-50 transition"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Chi tiết */}
      {selectedBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-slate-900">Hồ sơ đăng ký Doanh nghiệp</h2>
              <button onClick={() => setSelectedBusiness(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">
                &times;
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
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

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
              <button
                onClick={() => handleReview(selectedBusiness.id, 'Reject')}
                disabled={processing === selectedBusiness.id}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-lg transition disabled:opacity-50"
              >
                Từ chối
              </button>
              <button
                onClick={() => handleReview(selectedBusiness.id, 'Approve')}
                disabled={processing === selectedBusiness.id}
                className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition disabled:opacity-50"
              >
                {processing === selectedBusiness.id ? 'Đang xử lý...' : 'Phê duyệt Doanh nghiệp'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessApproval;
