import React from 'react';
import AmenityPickerList from '../../components/AmenityPickerList';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { useHotelInfo } from '../../hooks/useHotelInfo';
import type { HotelImage } from '../../hooks/useHotelInfo';


// Sub-component tách riêng (memoized để không re-render không cần thiết)
const HotelImagesSection = React.memo(({
  images,
  uploading,
  onUpload,
  onDelete,
  fileInputRef,
  disabled
}: {
  images: HotelImage[];
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: (id: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  disabled: boolean;
}) => {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-bold text-slate-900">Hình Ảnh</h2>
        <div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" id="hotel-img-upload" onChange={onUpload} disabled={disabled} />
          <Button
            variant="primary"
            onClick={() => document.getElementById('hotel-img-upload')?.click()}
            isLoading={uploading}
            disabled={disabled}
          >
            {uploading ? 'Đang tải...' : 'Upload ảnh'}
          </Button>
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
              {!disabled && (
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <Button variant="danger" size="sm" onClick={() => onDelete(img.id)}>
                    Xóa
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
});

const HotelInfo: React.FC = () => {
  const {
    hotel,
    allAmenities,
    loading,
    saving,
    uploading,
    msg,
    setMsg,
    description,
    setDescription,
    starRating,
    setStarRating,
    selectedAmenityIds,
    fileInputRef,
    handleSaveAll,
    handleUploadImage,
    handleDeleteImage,
    toggleAmenity,
  } = useHotelInfo();

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

  const isPending = hotel.approvalStatus === 'Pending';
  const canEdit = !isPending;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header + Alert */}
      <div className="shrink-0">
        <div className="mb-4 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{hotel.name}</h1>
            <div className="flex gap-2 mt-2">
              <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${hotel.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                {hotel.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
              </span>
              <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${hotel.approvalStatus === 'Pending' ? 'bg-amber-100 text-amber-700' : hotel.approvalStatus === 'Draft' ? 'bg-slate-200 text-slate-700' : hotel.approvalStatus === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {hotel.approvalStatus}
              </span>
            </div>
          </div>
        </div>

        {isPending && (
          <div className="mb-4 p-4 rounded-xl text-sm bg-amber-50 text-amber-700 border border-amber-100">
            <span className="font-medium">Khách sạn đang chờ duyệt. Bạn không thể chỉnh sửa thông tin lúc này.</span>
          </div>
        )}

        {msg && (
          <div className={`mb-4 p-4 rounded-xl text-sm flex justify-between items-center ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
            <span className="font-medium">{msg.text}</span>
            <button onClick={() => setMsg(null)} className="ml-4 opacity-60 hover:opacity-100 font-bold">&times;</button>
          </div>
        )}
      </div>

      {/* Nội dung chính */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Cột trái: Basic Info + Mô tả + Tiện nghi */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Section: Thông tin mô tả chi tiết */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-5">Chi Tiết Giới Thiệu</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Hạng sao Khách sạn</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => canEdit && setStarRating(starRating === s ? null : s)} disabled={!canEdit}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${starRating === s ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600'}`}>
                      {s} Sao
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Textarea
                  label="Mô tả tổng quan"
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Giới thiệu về khách sạn, vị trí, phong cách, dịch vụ nổi bật..."
                  disabled={!canEdit}
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
              onToggle={canEdit ? toggleAmenity : () => {}}
              maxHeight="none"
            />
          </section>
        </div>

        {/* Cột phải: Ảnh + Nút lưu */}
        <div className="xl:col-span-1 flex flex-col gap-6 sticky top-24">
          <HotelImagesSection
            images={hotel.images}
            uploading={uploading}
            onUpload={handleUploadImage}
            onDelete={handleDeleteImage}
            fileInputRef={fileInputRef}
            disabled={!canEdit}
          />

          {/* Action Panel */}
          {canEdit && (
            <section className="bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col gap-3 xl:sticky xl:top-0">
              <h3 className="text-sm font-bold text-slate-800">Lưu Thông Tin</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-1">Lưu các thay đổi về mô tả, hạng sao và tiện nghi của khách sạn.</p>
              <Button
                variant="primary"
                onClick={handleSaveAll}
                isLoading={saving}
                className="w-full"
              >
                {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </Button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelInfo;
