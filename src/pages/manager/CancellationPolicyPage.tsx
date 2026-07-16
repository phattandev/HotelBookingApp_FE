import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface CancellationPolicy {
  id: string;
  hotelId: string;
  policyName: string;
  hoursBeforeCheckIn: number;
  penaltyPercentage: number;
  isActive: boolean;
  updatedAt: string;
}

const CancellationPolicyPage: React.FC = () => {
  const [policy, setPolicy] = useState<CancellationPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [policyName, setPolicyName] = useState('');
  const [hours, setHours] = useState<number>(24);
  const [penalty, setPenalty] = useState<number>(100);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchPolicy();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (penalty < 0 || penalty > 100) { toast.error('Tỉ lệ phạt phải từ 0 đến 100%.'); return; }
    if (hours <= 0) { toast.error('Mốc giờ phải lớn hơn 0.'); return; }

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

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      Đang tải dữ liệu...
    </div>
  );

  return (
    <div className="w-full">
      {/* Header and Add button */}
      <div className="flex items-center justify-end mb-4">
        {policy && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition shadow-sm"
          >
            Chỉnh sửa
          </button>
        )}
      </div>

      {/* Policy Info hoặc Form */}
      {!policy && !isEditing ? (
        // Chưa có policy → hiển thị CTA
        <div className="bg-white border border-slate-200 rounded-xl p-16 text-center shadow-sm">
          <h3 className="font-bold text-slate-900 text-lg">Chưa thiết lập chính sách hủy phòng</h3>
          <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
            Khi khách hủy đơn đã xác nhận, hệ thống cần biết quy định hoàn tiền của khách sạn bạn.
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="mt-6 mx-auto px-5 py-2.5 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 transition shadow-sm"
          >
            Tạo chính sách ngay
          </button>
        </div>
      ) : !isEditing && policy ? (
        // Hiển thị policy hiện tại (read-only)
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full max-w-3xl">
          <div className={`px-6 py-4 border-b ${policy.isActive ? 'bg-violet-50 border-violet-100' : 'bg-slate-50 border-slate-100'}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">{policy.policyName}</h3>
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${policy.isActive ? 'bg-violet-600 text-white' : 'bg-slate-400 text-white'}`}>
                {policy.isActive ? 'Đang áp dụng' : 'Tắt'}
              </span>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Mốc thời gian miễn phí
                </p>
                <p className="text-3xl font-bold text-slate-900">{policy.hoursBeforeCheckIn}<span className="text-base font-medium text-slate-500 ml-1">giờ</span></p>
                <p className="text-xs text-slate-500 mt-2">Trước giờ check-in</p>
              </div>
              <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-red-700">Tỉ lệ phạt</p>
                <p className="text-3xl font-bold text-red-600">{policy.penaltyPercentage}<span className="text-base font-medium text-red-400 ml-1">%</span></p>
                <p className="text-xs text-red-500 mt-2">Khi hủy sau mốc trên</p>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-violet-50 rounded-xl p-5 text-sm text-violet-800 border border-violet-100">
              <p className="font-bold mb-2">Diễn giải chính sách:</p>
              <ul className="space-y-1.5 text-violet-700">
                <li>• Hủy <strong>trước {policy.hoursBeforeCheckIn} giờ</strong> check-in → hoàn tiền <strong>100%</strong></li>
                <li>• Hủy <strong>trong vòng {policy.hoursBeforeCheckIn} giờ</strong> check-in → phạt <strong>{policy.penaltyPercentage}%</strong>, hoàn tiền {100 - policy.penaltyPercentage}%</li>
              </ul>
            </div>

            <p className="text-xs text-slate-400">
              Cập nhật lần cuối: {new Date(policy.updatedAt).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>
      ) : (
        // Form tạo/sửa
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 w-full max-w-3xl">
          <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3">{policy ? 'Chỉnh sửa chính sách' : 'Tạo chính sách mới'}</h3>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tên chính sách</label>
            <input
              type="text"
              value={policyName}
              onChange={e => setPolicyName(e.target.value)}
              placeholder="VD: Linh hoạt 24h, Tiêu chuẩn 48h..."
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Mốc giờ miễn phí hủy
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  value={hours}
                  onChange={e => setHours(Number(e.target.value))}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition pr-14"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">giờ</span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Hủy trước mốc này → hoàn 100%</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Tỉ lệ phạt (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={5}
                  value={penalty}
                  onChange={e => setPenalty(Number(e.target.value))}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition pr-8"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">%</span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Hủy sau mốc → phạt {penalty}%, hoàn {100 - penalty}%</p>
            </div>
          </div>

          {/* Preview */}
          {policyName && (
            <div className="bg-violet-50 rounded-xl p-4 text-sm text-violet-800 border border-violet-100">
              <p className="font-bold mb-1">Xem trước: <span className="text-violet-600">{policyName}</span></p>
              <p className="mt-1">✅ Hủy trước <strong>{hours} giờ</strong> check-in → hoàn <strong>100%</strong></p>
              <p className="mt-1">❌ Hủy trong vòng <strong>{hours} giờ</strong> → phạt <strong>{penalty}%</strong>, hoàn {100 - penalty}%</p>
            </div>
          )}

          {policy && (
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
              />
              <label htmlFor="isActive" className="text-sm text-slate-700 font-medium">Kích hoạt chính sách này</label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            {isEditing && (
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition">
                Hủy
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 transition"
            >
              {submitting ? 'Đang lưu...' : (policy ? 'Lưu thay đổi' : 'Tạo chính sách')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CancellationPolicyPage;
