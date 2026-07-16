import React, { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';
import SearchableSelect from '../../components/SearchableSelect';
import toast from 'react-hot-toast';
import { useConfirm } from '../../components/ConfirmModal';

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

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500';
  const selectCls = 'border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white';

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản lý địa điểm</h1>
          <p className="text-sm text-slate-500 mt-1">Cấu hình Tỉnh/Thành phố và Phường/Xã cho hệ thống</p>
        </div>
        <button
          onClick={() => activeTab === 'provinces' ? openProvModal() : openWardModal()}
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition"
        >
          Thêm {activeTab === 'provinces' ? 'Tỉnh/Thành' : 'Phường/Xã'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b border-slate-200">
        <button onClick={() => setActiveTab('provinces')} className={`pb-2 px-1 text-sm font-semibold transition-colors ${activeTab === 'provinces' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-slate-500 hover:text-slate-800'}`}>
          Tỉnh / Thành phố ({provinces.length})
        </button>
        <button onClick={() => setActiveTab('wards')} className={`pb-2 px-1 text-sm font-semibold transition-colors ${activeTab === 'wards' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-slate-500 hover:text-slate-800'}`}>
          Quận / Huyện / Phường / Xã ({wards.length})
        </button>
      </div>

      {/* Toolbar: Search + Filters */}
      <div className="flex flex-wrap gap-3 mb-4 p-4 bg-white rounded-xl border border-slate-200">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={activeTab === 'provinces' ? 'Tìm theo tên tỉnh/thành, mã...' : 'Tìm theo tên phường/xã, mã...'}
          className="flex-1 min-w-[200px] border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />

        {activeTab === 'provinces' && (
          <select value={provTypeFilter} onChange={e => setProvTypeFilter(e.target.value)} className={selectCls}>
            <option value="">Tất cả loại</option>
            <option value="Tỉnh">Tỉnh</option>
            <option value="Thành phố">Thành phố trực thuộc TW</option>
          </select>
        )}

        {activeTab === 'wards' && (
          <>
            <select value={wardProvinceFilter} onChange={e => setWardProvinceFilter(e.target.value)} className={`${selectCls} min-w-[180px]`}>
              <option value="">Tất cả tỉnh/thành</option>
              {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={wardTypeFilter} onChange={e => setWardTypeFilter(e.target.value)} className={selectCls}>
              <option value="">Tất cả loại</option>
              <option value="Phường">Phường</option>
              <option value="Xã">Xã</option>
              <option value="Quận">Quận</option>
              <option value="Huyện">Huyện</option>
              <option value="Thị trấn">Thị trấn</option>
              <option value="Thành phố">Thành phố (thuộc tỉnh)</option>
            </select>
          </>
        )}

        {(searchQuery || provTypeFilter || wardTypeFilter || wardProvinceFilter) && (
          <button onClick={() => { setSearchQuery(''); setProvTypeFilter(''); setWardTypeFilter(''); setWardProvinceFilter(''); }}
            className="px-3 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
            Xóa lọc
          </button>
        )}

        <span className="px-3 py-2 text-xs text-slate-500 font-medium self-center">
          {list.length} kết quả
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden w-full">
        {loading ? (
          <div className="p-10 text-center text-slate-400">Đang tải...</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
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
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                        {item.type}
                      </span>
                      {item.isActive === false && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-600">
                          Đã ẩn
                        </span>
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
                      <button
                        onClick={() => activeTab === 'provinces' ? openProvModal(item) : openWardModal(item)}
                        className="px-3 py-1.5 text-xs font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-lg transition">
                        Sửa
                      </button>
                      <button
                        onClick={() => activeTab === 'provinces' ? handleProvDelete(item.id, item.isActive ?? true) : handleWardDelete(item.id, item.isActive ?? true)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${item.isActive === false ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' : 'text-red-600 bg-red-50 hover:bg-red-100'}`}>
                        {item.isActive === false ? 'Hiện' : 'Ẩn'}
                      </button>
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

        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t flex justify-between items-center text-xs">
            <span className="text-slate-500">Trang {currentPage} / {totalPages} — {list.length} kết quả</span>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition">Trước</button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition">Sau</button>
            </div>
          </div>
        )}
      </div>

      {/* PROVINCE MODAL */}
      {isProvModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-slate-900 mb-5">{editingProv ? 'Sửa Tỉnh/Thành' : 'Thêm Tỉnh/Thành'}</h3>
            <form onSubmit={handleProvSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Mã vùng</label>
                <input required value={provCode} onChange={e => setProvCode(e.target.value)} placeholder="VD: 01, HN" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Tên Tỉnh/Thành</label>
                <input required value={provName} onChange={e => setProvName(e.target.value)} placeholder="VD: Hà Nội" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Phân loại</label>
                <select value={provType} onChange={e => setProvType(e.target.value)} className={inputCls}>
                  <option value="Tỉnh">Tỉnh</option>
                  <option value="Thành phố">Thành phố trực thuộc Trung Ương</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 mt-4">
                <button type="button" onClick={() => setIsProvModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition">Hủy</button>
                <button type="submit" disabled={submitting}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition">
                  {submitting ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WARD MODAL */}
      {isWardModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-slate-900 mb-5">{editingWard ? 'Sửa Phường/Xã' : 'Thêm Phường/Xã'}</h3>
            <form onSubmit={handleWardSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Thuộc Tỉnh/Thành phố</label>
                <SearchableSelect
                  options={provinces.map(p => ({ value: p.id, label: p.name }))}
                  value={wardProvinceId}
                  onChange={(val) => setWardProvinceId(val)}
                  placeholder="-- Chọn Tỉnh/Thành --"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Mã vùng</label>
                <input required value={wardCode} onChange={e => setWardCode(e.target.value)} placeholder="VD: 001" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Tên Phường/Xã</label>
                <input required value={wardName} onChange={e => setWardName(e.target.value)} placeholder="VD: Phường Ba Đình" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Phân loại</label>
                <select value={wardType} onChange={e => setWardType(e.target.value)} className={inputCls}>
                  <option value="Xã">Xã</option>
                  <option value="Phường">Phường</option>
                  <option value="Thị trấn">Thị trấn</option>
                  <option value="Quận">Quận</option>
                  <option value="Huyện">Huyện</option>
                  <option value="Thành phố">Thành phố (thuộc tỉnh)</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 mt-4">
                <button type="button" onClick={() => setIsWardModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition">Hủy</button>
                <button type="submit" disabled={submitting}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition">
                  {submitting ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationManagement;