import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'account' | 'management'>('account');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
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
        setBizName(data.businessInfo.businessName);
        setBizTax(data.businessInfo.taxCode);
        setBizAddr(data.businessInfo.businessAddress);
        setBizPosition(data.businessInfo.position);
        setBizStatus(data.businessInfo.verificationStatus);
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
        businessName: user?.Role === 'partner' ? bizName : null,
        taxCode: user?.Role === 'partner' ? bizTax : null,
        businessAddress: user?.Role === 'partner' ? bizAddr : null,
        position: user?.Role === 'partner' ? bizPosition : null,
      };
      await api.put('/profile', payload);
      toast.success('Cập nhật hồ sơ thành công!');
    } catch (err: any) {
      toast.error(err.response?.data?.Message || 'Cập nhật thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center p-12 text-slate-500 font-medium">Đang tải dữ liệu hồ sơ...</div>;

  const hasManagementPermission = ['admin', 'partner', 'manager'].includes(user?.Role?.toLowerCase() || '');
  const inputCls = "w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none transition";

  return (
    <div className="w-full flex flex-col md:flex-row gap-6">
      {/* SIDEBAR */}
      <div className="w-full md:w-1/4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-fit sticky top-24">
        <div className="text-center pb-5 border-b border-slate-100 mb-5">
          <div className="w-20 h-20 bg-violet-100 text-violet-700 font-bold text-3xl rounded-full flex items-center justify-center mx-auto mb-3 uppercase shadow-inner">
            {user?.Username.charAt(0)}
          </div>
          <h2 className="font-bold text-slate-900 text-lg">{fullName || user?.Username}</h2>
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider bg-violet-50 text-violet-700 px-3 py-1 rounded-full mt-2">
            {user?.Role}
          </span>
        </div>

        <div className="space-y-1.5">
          <button 
            onClick={() => setActiveSubTab('account')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition ${activeSubTab === 'account' ? 'bg-violet-600 text-white shadow-sm shadow-violet-600/20' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Thông tin tài khoản
          </button>

          {hasManagementPermission && (
            <button 
              onClick={() => setActiveSubTab('management')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition ${activeSubTab === 'management' ? 'bg-violet-600 text-white shadow-sm shadow-violet-600/20' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {user?.Role.toLowerCase() === 'admin' && 'Tổng Quản Trị Hệ Thống'}
              {user?.Role.toLowerCase() === 'partner' && 'Quản Lý Doanh Nghiệp'}
              {user?.Role.toLowerCase() === 'manager' && 'Quản Trị Khách Sạn'}
            </button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm">

        {/* --- TAB 1: THÔNG TIN TÀI KHOẢN --- */}
        {activeSubTab === 'account' && (
          <form onSubmit={handleUpdate} className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-5">Thông tin tài khoản cá nhân</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email hệ thống</label>
                  <input type="text" value={user?.Email} disabled className={`${inputCls} bg-slate-50 text-slate-500 cursor-not-allowed`} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Họ và tên</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Số điện thoại</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Giới tính</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)} className={`${inputCls} bg-white`}>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Ngày sinh</label>
                    <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputCls} />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Info */}
            {user?.Role.toLowerCase() === 'partner' && (
              <div>
                <h4 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-5">Thông tin pháp lý Doanh nghiệp</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tên doanh nghiệp</label>
                    <input type="text" value={bizName} onChange={(e) => setBizName(e.target.value)} required className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Mã số thuế</label>
                    <input type="text" value={bizTax} onChange={(e) => setBizTax(e.target.value)} required className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Chức vụ đại diện</label>
                    <input type="text" value={bizPosition} onChange={(e) => setBizPosition(e.target.value)} required className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Trạng thái phê duyệt</label>
                    <span className={`flex items-center px-4 py-2.5 rounded-lg font-bold text-sm ${bizStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                      {bizStatus === 'Approved' ? '✅ Đã kích hoạt' : '⏳ Đang chờ Admin duyệt'}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Địa chỉ trụ sở chính</label>
                    <input type="text" value={bizAddr} onChange={(e) => setBizAddr(e.target.value)} required className={inputCls} />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-violet-600 text-white font-bold rounded-lg text-sm hover:bg-violet-700 transition shadow-sm disabled:opacity-50">
                {submitting ? 'Đang lưu...' : 'Lưu thay đổi hồ sơ'}
              </button>
            </div>
          </form>
        )}

        {/* --- TAB 2: QUẢN TRỊ --- */}
        {activeSubTab === 'management' && (
          <div className="space-y-6">
            {user?.Role.toLowerCase() === 'admin' && (
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Hệ thống tổng quản trị (Admin Dashboard)</h3>
                <p className="text-slate-600 text-sm mb-5">Khu vực thiết lập cấu hình chung và dữ liệu chuẩn cho toàn hệ thống.</p>
                <div className="p-4 bg-white border border-dashed border-slate-300 rounded-xl text-sm text-slate-500">
                  ⚡ Tính năng kế tiếp: Cung cấp danh mục Tỉnh/Thành (`Provinces`), Phường/Xã (`Wards`) và Tiện nghi hệ thống (`Amenities`).
                </div>
              </div>
            )}

            {user?.Role.toLowerCase() === 'partner' && (
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Trang quản trị Doanh nghiệp (Partner Console)</h3>
                <p className="text-slate-600 text-sm mb-5">Tại đây bạn có quyền quản trị chuỗi khách sạn và danh sách nhân sự trực thuộc.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-2">Quản lý Nhân viên</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Thêm mới nhân viên, vô hiệu hóa tài khoản hoặc luân chuyển công tác.</p>
                  </div>
                  <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-2">Danh mục Khách sạn</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Xem danh sách khách sạn sở hữu và tạo hồ sơ đăng ký khách sạn mới gửi Admin phê duyệt.</p>
                  </div>
                </div>
              </div>
            )}

            {user?.Role.toLowerCase() === 'manager' && (
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Trang Quản lý Cơ sở (Hotel Manager Panel)</h3>
                <p className="text-slate-600 text-sm mb-3">Bạn được cấp quyền quản lý vận hành trực tiếp khách sạn được chỉ định.</p>
                <div className="p-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-500 shadow-sm">
                  ⚡ Chức năng sắp triển khai: Quản lý loại phòng (`RoomTypes`), cấu hình Tiện nghi cụ thể và tiếp nhận đơn đặt phòng (`Bookings`).
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;