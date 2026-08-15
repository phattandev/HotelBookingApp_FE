// Kiểu dữ liệu liên quan đến Authentication

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterUserRequest {
  email: string;
  password: string;
  confirmPassword: string;
}


export interface AuthResponse {
  userId: string;
  fullName: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  errors?: string[];
  data: T;
}
