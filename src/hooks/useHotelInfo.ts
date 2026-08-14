import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { useConfirm } from '../components/ConfirmModal';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '../utils/formatters';

export interface HotelImage { id: string; url: string; publicId: string; isPrimary: boolean; displayOrder: number; }
export interface AmenityItem { id: string; name: string; categoryName: string; applicableTo: string; }
export interface HotelDetail {
  id: string; name: string; addressLine: string; description: string | null; starRating: number | null;
  approvalStatus: string; isActive: boolean; images: HotelImage[]; amenities: AmenityItem[];
  provinceId?: string; wardId?: string; provinceName?: string; wardName?: string;
}

export const useHotelInfo = () => {
  const confirm = useConfirm();
  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [allAmenities, setAllAmenities] = useState<AmenityItem[]>([]);

  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State

  // Other Form State
  const [description, setDescription] = useState('');
  const [starRating, setStarRating] = useState<number | null>(null);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [hotelRes, amenitiesRes] = await Promise.all([
        api.get('/manager/hotel'),
        api.get('/manager/hotel/amenities/catalog?type=hotel')
      ]);
      const h: HotelDetail = hotelRes.data.data;
      setHotel(h);
      setDescription(h.description || '');
      setStarRating(h.starRating);
      setSelectedAmenityIds(h.amenities.map((a) => a.id));
      
      const fetchedAmenities: AmenityItem[] = amenitiesRes.data.data || [];
      setAllAmenities(fetchedAmenities.filter(a => a.applicableTo === 'hotel'));
    } catch (err: unknown) {
      setMsg({ type: 'error', text: extractErrorMessage(err, 'Không thể tải thông tin khách sạn.') });
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
      setMsg({ type: 'success', text: 'Đã lưu mô tả và tiện nghi thành công!' });
      fetchData();
    } catch (err: unknown) {
      setMsg({ type: 'error', text: extractErrorMessage(err, 'Lỗi khi lưu thông tin. Vui lòng thử lại.') });
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
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, 'Upload ảnh thất bại.'));
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
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, 'Xóa ảnh thất bại.'));
    }
  }, [confirm, fetchData]);

  const toggleAmenity = useCallback((id: string) => {
    setSelectedAmenityIds((prev) => {
      const nextIds = new Set(prev);
      nextIds.has(id) ? nextIds.delete(id) : nextIds.add(id);
      return Array.from(nextIds);
    });
  }, []);

  return {
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
  };
};
