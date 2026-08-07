import React from 'react';
import { useStaffManagement } from '../../hooks/useStaffManagement';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Badge } from '../../components/ui/Badge';
import { SidePanel } from '../../components/ui/SidePanel';

const StaffManagement: React.FC = () => {
  const {
    loading,
    uniqueHotels,
    paginatedEmployees,
    // Add modal
    isModalOpen, setIsModalOpen,
    submitting,
    formData,
    handleAddEmployee,
    // Edit modal
    editEmployee,
    editFullName, setEditFullName,
    editPhone, setEditPhone,
    editNewPassword, setEditNewPassword,
    editSubmitting,
    openEditModal,
    closeEditModal,
    handleUpdateEmployee,
    // Actions
    handleToggleStatus,
    getSystemRoleLabel,
    // Filters
    filters,
    pagination,
  } = useStaffManagement();

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <PageHeader
        title="Quản lý Nhân sự"
        description="Danh sách tài khoản nhân viên thuộc doanh nghiệp"
        action={
          <Button onClick={() => setIsModalOpen(true)} variant="primary">
            Thêm Nhân Viên
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm items-end">
        <div className="flex-1 min-w-[250px]">
          <Input
            label="Tìm kiếm"
            type="text"
            value={filters.searchQuery}
            onChange={e => filters.setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên nhân viên, email..."
          />
        </div>
        <div className="min-w-[180px]">
          <Select
            label="Vị trí"
            value={filters.roleFilter}
            onChange={val => filters.setRoleFilter(val)}
            options={[
              { value: '', label: 'Tất cả vị trí' },
              { value: 'manager', label: 'Quản lý khách sạn' },
              { value: 'receptionist', label: 'Lễ tân' },
              { value: 'unassigned', label: 'Chưa phân công' },
            ]}
          />
        </div>
        <div className="min-w-[180px]">
          <Select
            label="Khách sạn"
            value={filters.hotelFilter}
            onChange={val => filters.setHotelFilter(val)}
            options={[
              { value: '', label: 'Tất cả khách sạn' },
              ...uniqueHotels.map(h => ({ value: h.id, label: h.name }))
            ]}
          />
        </div>
        {(filters.searchQuery || filters.roleFilter || filters.hotelFilter) && (
          <Button
            onClick={filters.clearFilters}
            variant="ghost"
            className="!bg-slate-100 !text-slate-600 hover:!bg-slate-200 border-none shadow-none mb-1"
          >
            Xóa lọc
          </Button>
        )}
      </div>

      {/* Table */}
      <Table
        columns={[
          {
            key: 'name',
            header: 'Họ Tên',
            render: (emp) => <span className="font-semibold text-slate-800">{emp.fullName}</span>
          },
          {
            key: 'phone',
            header: 'Số điện thoại',
            render: (emp) => <span className="font-semibold text-slate-800">{emp.phone || '—'}</span>
          },
          {
            key: 'contact',
            header: 'Liên hệ',
            render: (emp) => (
              <div>
                <div>{emp.email}</div>
                <div className="text-slate-400 mt-0.5 text-xs">{emp.phone || '—'}</div>
              </div>
            )
          },
          {
            key: 'assignment',
            header: 'Phân công tại',
            render: (emp) => emp.assignedHotelId ? (
              <div>
                <div className="font-medium text-slate-800">{emp.assignedHotelName}</div>
                <div className="mt-0.5">
                  <Badge variant={emp.roleInHotel === 'manager' ? 'violet' : 'info'}>
                    {emp.roleInHotel === 'manager' ? 'Quản lý khách sạn' : 'Lễ tân'}
                  </Badge>
                </div>
              </div>
            ) : (
              <span className="text-slate-400 italic text-xs">Chưa phân công</span>
            )
          },
          {
            key: 'systemRole',
            header: 'Quyền hệ thống',
            render: (emp) => (
              <Badge variant="neutral">
                {getSystemRoleLabel(emp.role)}
              </Badge>
            )
          },
          {
            key: 'status',
            header: 'Trạng thái',
            render: (emp) => (
              <Badge variant={emp.isActive ? 'success' : 'danger'}>
                {emp.isActive ? 'Hoạt động' : 'Bị khóa'}
              </Badge>
            )
          },
          {
            key: 'actions',
            header: 'Thao tác',
            align: 'center',
            render: (emp) => (
              <div className="flex items-center justify-center gap-2">
                <Button size="sm" variant="outline" onClick={() => openEditModal(emp)}>
                  Sửa
                </Button>
                <Button
                  size="sm"
                  variant={emp.isActive ? 'danger' : 'primary'}
                  onClick={() => handleToggleStatus(emp.id, emp.fullName)}
                >
                  {emp.isActive ? 'Khóa TK' : 'Mở TK'}
                </Button>
              </div>
            )
          }
        ]}
        data={paginatedEmployees}
        keyExtractor={(emp) => emp.id}
        isLoading={loading}
        emptyMessage="Không tìm thấy nhân viên phù hợp."
      />

      {/* Pagination */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={pagination.setCurrentPage}
      />

      {/* ── Modal Thêm Nhân viên ── */}
      <SidePanel
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Thêm tài khoản nhân viên mới"
        width="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button variant="primary" form="add-employee-form" type="submit" isLoading={submitting}>
              {submitting ? 'Đang tạo...' : 'Tạo Tài Khoản'}
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-500 mb-5 pb-3 border-b border-slate-100">
          Nhân viên mới sẽ ở trạng thái <strong>"Chưa phân công"</strong>. Sau khi tạo, hãy vào mục Phân Công để giao vị trí.
        </p>
        <form id="add-employee-form" onSubmit={handleAddEmployee} className="space-y-4">
          <div>
            <Input label="Họ và tên" type="text" required value={formData.fullName} onChange={e => formData.setFullName(e.target.value)} />
          </div>
          <div>
            <Input label="Email (Đăng nhập)" type="email" required value={formData.email} onChange={e => formData.setEmail(e.target.value)} />
          </div>
          <div>
            <Input label="Số điện thoại" type="text" required value={formData.phone} onChange={e => formData.setPhone(e.target.value)} />
          </div>
          <div>
            <Input label="Mật khẩu khởi tạo" type="password" required value={formData.password} onChange={e => formData.setPassword(e.target.value)} />
          </div>
        </form>
      </SidePanel>

      {/* ── Modal Sửa Nhân viên ── */}
      <SidePanel
        isOpen={!!editEmployee}
        onClose={closeEditModal}
        title="Chỉnh sửa thông tin nhân viên"
        width="md"
        footer={
          <>
            <Button variant="outline" onClick={closeEditModal}>Hủy</Button>
            <Button variant="primary" form="edit-employee-form" type="submit" isLoading={editSubmitting}>
              {editSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-500 mb-5 pb-3 border-b border-slate-100">
          Đang sửa: <strong className="text-slate-700">{editEmployee?.email}</strong>
          <span className="ml-1 text-slate-400">(Email không thể thay đổi)</span>
        </p>

        <form id="edit-employee-form" onSubmit={handleUpdateEmployee} className="space-y-4">
          <div>
            <Input
              label="Họ và tên"
              type="text"
              required
              value={editFullName}
              onChange={e => setEditFullName(e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Số điện thoại"
              type="text"
              required
              value={editPhone}
              onChange={e => setEditPhone(e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Mật khẩu mới (để trống nếu không đổi)"
              type="password"
              value={editNewPassword}
              onChange={e => setEditNewPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự..."
            />
          </div>
        </form>
      </SidePanel>
    </div>
  );
};

export default StaffManagement;