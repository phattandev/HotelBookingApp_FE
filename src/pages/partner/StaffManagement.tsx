import React, { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useConfirm } from '../../components/ConfirmModal';

interface Employee {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  isActive: boolean;
  // Thông tin phân công
  assignedHotelId: string | null;
  assignedHotelName: string | null;
  roleInHotel: string | null;
}

const StaffManagement: React.FC = () => {
  const confirm = useConfirm();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [hotelFilter, setHotelFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/businessstaff');
      setEmployees(res.data.data || []);
    } catch (error) {
      toast.error('Lỗi khi lấy danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Unique Hotels for Filter
  const uniqueHotels = useMemo(() => {
    const hotels = employees
      .map(e => ({ id: e.assignedHotelId, name: e.assignedHotelName }))
      .filter(h => h.id != null) as { id: string; name: string }[];
    
    // Distinct by ID
    const map = new Map<string, string>();
    hotels.forEach(h => map.set(h.id, h.name));
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [employees]);

  // Lọc danh sách (Client-side)
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch = !searchQuery || 
                          emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchRole = true;
      if (roleFilter === 'manager') matchRole = emp.roleInHotel === 'manager';
      if (roleFilter === 'receptionist') matchRole = emp.roleInHotel === 'receptionist';
      if (roleFilter === 'unassigned') matchRole = !emp.assignedHotelId;

      const matchHotel = !hotelFilter || emp.assignedHotelId === hotelFilter;

      return matchSearch && matchRole && matchHotel;
    });
  }, [employees, searchQuery, roleFilter, hotelFilter]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / itemsPerPage));
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(start, start + itemsPerPage);
  }, [filteredEmployees, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, hotelFilter]);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/businessstaff', { email, fullName, phone, password });
      toast.success('Thêm nhân viên thành công! Hãy vào mục "Phân Công" để phân công vị trí.');
      setIsModalOpen(false);
      fetchEmployees();
      setEmail(''); setFullName(''); setPhone(''); setPassword('');
    } catch (err: any) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        toast.error(err.response.data.errors.join('\n'));
      } else {
        toast.error(err.response?.data?.message || 'Thêm thất bại');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (employeeId: string, currentName: string) => {
    const ok = await confirm({
      title: 'Đổi trạng thái tài khoản',
      message: `Bạn có chắc muốn đổi trạng thái tài khoản của ${currentName}?`,
      confirmText: 'Đổi trạng thái',
      variant: 'warning',
    });
    if (!ok) return;
    try {
      await api.patch(`/businessstaff/${employeeId}/toggle-status`);
      toast.success('Đã cập nhật trạng thái!');
      fetchEmployees();
    } catch {
      toast.error('Không thể thay đổi trạng thái.');
    }
  };

  const getSystemRoleLabel = (role: string) => {
    switch(role) {
      case 'staff': return 'Nhân viên';
      case 'manager': return 'Quản lý doanh nghiệp';
      default: return role;
    }
  };

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500';
  const selectCls = 'border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white min-w-[180px]';

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản lý Nhân sự</h1>
          <p className="text-sm text-slate-500 mt-1">Danh sách tài khoản nhân viên thuộc doanh nghiệp</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition"
        >
          Thêm Nhân Viên
        </button>
      </div>

      {/* Toolbar: Search + Filters */}
      <div className="flex flex-wrap gap-3 mb-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Tìm theo tên nhân viên, email..."
          className="flex-1 min-w-[250px] border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />

        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className={selectCls}>
          <option value="">Tất cả vị trí</option>
          <option value="manager">Quản lý khách sạn</option>
          <option value="receptionist">Lễ tân</option>
          <option value="unassigned">Chưa phân công</option>
        </select>

        <select value={hotelFilter} onChange={e => setHotelFilter(e.target.value)} className={selectCls}>
          <option value="">Tất cả khách sạn</option>
          {uniqueHotels.map(h => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>

        {(searchQuery || roleFilter || hotelFilter) && (
          <button onClick={() => { setSearchQuery(''); setRoleFilter(''); setHotelFilter(''); }}
            className="px-3 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
            Xóa lọc
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden w-full shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-slate-400">Đang tải...</div>
        ) : (
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3">Họ Tên</th>
                <th className="px-5 py-3">Liên hệ</th>
                <th className="px-5 py-3">Phân công tại</th>
                <th className="px-5 py-3">Quyền hệ thống</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-10 text-slate-400">
                    Không tìm thấy nhân viên phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-800">{emp.fullName}</td>
                    <td className="px-5 py-3 text-slate-600 text-xs">
                      <div>{emp.email}</div>
                      <div className="text-slate-400 mt-0.5">{emp.phone || '—'}</div>
                    </td>
                    <td className="px-5 py-3">
                      {emp.assignedHotelId ? (
                        <div>
                          <div className="font-medium text-slate-800">{emp.assignedHotelName}</div>
                          <div className="mt-0.5 text-xs">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded font-medium ${
                              emp.roleInHotel === 'manager' ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'
                            }`}>
                              {emp.roleInHotel === 'manager' ? 'Quản lý khách sạn' : 'Lễ tân'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Chưa phân công</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded">
                        {getSystemRoleLabel(emp.role)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                        emp.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {emp.isActive ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => handleToggleStatus(emp.id, emp.fullName)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                          emp.isActive 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {emp.isActive ? 'Khóa TK' : 'Mở TK'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t flex justify-between items-center text-xs">
            <span className="text-slate-500">
              Trang {currentPage} / {totalPages} — Hiển thị {filteredEmployees.length} nhân viên
            </span>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition">
                Trước
              </button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition">
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Thêm Nhân viên */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-slate-900 mb-1">Thêm tài khoản nhân viên mới</h3>
            <p className="text-xs text-slate-500 mb-5 pb-3 border-b border-slate-100">
              Nhân viên mới sẽ ở trạng thái <strong>"Chưa phân công"</strong>. Sau khi tạo, hãy vào mục Phân Công để giao vị trí.
            </p>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Họ và tên</label>
                <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email (Đăng nhập)</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Số điện thoại</label>
                <input type="text" required value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Mật khẩu khởi tạo</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className={inputCls} />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
                  Hủy
                </button>
                <button type="submit" disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition disabled:opacity-50">
                  {submitting ? 'Đang tạo...' : 'Tạo Tài Khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;