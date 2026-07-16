import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import api from '../../services/api';
import AmenityPickerList from '../../components/AmenityPickerList';
import toast from 'react-hot-toast';
import { useConfirm } from '../../components/ConfirmModal';

// ---- Types ----
interface HotelImage { id: string; url: string; isPrimary: boolean; displayOrder: number; }
interface AmenityItem { id: string; name: string; categoryName: string; }
interface RoomType {
  id: string; name: string; basePrice: number; maxAdults: number; maxChildren: number;
  totalRooms: number; description: string; isActive: boolean;
  images: HotelImage[]; amenities: AmenityItem[];
}

const defaultForm = {
  name: '', basePrice: 0, maxAdults: 1, maxChildren: 0, totalRooms: 1, description: '', amenityIds: [] as string[],
};

const RoomTypeManagement: React.FC = () => {
  const confirm = useConfirm();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [allAmenities, setAllAmenities] = useState<AmenityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRt, setEditingRt] = useState<RoomType | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]); // Ảnh chờ upload khi tạo mới
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createImgInputRef = useRef<HTMLInputElement>(null);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minCapacity, setMinCapacity] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [hotelRes, amenitiesRes] = await Promise.all([
        api.get('/manager/hotel'),
        api.get('/manager/hotel/amenities/catalog?type=room'),
      ]);
      setRoomTypes(hotelRes.data.data?.roomTypes || []);
      setAllAmenities(amenitiesRes.data.data || []);
      
      setEditingRt(prev => {
        if (!prev) return null;
        const updated = hotelRes.data.data?.roomTypes?.find((r: RoomType) => r.id === prev.id);
        return updated || null;
      });
    } catch {
      toast.error('Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Client-side filtering
  const filteredRoomTypes = useMemo(() => {
    return roomTypes.filter(rt => {
      const matchSearch = !searchQuery || rt.name.toLowerCase().includes(searchQuery.toLowerCase());
      const pMin = minPrice ? parseInt(minPrice, 10) : 0;
      const pMax = maxPrice ? parseInt(maxPrice, 10) : Infinity;
      const matchPrice = rt.basePrice >= pMin && rt.basePrice <= pMax;
      const cap = minCapacity ? parseInt(minCapacity, 10) : 0;
      const matchCapacity = rt.maxAdults >= cap;

      return matchSearch && matchPrice && matchCapacity;
    });
  }, [roomTypes, searchQuery, minPrice, maxPrice, minCapacity]);

  const handleOpenCreate = () => {
    setEditingRt(null);
    setForm(defaultForm);
    setPendingFiles([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rt: RoomType) => {
    setEditingRt(rt);
    setForm({
      name: rt.name, basePrice: rt.basePrice, maxAdults: rt.maxAdults, maxChildren: rt.maxChildren,
      totalRooms: rt.totalRooms, description: rt.description || '', amenityIds: rt.amenities.map(a => a.id),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingRt) {
        await api.put(`/manager/roomtypes/${editingRt.id}`, form);
        toast.success('Cập nhật loại phòng thành công!');
        setIsModalOpen(false);
        fetchData();
      } else {
        const res = await api.post('/manager/roomtypes', form);
        const newId: string = res.data.data; // ID loại phòng mới
        // Upload ảnh pending nếu có
        if (pendingFiles.length > 0) {
          setUploading(true);
          for (const file of pendingFiles) {
            const fd = new FormData();
            fd.append('file', file);
            await api.post(`/manager/images/roomtype/${newId}`, fd, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
          }
          setUploading(false);
          toast.success(`Tạo loại phòng và upload ${pendingFiles.length} ảnh thành công!`);
        } else {
          toast.success('Tạo loại phòng thành công!');
        }
        setPendingFiles([]);
        setIsModalOpen(false);
        fetchData();
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Thao tác thất bại.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: 'Ẩn loại phòng',
      message: `Ẩn loại phòng "${name}"? Khách hàng sẽ không thấy loại phòng này trên hệ thống nữa.`,
      confirmText: 'Ẩn',
      variant: 'warning',
    });
    if (!ok) return;
    try {
      await api.delete(`/manager/roomtypes/${id}`);
      toast.success(`Đã ẩn loại phòng "${name}".`);
      fetchData();
    } catch {
      toast.error('Thao tác thất bại.');
    }
  };

  const handleRestore = async (id: string, name: string) => {
    const ok = await confirm({
      title: 'Mở lại loại phòng',
      message: `Mở lại loại phòng "${name}" để khách hàng có thể đặt phòng?`,
      confirmText: 'Mở lại',
      variant: 'info',
    });
    if (!ok) return;
    try {
      await api.put(`/manager/roomtypes/${id}/restore`);
      toast.success(`Đã khôi phục loại phòng "${name}".`);
      fetchData();
    } catch {
      toast.error('Thao tác thất bại.');
    }
  };

  const handleUploadRoomImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingRt) return;
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        await api.post(`/manager/images/roomtype/${editingRt.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      toast.success(`Upload ${files.length > 1 ? files.length + ' ảnh' : '1 ảnh'} thành công!`);
      fetchData();
    } catch {
      toast.error('Upload ảnh thất bại.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteRoomImage = async (imageId: string) => {
    const ok = await confirm({
      title: 'Xóa ảnh',
      message: 'Bạn có chắc muốn xóa ảnh này?',
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`/manager/images/roomtype/${imageId}`);
      toast.success('Đã xóa ảnh.');
      fetchData();
    } catch {
      toast.error('Xóa ảnh thất bại.');
    }
  };

  const toggleFormAmenity = (id: string) => {
    setForm(prev => ({
      ...prev,
      amenityIds: prev.amenityIds.includes(id)
        ? prev.amenityIds.filter(a => a !== id)
        : [...prev.amenityIds, id],
    }));
  };

  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white";

  if (loading && roomTypes.length === 0) return <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản Lý Loại Phòng</h1>
          <p className="text-sm text-slate-500 mt-1">Cấu hình các loại phòng, giá bán, tiện nghi và hình ảnh</p>
        </div>
        <button onClick={handleOpenCreate}
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
          Thêm loại phòng
        </button>
      </div>

      {/* Toolbar: Filters */}
      <div className="flex flex-wrap gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Tìm tên loại phòng..."
          className={`flex-1 min-w-[200px] ${inputCls}`}
        />
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            placeholder="Giá từ (VNĐ)"
            className={`w-32 ${inputCls}`}
          />
          <span className="text-slate-400">-</span>
          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            placeholder="Giá đến (VNĐ)"
            className={`w-32 ${inputCls}`}
          />
        </div>
        <select value={minCapacity} onChange={e => setMinCapacity(e.target.value)} className={inputCls + " w-auto"}>
          <option value="">Sức chứa (Người lớn)</option>
          <option value="1">Từ 1 người</option>
          <option value="2">Từ 2 người</option>
          <option value="4">Từ 4 người</option>
          <option value="6">Từ 6 người</option>
        </select>
        
        {(searchQuery || minPrice || maxPrice || minCapacity) && (
          <button onClick={() => { setSearchQuery(''); setMinPrice(''); setMaxPrice(''); setMinCapacity(''); }}
            className="px-3 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
            Xóa lọc
          </button>
        )}
      </div>

      {roomTypes.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center border border-slate-200 shadow-sm">
          <p className="text-slate-500 font-medium">Chưa có loại phòng nào</p>
          <p className="text-slate-400 text-sm mt-1">Bấm nút "Thêm loại phòng" để bắt đầu thiết lập phòng bán.</p>
        </div>
      ) : filteredRoomTypes.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center border border-slate-200 shadow-sm text-slate-500 font-medium">
          Không tìm thấy loại phòng phù hợp với bộ lọc.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoomTypes.map((rt) => {
            const primaryImg = rt.images.find(i => i.isPrimary) || rt.images[0];
            return (
              <div key={rt.id} className={`bg-white rounded-xl border overflow-hidden flex flex-col transition shadow-sm ${rt.isActive ? 'border-slate-200 hover:shadow-md' : 'border-dashed border-slate-300 opacity-60 grayscale'}`}>
                <div className="h-48 bg-slate-100 relative">
                  {primaryImg ? (
                    <img src={primaryImg.url} alt={rt.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">Chưa có ảnh</div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button onClick={() => handleOpenEdit(rt)}
                      className="text-xs px-3 py-1.5 bg-white/90 text-slate-700 hover:bg-violet-50 hover:text-violet-700 font-semibold rounded-md backdrop-blur-sm transition shadow-sm">
                      Sửa
                    </button>
                    {rt.isActive ? (
                      <button onClick={() => handleDelete(rt.id, rt.name)}
                        className="text-xs px-3 py-1.5 bg-white/90 text-red-600 hover:bg-red-50 font-semibold rounded-md backdrop-blur-sm transition shadow-sm">
                        Ẩn
                      </button>
                    ) : (
                      <button onClick={() => handleRestore(rt.id, rt.name)}
                        className="text-xs px-3 py-1.5 bg-slate-800 text-white hover:bg-slate-700 font-semibold rounded-md backdrop-blur-sm transition shadow-sm">
                        Mở lại
                      </button>
                    )}
                  </div>
                  {!rt.isActive && (
                    <div className="absolute top-3 left-3 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">ĐÃ BỊ ẨN</div>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-slate-900 leading-tight mb-1">{rt.name}</h3>
                  <div className="text-xs text-slate-500 mb-4 space-x-3">
                    <span className="inline-block" title="Sức chứa người lớn">👱 {rt.maxAdults} Lớn</span>
                    {rt.maxChildren > 0 && <span className="inline-block" title="Sức chứa trẻ em">👶 {rt.maxChildren} Trẻ em</span>}
                    <span className="inline-block" title="Tổng số phòng">🚪 {rt.totalRooms} phòng</span>
                  </div>

                  <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold mb-0.5">Giá mỗi đêm</span>
                      <span className="text-violet-700 font-bold text-lg leading-none">{rt.basePrice.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold mb-0.5">Tiện nghi</span>
                      <span className="text-sm font-medium text-slate-700">{rt.amenities.length} mục</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl animate-fade-in-right flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <h2 className="text-xl font-bold text-slate-900">{editingRt ? 'Chỉnh sửa loại phòng' : 'Thêm loại phòng mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition">
                &times;
              </button>
            </div>

            <div className="p-6 flex-1 space-y-8">
              {/* Form Info */}
              <form id="rt-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tên loại phòng</label>
                  <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-slate-300 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 font-medium"
                    placeholder="VD: Phòng Deluxe Giường Đôi" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Giá cơ bản (VNĐ/đêm)</label>
                    <input type="number" required min="0" value={form.basePrice} onChange={e => setForm({ ...form, basePrice: Number(e.target.value) })}
                      className="w-full border border-slate-300 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-violet-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng số phòng (Inventory)</label>
                    <input type="number" required min="1" value={form.totalRooms} onChange={e => setForm({ ...form, totalRooms: Number(e.target.value) })}
                      className="w-full border border-slate-300 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-violet-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Số người lớn tối đa</label>
                    <input type="number" required min="1" value={form.maxAdults} onChange={e => setForm({ ...form, maxAdults: Number(e.target.value) })}
                      className="w-full border border-slate-300 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-violet-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Số trẻ em tối đa</label>
                    <input type="number" required min="0" value={form.maxChildren} onChange={e => setForm({ ...form, maxChildren: Number(e.target.value) })}
                      className="w-full border border-slate-300 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-violet-500" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mô tả thêm</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-slate-300 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 resize-none"
                    placeholder="Mô tả hướng nhìn, kích thước giường,..." />
                </div>
              </form>

              {/* Tiện nghi */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3 border-b pb-2">Tiện nghi phòng</h3>
                <AmenityPickerList 
                  allAmenities={allAmenities} 
                  selectedIds={form.amenityIds} 
                  onToggle={toggleFormAmenity} 
                />
              </div>

              {/* Hình ảnh */}
              <div>
                <div className="flex justify-between items-center mb-3 border-b pb-2">
                  <h3 className="text-sm font-bold text-slate-800">Hình ảnh loại phòng</h3>
                  {editingRt ? (
                    <div>
                      <input type="file" accept="image/*" multiple className="hidden" ref={fileInputRef} onChange={handleUploadRoomImage} />
                      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                        className="text-xs bg-violet-100 text-violet-700 px-3 py-1.5 rounded-md font-semibold hover:bg-violet-200 transition">
                        {uploading ? 'Đang tải lên...' : '+ Thêm ảnh'}
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer text-xs bg-violet-100 text-violet-700 px-3 py-1.5 rounded-md font-semibold hover:bg-violet-200 transition">
                      + Chọn ảnh ({pendingFiles.length} đã chọn)
                      <input type="file" accept="image/*" multiple className="hidden"
                        ref={createImgInputRef}
                        onChange={e => setPendingFiles(Array.from(e.target.files || []))} />
                    </label>
                  )}
                </div>

                {/* Edit mode: Show uploaded images */}
                {editingRt && (
                  <>
                    {editingRt.images.length === 0 ? (
                      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-400 text-sm">
                        Chưa có hình ảnh nào. Nhấn "+ Thêm ảnh" để tải lên.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        {editingRt.images.map(img => (
                          <div key={img.id} className="group relative aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                            {img.isPrimary && (
                              <span className="absolute top-1.5 left-1.5 bg-violet-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">Ảnh Bìa</span>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button type="button" onClick={() => handleDeleteRoomImage(img.id)}
                                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition shadow">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Create mode: Preview pending files */}
                {!editingRt && pendingFiles.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {pendingFiles.map((file, idx) => (
                      <div key={idx} className="group relative aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                        <button type="button"
                          onClick={() => setPendingFiles(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {!editingRt && pendingFiles.length === 0 && (
                  <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 text-center text-slate-400 text-sm">
                    Chưa chọn ảnh nào. Bạn có thể thêm ảnh sau khi tạo.
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 sticky bottom-0 z-10">
              <button type="button" onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 bg-white border border-slate-300 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">
                Hủy bỏ
              </button>
              <button type="submit" form="rt-form" disabled={saving}
                className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 shadow-sm shadow-violet-600/20">
                {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomTypeManagement;
