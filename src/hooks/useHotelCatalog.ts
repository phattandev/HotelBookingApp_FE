import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

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
        .catch(() => toast.error('Lỗi khi tải chi tiết khách sạn'))
        .finally(() => setLoadingDetail(false));
    } else {
      setHotelDetail(null);
    }
  }, [detailModalHotelId]);

  const [editingHotelId, setEditingHotelId] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

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
      toast.success('Tạo bản nháp khách sạn thành công! Hãy hoàn thiện thông tin trước khi gửi.');
      setIsRegisterModalOpen(false);
      setName(''); setAddressLine(''); setProvinceId(''); setWardId(''); setTaxCode('');
      fetchMyHotels();
    } catch (err: any) {
      toast.error(err.response?.data?.Message || 'Đăng ký thất bại');
    }
  };

  const handleSubmitRegistration = async (hotelId: string) => {
    try {
      setSubmittingId(hotelId);
      await api.post(`/hotels/${hotelId}/submit`);
      toast.success('Đã gửi đơn đăng ký khách sạn! Vui lòng chờ Admin phê duyệt.');
      fetchMyHotels();
    } catch (err: any) {
      toast.error(err.response?.data?.Message || 'Không thể gửi đơn đăng ký');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleUpdateBasicInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHotelId) return;
    try {
      await api.put(`/hotels/${editingHotelId}/basic-info`, {
        name, addressLine, wardId
      });
      toast.success('Cập nhật thông tin khách sạn thành công');
      setEditingHotelId(null);
      fetchMyHotels();
      if (detailModalHotelId === editingHotelId) {
          api.get(`/hotels/my-hotels/${detailModalHotelId}`).then(res => setHotelDetail(res.data.data));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.Message || 'Cập nhật thất bại');
    }
  };

  const openEditModal = (hotel: HotelDetail) => {
    setName(hotel.name || '');
    setAddressLine(hotel.addressLine || '');
    setProvinceId(hotel.provinceId || '');
    setWardId(hotel.wardId || '');
    setEditingHotelId(hotel.id);
  };

  const totalPages = Math.ceil(hotels.length / itemsPerPage);
  const paginatedHotels = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return hotels.slice(start, start + itemsPerPage);
  }, [hotels, currentPage]);

  return {
    hotels,
    paginatedHotels,
    provinces,
    wards,
    
    isRegisterModalOpen,
    setIsRegisterModalOpen,
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
    openEditModal
  };
};
