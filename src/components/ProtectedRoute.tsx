import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen font-semibold text-indigo-600">Đang tải cấu hình...</div>;
  }

  // 1. Chưa đăng nhập -> Đẩy về trang Login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Có quy định Role nhưng User không khớp -> Đẩy về trang báo lỗi 403
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.Role.toLowerCase())) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Hợp lệ -> Cho phép render Layout/Page bên trong
  return <Outlet />;
};

export default ProtectedRoute;