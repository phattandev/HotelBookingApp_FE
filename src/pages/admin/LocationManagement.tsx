import React, { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';
import SearchableSelect from '../../components/SearchableSelect';
import toast from 'react-hot-toast';
import { useConfirm } from '../../components/ConfirmModal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { Tabs } from '../../components/ui/Tabs';
import { Pagination } from '../../components/ui/Pagination';
import { SidePanel } from '../../components/ui/SidePanel';
import { Badge } from '../../components/ui/Badge';

interface Province { id: string; code: string; name: string; slug: string; type: string; isActive?: boolean; }
interface Ward { id: string; code: string; name: string; slug: string; type: string; provinceId: string; isActive?: boolean; }

const LocationManagement: React.FC = () => {
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState<'provinces' | 'wards'>('provinces');

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);

  // ---- Filter state ----
  const [searchQuery, setSearchQuery] = useState('');
  const [provTypeFilter, setProvTypeFilter] = useState('');       // "Tỉnh" | "Thành phố" | ""
  const [wardTypeFilter, setWardTypeFilter] = useState('');       // "Phường" | "Xã" | "Quận" | ...
  const [wardProvinceFilter, setWardProvinceFilter] = useState(''); // province ID

  // Province Modal State
  const [isProvModalOpen, setIsProvModalOpen] = useState(false);
  const [editingProv, setEditingProv] = useState<Province | null>(null);
  const [provCode, setProvCode] = useState('');
  const [provName, setProvName] = useState('');
  const [provType, setProvType] = useState('Tỉnh');

  // Ward Modal State
  const [isWardModalOpen, setIsWardModalOpen] = useState(false);
  const [editingWard, setEditingWard] = useState<Ward | null>(null);
  const [wardCode, setWardCode] = useState('');
  const [wardName, setWardName] = useState('');
  const [wardType, setWardType] = useState('Xã');
  const [wardProvinceId, setWardProvinceId] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => { fetchProvinces(); }, []);
  useEffect(() => { if (activeTab === 'wards') fetchWards(); }, [activeTab]);

  const fetchProvinces = async () => {
    setLoading(true);
    try {
      const res = await api.get('/provinces?includeHidden=true');
      setProvinces(res.data.data || []);
    } catch { setProvinces([]); }
    finally { setLoading(false); }
  };

  const fetchWards = async () => {
    setLoading(true);
    try {
      const res = await api.get('/wards?includeHidden=true');
      setWards(res.data.data || []);
    } catch { setWards([]); }
    finally { setLoading(false); }
  };

  // Map provinceId → province name (client-side join để fix N/A bug)
  const provinceMap = useMemo(() =>
    Object.fromEntries(provinces.map(p => [p.id, p.name])),
    [provinces]
  );

  // ---- Filtered lists ----
  const filteredProvinces = useMemo(() => {
    return provinces.filter(p => {
      const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = !provTypeFilter || p.type === provTypeFilter;
      return matchSearch && matchType;
    });
  }, [provinces, searchQuery, provTypeFilter]);

  const filteredWards = useMemo(() => {
    return wards.filter(w => {
      const matchSearch = !searchQuery || w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = !wardTypeFilter || w.type === wardTypeFilter;
      const matchProvince = !wardProvinceFilter || w.provinceId === wardProvinceFilter;
      return matchSearch && matchType && matchProvince;
    });
  }, [wards, searchQuery, wardTypeFilter, wardProvinceFilter]);

  const list = activeTab === 'provinces' ? filteredProvinces : filteredWards;
  const totalPages = Math.max(1, Math.ceil(list.length / itemsPerPage));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return list.slice(start, start + itemsPerPage);
  }, [list, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [activeTab, searchQuery, provTypeFilter, wardTypeFilter, wardProvinceFilter]);

  // ---- Province handlers ----
  const openProvModal = (prov?: Province) => {
    if (prov) {
      setEditingProv(prov); setProvCode(prov.code); setProvName(prov.name); setProvType(prov.type);
    } else {
      setEditingProv(null); setProvCode(''); setProvName(''); setProvType('Tỉnh');
    }
    setIsProvModalOpen(true);
  };

  const handleProvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = provName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ /g, '-');
    setSubmitting(true);
    try {
      if (editingProv) await api.put('/provinces', { id: editingProv.id, code: provCode, name: provName, slug, type: provType });
      else await api.post('/provinces', { code: provCode, name: provName, slug, type: provType });
      setIsProvModalOpen(false);
      fetchProvinces();
      toast.success(editingProv ? 'Cập nhật tỉnh/thành thành công!' : 'Thêm tỉnh/thành thành công!');
    } catch (err: any) { toast.error(err.response?.data?.Message || 'Thao tác thất bại'); }
    finally { setSubmitting(false); }
  };

  const handleProvDelete = async (id: string, currentIsActive: boolean) => {
    const ok = await confirm({
      title: currentIsActive ? 'Ẩn Tỉnh/Thành phố' : 'Hiện Tỉnh/Thành phố',
      message: currentIsActive ? 'Ẩn Tỉnh/Thành phố này? Các khách sạn sẽ không thể chọn địa điểm này nữa.' : 'Hiện lại Tỉnh/Thành phố này?',
      confirmText: currentIsActive ? 'Ẩn' : 'Hiện',
      variant: currentIsActive ? 'danger' : 'info',
    });
    if (!ok) return;
    try { await api.delete(`/provinces/${id}`); fetchProvinces(); toast.success('Cập nhật trạng thái thành công!'); }
    catch (err: any) { toast.error(err.response?.data?.Message || 'Thao tác thất bại'); }
  };

  // ---- Ward handlers ----
  const openWardModal = (ward?: Ward) => {
    if (ward) {
      setEditingWard(ward); setWardCode(ward.code); setWardName(ward.name); setWardType(ward.type); setWardProvinceId(ward.provinceId);
    } else {
      setEditingWard(null); setWardCode(''); setWardName(''); setWardType('Xã'); setWardProvinceId('');
    }
    setIsWardModalOpen(true);
  };

  const handleWardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wardProvinceId) { toast.error('Vui lòng chọn Tỉnh/Thành phố!'); return; }
    const slug = wardName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ /g, '-');
    setSubmitting(true);
    try {
      if (editingWard) await api.put(`/wards/${editingWard.id}`, { id: editingWard.id, code: wardCode, name: wardName, slug, type: wardType, provinceId: wardProvinceId });
      else await api.post('/wards', { code: wardCode, name: wardName, slug, type: wardType, provinceId: wardProvinceId });
      setIsWardModalOpen(false);
      fetchWards();
      toast.success(editingWard ? 'Cập nhật phường/xã thành công!' : 'Thêm phường/xã thành công!');
    } catch (err: any) { toast.error(err.response?.data?.Message || 'Thao tác thất bại'); }
    finally { setSubmitting(false); }
  };

  const handleWardDelete = async (id: string, currentIsActive: boolean) => {
    const ok = await confirm({
      title: currentIsActive ? 'Ẩn Phường/Xã' : 'Hiện Phường/Xã',
      message: currentIsActive ? 'Ẩn Phường/Xã này? Các khách sạn sẽ không thể chọn địa điểm này nữa.' : 'Hiện lại Phường/Xã này?',
      confirmText: currentIsActive ? 'Ẩn' : 'Hiện',
      variant: currentIsActive ? 'danger' : 'info',
    });
    if (!ok) return;
    try { await api.delete(`/wards/${id}`); fetchWards(); toast.success('Cập nhật trạng thái thành công!'); }
    catch (err: any) { toast.error(err.response?.data?.Message || 'Thao tác thất bại'); }
  };

  return (
    <div className="w-full">
      <PageHeader
        title="Quản lý địa điểm"
        description="Cấu hình Tỉnh/Thành phố và Phường/Xã cho hệ thống"
        action={
          <Button
            onClick={() => activeTab === 'provinces' ? openProvModal() : openWardModal()}
            variant="primary"
          >
            Thêm {activeTab === 'provinces' ? 'Tỉnh/Thành' : 'Phường/Xã'}
          </Button>
        }
      />

      {/* Tabs */}
      <div className="mb-4">
        <Tabs
          tabs={[
            { value: 'provinces', label: 'Tỉnh / Thành phố', count: provinces.length },
            { value: 'wards', label: 'Quận / Huyện / Phường / Xã', count: wards.length }
          ]}
          activeTab={activeTab}
          onChange={(val) => setActiveTab(val as 'provinces' | 'wards')}
          variant="line"
        />
      </div>

      {/* Toolbar: Search + Filters */}
      <div className="flex flex-wrap gap-3 mb-4 p-4 bg-white rounded-xl border border-slate-200 items-end">
        <div className="flex-1 min-w-[200px]">
          <Input
            label="Tìm kiếm"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'provinces' ? 'Tìm theo tên tỉnh/thành, mã...' : 'Tìm theo tên phường/xã, mã...'}
          />
        </div>

        {activeTab === 'provinces' && (
          <div className="w-44">
            <Select
              label="Phân loại"
              value={provTypeFilter}
              onChange={val => setProvTypeFilter(val)}
              options={[
                { value: '', label: 'Tất cả loại' },
                { value: 'Tỉnh', label: 'Tỉnh' },
                { value: 'Thành phố', label: 'Thành phố trực thuộc TW' },
              ]}
            />
          </div>
        )}

        {activeTab === 'wards' && (
          <>
            <div className="min-w-[180px]">
              <Select
                label="Tỉnh/Thành phố"
                value={wardProvinceFilter}
                onChange={val => setWardProvinceFilter(val)}
                options={[
                  { value: '', label: 'Tất cả tỉnh/thành' },
                  ...provinces.map(p => ({ value: p.id, label: p.name }))
                ]}
              />
            </div>
            <div className="w-44">
              <Select
                label="Phân loại"
                value={wardTypeFilter}
                onChange={val => setWardTypeFilter(val)}
                options={[
                  { value: '', label: 'Tất cả loại' },
                  { value: 'Phường', label: 'Phường' },
                  { value: 'Xã', label: 'Xã' },
                  { value: 'Quận', label: 'Quận' },
                  { value: 'Huyện', label: 'Huyện' },
                  { value: 'Thị trấn', label: 'Thị trấn' },
                  { value: 'Thành phố', label: 'Thành phố (thuộc tỉnh)' },
                ]}
              />
            </div>
          </>
        )}

        {(searchQuery || provTypeFilter || wardTypeFilter || wardProvinceFilter) && (
          <Button
            onClick={() => { setSearchQuery(''); setProvTypeFilter(''); setWardTypeFilter(''); setWardProvinceFilter(''); }}
            variant="ghost"
            className="!bg-slate-100 !text-slate-600 hover:!bg-slate-200 border-none shadow-none mb-1"
          >
            Xóa lọc
          </Button>
        )}

        {/* Removed redundant result count span */}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden w-full">
        {loading ? (
          <div className="p-10 text-center text-slate-400">Đang tải...</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-100">
              <tr>
                <th className="px-5 py-3">Mã</th>
                <th className="px-5 py-3">Tên {activeTab === 'provinces' ? 'Tỉnh/Thành' : 'Phường/Xã'}</th>
                <th className="px-5 py-3">Phân loại</th>
                {activeTab === 'wards' && <th className="px-5 py-3">Thuộc Tỉnh/Thành</th>}
                <th className="px-5 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedList.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">{item.code}</td>
                  <td className="px-5 py-3 font-semibold text-slate-800">{item.name}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral">{item.type}</Badge>
                      {item.isActive === false && (
                        <Badge variant="danger">Đã ẩn</Badge>
                      )}
                    </div>
                  </td>
                  {activeTab === 'wards' && (
                    <td className="px-5 py-3 text-slate-600">
                      {provinceMap[item.provinceId] || <span className="text-slate-300 text-xs">—</span>}
                    </td>
                  )}
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => activeTab === 'provinces' ? openProvModal(item) : openWardModal(item)}>
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant={item.isActive === false ? 'primary' : 'danger'}
                        onClick={() => activeTab === 'provinces' ? handleProvDelete(item.id, item.isActive ?? true) : handleWardDelete(item.id, item.isActive ?? true)}
                      >
                        {item.isActive === false ? 'Hiện' : 'Ẩn'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedList.length === 0 && (
                <tr><td colSpan={5} className="text-center p-10 text-slate-400">Không có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        )}

        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* PROVINCE MODAL */}
      <SidePanel
        isOpen={isProvModalOpen}
        onClose={() => setIsProvModalOpen(false)}
        title={editingProv ? 'Sửa Tỉnh/Thành' : 'Thêm Tỉnh/Thành'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsProvModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleProvSubmit} isLoading={submitting}>Lưu</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input required label="Mã vùng" value={provCode} onChange={e => setProvCode(e.target.value)} placeholder="VD: 01, HN" />
          <Input required label="Tên Tỉnh/Thành" value={provName} onChange={e => setProvName(e.target.value)} placeholder="VD: Hà Nội" />
          <Select 
            label="Phân loại" 
            value={provType} 
            onChange={val => setProvType(val)} 
            options={[
              { value: 'Tỉnh', label: 'Tỉnh' },
              { value: 'Thành phố', label: 'Thành phố trực thuộc Trung Ương' }
            ]} 
          />
        </div>
      </SidePanel>

      {/* WARD MODAL */}
      <SidePanel
        isOpen={isWardModalOpen}
        onClose={() => setIsWardModalOpen(false)}
        title={editingWard ? 'Sửa Phường/Xã' : 'Thêm Phường/Xã'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsWardModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleWardSubmit} isLoading={submitting}>Lưu</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Thuộc Tỉnh/Thành phố</label>
            <SearchableSelect
              options={provinces.map(p => ({ value: p.id, label: p.name }))}
              value={wardProvinceId}
              onChange={(val) => setWardProvinceId(val)}
              placeholder="-- Chọn Tỉnh/Thành --"
            />
          </div>
          <Input required label="Mã vùng" value={wardCode} onChange={e => setWardCode(e.target.value)} placeholder="VD: 001" />
          <Input required label="Tên Phường/Xã" value={wardName} onChange={e => setWardName(e.target.value)} placeholder="VD: Phường Ba Đình" />
          <Select 
            label="Phân loại" 
            value={wardType} 
            onChange={val => setWardType(val)} 
            options={[
              { value: 'Xã', label: 'Xã' },
              { value: 'Phường', label: 'Phường' },
              { value: 'Thị trấn', label: 'Thị trấn' },
              { value: 'Quận', label: 'Quận' },
              { value: 'Huyện', label: 'Huyện' },
              { value: 'Thành phố', label: 'Thành phố (thuộc tỉnh)' }
            ]} 
          />
        </div>
      </SidePanel>
    </div>
  );
};

export default LocationManagement;