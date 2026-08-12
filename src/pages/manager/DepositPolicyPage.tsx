import React from 'react';
import { useDepositPolicy } from '../../hooks/useDepositPolicy';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const DepositPolicyPage: React.FC<{ isPending?: boolean }> = ({ isPending }) => {
  const {
    policy,
    loading,
    submitting,
    isEditing,
    setIsEditing,
    formData,
    fieldErrors,
    handleSubmit,
    handleEdit,
  } = useDepositPolicy();

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
            <Button onClick={handleEdit} variant="primary" disabled={isPending}>
              Chỉnh sửa
            </Button>
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
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="text-amber-700 font-medium mb-1">Chưa có chính sách đặt cọc</p>
          <p className="text-sm text-amber-600 mb-4">
            Nếu chưa thiết lập, hệ thống sẽ dùng mặc định: cọc 50%, hạn 24h trước check-in.
          </p>
          <Button onClick={() => setIsEditing(true)} variant="primary" disabled={isPending}>
            Tạo chính sách
          </Button>
        </div>
      ) : null}

      {/* Edit / Create form */}
      {isEditing && (
        <form onSubmit={handleSubmit} noValidate className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <p className="font-semibold text-slate-800">
            {policy ? 'Chỉnh sửa chính sách đặt cọc' : 'Tạo chính sách đặt cọc mới'}
          </p>

          <div>
            <Input
              label="Tỉ lệ đặt cọc (%)"
              type="number"
              min="1"
              max="100"
              value={formData.percentage.toString()}
              onChange={e => formData.setPercentage(Number(e.target.value))}
              placeholder="Ví dụ: 50 (50% tổng tiền phòng)"
              error={fieldErrors?.percentage}
            />
            <p className="text-xs text-slate-400 mt-1">
              Số tiền khách phải cọc = {formData.percentage}% × Tổng tiền phòng
            </p>
          </div>

          <div>
            <Input
              label="Hạn thanh toán cọc (giờ trước ngày nhận phòng)"
              type="number"
              min="1"
              value={formData.hours.toString()}
              onChange={e => formData.setHours(Number(e.target.value))}
              placeholder="Ví dụ: 24 (phải cọc trước 1 ngày)"
              error={fieldErrors?.hours}
            />
            <p className="text-xs text-slate-400 mt-1">
              Khách phải thanh toán cọc ít nhất {formData.hours} giờ trước 00:00 ngày nhận phòng.
            </p>
          </div>

          {policy && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => formData.setIsActive(!formData.isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.isActive ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.isActive ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
              <span className="text-sm text-slate-700">
                {formData.isActive ? 'Đang áp dụng' : 'Tạm dừng'}
              </span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={submitting}
            >
              {submitting ? 'Đang lưu...' : policy ? 'Cập nhật' : 'Tạo chính sách'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Hủy
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default DepositPolicyPage;
