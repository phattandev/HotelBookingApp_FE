import React, { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useConfirm } from '../../components/ConfirmModal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { PageHeader } from '../../components/ui/PageHeader';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

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
      const params: Record<string, string | number | boolean> = { page: 1, pageSize: 1000 };
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    } catch (e) {
      const err = e as { response?: { data?: { Message?: string } } };
      toast.error(err.response?.data?.Message || 'Đã xảy ra lỗi.');
    } finally {
      setProcessing(null);
    }
  };

  const getRoleBadge = (roleName: string) => {
    const r = roleName.toLowerCase();
    if (r === 'admin') return <Badge variant="danger">Admin</Badge>;
    if (r === 'partner') return <Badge variant="violet">Đối tác</Badge>;
    if (r === 'manager') return <Badge variant="info">Quản lý</Badge>;
    if (r === 'staff') return <Badge variant="success">Nhân viên</Badge>;
    return <Badge variant="neutral">Khách</Badge>;
  };

  const columns = [
    {
      key: 'account',
      header: 'Tài khoản',
      render: (u: UserItem) => (
        <div>
          <p className="font-semibold text-slate-800">{u.username}</p>
          <p className="text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</p>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Thông tin liên hệ',
      render: (u: UserItem) => (
        <div>
          <p className="font-medium text-slate-700">{u.fullName}</p>
          <p className="text-xs text-slate-500">{u.email}</p>
          {u.phone && <p className="text-xs text-slate-500">{u.phone}</p>}
        </div>
      )
    },
    {
      key: 'role',
      header: 'Vai trò',
      render: (u: UserItem) => getRoleBadge(u.roleName)
    },
    {
      key: 'details',
      header: 'Chi tiết thêm',
      render: (u: UserItem) => (
        u.roleName.toLowerCase() === 'partner' && u.businessName ? (
          <div className="text-xs text-slate-600">
            DN: <span className="font-medium text-slate-800">{u.businessName}</span>
            {u.businessStatus && <span className="ml-1 text-slate-400">({u.businessStatus})</span>}
          </div>
        ) : (u.roleName.toLowerCase() === 'manager' || u.roleName.toLowerCase() === 'staff') && u.assignedHotelName ? (
          <div className="text-xs text-slate-600">
            KS: <span className="font-medium text-slate-800">{u.assignedHotelName}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )
      )
    },
    {
      key: 'status',
      header: 'Trạng thái',
      align: 'center' as const,
      render: (u: UserItem) => (
        <Badge variant={u.isActive ? 'success' : 'danger'}>
          {u.isActive ? 'Hoạt động' : 'Bị khóa'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right' as const,
      render: (u: UserItem) => (
        u.roleName.toLowerCase() !== 'admin' ? (
          <Button
            size="sm"
            variant={u.isActive ? 'danger' : 'primary'}
            onClick={() => handleToggleStatus(u.id, u.isActive, u.username)}
            isLoading={processing === u.id}
          >
            {u.isActive ? 'Khóa' : 'Mở khóa'}
          </Button>
        ) : null
      )
    }
  ];

  return (
    <div className="w-full">
      <PageHeader
        title="Quản lý Tài khoản"
        description="Quản lý toàn bộ tài khoản người dùng, đối tác, nhân viên và admin trên hệ thống"
      />
      
      <div className="flex flex-wrap gap-4 items-end mb-6 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <Input 
            label="Tìm kiếm"
            type="text" 
            placeholder="Tên, Email, SĐT..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); }}
            onKeyDown={(e) => { if(e.key === 'Enter') fetchUsers(); }}
          />
        </div>
        <div className="w-48">
          <Select 
            label="Vai trò"
            value={roleFilter}
            onChange={(val) => setRoleFilter(val)}
            options={[
              { value: '', label: 'Tất cả vai trò' },
              { value: 'customer', label: 'Khách hàng' },
              { value: 'partner', label: 'Đối tác (Chủ DN)' },
              { value: 'manager', label: 'Quản lý KS' },
              { value: 'staff', label: 'Nhân viên KS' },
              { value: 'admin', label: 'Admin' },
            ]}
          />
        </div>
        <div className="w-40">
          <Select 
            label="Trạng thái"
            value={activeFilter}
            onChange={(val) => setActiveFilter(val)}
            options={[
              { value: '', label: 'Tất cả' },
              { value: 'true', label: 'Hoạt động' },
              { value: 'false', label: 'Đã khóa' },
            ]}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={paginatedUsers}
        keyExtractor={u => u.id}
        isLoading={loading}
        emptyMessage="Không tìm thấy tài khoản nào."
      />
      
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default AdminAccountList;
