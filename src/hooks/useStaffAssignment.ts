import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useConfirm } from '../components/ConfirmModal';
import { extractErrorMessage } from '../utils/formatters';

export interface Staff {
  id: string;
  fullName: string | null;
  username: string;
  email: string;
  hotelId: string | null;
  hotelName: string | null;
  role: string | null;
}

export interface Hotel {
  id: string;
  name: string;
}

export const useStaffAssignment = () => {
  const confirm = useConfirm();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<string>('');

  const [unassignedStaff, setUnassignedStaff] = useState<Staff[]>([]);
  const [assignedStaff, setAssignedStaff] = useState<Staff[]>([]);

  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [selectedRole, setSelectedRole] = useState<Record<string, string>>({});
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const [resStaff, resHotels] = await Promise.all([
        api.get('/BusinessStaff'),
        api.get('/hotels/my-hotels'),
      ]);

      const allStaff = (resStaff.data.data || [])
        .filter((emp: any) => emp.role !== 'partner')
        .map((emp: any) => ({
          id: emp.id,
          fullName: emp.fullName,
          username: emp.username || emp.email,
          email: emp.email,
          hotelId: emp.assignedHotelId ?? null,
          hotelName: emp.assignedHotelName ?? null,
          role: emp.roleInHotel ?? null,
        })) as Staff[];

      const allHotels = resHotels.data.data || [] as Hotel[];

      setUnassignedStaff(allStaff.filter((s) => !s.hotelId));
      setAssignedStaff(allStaff.filter((s) => !!s.hotelId));
      setHotels(allHotels);

      if (!selectedHotelId && allHotels.length > 0) {
        setSelectedHotelId(allHotels[0].id);
      }
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, 'Không thể tải dữ liệu nhân sự.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const assignedForSelectedHotel = useMemo(
    () => assignedStaff.filter((s) => s.hotelId === selectedHotelId),
    [assignedStaff, selectedHotelId]
  );

  const handleAssign = async () => {
    if (!selectedStaffId) {
      toast.error('Vui lòng chọn một nhân viên để phân công!');
      return;
    }
    if (!selectedHotelId) {
      toast.error('Vui lòng chọn khách sạn ở phần trên trước!');
      return;
    }
    const role = selectedRole[selectedStaffId];
    if (!role) {
      toast.error('Vui lòng chọn vai trò cho nhân viên này!');
      return;
    }

    try {
      setProcessingId(selectedStaffId);
      await api.post('/StaffAssignment', {
        employeeId: selectedStaffId,
        hotelId: selectedHotelId,
        roleInHotel: role,
      });
      setSelectedStaffId(null);
      setSelectedRole((prev) => {
        const next = { ...prev };
        delete next[selectedStaffId];
        return next;
      });
      await fetchStaffData();
      toast.success('Phân công nhân viên thành công!');
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, 'Phân công thất bại'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleUnassign = async (staffId: string) => {
    const ok = await confirm({
      title: 'Hủy phân công',
      message: 'Hủy phân công nhân viên này? Họ sẽ không còn quyền quản lý khách sạn hiện tại.',
      confirmText: 'Hủy phân công',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      setProcessingId(staffId);
      await api.delete(`/StaffAssignment/${staffId}`);
      await fetchStaffData();
      toast.success('Hủy phân công thành công!');
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, 'Hủy phân công thất bại'));
    } finally {
      setProcessingId(null);
    }
  };

  const selectedHotelName = hotels.find((h) => h.id === selectedHotelId)?.name ?? '';

  return {
    hotels,
    selectedHotelId,
    setSelectedHotelId,
    unassignedStaff,
    assignedForSelectedHotel,
    loading,
    processingId,
    selectedRole,
    setSelectedRole,
    selectedStaffId,
    setSelectedStaffId,
    handleAssign,
    handleUnassign,
    selectedHotelName
  };
};
