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
    handleLoginSubmit,
    handleRegisterUserSubmit
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
            <h1 className="text-3xl font-bold tracking-tight">BookNow</h1>
            <p className="text-white/80 mt-2">Nơi nghỉ chân hoàn hảo cho chuyến hành trình dài của bạn</p>
          </div>

          <div className="flex justify-between border-b border-white/20 relative">
            <button
              type="button"
              onClick={() => setActiveTab(0)}
              className={`pb-3 w-1/2 text-center font-medium transition-colors ${activeTab === 0 ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => setActiveTab(1)}
              className={`pb-3 w-1/2 text-center font-medium transition-colors ${activeTab === 1 ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
            >
              Đăng ký người dùng
            </button>

            {/* Thanh gạch chân trượt */}
            <div
              className="absolute bottom-0 h-0.5 bg-white transition-all duration-300 ease-in-out w-1/2"
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
            className="flex transition-transform duration-500 ease-in-out w-[200%] h-full"
            style={{ transform: `translateX(-${activeTab * 50}%)` }}
          >

            {/* --- PANEL 1: ĐĂNG NHẬP --- */}
            <div className="w-1/2 p-6 h-full overflow-y-auto custom-scrollbar">
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

                <div className="text-center mt-6">
                  <p className="text-white/70 text-sm">Muốn hợp tác cùng chúng tôi?</p>
                  <Link to="/register-partner" className="text-white font-medium hover:underline text-sm inline-block mt-1">
                    Đăng ký trở thành đối tác →
                  </Link>
                </div>
              </form>
            </div>

            {/* --- PANEL 2: ĐĂNG KÝ USER --- */}
            <div className="w-1/2 p-6 h-full overflow-y-auto custom-scrollbar">
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

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
