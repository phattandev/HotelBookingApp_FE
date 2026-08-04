import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { SidePanel } from '../../components/ui/SidePanel';
import { Textarea } from '../../components/ui/Textarea';
import AmenityPickerList from '../../components/AmenityPickerList';
import { useRoomTypeManagement } from '../../hooks/useRoomTypeManagement';

const RoomTypeManagement: React.FC = () => {
  const {
    roomTypes,
    allAmenities,
    loading,
    saving,
    uploading,
    isPending,
    isModalOpen,
    setIsModalOpen,
    editingRt,
    form,
    setForm,
    pendingFiles,
    setPendingFiles,
    fileInputRef,
    createImgInputRef,
    filters,
    filteredRoomTypes,
    handleOpenCreate,
    handleOpenEdit,
    handleSubmit,
    handleDelete,
    handleRestore,
    handleUploadRoomImage,
    handleDeleteRoomImage,
    toggleFormAmenity
  } = useRoomTypeManagement();

  if (loading && roomTypes.length === 0) return <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title="Quản Lý Loại Phòng"
        description="Cấu hình các loại phòng, giá bán, tiện nghi và hình ảnh"
        action={
          <Button onClick={handleOpenCreate} variant="primary" disabled={isPending}>
            Thêm loại phòng
          </Button>
        }
      />
      
      {isPending && (
        <div className="p-4 rounded-xl text-sm bg-amber-50 text-amber-700 border border-amber-100 mb-4">
          <span className="font-medium">Khách sạn đang chờ duyệt. Bạn không thể thêm mới hay chỉnh sửa loại phòng lúc này.</span>
        </div>
      )}

      {/* Toolbar: Filters */}
      <div className="flex flex-wrap gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm items-end">
        <div className="flex-1 min-w-[200px]">
          <Input
            label="Tìm kiếm"
            type="text"
            value={filters.searchQuery}
            onChange={e => filters.setSearchQuery(e.target.value)}
            placeholder="Tìm tên loại phòng..."
          />
        </div>
        <div className="flex items-center gap-2">
          <Input
            label="Giá từ (VNĐ)"
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={e => filters.setMinPrice(e.target.value)}
            placeholder="Giá từ"
          />
          <span className="text-slate-400 mt-6">-</span>
          <Input
            label="Giá đến (VNĐ)"
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={e => filters.setMaxPrice(e.target.value)}
            placeholder="Giá đến"
          />
        </div>
        <div className="w-48">
          <Select
            label="Sức chứa"
            value={filters.minCapacity}
            onChange={val => filters.setMinCapacity(val)}
            options={[
              { value: '', label: 'Sức chứa (Người lớn)' },
              { value: '1', label: 'Từ 1 người' },
              { value: '2', label: 'Từ 2 người' },
              { value: '4', label: 'Từ 4 người' },
              { value: '6', label: 'Từ 6 người' },
            ]}
          />
        </div>

        {(filters.searchQuery || filters.minPrice || filters.maxPrice || filters.minCapacity) && (
          <Button onClick={() => { filters.setSearchQuery(''); filters.setMinPrice(''); filters.setMaxPrice(''); filters.setMinCapacity(''); }}
            variant="ghost" className="!bg-slate-100 !text-slate-600 hover:!bg-slate-200 border-none mb-1 shadow-none">
            Xóa lọc
          </Button>
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
                  {!isPending && (
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
                  )}
                  {!rt.isActive && (
                    <div className="absolute top-3 left-3 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">ĐÃ BỊ ẨN</div>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-slate-900 leading-tight mb-1">{rt.name}</h3>
                  <div className="text-xs text-slate-500 mb-2 space-x-3">
                    <span className="inline-block" title="Sức chứa người lớn">{rt.maxAdults} Lớn</span>
                    {rt.maxChildren > 0 && <span className="inline-block" title="Sức chứa trẻ em">{rt.maxChildren} Trẻ em</span>}
                  </div>
                  <div className="text-xs mb-4 flex gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-slate-100 rounded-md font-medium text-slate-600" title="Tổng số phòng">Tổng: {rt.totalRooms}</span>
                    <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-md font-medium text-amber-700" title="Đang được đặt hôm nay">Đã đặt: {rt.bookedRooms}</span>
                    <span className={`px-2 py-0.5 border rounded-md font-medium ${rt.availableRooms > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`} title="Còn trống hôm nay">Trống: {rt.availableRooms}</span>
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
      <SidePanel
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRt ? 'Chỉnh sửa loại phòng' : 'Thêm loại phòng mới'}
        width="xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button form="rt-form" type="submit" variant="primary" isLoading={saving}>
              {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </Button>
          </>
        }
      >
        <div className="space-y-8">
          {/* Form Info */}
          <form id="rt-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <Input
                label="Tên loại phòng"
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="VD: Phòng Deluxe Giường Đôi"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Input
                  label="Giá cơ bản (VNĐ/đêm)"
                  type="number"
                  required
                  min={0}
                  value={form.basePrice}
                  onChange={e => setForm({ ...form, basePrice: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1">
                <Input
                  label="Tổng số phòng (Inventory)"
                  type="number"
                  required
                  min={1}
                  value={form.totalRooms}
                  onChange={e => setForm({ ...form, totalRooms: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Input
                  label="Số người lớn tối đa"
                  type="number"
                  required
                  min={1}
                  value={form.maxAdults}
                  onChange={e => setForm({ ...form, maxAdults: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1">
                <Input
                  label="Số trẻ em tối đa"
                  type="number"
                  required
                  min={0}
                  value={form.maxChildren}
                  onChange={e => setForm({ ...form, maxChildren: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Textarea
                label="Mô tả thêm"
                rows={3}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Mô tả hướng nhìn, kích thước giường,..."
              />
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
      </SidePanel>
    </div>
  );
};

export default RoomTypeManagement;
