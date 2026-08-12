import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export interface CancellationPolicy {
  id: string;
  hotelId: string;
  policyName: string;
  hoursBeforeCheckIn: number;
  penaltyPercentage: number;
  isActive: boolean;
  updatedAt: string;
}

export const useCancellationPolicy = () => {
  const [policy, setPolicy] = useState<CancellationPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [policyName, setPolicyName] = useState('');
  const [hours, setHours] = useState<number>(24);
  const [penalty, setPenalty] = useState<number>(100);
  const [isActive, setIsActive] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      const res = await api.get('/manager/policy');
      const data = res.data.data as CancellationPolicy | null;
      setPolicy(data);
      if (data) {
        setPolicyName(data.policyName);
        setHours(data.hoursBeforeCheckIn);
        setPenalty(data.penaltyPercentage);
        setIsActive(data.isActive);
      }
    } catch {
      toast.error('Không thể tải chính sách hủy phòng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPolicy(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    let hasError = false;
    const errors: Record<string, string> = {};

    if (!policyName.trim()) { errors.policyName = 'Tên chính sách không được để trống'; hasError = true; }
    if (penalty < 0 || penalty > 100) { errors.penalty = 'Tỉ lệ phạt phải từ 0 đến 100%'; hasError = true; }
    if (hours <= 0) { errors.hours = 'Mốc giờ phải lớn hơn 0'; hasError = true; }

    if (hasError) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      if (policy) {
        await api.put('/manager/policy', { policyName, hoursBeforeCheckIn: hours, penaltyPercentage: penalty, isActive });
        toast.success('Đã cập nhật chính sách hủy phòng!');
      } else {
        await api.post('/manager/policy', { policyName, hoursBeforeCheckIn: hours, penaltyPercentage: penalty });
        toast.success('Đã tạo chính sách hủy phòng!');
      }
      setIsEditing(false);
      await fetchPolicy();
    } catch (err: any) {
      toast.error(err.response?.data?.Message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    policy,
    loading,
    submitting,
    isEditing,
    setIsEditing,
    formData: { policyName, setPolicyName, hours, setHours, penalty, setPenalty, isActive, setIsActive },
    fieldErrors,
    handleSubmit,
  };
};
