import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { setTokens, clearTokens, getTokens } from '../utils/token';
import type { LoginRequest, RegisterUserRequest, RegisterBusinessRequest, ApiResponse, AuthResponse } from '../types/auth.types';

export interface User {
  Id: string;
  Username: string;
  Email: string;
  Role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  registerUser: (data: RegisterUserRequest) => Promise<void>;
  registerBusiness: (data: RegisterBusinessRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = () => {
      const { accessToken } = getTokens();
      if (accessToken) {
        const decoded = parseJwt(accessToken);
        if (decoded && decoded.exp * 1000 > Date.now()) {
          setUser({
            Id: decoded.nameid || decoded.sub || '',
            Username: decoded.unique_name || decoded.name || '',
            Email: decoded.email || '',
            Role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role || 'USER',
          });
        } else {
          clearTokens();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  // Hàm xử lý chung sau khi có kết quả trả về từ API Auth (Login/Register)
  const handleAuthResponse = (response: ApiResponse<AuthResponse>) => {
    const { accessToken, refreshToken } = response.data;
    
    setTokens(accessToken, refreshToken);
    
    const decoded = parseJwt(accessToken);
    const userRole = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role || 'customer';

    setUser({
      Id: decoded.nameid || decoded.sub || '',
      Username: decoded.unique_name || decoded.name || '',
      Email: decoded.email || '',
      Role: userRole,
    });
    
    // 🟢 ĐIỀU HƯỚNG THEO ROLE (PHÂN QUYỀN GIAO DIỆN)
    if (userRole === 'admin') {
      navigate('/admin'); // Chuyển thẳng vào Admin Dashboard
    } else if (userRole === 'partner') {
      navigate('/partner'); // Chuyển thẳng vào Partner Console
    } else if (userRole === 'manager') {
      navigate('/manager'); // Chuyển vào trang Quản lý Khách sạn
    } else {
      const searchParams = new URLSearchParams(window.location.search);
      const redirectUrl = searchParams.get('redirect');
      if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        navigate('/'); // Khách hàng bình thường về trang chủ
      }
    }
  };

  const login = async (credentials: LoginRequest) => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    handleAuthResponse(response.data);
  };

  // Hàm Đăng ký Khách hàng
  const registerUser = async (data: RegisterUserRequest) => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register/user', data);
    handleAuthResponse(response.data);
  };

  // Hàm Đăng ký Doanh nghiệp
  const registerBusiness = async (data: RegisterBusinessRequest) => {
    await api.post<ApiResponse<string>>('/auth/register/business', data);
    // Không gọi handleAuthResponse nữa vì API chỉ trả về chuỗi thành công, tài khoản cần chờ duyệt.
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    navigate('/login', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, registerUser, registerBusiness, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};