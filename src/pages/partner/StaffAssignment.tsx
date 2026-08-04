import React from 'react';
import { useStaffAssignment } from '../../hooks/useStaffAssignment';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';

const ROLE_LABELS: Record<string, string> = {
  manager: 'Quản lý',
  staff: 'Nhân viên',
};

const StaffAssignment: React.FC = () => {
  const {
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
  } = useStaffAssignment();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Phân công nhân viên"
        description="Chọn khách sạn, sau đó chọn nhân viên và vai trò để phân công."
      />
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-4 pb-4 border-b border-slate-100">

        {/* Hotel selector */}
        <div className="mt-4 flex items-end gap-3 flex-wrap">
          {hotels.length === 0 ? (
            <span className="text-sm text-red-500">
              Chưa có khách sạn nào.
            </span>
          ) : (
            <div className="min-w-[260px]">
              <Select
                label="Khách sạn"
                value={selectedHotelId}
                onChange={(val) => {
                  setSelectedHotelId(val);
                  setSelectedStaffId(null);
                }}
                options={hotels.map(h => ({ value: h.id, label: h.name }))}
              />
            </div>
          )}
          {selectedHotelId && (
            <span className="text-xs text-slate-400 mb-1">
              {assignedForSelectedHotel.length} nhân viên đang làm việc tại đây
            </span>
          )}
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div className="grid grid-cols-2 divide-x divide-slate-200 min-h-[480px]">
        {/* ════ LEFT: Unassigned ════ */}
        <div className="flex flex-col">
          {/* Cột trái header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">Chưa phân công</span>
              <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-semibold">
                {unassignedStaff.length}
              </span>
            </div>
          </div>

          {/* Staff list */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {unassignedStaff.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-slate-400">
                <p className="text-sm">Tất cả nhân viên đã được phân công.</p>
              </div>
            ) : (
              unassignedStaff.map((s) => {
                const isSelected = selectedStaffId === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() =>
                      setSelectedStaffId(isSelected ? null : s.id)
                    }
                    className={`px-4 py-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-violet-50 border-l-4 border-violet-500'
                        : 'border-l-4 border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div
                        className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                          isSelected
                            ? 'bg-violet-500 text-white'
                            : 'bg-slate-200 text-slate-600 hover:bg-violet-100 hover:text-violet-700'
                        }`}
                      >
                        {(s.fullName || s.username).charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-800 truncate">
                          {s.fullName || s.username}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{s.email}</p>

                        {/* Role selector — shown when this row is selected */}
                        {isSelected && (
                          <div
                            className="mt-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <select
                              value={selectedRole[s.id] || ''}
                              onChange={(e) =>
                                setSelectedRole((prev) => ({
                                  ...prev,
                                  [s.id]: e.target.value,
                                }))
                              }
                              className="w-full border border-violet-300 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 bg-white"
                            >
                              <option value="">-- Chọn vai trò --</option>
                              <option value="manager">Quản lý (Manager)</option>
                              <option value="staff">Nhân viên (Staff)</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {isSelected && (
                        <div className="shrink-0 mt-1 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold">✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Assign button footer */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
            {!selectedHotelId ? (
              <p className="text-xs text-slate-400 text-center">Chọn khách sạn phía trên trước</p>
            ) : (
              <Button
                onClick={handleAssign}
                disabled={!selectedStaffId || !!processingId}
                variant="primary"
                className="w-full justify-center"
              >
                {processingId
                  ? 'Đang phân công...'
                  : selectedStaffId
                  ? `Phân công vào "${selectedHotelName}"`
                  : 'Chọn một nhân viên để phân công'}
              </Button>
            )}
          </div>
        </div>

        {/* ════ RIGHT: Assigned to selected hotel ════ */}
        <div className="flex flex-col">
          {/* Cột phải: Đã phân công */}
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
            <span className="text-sm font-semibold text-slate-700 truncate">
              {
                selectedHotelName
                  ? `Đã phân công — ${selectedHotelName}`
                  : 'Đã phân công'
              }
            </span>
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-semibold shrink-0">
              {assignedForSelectedHotel.length}
            </span>
          </div>

          {/* Staff list */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {!selectedHotelId ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-slate-400">
                <p className="text-sm">Chọn khách sạn để xem nhân viên.</p>
              </div>
            ) : assignedForSelectedHotel.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-slate-400">
                <p className="text-sm">Chưa có nhân viên nào tại khách sạn này.</p>
                <p className="text-xs mt-1 text-slate-300">Chọn nhân viên bên trái và nhấn Phân công.</p>
              </div>
            ) : (
              assignedForSelectedHotel.map((s) => (
                <div
                  key={s.id}
                  className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition group"
                >
                  {/* Avatar */}
                  <div className="shrink-0 w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">
                    {(s.fullName || s.username).charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-800 truncate">
                      {s.fullName || s.username}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{s.email}</p>
                  </div>

                  {/* Role badge */}
                  <span
                    className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      s.role === 'manager'
                        ? 'bg-violet-100 text-violet-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {ROLE_LABELS[s.role ?? ''] ?? s.role}
                  </span>

                  {/* Unassign button */}
                  <button
                    onClick={() => handleUnassign(s.id)}
                    disabled={processingId === s.id}
                    title="Hủy phân công"
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-40"
                  >
                    {processingId === s.id ? (
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full"></span>
                    ) : (
                      <span className="text-xs font-bold">✕</span>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-400 text-center">
            Hover vào nhân viên để hủy phân công
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default StaffAssignment;
