import React from 'react';
import { useCancellationPolicy } from '../../hooks/useCancellationPolicy';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const CancellationPolicyPage: React.FC<{ isPending?: boolean }> = ({ isPending }) => {
  const {
    policy,
    loading,
    submitting,
    isEditing,
    setIsEditing,
    formData,
    fieldErrors,
    handleSubmit,
  } = useCancellationPolicy();

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      Đang tải dữ liệu...
    </div>
  );

  return (
    <div className="w-full">
      {/* Header and Edit button */}
      <div className="flex items-center justify-end mb-4">
        {policy && !isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="primary" disabled={isPending}>
            Chỉnh sửa
          </Button>
        )}
      </div>

      {/* Policy Info hoặc Form */}
      {!policy && !isEditing ? (
        <div className="bg-white border border-slate-200 rounded-xl p-16 text-center shadow-sm">
          <h3 className="font-bold text-slate-900 text-lg">Chưa thiết lập chính sách hủy phòng</h3>
          <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto mb-6">
            Khi khách hủy đơn đã xác nhận, hệ thống cần biết quy định hoàn tiền của khách sạn bạn.
          </p>
          <Button onClick={() => setIsEditing(true)} variant="primary" disabled={isPending}>
            Tạo chính sách ngay
          </Button>
        </div>
      ) : !isEditing && policy ? (
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
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mốc thời gian miễn phí</p>
                <p className="text-3xl font-bold text-slate-900">{policy.hoursBeforeCheckIn}<span className="text-base font-medium text-slate-500 ml-1">giờ</span></p>
                <p className="text-xs text-slate-500 mt-2">Trước giờ check-in</p>
              </div>
              <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-red-700">Tỉ lệ phạt</p>
                <p className="text-3xl font-bold text-red-600">{policy.penaltyPercentage}<span className="text-base font-medium text-red-400 ml-1">%</span></p>
                <p className="text-xs text-red-500 mt-2">Khi hủy sau mốc trên</p>
              </div>
            </div>

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
        <form onSubmit={handleSubmit} noValidate className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 w-full max-w-3xl">
          <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3">{policy ? 'Chỉnh sửa chính sách' : 'Tạo chính sách mới'}</h3>

          <div>
            <Input
              label="Tên chính sách"
              type="text"
              value={formData.policyName}
              onChange={e => formData.setPolicyName(e.target.value)}
              placeholder="VD: Linh hoạt 24h, Tiêu chuẩn 48h..."
              error={fieldErrors?.policyName}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <Input
                label="Mốc giờ miễn phí hủy"
                type="number"
                min="1"
                value={formData.hours.toString()}
                onChange={e => formData.setHours(Number(e.target.value))}
                error={fieldErrors?.hours}
              />
              <p className="text-xs text-slate-400 mt-1.5">Hủy trước mốc này → hoàn 100%</p>
            </div>

            <div>
              <Input
                label="Tỉ lệ phạt (%)"
                type="number"
                min="0"
                max="100"
                step="5"
                value={formData.penalty.toString()}
                onChange={e => formData.setPenalty(Number(e.target.value))}
                error={fieldErrors?.penalty}
              />
              <p className="text-xs text-slate-400 mt-1.5">Hủy sau mốc → phạt {formData.penalty}%, hoàn {100 - formData.penalty}%</p>
            </div>
          </div>

          {formData.policyName && (
            <div className="bg-violet-50 rounded-xl p-4 text-sm text-violet-800 border border-violet-100">
              <p className="font-bold mb-1">Xem trước: <span className="text-violet-600">{formData.policyName}</span></p>
              <p className="mt-1">✅ Hủy trước <strong>{formData.hours} giờ</strong> check-in → hoàn <strong>100%</strong></p>
              <p className="mt-1">❌ Hủy trong vòng <strong>{formData.hours} giờ</strong> → phạt <strong>{formData.penalty}%</strong>, hoàn {100 - formData.penalty}%</p>
            </div>
          )}

          {policy && (
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={e => formData.setIsActive(e.target.checked)}
                className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
              />
              <label htmlFor="isActive" className="text-sm text-slate-700 font-medium">Kích hoạt chính sách này</label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            {isEditing && (
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Hủy
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              isLoading={submitting}
            >
              {submitting ? 'Đang lưu...' : (policy ? 'Lưu thay đổi' : 'Tạo chính sách')}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CancellationPolicyPage;
