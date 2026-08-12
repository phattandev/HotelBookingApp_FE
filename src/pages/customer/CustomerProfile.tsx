import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toSentenceCase, isValidPhone, isValidName } from '../../utils/formatters';

const CustomerProfile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    gender: 'Nam',
    dateOfBirth: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profile');
      const data = res.data.data;
      setForm({
        fullName: data.fullName || '',
        phone: data.phone || '',
        gender: data.gender || 'Nam',
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : ''
      });
    } catch (err) {
      toast.error('Không thể tải thông tin hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    let hasError = false;
    const errors: Record<string, string> = {};

    if (!form.fullName.trim()) {
      errors.fullName = 'Họ và tên không được để trống';
      hasError = true;
    } else if (form.fullName.trim().length < 2 || form.fullName.trim().length > 100) {
      errors.fullName = 'Họ và tên phải từ 2 đến 100 ký tự'; hasError = true;
    } else if (!isValidName(form.fullName.trim())) {
      errors.fullName = 'Họ và tên không được chứa số hoặc ký tự đặc biệt'; hasError = true;
    }

    if (form.phone.trim()) {
      if (!/^[0-9]+$/.test(form.phone.trim())) {
        errors.phone = 'Số điện thoại chỉ được nhập số'; hasError = true;
      } else if (!isValidPhone(form.phone.trim())) {
        errors.phone = 'Số điện thoại phải từ 10-11 số'; hasError = true;
      }
    }

    if (hasError) {
      setFieldErrors(errors);
      return;
    }

    setSaving(true);
    try {
      await api.put('/profile', {
        ...form,
        fullName: toSentenceCase(form.fullName.trim()),
        phone: form.phone.trim(),
        dateOfBirth: form.dateOfBirth || null
      });
      toast.success('Cập nhật hồ sơ thành công!');
    } catch (err: any) {
      toast.error(err.response?.data?.Message || 'Cập nhật thất bại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center p-12 text-slate-500">Đang tải hồ sơ...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader
        title="Hồ sơ cá nhân"
        description="Quản lý thông tin tài khoản của bạn"
      />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col md:flex-row">
        
        {/* Cột trái: Tóm tắt */}
        <div className="md:w-1/3 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-8 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-3xl font-bold uppercase mb-4">
            {user?.Username.charAt(0)}
          </div>
          <h2 className="text-lg font-bold text-slate-900">{form.fullName || user?.Username}</h2>
          <span className="inline-block mt-2 px-3 py-1 bg-violet-600/10 text-violet-700 text-xs font-bold rounded-full uppercase tracking-wider">
            {user?.Role || 'Khách hàng'}
          </span>
          <p className="mt-4 text-sm text-slate-500 break-all">{user?.Email}</p>
        </div>

        {/* Cột phải: Form cập nhật */}
        <div className="md:w-2/3 p-8">
          <form onSubmit={handleUpdate} noValidate className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="md:col-span-2">
                <Input 
                  label="Họ và tên" 
                  type="text" 
                  value={form.fullName} 
                  onChange={e => setForm({...form, fullName: e.target.value})} 
                  error={fieldErrors.fullName}
                />
              </div>

              <div>
                <Input 
                  label="Số điện thoại" 
                  type="text" 
                  value={form.phone} 
                  onChange={e => setForm({...form, phone: e.target.value})} 
                  error={fieldErrors.phone}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Giới tính</label>
                <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <Input 
                  label="Ngày sinh" 
                  type="date" 
                  value={form.dateOfBirth} 
                  onChange={e => setForm({...form, dateOfBirth: e.target.value})} 
                />
              </div>

            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button type="submit" disabled={saving} variant="primary">
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default CustomerProfile;
