import React from 'react';
import ProfileForm from '../../components/ProfileForm';

const ManagerProfile: React.FC = () => {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Hồ sơ Quản lý</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý thông tin tài khoản cá nhân của bạn</p>
        </div>
      </div>
      <ProfileForm colorScheme="emerald" />
    </div>
  );
};

export default ManagerProfile;
