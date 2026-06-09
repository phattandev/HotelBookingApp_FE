import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';

// 1. Tạo một Component "Bảo vệ cổng"
// Nhiệm vụ: Kiểm tra xem user đã đăng nhập chưa. 
// Nếu chưa -> Đẩy về /login. Nếu rồi -> Cho đi tiếp vào trang bên trong.
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Đợi AuthContext kiểm tra token trong localStorage xong mới render
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Đang kiểm tra xác thực...</div>;
  }

  // Chưa đăng nhập thì đá về login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Component trang chủ tạm thời (bạn có thể thay bằng component Dashboard thật của bạn)
const Dashboard = () => {
  const { logout, user } = useAuth();
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Chào mừng {user?.Username} đã đăng nhập!</h1>
      <button 
        onClick={logout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Đăng xuất
      </button>
    </div>
  );
};

// 2. Cấu hình Router chính
function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider phải nằm TRONG BrowserRouter vì nó có xài useNavigate */}
      <AuthProvider>
        <Routes>
          {/* Route công khai: Bất kỳ ai cũng vào được */}
          <Route path="/login" element={<Login />} />

          {/* Route bảo mật: Truy cập root ("/") sẽ qua màng lọc ProtectedRoute */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Nếu user nhập URL bậy bạ, tự động đưa về trang chủ (rồi trang chủ sẽ tự quyết định đẩy về login hay không) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;