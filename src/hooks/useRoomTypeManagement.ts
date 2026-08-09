import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useConfirm } from '../components/ConfirmModal';

export interface HotelImage { id: string; url: string; isPrimary: boolean; displayOrder: number; }
export interface AmenityItem { id: string; name: string; categoryName: string; }
export interface RoomType {
  id: string; name: string; basePrice: number; maxAdults: number; maxChildren: number;
  totalRooms: number; bookedRooms: number; availableRooms: number; description: string; isActive: boolean;
  images: HotelImage[]; amenities: AmenityItem[];
}

export const defaultForm = {
  name: '', basePrice: 0, maxAdults: 1, maxChildren: 0, totalRooms: 1, description: '', amenityIds: [] as string[],
};

export const useRoomTypeManagement = () => {
  const confirm = useConfirm();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [allAmenities, setAllAmenities] = useState<AmenityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRt, setEditingRt] = useState<RoomType | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
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
      setIsPending(hotelRes.data.data?.approvalStatus === 'Pending');

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

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleOpenCreate = () => {
    setEditingRt(null);
    setForm(defaultForm);
    setPendingFiles([]);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rt: RoomType) => {
    setEditingRt(rt);
    setForm({
      name: rt.name, basePrice: rt.basePrice, maxAdults: rt.maxAdults, maxChildren: rt.maxChildren,
      totalRooms: rt.totalRooms, description: rt.description || '', amenityIds: rt.amenities.map(a => a.id),
    });
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    let hasError = false;
    const errors: Record<string, string> = {};

    if (!form.name.trim()) { errors.name = 'Tên loại phòng không được để trống'; hasError = true; }
    if (form.basePrice < 0 || form.basePrice === null || form.basePrice === undefined || form.basePrice === 0) { errors.basePrice = 'Giá cơ bản không hợp lệ'; hasError = true; }
    if (!form.totalRooms || form.totalRooms < 1) { errors.totalRooms = 'Tổng số phòng phải lớn hơn 0'; hasError = true; }
    if (!form.maxAdults || form.maxAdults < 1) { errors.maxAdults = 'Số người lớn tối đa phải lớn hơn 0'; hasError = true; }
    if (form.maxChildren < 0 || form.maxChildren === null || form.maxChildren === undefined || form.maxChildren === 0) { errors.maxChildren = 'Số trẻ em tối đa không hợp lệ'; hasError = true; }

    if (hasError) {
      setFieldErrors(errors);
      return;
    }

    setSaving(true);
    try {
      if (editingRt) {
        await api.put(`/manager/roomtypes/${editingRt.id}`, form);
        toast.success('Cập nhật loại phòng thành công!');
        setIsModalOpen(false);
        fetchData();
      } else {
        const res = await api.post('/manager/roomtypes', form);
        const newId: string = res.data.data;
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

  return {
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
    filters: {
      searchQuery, setSearchQuery,
      minPrice, setMinPrice,
      maxPrice, setMaxPrice,
      minCapacity, setMinCapacity
    },
    filteredRoomTypes,
    handleOpenCreate,
    handleOpenEdit,
    handleSubmit,
    handleDelete,
    handleRestore,
    handleUploadRoomImage,
    handleDeleteRoomImage,
    toggleFormAmenity,
    fieldErrors
  };
};
