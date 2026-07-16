import React, { useCallback, useEffect, useRef, useState } from 'react';
import api from '../../services/api';
import AmenityPickerList from '../../components/AmenityPickerList';
import { useConfirm } from '../../components/ConfirmModal';
import toast from 'react-hot-toast';

// ---- Types ----
interface HotelImage { id: string; url: string; publicId: string; isPrimary: boolean; displayOrder: number; }
interface AmenityItem { id: string; name: string; categoryName: string; applicableTo: string; }
interface HotelDetail {
  id: string; name: string; addressLine: string; description: string | null; starRating: number | null;
  approvalStatus: string; isActive: boolean; images: HotelImage[]; amenities: AmenityItem[];
}

const HotelImagesSection = React.memo(({ 
  images, 
  uploading, 
  onUpload, 
  onDelete, 
  fileInputRef 
}: { 
  images: HotelImage[]; 
  uploading: boolean; 
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  onDelete: (id: string) => void; 
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}) => {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-bold text-slate-900">Hình Ảnh</h2>
        <div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" id="hotel-img-upload" onChange={onUpload} />
          <label htmlFor="hotel-img-upload"
            className={`cursor-pointer inline-block px-3 py-1.5 rounded-lg text-xs font-semibold transition text-white ${uploading ? 'bg-slate-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
            {uploading ? 'Đang tải...' : 'Upload ảnh'}
          </label>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50">
          <p className="text-slate-400 text-sm font-medium">Chưa có ảnh nào</p>
          <p className="text-slate-400 text-xs mt-1">Hãy upload ảnh để thu hút khách hàng.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {images.map((img) => (
            <div key={img.id} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-100">
              <img src={img.url} alt="hotel" className="w-full h-full object-cover" loading="lazy" />
              {img.isPrimary && (
                <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                  Ảnh bìa
                </span>
              )}
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <button onClick={() => onDelete(img.id)}
                  className="text-white text-xs font-semibold bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg shadow-sm transition">
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
});

const HotelInfo: React.FC = () => {
  const confirm = useConfirm();
  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [allAmenities, setAllAmenities] = useState<AmenityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [description, setDescription] = useState('');
  const [starRating, setStarRating] = useState<number | null>(null);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [hotelRes, amenitiesRes] = await Promise.all([
        api.get('/manager/hotel'),
        api.get('/manager/hotel/amenities/catalog?type=hotel'), // the backend handles "applicableTo = hotel or both"
      ]);
      const h: HotelDetail = hotelRes.data.data;
      setHotel(h);
      setDescription(h.description || '');
      setStarRating(h.starRating);
      setSelectedAmenityIds(h.amenities.map((a) => a.id));
      const fetchedAmenities: AmenityItem[] = amenitiesRes.data.data || [];
      // Yêu cầu: chỉ lấy tiện nghi chuyên dành cho khách sạn (không lấy 'room' hay 'both' nếu không cần thiết)
      setAllAmenities(fetchedAmenities.filter(a => a.applicableTo === 'hotel'));
    } catch (e) {
      setMsg({ type: 'error', text: 'Không thể tải thông tin khách sạn.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSaveAll = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await Promise.all([
        api.put('/manager/hotel/info', { description, starRating }),
        api.put('/manager/hotel/amenities', { amenityIds: selectedAmenityIds })
      ]);
      setMsg({ type: 'success', text: 'Đã lưu toàn bộ thông tin khách sạn thành công!' });
      fetchData();
    } catch {
      setMsg({ type: 'error', text: 'Lỗi khi lưu thông tin. Vui lòng thử lại.' });
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImage = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        await api.post('/manager/images/hotel', formData, {
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
  }, [fetchData]);

  const handleDeleteImage = useCallback(async (imageId: string) => {
    const ok = await confirm({
      title: 'Xóa ảnh',
      message: 'Bạn có chắc muốn xóa ảnh này?',
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`/manager/images/hotel/${imageId}`);
      toast.success('Đã xóa ảnh.');
      fetchData();
    } catch {
      toast.error('Xóa ảnh thất bại.');
    }
  }, [confirm, fetchData]);

  const toggleAmenity = useCallback((id: string) => {
    setSelectedAmenityIds((prev) => {
      const nextIds = new Set(prev);
      nextIds.has(id) ? nextIds.delete(id) : nextIds.add(id);
      return Array.from(nextIds);
    });
  }, []);



  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Đang tải dữ liệu...</div>;
  if (!hotel) return (
    <div className="bg-white rounded-xl border border-slate-200 p-16 text-center max-w-4xl">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
        <span className="text-red-500 font-bold text-xl">!</span>
      </div>
      <p className="text-slate-500 font-medium">Không tìm thấy thông tin khách sạn</p>
      <p className="text-slate-400 text-sm mt-1">Tài khoản của bạn có thể chưa được phân công quản lý khách sạn nào.</p>
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-6">

      {/* Header + Alert - phần cố định trên cùng */}
      <div className="shrink-0">
        <div className="mb-4 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{hotel.name}</h1>
            <p className="text-sm text-slate-500 mt-1">{hotel.addressLine}</p>
            <div className="flex gap-2 mt-2">
              <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${hotel.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                {hotel.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
              </span>
            </div>
          </div>
        </div>

        {msg && (
          <div className={`mb-4 p-4 rounded-xl text-sm flex justify-between items-center ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
            <span className="font-medium">{msg.text}</span>
            <button onClick={() => setMsg(null)} className="ml-4 opacity-60 hover:opacity-100 font-bold">&times;</button>
          </div>
        )}
      </div>

      {/* Nội dung chính */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

        {/* Cột trái: Mô tả + Tiện nghi */}
        <div className="xl:col-span-2 flex flex-col gap-6">

          {/* Section: Thông tin căn bản */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-5">Thông Tin Căn Bản</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Hạng sao Khách sạn</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setStarRating(starRating === s ? null : s)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${starRating === s ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600'}`}>
                      {s} Sao
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Mô tả tổng quan</label>
                <textarea
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Giới thiệu về khách sạn, vị trí, phong cách, dịch vụ nổi bật..."
                  className="w-full border border-slate-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none transition"
                />
                <p className="text-xs text-slate-400 mt-1.5 text-right">{description.length}/5000 ký tự</p>
              </div>
            </div>
          </section>

          {/* Section: Tiện nghi */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Danh Mục Tiện Nghi</h2>
            <AmenityPickerList
              allAmenities={allAmenities}
              selectedIds={selectedAmenityIds}
              onToggle={toggleAmenity}
              maxHeight="none"
            />
          </section>
        </div>

        {/* Cột phải: Ảnh + Nút lưu */}
        <div className="xl:col-span-1 flex flex-col gap-6 sticky top-24">
          {/* Section: Ảnh */}
          <HotelImagesSection 
            images={hotel.images} 
            uploading={uploading} 
            onUpload={handleUploadImage} 
            onDelete={handleDeleteImage} 
            fileInputRef={fileInputRef} 
          />

          {/* Action Panel */}
          <section className="bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col gap-3 xl:sticky xl:top-0">
            <h3 className="text-sm font-bold text-slate-800">Cập nhật thay đổi</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-1">Hãy chắc chắn bạn đã kiểm tra kỹ các thông tin trước khi lưu.</p>
            <button onClick={handleSaveAll} disabled={saving}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition shadow-sm shadow-emerald-600/20">
              {saving ? 'Đang lưu hệ thống...' : 'Lưu tất cả thay đổi'}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HotelInfo;
