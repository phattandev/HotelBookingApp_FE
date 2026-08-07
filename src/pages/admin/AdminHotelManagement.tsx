import React, { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useConfirm, usePrompt } from '../../components/ConfirmModal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { Tabs } from '../../components/ui/Tabs';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { SidePanel } from '../../components/ui/SidePanel';
import { Badge } from '../../components/ui/Badge';

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

// ── Helper component hiển thị một dòng label/value trong modal ──
const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between gap-4 text-sm">
    <span className="text-slate-500 shrink-0">{label}</span>
    <span className="text-slate-800 font-medium text-right">{value}</span>
  </div>
);

const AdminHotelManagement: React.FC = () => {
  const confirm = useConfirm();
  const prompt = usePrompt();
  
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<HotelItem | null>(null);
  const [hotelDetail, setHotelDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (selectedHotel) {
      setLoadingDetail(true);
      api.get(`/admin/hotels/${selectedHotel.id}/detail`)
        .then(res => setHotelDetail(res.data.data))
        .catch(() => toast.error('Lỗi khi tải chi tiết khách sạn'))
        .finally(() => setLoadingDetail(false));
    } else {
      setHotelDetail(null);
    }
  }, [selectedHotel]);
  
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
      setSelectedHotel(null); // đóng modal sau khi xử lý
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

  const columns = [
    {
      key: 'hotel',
      header: 'Khách sạn',
      render: (h: HotelItem) => (
        <div>
          <p className="font-semibold text-slate-800">{h.name}</p>
          <p className="text-xs text-slate-500">MST: {h.taxCode}</p>
        </div>
      )
    },
    {
      key: 'business',
      header: 'Doanh nghiệp',
      render: (h: HotelItem) => (
        <div>
          <p className="font-medium text-slate-700">{h.businessName || 'N/A'}</p>
          <p className="text-xs text-slate-500">{h.representativeName}</p>
        </div>
      )
    },
    {
      key: 'address',
      header: 'Địa chỉ',
      render: (h: HotelItem) => (
        <p className="text-slate-600 truncate max-w-[200px]" title={h.addressLine}>{h.addressLine}</p>
      )
    },
    {
      key: 'status',
      header: 'Trạng thái',
      align: 'center' as const,
      render: (h: HotelItem) => (
        <div>
          {h.approvalStatus === 'Pending' && <Badge variant="warning">Chờ duyệt</Badge>}
          {h.approvalStatus === 'Rejected' && <div title={h.rejectionReason}><Badge variant="danger">Từ chối</Badge></div>}
          {h.approvalStatus === 'Approved' && (
            <Badge variant={h.isActive ? 'success' : 'neutral'}>
              {h.isActive ? 'Hoạt động' : 'Đình chỉ'}
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right' as const,
      render: (h: HotelItem) => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => setSelectedHotel(h)}>
            Chi tiết
          </Button>
          {h.approvalStatus === 'Pending' ? (
            <>
              <Button size="sm" variant="primary" onClick={() => handleReview(h.id, 'Approve')} isLoading={processing === h.id}>
                Duyệt
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleReview(h.id, 'Reject')} isLoading={processing === h.id}>
                Từ chối
              </Button>
            </>
          ) : h.approvalStatus === 'Approved' ? (
            <Button size="sm" variant={h.isActive ? 'danger' : 'primary'} onClick={() => handleToggleActive(h.id, h.isActive, h.name)} isLoading={processing === h.id}>
              {h.isActive ? 'Đình chỉ' : 'Mở lại'}
            </Button>
          ) : null}
        </div>
      )
    }
  ];

  return (
    <div className="w-full">
      <PageHeader
        title="Quản lý Khách sạn"
        description="Duyệt hồ sơ đăng ký và quản lý trạng thái hoạt động"
      />

      <div className="mb-6">
        <Tabs
          tabs={[
            { value: 'pending', label: 'Chờ phê duyệt' },
            { value: 'all', label: 'Tất cả khách sạn' }
          ]}
          activeTab={activeTab}
          onChange={(val) => setActiveTab(val as 'pending' | 'all')}
          variant="line"
        />
      </div>

      <div className="flex flex-wrap gap-3 mb-4 p-4 bg-white rounded-xl border border-slate-200">
        <div className="flex-1 min-w-[200px]">
          <Input 
            label="Tìm kiếm"
            type="text" 
            placeholder="Tên khách sạn, MST..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); if(activeTab === 'all') fetchHotels(); }}
          />
        </div>
        {activeTab === 'all' && (
          <div className="w-48">
            <Select 
              label="Trạng thái duyệt"
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { value: '', label: 'Tất cả' },
                { value: 'Approved', label: 'Đã duyệt' },
                { value: 'Pending', label: 'Chờ duyệt' },
                { value: 'Rejected', label: 'Từ chối' },
              ]}
            />
          </div>
        )}
      </div>

      <Table
        columns={columns}
        data={paginatedHotels}
        keyExtractor={h => h.id}
        isLoading={loading}
        emptyMessage="Không có khách sạn nào."
      />
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* ── Modal Chi tiết Khách sạn ── */}
      <SidePanel
        isOpen={!!selectedHotel}
        onClose={() => setSelectedHotel(null)}
        title="Chi tiết đơn đăng ký khách sạn"
        width="xl"
      >
        {selectedHotel && (
          <div className="space-y-6">
            {loadingDetail ? (
              <div className="flex items-center justify-center h-40 text-violet-600 font-medium">Đang tải chi tiết...</div>
            ) : hotelDetail ? (
              <>
                {/* Thông tin khách sạn */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Thông tin khách sạn</p>
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                    <Row label="Tên khách sạn" value={selectedHotel.name} />
                    <Row label="Mã số thuế" value={selectedHotel.taxCode} />
                    <Row label="Địa chỉ" value={`${hotelDetail.addressLine}, ${hotelDetail.wardName}, ${hotelDetail.provinceName}`} />
                    <Row label="Trạng thái duyệt" value={
                      selectedHotel.approvalStatus === 'Pending' ? 'Chờ phê duyệt' :
                      selectedHotel.approvalStatus === 'Approved' ? 'Đã phê duyệt' : 'Bị từ chối'
                    } />
                    {selectedHotel.approvalStatus === 'Approved' && (
                      <Row label="Hoạt động" value={selectedHotel.isActive ? 'Đang hoạt động' : 'Đã đình chỉ'} />
                    )}
                    {selectedHotel.rejectionReason && (
                      <Row label="Lý do từ chối" value={selectedHotel.rejectionReason} />
                    )}
                  </div>
                </div>

                {/* Thông tin doanh nghiệp */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Thông tin doanh nghiệp</p>
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                    <Row label="Doanh nghiệp" value={selectedHotel.businessName || '—'} />
                    <Row label="MST Doanh nghiệp" value={selectedHotel.businessTaxCode || '—'} />
                    <Row label="Người đại diện" value={selectedHotel.representativeName || '—'} />
                  </div>
                </div>

                {/* Danh sách loại phòng */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Các loại phòng ({hotelDetail.roomTypes?.length || 0})</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {hotelDetail.roomTypes?.map((rt: any, i: number) => (
                      <div key={i} className="flex gap-3 border border-slate-200 p-2 rounded-lg bg-white">
                        {rt.images?.length > 0 ? (
                          <img src={rt.images.find((img: any) => img.isPrimary)?.url || rt.images[0].url}
                            className="w-16 h-16 object-cover rounded-md" alt="room" />
                        ) : (
                          <div className="w-16 h-16 bg-slate-100 rounded-md flex items-center justify-center text-[10px] text-slate-400 text-center p-1 border border-dashed border-slate-300">Không có ảnh</div>
                        )}
                        <div className="flex-1">
                          <p className="font-bold text-sm text-slate-800 leading-tight">{rt.name}</p>
                          <p className="text-violet-600 text-sm font-bold mt-0.5">{rt.basePrice.toLocaleString('vi-VN')}₫</p>
                          <p className="text-[10px] text-slate-500 mt-1">
                            Sức chứa: {rt.maxAdults} NL, {rt.maxChildren} TE • {rt.totalRooms} phòng
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hành động nhanh nếu đang chờ duyệt */}
                {selectedHotel.approvalStatus === 'Pending' && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hành động</p>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleReview(selectedHotel.id, 'Approve')}
                        isLoading={processing === selectedHotel.id}
                        variant="primary"
                        className="flex-1"
                      >
                        Phê duyệt
                      </Button>
                      <Button
                        onClick={() => handleReview(selectedHotel.id, 'Reject')}
                        isLoading={processing === selectedHotel.id}
                        variant="danger"
                        className="flex-1"
                      >
                        Từ chối
                      </Button>
                    </div>
                  </div>
                )}
                {selectedHotel.approvalStatus === 'Approved' && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleToggleActive(selectedHotel.id, selectedHotel.isActive, selectedHotel.name)}
                      isLoading={processing === selectedHotel.id}
                      variant={selectedHotel.isActive ? 'danger' : 'primary'}
                      className="flex-1"
                    >
                      {selectedHotel.isActive ? 'Đình chỉ khách sạn' : 'Kích hoạt lại'}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-red-500 py-10">Không có dữ liệu chi tiết.</div>
            )}
          </div>
        )}
      </SidePanel>
    </div>
  );
};

export default AdminHotelManagement;
