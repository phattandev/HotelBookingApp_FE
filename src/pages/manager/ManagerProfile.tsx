import React from 'react';
import ProfileForm from '../../components/ProfileForm';
import { PageHeader } from '../../components/ui/PageHeader';

const ManagerProfile: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Hồ sơ Quản lý"
        description="Quản lý thông tin tài khoản cá nhân của bạn"
      />
      <ProfileForm colorScheme="emerald" />
    </div>
  );
};

export default ManagerProfile;
