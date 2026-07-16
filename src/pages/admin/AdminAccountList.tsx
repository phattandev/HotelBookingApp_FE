import React, { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useConfirm } from '../../components/ConfirmModal';

interface UserItem {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  roleName: string;
  isActive: boolean;
  createdAt: string;
  businessName?: string;
  businessStatus?: string;
  assignedHotelName?: string;
}

const AdminAccountList: React.FC = () => {
  const confirm = useConfirm();
  
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState(''); // '' | 'true' | 'false'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = { page: 1, pageSize: 1000 };
      if (roleFilter) params.role = roleFilter;
      if (activeFilter !== '') params.isActive = activeFilter === 'true';
      if (searchQuery) params.search = searchQuery;
      
      const res = await api.get('/admin/accounts', { params });
      setUsers(res.data.data || []);
    } catch {
      setUsers([]);
      toast.error('Lỗi khi tải danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    setCurrentPage(1);
    fetchUsers(); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, activeFilter]);

  // Client search
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(u =>
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.fullName.toLowerCase().includes(q) ||
      (u.phone || '').includes(q)
    );
  }, [users, searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const handleToggleStatus = async (id: string, currentStatus: boolean, username: string) => {
    const actionName = currentStatus ? 'khóa' : 'mở khóa';
    const ok = await confirm({
      title: `${currentStatus ? 'Khóa' : 'Mở khóa'} tài khoản`,
      message: `Bạn có chắc muốn ${actionName} tài khoản "${username}"?`,
      confirmText: currentStatus ? 'Khóa' : 'Mở khóa',
      variant: currentStatus ? 'danger' : 'info',
    });
    if (!ok) return;

    setProcessing(id);
    try {
      await api.patch(`/admin/accounts/${id}/toggle-status`);
      toast.success(`Đã ${actionName} tài khoản thành công!`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.Message || 'Đã xảy ra lỗi.');
    } finally {
      setProcessing(null);
    }
  };

  const getRoleBadge = (roleName: string) => {
    const r = roleName.toLowerCase();
    if (r === 'admin') return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Admin</span>;
    if (r === 'partner') return <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">Đối tác</span>;
    if (r === 'manager') return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Quản lý</span>;
    if (r === 'staff') return <span className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-medium">Nhân viên</span>;
    return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">Khách</span>;
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-3 mb-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-slate-500 mb-1">Tìm kiếm</label>
          <input 
            type="text" 
            placeholder="Tên, Email, SĐT..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); }}
            onKeyDown={(e) => { if(e.key === 'Enter') fetchUsers(); }}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <div className="w-48">
          <label className="block text-xs font-medium text-slate-500 mb-1">Vai trò</label>
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 bg-white"
          >
            <option value="">Tất cả vai trò</option>
            <option value="customer">Khách hàng</option>
            <option value="partner">Đối tác (Chủ DN)</option>
            <option value="manager">Quản lý KS</option>
            <option value="staff">Nhân viên KS</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="w-40">
          <label className="block text-xs font-medium text-slate-500 mb-1">Trạng thái</label>
          <select 
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 bg-white"
          >
            <option value="">Tất cả</option>
            <option value="true">Hoạt động</option>
            <option value="false">Đã khóa</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Đang tải...</div>
        ) : paginatedUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Không tìm thấy tài khoản nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Tài khoản</th>
                  <th className="px-4 py-3">Thông tin liên hệ</th>
                  <th className="px-4 py-3">Vai trò</th>
                  <th className="px-4 py-3">Chi tiết thêm</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">{u.username}</p>
                      <p className="text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700">{u.fullName}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                      {u.phone && <p className="text-xs text-slate-500">{u.phone}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {getRoleBadge(u.roleName)}
                    </td>
                    <td className="px-4 py-3">
                      {u.roleName.toLowerCase() === 'partner' && u.businessName ? (
                        <div className="text-xs text-slate-600">
                          DN: <span className="font-medium text-slate-800">{u.businessName}</span>
                          {u.businessStatus && <span className="ml-1 text-slate-400">({u.businessStatus})</span>}
                        </div>
                      ) : (u.roleName.toLowerCase() === 'manager' || u.roleName.toLowerCase() === 'staff') && u.assignedHotelName ? (
                        <div className="text-xs text-slate-600">
                          KS: <span className="font-medium text-slate-800">{u.assignedHotelName}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {u.isActive ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.roleName.toLowerCase() !== 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(u.id, u.isActive, u.username)}
                          disabled={processing === u.id}
                          className={`px-3 py-1.5 rounded font-medium transition ${u.isActive ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}
                        >
                          {u.isActive ? 'Khóa' : 'Mở khóa'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Trang {currentPage} / {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-slate-200 text-sm disabled:opacity-50 hover:bg-slate-50"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-slate-200 text-sm disabled:opacity-50 hover:bg-slate-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAccountList;
