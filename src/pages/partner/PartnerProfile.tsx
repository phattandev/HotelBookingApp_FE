import React from 'react';
import ProfileForm from '../../components/ProfileForm';

const PartnerProfile: React.FC = () => {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Hồ sơ Doanh nghiệp</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý thông tin tài khoản và pháp lý doanh nghiệp</p>
        </div>
      </div>
      <ProfileForm colorScheme="sky" />
    </div>
  );
};

export default PartnerProfile;
