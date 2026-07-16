import React, { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useConfirm } from '../../components/ConfirmModal';

interface Staff {
  id: string;
  fullName: string | null;
  username: string;
  email: string;
  hotelId: string | null;
  hotelName: string | null;
  role: string | null;
}

interface Hotel {
  id: string;
  name: string;
}

const ROLE_LABELS: Record<string, string> = {
  manager: 'Quản lý',
  staff: 'Nhân viên',
};

const StaffAssignment: React.FC = () => {
  const confirm = useConfirm();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<string>('');

  const [unassignedStaff, setUnassignedStaff] = useState<Staff[]>([]);
  const [assignedStaff, setAssignedStaff] = useState<Staff[]>([]);

  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Per-row role selection (only for unassigned panel)
  const [selectedRole, setSelectedRole] = useState<Record<string, string>>({});
  // Selected staff on unassigned panel
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

      const approvedHotels = (resHotels.data.data || []).filter(
        (h: any) => h.approvalStatus === 'Approved'
      ) as Hotel[];

      setUnassignedStaff(allStaff.filter((s) => !s.hotelId));
      setAssignedStaff(allStaff.filter((s) => !!s.hotelId));
      setHotels(approvedHotels);

      // Auto-select first hotel if none selected
      if (!selectedHotelId && approvedHotels.length > 0) {
        setSelectedHotelId(approvedHotels[0].id);
      }
    } catch {
      toast.error('Không thể tải dữ liệu nhân sự.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Assigned staff filtered by selected hotel
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
    } catch (err: any) {
      toast.error(err.response?.data?.Message || 'Phân công thất bại');
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
    } catch (err: any) {
      toast.error(err.response?.data?.Message || 'Hủy phân công thất bại');
    } finally {
      setProcessingId(null);
    }
  };

  const selectedHotelName =
    hotels.find((h) => h.id === selectedHotelId)?.name ?? '';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-100">
        <h2 className="text-xl font-bold text-sky-900">Phân công công việc</h2>
        <p className="text-sm text-slate-500 mt-1">
          Chọn khách sạn, sau đó kéo nhân viên vào vị trí phù hợp.
        </p>

        {/* ── Hotel Combobox ── */}
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-slate-700 shrink-0">
            Khách sạn:
          </span>
          {hotels.length === 0 ? (
            <span className="text-sm text-rose-500 italic">
              Chưa có khách sạn nào được phê duyệt.
            </span>
          ) : (
            <select
              value={selectedHotelId}
              onChange={(e) => {
                setSelectedHotelId(e.target.value);
                setSelectedStaffId(null);
              }}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition bg-white min-w-[260px]"
            >
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          )}

          {selectedHotelId && (
            <span className="text-xs text-slate-400">
              {assignedForSelectedHotel.length} nhân viên đang làm việc tại đây
            </span>
          )}
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div className="grid grid-cols-2 divide-x divide-slate-200 min-h-[480px]">
        {/* ════ LEFT: Unassigned ════ */}
        <div className="flex flex-col">
          {/* Column header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span>
              <span className="text-sm font-semibold text-slate-700">
                Chưa phân công
              </span>
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                {unassignedStaff.length}
              </span>
            </div>
          </div>

          {/* Staff list */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {unassignedStaff.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-slate-400">
                <svg className="w-10 h-10 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a4 4 0 00-5-4M9 20H4v-2a4 4 0 015-4m6-4a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
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
                    className={`px-4 py-3 cursor-pointer transition-all group ${
                      isSelected
                        ? 'bg-sky-50 border-l-4 border-sky-500'
                        : 'border-l-4 border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div
                        className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                          isSelected
                            ? 'bg-sky-500 text-white'
                            : 'bg-slate-200 text-slate-600 group-hover:bg-sky-100 group-hover:text-sky-700'
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
                              className="w-full border border-sky-300 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 bg-white"
                            >
                              <option value="">-- Chọn vai trò --</option>
                              <option value="manager">Quản lý (Manager)</option>
                              <option value="staff">Nhân viên (Staff)</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Checkmark when selected */}
                      {isSelected && (
                        <div className="shrink-0 mt-1">
                          <svg className="w-4 h-4 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
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
              <button
                onClick={handleAssign}
                disabled={!selectedStaffId || !!processingId}
                className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {processingId ? (
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                )}
                {processingId
                  ? 'Đang phân công...'
                  : selectedStaffId
                  ? `Phân công vào "${selectedHotelName}"`
                  : 'Chọn một nhân viên để phân công'}
              </button>
            )}
          </div>
        </div>

        {/* ════ RIGHT: Assigned to selected hotel ════ */}
        <div className="flex flex-col">
          {/* Column header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span className="text-sm font-semibold text-slate-700 truncate">
              {selectedHotelName
                ? `Đã phân công — ${selectedHotelName}`
                : 'Đã phân công'}
            </span>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold shrink-0">
              {assignedForSelectedHotel.length}
            </span>
          </div>

          {/* Staff list */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {!selectedHotelId ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-slate-400">
                <svg className="w-10 h-10 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="text-sm">Chọn khách sạn để xem nhân viên.</p>
              </div>
            ) : assignedForSelectedHotel.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-slate-400">
                <svg className="w-10 h-10 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
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
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-40"
                  >
                    {processingId === s.id ? (
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full"></span>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer spacer to match left panel */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-400 text-center">
            Hover vào nhân viên để hủy phân công
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffAssignment;
