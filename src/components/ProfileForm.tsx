import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';

interface ProfileFormProps {
  colorScheme?: 'violet' | 'sky' | 'emerald' | 'indigo';
}

const ProfileForm: React.FC<ProfileFormProps> = ({ colorScheme = 'indigo' }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Nam');
  const [dob, setDob] = useState('');

  // Business State
  const [bizName, setBizName] = useState('');
  const [bizTax, setBizTax] = useState('');
  const [bizAddr, setBizAddr] = useState('');
  const [bizPosition, setBizPosition] = useState('');
  const [bizStatus, setBizStatus] = useState('');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profile');
      const data = res.data.data;
      
      setFullName(data.fullName || '');
      setPhone(data.phone || '');
      setGender(data.gender || 'Nam');
      setDob(data.dateOfBirth || '');

      if (data.businessInfo) {
        setBizName(data.businessInfo.businessName || '');
        setBizTax(data.businessInfo.taxCode || '');
        setBizAddr(data.businessInfo.businessAddress || '');
        setBizPosition(data.businessInfo.position || '');
        setBizStatus(data.businessInfo.verificationStatus || '');
      }
    } catch (err: any) {
      toast.error('Không thể tải thông tin hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        fullName,
        phone,
        gender,
        dateOfBirth: dob || null,
        businessName: user?.Role.toLowerCase() === 'partner' ? bizName : null,
        taxCode: user?.Role.toLowerCase() === 'partner' ? bizTax : null,
        businessAddress: user?.Role.toLowerCase() === 'partner' ? bizAddr : null,
        position: user?.Role.toLowerCase() === 'partner' ? bizPosition : null,
      };
      await api.put('/profile', payload);
      toast.success('Cập nhật hồ sơ thành công!');
    } catch (err: any) {
      toast.error(err.response?.data?.Message || 'Cập nhật thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center p-12 text-slate-400">Đang tải dữ liệu hồ sơ...</div>;



  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-4xl">
      <form onSubmit={handleUpdate} className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Thông tin tài khoản cá nhân</h3>
          <p className="text-sm text-slate-500">Cập nhật thông tin cơ bản liên hệ của bạn</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Email hệ thống" type="text" value={user?.Email} disabled />
          <Input label="Họ và tên" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <Input label="Số điện thoại" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Select 
            label="Giới tính" 
            value={gender} 
            onChange={(val) => setGender(val)} 
            options={[
              { value: 'Nam', label: 'Nam' },
              { value: 'Nữ', label: 'Nữ' },
              { value: 'Khác', label: 'Khác' }
            ]}
          />
          <Input label="Ngày sinh" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
        </div>

        {/* Thông tin doanh nghiệp (dành riêng cho Partner) */}
        {user?.Role.toLowerCase() === 'partner' && (
          <div className="pt-6 border-t border-slate-100 mt-6 space-y-5">
            <div>
              <h4 className="text-lg font-bold text-slate-900">Thông tin Doanh nghiệp</h4>
              <p className="text-sm text-slate-500">Thông tin pháp lý doanh nghiệp bạn đại diện</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Trạng thái xác thực</label>
                <div className={`px-4 py-3 rounded-xl border text-sm font-bold ${bizStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                  {bizStatus === 'Approved' ? 'Đã kích hoạt' : (bizStatus === 'Pending' ? 'Đang chờ Admin duyệt' : bizStatus)}
                </div>
              </div>
              <Input label="Tên doanh nghiệp" type="text" value={bizName} onChange={(e) => setBizName(e.target.value)} required />
              <Input label="Mã số thuế" type="text" value={bizTax} onChange={(e) => setBizTax(e.target.value)} required />
              <div className="md:col-span-2">
                <Input label="Địa chỉ trụ sở chính" type="text" value={bizAddr} onChange={(e) => setBizAddr(e.target.value)} required />
              </div>
              <Input label="Chức vụ đại diện" type="text" value={bizPosition} onChange={(e) => setBizPosition(e.target.value)} required />
            </div>
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <Button type="submit" isLoading={submitting} className={`!bg-${colorScheme}-600 hover:!bg-${colorScheme}-700 !text-white`}>
            Lưu thay đổi hồ sơ
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
