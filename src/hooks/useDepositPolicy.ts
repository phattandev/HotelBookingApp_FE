import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export interface DepositPolicy {
  id: string;
  hotelId: string;
  hoursBeforeCheckIn: number;
  depositPercentage: number;
  isActive: boolean;
  updatedAt: string;
}

export const useDepositPolicy = () => {
  const [policy, setPolicy] = useState<DepositPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [hours, setHours] = useState<number>(24);
  const [percentage, setPercentage] = useState<number>(50);
  const [isActive, setIsActive] = useState(true);

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      const res = await api.get('/manager/deposit-policy');
      const data = res.data.data as DepositPolicy | null;
      setPolicy(data);
      if (data) {
        setHours(data.hoursBeforeCheckIn);
        setPercentage(data.depositPercentage);
        setIsActive(data.isActive);
      }
    } catch {
      toast.error('Không thể tải chính sách đặt cọc.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPolicy(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (percentage < 1 || percentage > 100) { toast.error('Tỉ lệ cọc phải từ 1% đến 100%.'); return; }
    if (hours <= 0) { toast.error('Số giờ phải lớn hơn 0.'); return; }

    setSubmitting(true);
    try {
      if (policy) {
        await api.put('/manager/deposit-policy', { hoursBeforeCheckIn: hours, depositPercentage: percentage, isActive });
        toast.success('Đã cập nhật chính sách đặt cọc!');
      } else {
        await api.post('/manager/deposit-policy', { hoursBeforeCheckIn: hours, depositPercentage: percentage });
        toast.success('Đã tạo chính sách đặt cọc!');
      }
      setIsEditing(false);
      await fetchPolicy();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = () => {
    if (policy) {
      setHours(policy.hoursBeforeCheckIn);
      setPercentage(policy.depositPercentage);
      setIsActive(policy.isActive);
    }
    setIsEditing(true);
  };

  return {
    policy,
    loading,
    submitting,
    isEditing,
    setIsEditing,
    formData: { hours, setHours, percentage, setPercentage, isActive, setIsActive },
    handleSubmit,
    handleEdit,
  };
};
