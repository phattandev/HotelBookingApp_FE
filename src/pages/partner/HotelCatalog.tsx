import React from 'react';
import SearchableSelect from '../../components/SearchableSelect';
import { useHotelCatalog } from '../../hooks/useHotelCatalog';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { SidePanel } from '../../components/ui/SidePanel';
import { Input } from '../../components/ui/Input';

const HotelCatalog: React.FC = () => {
  const {
    paginatedHotels,
    hotels,
    provinces,
    wards,
    isRegisterModalOpen,
    setIsRegisterModalOpen,
    handleOpenRegisterModal,
    detailModalHotelId,
    setDetailModalHotelId,
    hotelDetail,
    loadingDetail,
    formData,
    pagination,
    handleRegister,
    submittingId,
    handleSubmitRegistration,
    editingHotelId,
    setEditingHotelId,
    handleUpdateBasicInfo,
    openEditModal,
    fieldErrors
  } = useHotelCatalog();

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Danh mục Khách sạn"
        description="Quản lý các cơ sở lưu trú thuộc doanh nghiệp"
        action={
          <Button onClick={handleOpenRegisterModal} variant="primary">
            + Đăng ký Khách sạn mới
          </Button>
        }
      />

      {/* DANH SÁCH KHÁCH SẠN */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="px-4 py-3">Khách sạn</th>
                <th className="px-4 py-3">Địa chỉ</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-center">Phòng</th>
                <th className="px-4 py-3 text-center">Nhân viên</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hotels.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Chưa có khách sạn nào. Hãy đăng ký một cơ sở mới!
                  </td>
                </tr>
              ) : (
                paginatedHotels.map(h => (
                  <tr key={h.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900">{h.name}</p>
                      <p className="text-xs text-slate-500">MST: {h.taxCode}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-600 line-clamp-2 max-w-[200px]" title={h.addressLine}>
                        {h.addressLine}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Badge
                          variant={
                            h.approvalStatus === 'Approved' ? 'success' :
                            h.approvalStatus === 'Rejected' ? 'danger' :
                            h.approvalStatus === 'Pending' ? 'warning' : 'neutral'
                          }
                        >
                          {h.approvalStatus === 'Approved' ? 'Đã duyệt' :
                           h.approvalStatus === 'Pending' ? 'Chờ duyệt' :
                           h.approvalStatus === 'Rejected' ? 'Bị từ chối' : 'Bản nháp'}
                        </Badge>
                        {h.approvalStatus === 'Approved' && (
                          <span className={`text-[10px] uppercase font-bold ${h.isActive ? 'text-violet-600' : 'text-slate-400'}`}>
                            {h.isActive ? '● Hoạt động' : '○ Tạm ngưng'}
                          </span>
                        )}
                        {h.approvalStatus === 'Rejected' && h.rejectionReason && (
                          <span className="text-[10px] text-red-500 font-medium cursor-help" title={h.rejectionReason}>
                            Xem lý do
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-medium">{h.roomTypeCount}</td>
                    <td className="px-4 py-3 text-center font-medium">{h.staffCount}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setDetailModalHotelId(h.id)}>
                          Chi tiết
                        </Button>
                        {(h.approvalStatus === 'Draft' || h.approvalStatus === 'Rejected') && (
                          <Button size="sm" variant="primary" onClick={() => handleSubmitRegistration(h.id)} isLoading={submittingId === h.id}>
                            Gửi duyệt
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.setCurrentPage}
        />
      )}

      {/* MODAL CHI TIẾT KHÁCH SẠN */}
      <SidePanel
        isOpen={!!detailModalHotelId}
        onClose={() => setDetailModalHotelId(null)}
        title="Chi tiết Khách sạn"
        width="xl"
      >
        <div className="overflow-y-auto">
          {loadingDetail ? (
            <div className="flex justify-center items-center h-40 text-violet-600 font-medium">Đang tải dữ liệu...</div>
          ) : hotelDetail ? (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex gap-6 items-start">
                {hotelDetail.images.length > 0 ? (
                  <img src={hotelDetail.images.find(i => i.isPrimary)?.url || hotelDetail.images[0].url}
                    alt="hotel" className="w-48 h-32 object-cover rounded-lg shadow-sm" />
                ) : (
                  <div className="w-48 h-32 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-sm">
                    Chưa có ảnh
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-slate-900">{hotelDetail.name}</h2>
                    {hotelDetail.approvalStatus !== 'Pending' && (
                      <Button variant="outline" size="sm" onClick={() => openEditModal(hotelDetail)}>Sửa thông tin</Button>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {hotelDetail.addressLine}, {hotelDetail.wardName}, {hotelDetail.provinceName}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant={hotelDetail.isActive ? 'success' : 'warning'}>
                      {hotelDetail.isActive ? 'Đang hoạt động' : hotelDetail.approvalStatus}
                    </Badge>
                    {hotelDetail.starRating && (
                      <span className="text-sm font-semibold text-amber-500">
                        Hạng: {hotelDetail.starRating} sao
                      </span>
                    )}
                  </div>
                  <p className="text-sm mt-3 text-slate-700 line-clamp-3">{hotelDetail.description || 'Chưa có mô tả.'}</p>
                </div>
              </div>

              {/* Amenities */}
              {hotelDetail.amenities.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Tiện nghi khách sạn</h4>
                  <div className="flex flex-wrap gap-2">
                    {hotelDetail.amenities.map((a, i) => (
                      <span key={i} className="text-xs bg-violet-50 text-violet-700 border border-violet-100 px-2.5 py-1 rounded-full">
                        {a.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Room Types */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3 border-b border-slate-100 pb-2">Danh sách loại phòng ({hotelDetail.roomTypes.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hotelDetail.roomTypes.map((rt, i) => (
                    <div key={i} className="flex gap-3 border border-slate-200 p-3 rounded-lg bg-white">
                      {rt.images.length > 0 ? (
                        <img src={rt.images.find(img => img.isPrimary)?.url || rt.images[0].url}
                          className="w-24 h-24 object-cover rounded-md" alt="room" />
                      ) : (
                        <div className="w-24 h-24 bg-slate-100 rounded-md flex items-center justify-center text-xs text-slate-400 text-center p-2 border border-dashed border-slate-300">Chưa có ảnh</div>
                      )}
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 leading-tight">{rt.name}</p>
                        <p className="text-violet-600 font-bold mt-1">{rt.basePrice.toLocaleString('vi-VN')}₫</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Sức chứa: {rt.maxAdults} Người lớn, {rt.maxChildren} Trẻ em • Tổng: {rt.totalRooms} phòng
                        </p>
                        {rt.amenities.length > 0 && (
                          <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                            {rt.amenities.map(a => a.name).join(' · ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {hotelDetail.roomTypes.length === 0 && (
                    <p className="text-sm text-slate-500 col-span-full">Khách sạn chưa có loại phòng nào.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-red-500 py-10">Không có dữ liệu.</div>
          )}
        </div>
      </SidePanel>

      {/* MODAL FORM ĐĂNG KÝ */}
      <SidePanel
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Đơn Đăng Ký Cơ Sở Khách Sạn"
        width="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsRegisterModalOpen(false)}>Hủy</Button>
            <Button variant="primary" form="register-hotel-form" type="submit">Gửi Yêu Cầu</Button>
          </>
        }
      >
        <form id="register-hotel-form" onSubmit={handleRegister} noValidate className="grid grid-cols-1 gap-4">
          <div>
            <Input label="Tên khách sạn" type="text" value={formData.name} onChange={e => formData.setName(e.target.value)} placeholder="VD: Khách sạn Mường Thanh..." error={fieldErrors?.name} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tỉnh / Thành phố</label>
              <SearchableSelect
                options={provinces.map(p => ({ value: p.id, label: p.name }))}
                value={formData.provinceId}
                onChange={(val) => { formData.setProvinceId(val); formData.setWardId(''); }}
                placeholder="-- Chọn Tỉnh/Thành --"
              />
              {fieldErrors?.provinceId && <span className="text-xs font-medium text-red-500 mt-1 block">{fieldErrors.provinceId}</span>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quận / Huyện / Phường / Xã</label>
              <SearchableSelect
                options={wards.map(w => ({ value: w.id, label: w.name }))}
                value={formData.wardId}
                onChange={(val) => formData.setWardId(val)}
                placeholder="-- Chọn Phường/Xã --"
                disabled={!formData.provinceId}
              />
              {fieldErrors?.wardId && <span className="text-xs font-medium text-red-500 mt-1 block">{fieldErrors.wardId}</span>}
            </div>
          </div>
          <div>
            <Input label="Địa chỉ chi tiết" type="text" value={formData.addressLine} onChange={e => formData.setAddressLine(e.target.value)} placeholder="VD: 123 Đường Nguyễn Văn Linh..." error={fieldErrors?.addressLine} />
          </div>
          <div>
            <Input label="Mã số thuế" type="text" value={formData.taxCode} onChange={e => formData.setTaxCode(e.target.value)} placeholder="VD: 0101234567-001" error={fieldErrors?.taxCode} />
          </div>
        </form>
      </SidePanel>

      {/* MODAL FORM CHỈNH SỬA */}
      <SidePanel
        isOpen={!!editingHotelId}
        onClose={() => setEditingHotelId(null)}
        title="Chỉnh sửa thông tin cơ bản Khách Sạn"
        width="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditingHotelId(null)}>Hủy</Button>
            <Button variant="primary" form="edit-hotel-form" type="submit">Lưu Thay Đổi</Button>
          </>
        }
      >
        <form id="edit-hotel-form" onSubmit={handleUpdateBasicInfo} noValidate className="grid grid-cols-1 gap-4">
          <div>
            <Input label="Tên khách sạn" type="text" value={formData.name} onChange={e => formData.setName(e.target.value)} error={fieldErrors?.name} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tỉnh / Thành phố</label>
              <SearchableSelect
                options={provinces.map(p => ({ value: p.id, label: p.name }))}
                value={formData.provinceId}
                onChange={(val) => { formData.setProvinceId(val); formData.setWardId(''); }}
                placeholder="-- Chọn Tỉnh/Thành --"
              />
              {fieldErrors?.provinceId && <span className="text-xs font-medium text-red-500 mt-1 block">{fieldErrors.provinceId}</span>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quận / Huyện / Phường / Xã</label>
              <SearchableSelect
                options={wards.map(w => ({ value: w.id, label: w.name }))}
                value={formData.wardId}
                onChange={(val) => formData.setWardId(val)}
                placeholder="-- Chọn Phường/Xã --"
                disabled={!formData.provinceId}
              />
              {fieldErrors?.wardId && <span className="text-xs font-medium text-red-500 mt-1 block">{fieldErrors.wardId}</span>}
            </div>
          </div>
          <div>
            <Input label="Địa chỉ chi tiết" type="text" value={formData.addressLine} onChange={e => formData.setAddressLine(e.target.value)} error={fieldErrors?.addressLine} />
          </div>
        </form>
      </SidePanel>
    </div>
  );
};
export default HotelCatalog;
