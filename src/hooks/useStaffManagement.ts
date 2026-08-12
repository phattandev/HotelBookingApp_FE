import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useConfirm } from '../components/ConfirmModal';
import { toSentenceCase, isValidPhone, isValidName } from '../utils/formatters';

export interface Employee {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  isActive: boolean;
  assignedHotelId: string | null;
  assignedHotelName: string | null;
  roleInHotel: string | null;
}

export const useStaffManagement = () => {
  const confirm = useConfirm();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Add modal state ──
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Add form
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // ── Edit modal state ──
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

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
    } catch {
      toast.error('Lỗi khi lấy danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const uniqueHotels = useMemo(() => {
    const hotels = employees
      .map(e => ({ id: e.assignedHotelId, name: e.assignedHotelName }))
      .filter(h => h.id != null) as { id: string; name: string }[];
    const map = new Map<string, string>();
    hotels.forEach(h => map.set(h.id, h.name));
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [employees]);

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

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / itemsPerPage));
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(start, start + itemsPerPage);
  }, [filteredEmployees, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, roleFilter, hotelFilter]);

  // ── Add employee ──
  const [addFieldErrors, setAddFieldErrors] = useState<Record<string, string>>({});
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddFieldErrors({});

    let hasError = false;
    const errors: Record<string, string> = {};

    if (!fullName.trim()) { 
      errors.fullName = 'Họ và tên không được để trống'; hasError = true; 
    } else if (fullName.trim().length < 2 || fullName.trim().length > 100) {
      errors.fullName = 'Họ và tên phải từ 2 đến 100 ký tự'; hasError = true; 
    } else if (!isValidName(fullName.trim())) {
      errors.fullName = 'Họ và tên không được chứa số hoặc ký tự đặc biệt'; hasError = true; 
    }

    if (!email.trim()) { errors.email = 'Email không được để trống'; hasError = true; }
    
    if (!phone.trim()) { 
      errors.phone = 'Số điện thoại không được để trống'; hasError = true; 
    } else if (!/^[0-9]+$/.test(phone.trim())) {
      errors.phone = 'Số điện thoại chỉ được nhập số'; hasError = true; 
    } else if (!isValidPhone(phone.trim())) {
      errors.phone = 'Số điện thoại phải từ 10-11 số'; hasError = true;
    }
    
    if (!password) { errors.password = 'Mật khẩu không được để trống'; hasError = true; }

    if (hasError) {
      setAddFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const formattedName = toSentenceCase(fullName.trim());
      await api.post('/businessstaff', { email, fullName: formattedName, phone: phone.trim(), password });
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

  // ── Open edit modal ──
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>({});
  const openEditModal = (emp: Employee) => {
    setEditEmployee(emp);
    setEditFullName(emp.fullName);
    setEditPhone(emp.phone || '');
    setEditNewPassword(''); // luôn reset password field
    setEditFieldErrors({});
  };

  const closeEditModal = () => {
    setEditEmployee(null);
    setEditFullName('');
    setEditPhone('');
    setEditNewPassword('');
    setEditFieldErrors({});
  };

  // ── Submit edit ──
  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditFieldErrors({});

    let hasError = false;
    const errors: Record<string, string> = {};

    if (!editFullName.trim()) { 
      errors.fullName = 'Họ và tên không được để trống'; hasError = true; 
    } else if (editFullName.trim().length < 2 || editFullName.trim().length > 100) {
      errors.fullName = 'Họ và tên phải từ 2 đến 100 ký tự'; hasError = true; 
    } else if (!isValidName(editFullName.trim())) {
      errors.fullName = 'Họ và tên không được chứa số hoặc ký tự đặc biệt'; hasError = true; 
    }

    if (!editPhone.trim()) { 
      errors.phone = 'Số điện thoại không được để trống'; hasError = true; 
    } else if (!/^[0-9]+$/.test(editPhone.trim())) {
      errors.phone = 'Số điện thoại chỉ được nhập số'; hasError = true; 
    } else if (!isValidPhone(editPhone.trim())) {
      errors.phone = 'Số điện thoại phải từ 10-11 số'; hasError = true;
    }
    
    if (editNewPassword && editNewPassword.length < 6) { errors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự'; hasError = true; }

    if (hasError) {
      setEditFieldErrors(errors);
      return;
    }

    if (!editEmployee) return;
    setEditSubmitting(true);
    try {
      const formattedName = toSentenceCase(editFullName.trim());
      await api.put(`/businessstaff/${editEmployee.id}`, {
        fullName: formattedName,
        phone: editPhone.trim(),
        newPassword: editNewPassword || null, // null = không đổi mật khẩu
      });
      toast.success('Cập nhật thông tin nhân viên thành công!');
      closeEditModal();
      fetchEmployees();
    } catch (err: any) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        toast.error(err.response.data.errors.join('\n'));
      } else {
        toast.error(err.response?.data?.message || 'Cập nhật thất bại');
      }
    } finally {
      setEditSubmitting(false);
    }
  };

  // ── Toggle status ──
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
    switch (role) {
      case 'staff': return 'Nhân viên';
      case 'manager': return 'Quản lý doanh nghiệp';
      default: return role;
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setRoleFilter('');
    setHotelFilter('');
  };

  const handleOpenAddModal = () => {
    setEmail(''); setFullName(''); setPhone(''); setPassword('');
    setAddFieldErrors({});
    setIsModalOpen(true);
  };

  return {
    loading,
    uniqueHotels,
    filteredEmployees,
    paginatedEmployees,
    // Add modal
    isModalOpen,
    setIsModalOpen,
    handleOpenAddModal,
    submitting,
    formData: { email, setEmail, fullName, setFullName, phone, setPhone, password, setPassword },
    handleAddEmployee,
    addFieldErrors,
    // Edit modal
    editEmployee,
    editFullName, setEditFullName,
    editPhone, setEditPhone,
    editNewPassword, setEditNewPassword,
    editSubmitting,
    openEditModal,
    closeEditModal,
    handleUpdateEmployee,
    editFieldErrors,
    // Actions
    handleToggleStatus,
    getSystemRoleLabel,
    // Filters
    filters: { searchQuery, setSearchQuery, roleFilter, setRoleFilter, hotelFilter, setHotelFilter, clearFilters },
    // Pagination
    pagination: { currentPage, setCurrentPage, totalPages, itemsPerPage },
  };
};
