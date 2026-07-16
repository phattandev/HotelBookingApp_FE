import React from 'react';
import ProfileForm from '../../components/ProfileForm';

const AdminProfile: React.FC = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Hồ sơ Quản trị viên</h1>
        <p className="text-sm text-slate-500 mt-1">Quản lý thông tin tài khoản cá nhân của bạn</p>
      </div>
      <ProfileForm colorScheme="violet" />
    </div>
  );
};

export default AdminProfile;
