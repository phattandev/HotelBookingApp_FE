import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface DepositPolicy {
  id: string;
  hotelId: string;
  hoursBeforeCheckIn: number;
  depositPercentage: number;
  isActive: boolean;
  updatedAt: string;
}

const DepositPolicyPage: React.FC = () => {
  const [policy, setPolicy] = useState<DepositPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [hours, setHours] = useState<number>(24);
  const [percentage, setPercentage] = useState<number>(50);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchPolicy();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700 space-y-1">
        <p className="font-semibold">Cách hoạt động:</p>
        <ul className="list-disc list-inside space-y-0.5 text-blue-600">
          <li>Khi đơn được duyệt, hệ thống tính hạn cọc dựa trên số giờ trước ngày nhận phòng.</li>
          <li>Nếu đặt phòng gần ngày check-in (ít hơn số giờ quy định), khách có 4 giờ ân hạn để cọc.</li>
          <li>Quá hạn mà chưa cọc → hệ thống tự động hủy đơn.</li>
        </ul>
      </div>

      {/* Display current policy */}
      {policy && !isEditing ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Chính sách hiện tại</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                policy.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {policy.isActive ? '● Đang áp dụng' : '○ Tạm dừng'}
              </span>
            </div>
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Chỉnh sửa
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-xs text-slate-500 mb-1">Tỉ lệ đặt cọc</p>
              <p className="text-2xl font-bold text-slate-800">{policy.depositPercentage}%</p>
              <p className="text-xs text-slate-400 mt-1">trên tổng tiền phòng</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-xs text-slate-500 mb-1">Hạn cọc</p>
              <p className="text-2xl font-bold text-slate-800">{policy.hoursBeforeCheckIn}h</p>
              <p className="text-xs text-slate-400 mt-1">trước ngày nhận phòng</p>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Cập nhật lần cuối: {new Date(policy.updatedAt).toLocaleString('vi-VN')}
          </p>
        </div>
      ) : !isEditing ? (
        /* No policy yet */
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="text-amber-700 font-medium mb-1">Chưa có chính sách đặt cọc</p>
          <p className="text-sm text-amber-600 mb-4">
            Nếu chưa thiết lập, hệ thống sẽ dùng mặc định: cọc 50%, hạn 24h trước check-in.
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="px-5 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition"
          >
            Tạo chính sách
          </button>
        </div>
      ) : null}

      {/* Edit / Create form */}
      {isEditing && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <p className="font-semibold text-slate-800">
            {policy ? 'Chỉnh sửa chính sách đặt cọc' : 'Tạo chính sách đặt cọc mới'}
          </p>

          {/* Deposit percentage */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Tỉ lệ đặt cọc (%)
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={percentage}
              onChange={e => setPercentage(Number(e.target.value))}
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ví dụ: 50 (50% tổng tiền phòng)"
            />
            <p className="text-xs text-slate-400 mt-1">
              Số tiền khách phải cọc = {percentage}% × Tổng tiền phòng
            </p>
          </div>

          {/* Hours before check-in */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Hạn thanh toán cọc (giờ trước ngày nhận phòng)
            </label>
            <input
              type="number"
              min={1}
              value={hours}
              onChange={e => setHours(Number(e.target.value))}
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ví dụ: 24 (phải cọc trước 1 ngày)"
            />
            <p className="text-xs text-slate-400 mt-1">
              Khách phải thanh toán cọc ít nhất {hours} giờ trước 00:00 ngày nhận phòng.
            </p>
          </div>

          {/* Active toggle (only for update) */}
          {policy && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isActive ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isActive ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
              <span className="text-sm text-slate-700">
                {isActive ? 'Đang áp dụng' : 'Tạm dừng'}
              </span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {submitting ? 'Đang lưu...' : policy ? 'Cập nhật' : 'Tạo chính sách'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition"
            >
              Hủy
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default DepositPolicyPage;
