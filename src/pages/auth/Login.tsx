import React from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../../hooks/useLogin';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const Login: React.FC = () => {
  const {
    activeTab, setActiveTab,
    error,
    fieldErrors,
    isSubmitting,
    loginData,
    regUserData,
    regBizData,
    handleLoginSubmit,
    handleRegisterUserSubmit,
    handleRegisterBizSubmit
  } = useLogin();

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
          <div className="relative text-center mb-6">
            <Link to="/" className="absolute left-0 top-0 text-white/60 hover:text-white text-sm flex items-center gap-1 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Về trang chủ
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">HotelBooking</h1>
            <p className="text-white/80 mt-2">Nơi nghỉ chân hoàn hảo cho chuyến hành trình dài của bạn</p>
          </div>

          <div className="flex justify-between border-b border-white/20 relative">
            <button
              type="button"
              onClick={() => setActiveTab(0)}
              className={`pb-3 w-1/3 text-center font-medium transition-colors ${activeTab === 0 ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => setActiveTab(1)}
              className={`pb-3 w-1/3 text-center font-medium transition-colors ${activeTab === 1 ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
            >
              Đăng ký người dùng
            </button>
            <button
              type="button"
              onClick={() => setActiveTab(2)}
              className={`pb-3 w-1/3 text-center font-medium transition-colors ${activeTab === 2 ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
            >
              Đăng ký doanh nghiệp
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
            style={{ transform: `translateX(-${activeTab * (100 / 3)}%)` }}
          >

            {/* --- PANEL 1: ĐĂNG NHẬP --- */}
            <div className="w-1/3 p-6 h-full overflow-y-auto custom-scrollbar">
              <form onSubmit={handleLoginSubmit} noValidate className="space-y-4 max-w-sm mx-auto mt-4">
                <Input
                  label="Email"
                  type="text"
                  variant="glass"
                  value={loginData.loginEmail}
                  onChange={(e) => loginData.setLoginEmail(e.target.value)}
                  placeholder="Nhập email..."
                  error={fieldErrors.loginEmail}
                />
                <Input
                  label="Mật khẩu"
                  type="password"
                  variant="glass"
                  value={loginData.loginPassword}
                  onChange={(e) => loginData.setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  error={fieldErrors.loginPassword}
                />

                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full mt-8 !bg-white !text-slate-900 hover:!bg-slate-100"
                >
                  Đăng Nhập
                </Button>
              </form>
            </div>

            {/* --- PANEL 2: ĐĂNG KÝ USER/ADMIN --- */}
            <div className="w-1/3 p-6 h-full overflow-y-auto custom-scrollbar">
              <form onSubmit={handleRegisterUserSubmit} noValidate className="space-y-4 max-w-sm mx-auto mt-4">
                <Input
                  label="Email"
                  type="text"
                  variant="glass"
                  value={regUserData.regUserEmail}
                  onChange={(e) => regUserData.setRegUserEmail(e.target.value)}
                  error={fieldErrors.regUserEmail}
                />
                <Input
                  label="Mật khẩu"
                  type="password"
                  variant="glass"
                  value={regUserData.regUserPassword}
                  onChange={(e) => regUserData.setRegUserPassword(e.target.value)}
                  error={fieldErrors.regUserPassword}
                />
                <Input
                  label="Xác nhận mật khẩu"
                  type="password"
                  variant="glass"
                  value={regUserData.regUserConfirm}
                  onChange={(e) => regUserData.setRegUserConfirm(e.target.value)}
                  error={fieldErrors.regUserConfirm}
                />

                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full mt-8 !bg-white !text-slate-900 hover:!bg-slate-100"
                >
                  Tạo Tài Khoản
                </Button>
              </form>
            </div>

            {/* --- PANEL 3: ĐĂNG KÝ DOANH NGHIỆP --- */}
            <div className="w-1/3 p-6 h-full overflow-y-auto custom-scrollbar">
              <form onSubmit={handleRegisterBizSubmit} noValidate className="space-y-5 mt-2">
                <h3 className="font-semibold text-white/90 border-b border-white/20 pb-2">1. Thông tin pháp lý & Doanh nghiệp</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Tên doanh nghiệp"
                    variant="glass"
                    value={regBizData.bizName}
                    onChange={(e) => regBizData.setBizName(e.target.value)}
                    error={fieldErrors.bizName}
                  />
                  <Input
                    label="Mã số thuế"
                    variant="glass"
                    value={regBizData.bizTaxCode}
                    onChange={(e) => regBizData.setBizTaxCode(e.target.value)}
                    error={fieldErrors.bizTaxCode}
                  />
                  <Input
                    label="Địa chỉ đăng ký kinh doanh"
                    variant="glass"
                    className="sm:col-span-2"
                    value={regBizData.bizAddress}
                    onChange={(e) => regBizData.setBizAddress(e.target.value)}
                    error={fieldErrors.bizAddress}
                  />
                </div>

                <h3 className="font-semibold text-white/90 border-b border-white/20 pb-2 pt-2">2. Thông tin người đại diện</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Họ tên"
                    variant="glass"
                    value={regBizData.repName}
                    onChange={(e) => regBizData.setRepName(e.target.value)}
                    error={fieldErrors.repName}
                  />
                  <Input
                    label="Chức vụ"
                    variant="glass"
                    value={regBizData.repPosition}
                    onChange={(e) => regBizData.setRepPosition(e.target.value)}
                    error={fieldErrors.repPosition}
                  />
                  <Input
                    label="Số điện thoại"
                    type="text"
                    variant="glass"
                    value={regBizData.repPhone}
                    onChange={(e) => regBizData.setRepPhone(e.target.value)}
                    error={fieldErrors.repPhone}
                  />
                  <Input
                    label="Email làm việc"
                    type="text"
                    variant="glass"
                    value={regBizData.repEmail}
                    onChange={(e) => regBizData.setRepEmail(e.target.value)}
                    error={fieldErrors.repEmail}
                  />
                </div>

                <h3 className="font-semibold text-white/90 border-b border-white/20 pb-2 pt-2">3. Thiết lập mật khẩu</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Mật khẩu"
                    type="password"
                    variant="glass"
                    value={regBizData.bizPassword}
                    onChange={(e) => regBizData.setBizPassword(e.target.value)}
                    error={fieldErrors.bizPassword}
                  />
                  <Input
                    label="Xác nhận mật khẩu"
                    type="password"
                    variant="glass"
                    value={regBizData.bizConfirm}
                    onChange={(e) => regBizData.setBizConfirm(e.target.value)}
                    error={fieldErrors.bizConfirm}
                  />
                </div>

                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full mt-4 !bg-teal-500 hover:!bg-teal-600 !text-white"
                >
                  Gửi Yêu Cầu Hợp Tác
                </Button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;