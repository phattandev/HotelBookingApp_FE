import React from 'react';
import ProfileForm from '../../components/ProfileForm';
import { PageHeader } from '../../components/ui/PageHeader';

const PartnerProfile: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Hồ sơ Doanh nghiệp"
        description="Quản lý thông tin tài khoản và pháp lý doanh nghiệp"
      />
      <ProfileForm colorScheme="violet" />
    </div>
  );
};

export default PartnerProfile;
