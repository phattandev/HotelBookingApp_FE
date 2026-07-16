import React, { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';
import SearchableSelect from '../../components/SearchableSelect';
import toast from 'react-hot-toast';

interface Hotel {
  id: string;
  name: string;
  addressLine: string;
  taxCode: string;
  approvalStatus: string;
  isActive: boolean;
}

interface HotelDetail extends Hotel {
  provinceName: string;
  wardName: string;
  description: string | null;
  starRating: number | null;
  images: { url: string; isPrimary: boolean }[];
  amenities: { name: string; categoryName: string }[];
  roomTypes: {
    name: string; basePrice: number; maxAdults: number; maxChildren: number; totalRooms: number; description: string;
    images: { url: string; isPrimary: boolean }[];
    amenities: { name: string; categoryName: string }[];
  }[];
}

const HotelCatalog: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [detailModalHotelId, setDetailModalHotelId] = useState<string | null>(null);
  const [hotelDetail, setHotelDetail] = useState<HotelDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Form States
  const [name, setName] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [wardId, setWardId] = useState('');
  const [taxCode, setTaxCode] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 6 items per page looks good for cards

  useEffect(() => {
    fetchMyHotels();
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (provinceId) {
      api.get(`/wards?provinceId=${provinceId}`)
        .then(res => setWards(res.data.data || []))
        .catch(() => setWards([]));
    } else {
      setWards([]);
    }
    setWardId('');
  }, [provinceId]);

  useEffect(() => {
    if (detailModalHotelId) {
      setLoadingDetail(true);
      api.get(`/hotels/my-hotels/${detailModalHotelId}`)
        .then(res => setHotelDetail(res.data.data))
        .catch(() => toast.error('Lỗi khi tải chi tiết khách sạn'))
        .finally(() => setLoadingDetail(false));
    } else {
      setHotelDetail(null);
    }
  }, [detailModalHotelId]);

  const fetchMyHotels = async () => {
    try {
      const res = await api.get('/hotels/my-hotels');
      setHotels(res.data.data || []);
    } catch {
      console.error('Không thể tải danh sách khách sạn');
    }
  };

  const fetchProvinces = async () => {
    try {
      const res = await api.get('/provinces');
      setProvinces(res.data.data || []);
    } catch {
      console.error('Không thể tải danh sách tỉnh thành');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/hotels/register', { name, taxCode, addressLine, wardId });
      toast.success('Đã gửi đơn đăng ký khách sạn! Vui lòng chờ Admin phê duyệt.');
      setIsRegisterModalOpen(false);
      setName(''); setAddressLine(''); setProvinceId(''); setWardId(''); setTaxCode('');
      fetchMyHotels();
    } catch (err: any) {
      toast.error(err.response?.data?.Message || 'Đăng ký thất bại');
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(hotels.length / itemsPerPage);
  const paginatedHotels = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return hotels.slice(start, start + itemsPerPage);
  }, [hotels, currentPage]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-sky-800">Danh mục Khách sạn</h2>
          <p className="text-sm text-gray-500">Quản lý các cơ sở lưu trú thuộc doanh nghiệp</p>
        </div>
        <button onClick={() => setIsRegisterModalOpen(true)} className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
          + Đăng ký Khách sạn mới
        </button>
      </div>

      {/* DANH SÁCH KHÁCH SẠN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hotels.length === 0 ? (
          <p className="text-gray-500 col-span-full">Chưa có khách sạn nào. Hãy đăng ký một cơ sở mới!</p>
        ) : paginatedHotels.map(h => (
          <div key={h.id} className="border p-4 rounded-lg bg-gray-50 hover:shadow-md transition flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{h.name}</h3>
              <p className="text-sm text-gray-600 mb-2 mt-1 line-clamp-2" title={h.addressLine}>{h.addressLine}</p>
              <p className="text-xs text-gray-500 mb-3">MST: {h.taxCode}</p>
            </div>

            <div className="flex justify-between items-center mt-auto pt-3 border-t">
              <div className="flex flex-col gap-1">
                <span className={`px-2 py-0.5 text-[11px] font-bold rounded w-max ${h.approvalStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                    h.approvalStatus === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                  {h.approvalStatus === 'Approved' ? 'Đã duyệt' : h.approvalStatus === 'Pending' ? 'Chờ duyệt' : 'Bị từ chối'}
                </span>
                <span className={`text-[10px] uppercase font-bold ${h.isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                  {h.isActive ? '● Đang hoạt động' : '○ Tạm ngưng'}
                </span>
              </div>
              <button
                onClick={() => setDetailModalHotelId(h.id)}
                className="text-xs text-sky-600 hover:text-sky-800 font-semibold border border-sky-200 hover:bg-sky-50 px-3 py-1.5 rounded-md transition"
              >
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-md border border-gray-300 text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Trang trước
          </button>
          <span className="text-sm text-gray-600 font-medium px-2">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-md border border-gray-300 text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Trang sau
          </button>
        </div>
      )}

      {/* MODAL CHI TIẾT KHÁCH SẠN */}
      {detailModalHotelId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">Chi tiết Khách sạn</h3>
              <button onClick={() => setDetailModalHotelId(null)} className="text-gray-400 hover:text-gray-800 text-2xl leading-none">&times;</button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {loadingDetail ? (
                <div className="flex justify-center items-center h-40 text-sky-600 font-medium">Đang tải dữ liệu...</div>
              ) : hotelDetail ? (
                <div className="space-y-6">
                  {/* Header Info */}
                  <div className="flex gap-6 items-start">
                    {hotelDetail.images.length > 0 ? (
                      <img src={hotelDetail.images.find(i => i.isPrimary)?.url || hotelDetail.images[0].url}
                        alt="hotel" className="w-48 h-32 object-cover rounded-lg shadow-sm" />
                    ) : (
                      <div className="w-48 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                        Chưa có ảnh
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{hotelDetail.name}</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {hotelDetail.addressLine}, {hotelDetail.wardName}, {hotelDetail.provinceName}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${hotelDetail.isActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {hotelDetail.isActive ? 'Đang hoạt động' : hotelDetail.approvalStatus}
                        </span>
                        {hotelDetail.starRating && (
                          <span className="text-sm font-semibold text-amber-500">
                            Hạng: {hotelDetail.starRating} sao
                          </span>
                        )}
                      </div>
                      <p className="text-sm mt-3 text-gray-700 line-clamp-3">{hotelDetail.description || 'Chưa có mô tả.'}</p>
                    </div>
                  </div>

                  {/* Amenities */}
                  {hotelDetail.amenities.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Tiện nghi khách sạn</h4>
                      <div className="flex flex-wrap gap-2">
                        {hotelDetail.amenities.map((a, i) => (
                          <span key={i} className="text-xs bg-sky-50 text-sky-700 border border-sky-100 px-2.5 py-1 rounded-full">
                            {a.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Room Types */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 border-b pb-2">Danh sách loại phòng ({hotelDetail.roomTypes.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {hotelDetail.roomTypes.map((rt, i) => (
                        <div key={i} className="flex gap-3 border p-3 rounded-lg bg-white">
                          {rt.images.length > 0 ? (
                            <img src={rt.images.find(img => img.isPrimary)?.url || rt.images[0].url}
                              className="w-24 h-24 object-cover rounded-md" alt="room" />
                          ) : (
                            <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-400 text-center p-2 border border-dashed">Chưa có ảnh</div>
                          )}
                          <div className="flex-1">
                            <p className="font-bold text-gray-800 leading-tight">{rt.name}</p>
                            <p className="text-sky-600 font-bold mt-1">{rt.basePrice.toLocaleString('vi-VN')}₫</p>
                            <p className="text-[11px] text-gray-500 mt-1">
                              Sức chứa: {rt.maxAdults} Người lớn, {rt.maxChildren} Trẻ em • Tổng: {rt.totalRooms} phòng
                            </p>
                            {rt.amenities.length > 0 && (
                              <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">
                                {rt.amenities.map(a => a.name).join(' · ')}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      {hotelDetail.roomTypes.length === 0 && (
                        <p className="text-sm text-gray-500 col-span-full">Khách sạn chưa có loại phòng nào.</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-red-500 py-10">Không có dữ liệu.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORM ĐĂNG KÝ */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4 border-b pb-2">Đơn Đăng Ký Cơ Sở Khách Sạn</h3>
            <form onSubmit={handleRegister} className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Tên khách sạn</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="VD: Khách sạn Mường Thanh..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Tỉnh / Thành phố</label>
                  <SearchableSelect
                    options={provinces.map(p => ({ value: p.id, label: p.name }))}
                    value={provinceId}
                    onChange={(val) => setProvinceId(val)}
                    placeholder="-- Chọn Tỉnh/Thành --"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Quận / Huyện / Phường / Xã</label>
                  <SearchableSelect
                    options={wards.map(w => ({ value: w.id, label: w.name }))}
                    value={wardId}
                    onChange={(val) => setWardId(val)}
                    placeholder="-- Chọn Phường/Xã --"
                    disabled={!provinceId}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Địa chỉ chi tiết</label>
                <input type="text" required value={addressLine} onChange={e => setAddressLine(e.target.value)} className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="VD: 123 Đường Nguyễn Văn Linh..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Mã số thuế</label>
                <input type="text" required value={taxCode} onChange={e => setTaxCode(e.target.value)} className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="VD: 0101234567-001" />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t mt-2">
                <button type="button" onClick={() => setIsRegisterModalOpen(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition font-medium">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white hover:bg-sky-700 rounded-lg transition font-medium">Gửi Yêu Cầu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default HotelCatalog;
