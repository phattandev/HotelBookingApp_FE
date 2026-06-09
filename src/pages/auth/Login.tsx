import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { login, registerUser, registerBusiness } = useAuth();
  const navigate = useNavigate();
  
  // Trạng thái trượt: 0 = Đăng nhập, 1 = Đăng ký, 2 = Doanh nghiệp
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- State Form Đăng nhập ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // --- State Form Đăng ký User ---
  const [regUserEmail, setRegUserEmail] = useState('');
  const [regUserPassword, setRegUserPassword] = useState('');
  const [regUserConfirm, setRegUserConfirm] = useState('');

  // --- State Form Đăng ký Doanh nghiệp ---
  const [bizName, setBizName] = useState('');
  const [bizTaxCode, setBizTaxCode] = useState('');
  const [bizAddress, setBizAddress] = useState('');
  const [repName, setRepName] = useState('');
  const [repPosition, setRepPosition] = useState('');
  const [repPhone, setRepPhone] = useState('');
  const [repEmail, setRepEmail] = useState('');
  const [bizPassword, setBizPassword] = useState('');
  const [bizConfirm, setBizConfirm] = useState('');

  useEffect(() => {
    setError(''); // Xóa lỗi khi chuyển tab
  }, [activeTab]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login({ usernameOrEmail: loginEmail, password: loginPassword });
    } catch (err: any) {
      const responseData = err.response?.data;
      const validationErrors = responseData?.Errors || responseData?.errors;
      if (validationErrors && validationErrors.length > 0) {
        setError(validationErrors.join('\n'));
      } else {
        setError(responseData?.Message || responseData?.message || 'Đăng nhập thất bại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterUserSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  if (regUserPassword !== regUserConfirm) {
    return setError('Mật khẩu xác nhận không khớp.');
  }
  
  setIsSubmitting(true);
  try {
    // Map chính xác tên biến với Backend DTO (RegisterUserCommand)
    await registerUser({
      email: regUserEmail,
      password: regUserPassword,
      confirmPassword: regUserConfirm
    });
  } catch (err: any) {
    const responseData = err.response?.data;
    const validationErrors = responseData?.Errors || responseData?.errors;
    if (validationErrors && validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
    } else {
      setError(responseData?.Message || responseData?.message || 'Đăng ký thất bại.');
    }
  } finally {
    setIsSubmitting(false);
  }
};

  const handleRegisterBizSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  if (bizPassword !== bizConfirm) {
    return setError('Mật khẩu xác nhận không khớp.');
  }

  setIsSubmitting(true);
  try {
    // Map chính xác tên biến với Backend DTO (RegisterBusinessCommand)
    await registerBusiness({
      businessName: bizName,
      taxCode: bizTaxCode,
      businessAddress: bizAddress,
      representativeName: repName,
      position: repPosition,
      representativePhone: repPhone,
      representativeEmail: repEmail,
      password: bizPassword,
      confirmPassword: bizConfirm
    });
  } catch (err: any) {
    const responseData = err.response?.data;
    const validationErrors = responseData?.Errors || responseData?.errors;
    if (validationErrors && validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
    } else {
      setError(responseData?.Message || responseData?.message || 'Đăng ký doanh nghiệp thất bại.');
    }
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative p-4"
      style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")' }}
    >
      {/* Lớp phủ mờ tối cho background */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* Box Glassmorphism */}
      <div className="relative w-full max-w-2xl bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl overflow-hidden text-white">
        
        {/* Header & Menu trượt */}
        <div className="p-6 pb-0">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight">HotelBookingApp</h1>
            <p className="text-white/80 mt-2">Bắt đầu hành trình của bạn cùng chúng tôi</p>
          </div>

          <div className="flex justify-between border-b border-white/20 relative">
            <button 
              onClick={() => setActiveTab(0)}
              className={`pb-3 w-1/3 text-center font-medium transition-colors ${activeTab === 0 ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
            >
              Đăng nhập
            </button>
            <button 
              onClick={() => setActiveTab(1)}
              className={`pb-3 w-1/3 text-center font-medium transition-colors ${activeTab === 1 ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
            >
              Đăng ký
            </button>
            <button 
              onClick={() => setActiveTab(2)}
              className={`pb-3 w-1/3 text-center font-medium transition-colors ${activeTab === 2 ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
            >
              Doanh nghiệp
            </button>
            
            {/* Thanh gạch chân trượt */}
            <div 
              className="absolute bottom-0 h-0.5 bg-white transition-all duration-300 ease-in-out w-1/3"
              style={{ transform: `translateX(${activeTab * 100}%)` }}
            ></div>
          </div>
        </div>

        {/* Khu vực hiện lỗi chung */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-100 text-sm whitespace-pre-line">
            {error}
          </div>
        )}

        {/* Khung chứa các Form với hiệu ứng trượt */}
        <div className="overflow-hidden relative w-full h-[550px] sm:h-[450px]">
          <div 
            className="flex transition-transform duration-500 ease-in-out w-[300%] h-full"
            style={{ transform: `translateX(-${activeTab * (100/3)}%)` }}
          >
            
            {/* --- PANEL 1: ĐĂNG NHẬP --- */}
            <div className="w-1/3 p-6 h-full overflow-y-auto custom-scrollbar">
              <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-sm mx-auto mt-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Email hoặc Tài khoản</label>
                  <input type="text" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-white/50 focus:outline-none placeholder-white/30 text-white" 
                    placeholder="Nhập email..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Mật khẩu</label>
                  <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-white/50 focus:outline-none placeholder-white/30 text-white" 
                    placeholder="••••••••" />
                </div>
                <div className="flex items-center justify-between text-sm mt-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded bg-white/10 border-white/20 text-indigo-500 focus:ring-indigo-500/50" />
                    <span className="text-white/80">Nhớ mật khẩu</span>
                  </label>
                  <a href="#" className="text-white hover:underline">Quên mật khẩu?</a>
                </div>
                <button type="submit" disabled={isSubmitting}
                  className="w-full mt-6 py-2.5 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition duration-200 shadow-lg disabled:opacity-70"
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Đăng Nhập'}
                </button>
              </form>
            </div>

            {/* --- PANEL 2: ĐĂNG KÝ USER/ADMIN --- */}
            <div className="w-1/3 p-6 h-full overflow-y-auto custom-scrollbar">
              <form onSubmit={handleRegisterUserSubmit} className="space-y-4 max-w-sm mx-auto mt-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Email</label>
                  <input type="email" value={regUserEmail} onChange={(e) => setRegUserEmail(e.target.value)} required
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-white/50 focus:outline-none placeholder-white/30 text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Mật khẩu</label>
                  <input type="password" value={regUserPassword} onChange={(e) => setRegUserPassword(e.target.value)} required
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-white/50 focus:outline-none placeholder-white/30 text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Xác nhận mật khẩu</label>
                  <input type="password" value={regUserConfirm} onChange={(e) => setRegUserConfirm(e.target.value)} required
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-white/50 focus:outline-none placeholder-white/30 text-white" />
                </div>
                <button type="submit"
                  className="w-full mt-6 py-2.5 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 transition duration-200 shadow-lg"
                >
                  Tạo Tài Khoản
                </button>
              </form>
            </div>

            {/* --- PANEL 3: ĐĂNG KÝ DOANH NGHIỆP --- */}
            <div className="w-1/3 p-6 h-full overflow-y-auto custom-scrollbar">
              <form onSubmit={handleRegisterBizSubmit} className="space-y-5 mt-2">
                
                <h3 className="font-semibold text-white/90 border-b border-white/20 pb-2">1. Thông tin pháp lý & Doanh nghiệp</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">Tên doanh nghiệp</label>
                    <input type="text" value={bizName} onChange={(e) => setBizName(e.target.value)} required
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-white/50 focus:outline-none text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">Mã số thuế</label>
                    <input type="text" value={bizTaxCode} onChange={(e) => setBizTaxCode(e.target.value)} required
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-white/50 focus:outline-none text-white" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-white/90 mb-1">Địa chỉ đăng ký kinh doanh</label>
                    <input type="text" value={bizAddress} onChange={(e) => setBizAddress(e.target.value)} required
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-white/50 focus:outline-none text-white" />
                  </div>
                </div>

                <h3 className="font-semibold text-white/90 border-b border-white/20 pb-2 pt-2">2. Thông tin người đại diện</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">Họ tên</label>
                    <input type="text" value={repName} onChange={(e) => setRepName(e.target.value)} required
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-white/50 focus:outline-none text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">Chức vụ</label>
                    <input type="text" value={repPosition} onChange={(e) => setRepPosition(e.target.value)} required
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-white/50 focus:outline-none text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">Số điện thoại</label>
                    <input type="tel" value={repPhone} onChange={(e) => setRepPhone(e.target.value)} required
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-white/50 focus:outline-none text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">Email làm việc</label>
                    <input type="email" value={repEmail} onChange={(e) => setRepEmail(e.target.value)} required
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-white/50 focus:outline-none text-white" />
                  </div>
                </div>

                <h3 className="font-semibold text-white/90 border-b border-white/20 pb-2 pt-2">3. Thiết lập mật khẩu</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">Mật khẩu</label>
                    <input type="password" value={bizPassword} onChange={(e) => setBizPassword(e.target.value)} required
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-white/50 focus:outline-none text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">Xác nhận mật khẩu</label>
                    <input type="password" value={bizConfirm} onChange={(e) => setBizConfirm(e.target.value)} required
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-white/50 focus:outline-none text-white" />
                  </div>
                </div>

                <button type="submit"
                  className="w-full py-3 mt-4 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition duration-200 shadow-lg"
                >
                  Gửi Yêu Cầu Hợp Tác
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;