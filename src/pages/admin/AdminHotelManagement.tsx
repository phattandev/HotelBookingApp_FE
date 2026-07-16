import React, { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useConfirm, usePrompt } from '../../components/ConfirmModal';

interface HotelItem {
  id: string;
  name: string;
  taxCode: string;
  addressLine: string;
  approvalStatus: string;
  isActive: boolean;
  businessName?: string;
  businessTaxCode?: string;
  representativeName?: string;
  rejectionReason?: string;
}

const AdminHotelManagement: React.FC = () => {
  const confirm = useConfirm();
  const prompt = usePrompt();
  
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchHotels = async () => {
    try {
      setLoading(true);
      if (activeTab === 'pending') {
        const res = await api.get('/hotels/pending');
        setHotels(res.data.data || []);
      } else {
        const params: any = { page: 1, pageSize: 1000 };
        if (statusFilter) params.status = statusFilter;
        if (searchQuery) params.search = searchQuery;
        const res = await api.get('/admin/hotels', { params });
        setHotels(res.data.data || []);
      }
    } catch {
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    setCurrentPage(1);
    fetchHotels(); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, statusFilter]);

  // Client search for pending tab
  const filteredHotels = useMemo(() => {
    if (activeTab === 'all') return hotels;
    if (!searchQuery.trim()) return hotels;
    const q = searchQuery.toLowerCase();
    return hotels.filter(h =>
      h.name.toLowerCase().includes(q) ||
      h.addressLine.toLowerCase().includes(q) ||
      (h.businessName || '').toLowerCase().includes(q) ||
      (h.taxCode || '').toLowerCase().includes(q)
    );
  }, [hotels, searchQuery, activeTab]);

  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);
  const paginatedHotels = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredHotels.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredHotels, currentPage]);

  const handleReview = async (id: string, action: 'Approve' | 'Reject') => {
    let rejectionReason = null;
    
    if (action === 'Reject') {
      const reason = await prompt({
        title: 'Từ chối khách sạn',
        message: 'Vui lòng nhập lý do từ chối để thông báo cho đối tác:',
        confirmText: 'Từ chối',
        variant: 'danger',
        promptPlaceholder: 'VD: Thông tin không hợp lệ...',
      });
      if (!reason) return;
      rejectionReason = reason;
    } else {
      const ok = await confirm({
        title: 'Phê duyệt khách sạn',
        message: 'Bạn có chắc muốn phê duyệt khách sạn này?',
        confirmText: 'Phê duyệt',
        variant: 'info',
      });
      if (!ok) return;
    }

    setProcessing(id);
    try {
      await api.put(`/hotels/${id}/review`, { action, rejectionReason });
      toast.success(`Đã ${action === 'Approve' ? 'phê duyệt' : 'từ chối'} khách sạn thành công!`);
      fetchHotels();
    } catch {
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setProcessing(null);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean, name: string) => {
    const actionName = currentStatus ? 'đình chỉ' : 'kích hoạt';
    const ok = await confirm({
      title: `${currentStatus ? 'Đình chỉ' : 'Kích hoạt'} khách sạn`,
      message: `Bạn có chắc muốn ${actionName} khách sạn "${name}"?`,
      confirmText: currentStatus ? 'Đình chỉ' : 'Kích hoạt',
      variant: currentStatus ? 'danger' : 'info',
    });
    if (!ok) return;

    setProcessing(id);
    try {
      await api.patch(`/admin/hotels/${id}/toggle-active`);
      toast.success(`Đã ${actionName} khách sạn thành công!`);
      fetchHotels();
    } catch {
      toast.error('Đã xảy ra lỗi.');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản lý Khách sạn</h1>
          <p className="text-sm text-slate-500 mt-1">Duyệt hồ sơ đăng ký và quản lý trạng thái hoạt động</p>
        </div>
      </div>

      <div className="flex gap-4 mb-4 border-b border-slate-200">
        <button onClick={() => setActiveTab('pending')} className={`pb-2 px-1 text-sm font-semibold transition-colors ${activeTab === 'pending' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-slate-500 hover:text-slate-800'}`}>
          Chờ phê duyệt
        </button>
        <button onClick={() => setActiveTab('all')} className={`pb-2 px-1 text-sm font-semibold transition-colors ${activeTab === 'all' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-slate-500 hover:text-slate-800'}`}>
          Tất cả khách sạn
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4 p-4 bg-white rounded-xl border border-slate-200">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-slate-500 mb-1">Tìm kiếm</label>
          <input 
            type="text" 
            placeholder="Tên khách sạn, MST..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); if(activeTab === 'all') fetchHotels(); }}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500"
          />
        </div>
        {activeTab === 'all' && (
          <div className="w-48">
            <label className="block text-xs font-medium text-slate-500 mb-1">Trạng thái duyệt</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 bg-white"
            >
              <option value="">Tất cả</option>
              <option value="Approved">Đã duyệt</option>
              <option value="Pending">Chờ duyệt</option>
              <option value="Rejected">Từ chối</option>
            </select>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Đang tải...</div>
        ) : paginatedHotels.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Không có khách sạn nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Khách sạn</th>
                  <th className="px-4 py-3">Doanh nghiệp</th>
                  <th className="px-4 py-3">Địa chỉ</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedHotels.map(h => (
                  <tr key={h.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">{h.name}</p>
                      <p className="text-xs text-slate-500">MST: {h.taxCode}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700">{h.businessName || 'N/A'}</p>
                      <p className="text-xs text-slate-500">{h.representativeName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-600 truncate max-w-[200px]" title={h.addressLine}>{h.addressLine}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {h.approvalStatus === 'Pending' && <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">Chờ duyệt</span>}
                      {h.approvalStatus === 'Rejected' && <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium" title={h.rejectionReason}>Từ chối</span>}
                      {h.approvalStatus === 'Approved' && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${h.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {h.isActive ? 'Hoạt động' : 'Đình chỉ'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {h.approvalStatus === 'Pending' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleReview(h.id, 'Approve')}
                            disabled={processing === h.id}
                            className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded font-medium transition"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleReview(h.id, 'Reject')}
                            disabled={processing === h.id}
                            className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded font-medium transition"
                          >
                            Từ chối
                          </button>
                        </div>
                      ) : h.approvalStatus === 'Approved' ? (
                        <button
                          onClick={() => handleToggleActive(h.id, h.isActive, h.name)}
                          disabled={processing === h.id}
                          className={`px-3 py-1.5 rounded font-medium transition ${h.isActive ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}
                        >
                          {h.isActive ? 'Đình chỉ' : 'Mở lại'}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Trang {currentPage} / {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-slate-200 text-sm disabled:opacity-50 hover:bg-slate-50"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-slate-200 text-sm disabled:opacity-50 hover:bg-slate-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHotelManagement;
