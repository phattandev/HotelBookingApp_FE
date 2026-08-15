import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { toSentenceCase, isValidTaxCode, extractErrorMessage } from '../utils/formatters';

export interface Hotel {
  id: string;
  name: string;
  addressLine: string;
  taxCode: string;
  approvalStatus: string;
  isActive: boolean;
  rejectionReason?: string;
  roomTypeCount: number;
  staffCount: number;
}

export interface HotelDetail extends Hotel {
  provinceName: string;
  wardName: string;
  provinceId: string;
  wardId: string;
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

export const useHotelCatalog = () => {
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
  const itemsPerPage = 6;

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
  }, [provinceId]);

  useEffect(() => {
    if (detailModalHotelId) {
      setLoadingDetail(true);
      api.get(`/hotels/my-hotels/${detailModalHotelId}`)
        .then(res => setHotelDetail(res.data.data))
        .catch((err) => toast.error(extractErrorMessage(err, 'Lỗi khi tải chi tiết khách sạn')))
        .finally(() => setLoadingDetail(false));
    } else {
      setHotelDetail(null);
    }
  }, [detailModalHotelId]);

  const [editingHotelId, setEditingHotelId] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
    setFieldErrors({});

    let hasError = false;
    const errors: Record<string, string> = {};

    if (!name.trim()) { 
      errors.name = 'Tên khách sạn không được để trống'; hasError = true; 
    } else if (name.trim().length < 2 || name.trim().length > 100) {
      errors.name = 'Tên khách sạn phải từ 2 đến 100 ký tự'; hasError = true;
    }
    
    if (!provinceId) { errors.provinceId = 'Vui lòng chọn Tỉnh/Thành'; hasError = true; }
    if (!wardId) { errors.wardId = 'Vui lòng chọn Phường/Xã'; hasError = true; }
    if (!addressLine.trim()) { errors.addressLine = 'Địa chỉ không được để trống'; hasError = true; }
    
    if (!taxCode.trim()) { 
      errors.taxCode = 'Mã số thuế không được để trống'; hasError = true; 
    } else if (!isValidTaxCode(taxCode.trim())) {
      errors.taxCode = 'Mã số thuế phải gồm 10 số hoặc 13 số (VD: 0123456789 hoặc 0123456789-001)'; hasError = true;
    }

    if (hasError) {
      setFieldErrors(errors);
      return;
    }

    try {
      const formattedName = toSentenceCase(name.trim());
      await api.post('/hotels/register', { name: formattedName, taxCode: taxCode.trim(), addressLine, wardId });
      toast.success('Tạo bản nháp khách sạn thành công! Hãy hoàn thiện thông tin trước khi gửi.');
      setIsRegisterModalOpen(false);
      setName(''); setAddressLine(''); setProvinceId(''); setWardId(''); setTaxCode('');
      fetchMyHotels();
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, 'Đăng ký thất bại'));
    }
  };

  const handleSubmitRegistration = async (hotelId: string) => {
    try {
      setSubmittingId(hotelId);
      await api.post(`/hotels/${hotelId}/submit`);
      toast.success('Đã gửi đơn đăng ký khách sạn! Vui lòng chờ Admin phê duyệt.');
      fetchMyHotels();
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, 'Không thể gửi đơn đăng ký'));
    } finally {
      setSubmittingId(null);
    }
  };

  const handleUpdateBasicInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    let hasError = false;
    const errors: Record<string, string> = {};

    if (!name.trim()) { 
      errors.name = 'Tên khách sạn không được để trống'; hasError = true; 
    } else if (name.trim().length < 2 || name.trim().length > 100) {
      errors.name = 'Tên khách sạn phải từ 2 đến 100 ký tự'; hasError = true;
    }
    
    if (!provinceId) { errors.provinceId = 'Vui lòng chọn Tỉnh/Thành'; hasError = true; }
    if (!wardId) { errors.wardId = 'Vui lòng chọn Phường/Xã'; hasError = true; }
    if (!addressLine.trim()) { errors.addressLine = 'Địa chỉ không được để trống'; hasError = true; }

    if (hasError) {
      setFieldErrors(errors);
      return;
    }

    if (!editingHotelId) return;
    try {
      const formattedName = toSentenceCase(name.trim());
      await api.put(`/hotels/${editingHotelId}/basic-info`, {
        name: formattedName, addressLine, wardId
      });
      toast.success('Cập nhật thông tin khách sạn thành công');
      setEditingHotelId(null);
      fetchMyHotels();
      if (detailModalHotelId === editingHotelId) {
          api.get(`/hotels/my-hotels/${detailModalHotelId}`).then(res => setHotelDetail(res.data.data));
      }
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, 'Cập nhật thất bại'));
    }
  };

  const openEditModal = (hotel: HotelDetail) => {
    setName(hotel.name || '');
    setAddressLine(hotel.addressLine || '');
    setProvinceId(hotel.provinceId || '');
    setWardId(hotel.wardId || '');
    setEditingHotelId(hotel.id);
    setFieldErrors({});
  };

  const totalPages = Math.ceil(hotels.length / itemsPerPage);
  const paginatedHotels = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return hotels.slice(start, start + itemsPerPage);
  }, [hotels, currentPage]);

  const handleOpenRegisterModal = () => {
    setName(''); setAddressLine(''); setProvinceId(''); setWardId(''); setTaxCode('');
    setFieldErrors({});
    setIsRegisterModalOpen(true);
  };

  return {
    hotels,
    paginatedHotels,
    provinces,
    wards,
    
    isRegisterModalOpen,
    setIsRegisterModalOpen,
    handleOpenRegisterModal,
    detailModalHotelId,
    setDetailModalHotelId,
    hotelDetail,
    loadingDetail,
    
    editingHotelId,
    setEditingHotelId,
    submittingId,

    formData: {
      name, setName,
      addressLine, setAddressLine,
      provinceId, setProvinceId,
      wardId, setWardId,
      taxCode, setTaxCode
    },
    
    pagination: {
      currentPage,
      setCurrentPage,
      totalPages
    },
    
    handleRegister,
    handleSubmitRegistration,
    handleUpdateBasicInfo,
    openEditModal,
    fieldErrors
  };
};
