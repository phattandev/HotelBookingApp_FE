import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

interface ProfileFormProps {
  colorScheme?: 'violet' | 'sky' | 'emerald' | 'indigo';
}

const ProfileForm: React.FC<ProfileFormProps> = ({ colorScheme = 'indigo' }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

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
    }
  };

  if (loading) return <div className="text-center p-12 text-slate-400">Đang tải dữ liệu hồ sơ...</div>;

  const colorClasses = {
    violet: 'bg-violet-600 hover:bg-violet-700 ring-violet-500 text-violet-700 bg-violet-50 border-violet-200',
    sky: 'bg-sky-600 hover:bg-sky-700 ring-sky-500 text-sky-700 bg-sky-50 border-sky-200',
    emerald: 'bg-emerald-600 hover:bg-emerald-700 ring-emerald-500 text-emerald-700 bg-emerald-50 border-emerald-200',
    indigo: 'bg-indigo-600 hover:bg-indigo-700 ring-indigo-500 text-indigo-700 bg-indigo-50 border-indigo-200',
  };

  const currentColors = colorClasses[colorScheme];
  const btnColor = currentColors.split(' ')[0] + ' ' + currentColors.split(' ')[1];
  const focusColor = 'focus:ring-2 focus:' + currentColors.split(' ')[2];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-4xl">
      <form onSubmit={handleUpdate} className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Thông tin tài khoản cá nhân</h3>
          <p className="text-sm text-slate-500">Cập nhật thông tin cơ bản liên hệ của bạn</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email hệ thống</label>
            <input type="text" value={user?.Email} disabled className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Họ và tên</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none transition ${focusColor}`} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Số điện thoại</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none transition ${focusColor}`} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Giới tính</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none transition ${focusColor}`}>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ngày sinh</label>
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none transition ${focusColor}`} />
          </div>
        </div>

        {/* Thông tin doanh nghiệp (dành riêng cho Partner) */}
        {user?.Role.toLowerCase() === 'partner' && (
          <div className="pt-6 border-t border-slate-100 mt-6 space-y-5">
            <div>
              <h4 className="text-lg font-bold text-slate-900">Thông tin Doanh nghiệp</h4>
              <p className="text-sm text-slate-500">Thông tin pháp lý doanh nghiệp bạn đại diện</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Trạng thái xác thực</label>
                <div className={`px-4 py-3 rounded-xl border text-sm font-bold ${bizStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                  {bizStatus === 'Approved' ? 'Đã kích hoạt' : (bizStatus === 'Pending' ? 'Đang chờ Admin duyệt' : bizStatus)}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tên doanh nghiệp</label>
                <input type="text" value={bizName} onChange={(e) => setBizName(e.target.value)} required className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none transition ${focusColor}`} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mã số thuế</label>
                <input type="text" value={bizTax} onChange={(e) => setBizTax(e.target.value)} required className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none transition ${focusColor}`} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Địa chỉ trụ sở chính</label>
                <input type="text" value={bizAddr} onChange={(e) => setBizAddr(e.target.value)} required className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none transition ${focusColor}`} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Chức vụ đại diện</label>
                <input type="text" value={bizPosition} onChange={(e) => setBizPosition(e.target.value)} required className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none transition ${focusColor}`} />
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <button type="submit" className={`px-6 py-2.5 text-white font-bold rounded-xl text-sm transition shadow-sm ${btnColor}`}>
            Lưu thay đổi hồ sơ
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
