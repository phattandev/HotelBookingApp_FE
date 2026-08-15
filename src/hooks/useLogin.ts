import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { toSentenceCase, isValidTaxCode, isValidPhone, isValidName, extractErrorMessage } from '../utils/formatters';

export const useLogin = () => {
  const { login, registerUser } = useAuth();

  const [activeTab, setActiveTab] = useState<0 | 1>(0);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- State Form Đăng nhập ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // --- State Form Đăng ký User ---
  const [regUserEmail, setRegUserEmail] = useState('');
  const [regUserPassword, setRegUserPassword] = useState('');
  const [regUserConfirm, setRegUserConfirm] = useState('');

  useEffect(() => {
    setError('');
    setFieldErrors({});
  }, [activeTab]);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    
    let hasError = false;
    const errors: Record<string, string> = {};

    if (!loginEmail) {
      errors.loginEmail = 'Email không được để trống';
      hasError = true;
    }

    if (!loginPassword) {
      errors.loginPassword = 'Mật khẩu không được để trống';
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ usernameOrEmail: loginEmail, password: loginPassword });
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Đăng nhập thất bại.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    let hasError = false;
    const errors: Record<string, string> = {};

    if (!regUserEmail) {
      errors.regUserEmail = 'Email không được để trống';
      hasError = true;
    } else if (!isValidEmail(regUserEmail)) {
      errors.regUserEmail = 'Email không đúng định dạng';
      hasError = true;
    }

    if (!regUserPassword) {
      errors.regUserPassword = 'Mật khẩu không được để trống';
      hasError = true;
    }

    if (!regUserConfirm) {
      errors.regUserConfirm = 'Vui lòng xác nhận mật khẩu';
      hasError = true;
    } else if (regUserPassword !== regUserConfirm) {
      errors.regUserConfirm = 'Mật khẩu xác nhận không khớp.';
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUser({
        email: regUserEmail,
        password: regUserPassword,
        confirmPassword: regUserConfirm
      });
      toast.success('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
      setActiveTab(0);
      setRegUserEmail(''); setRegUserPassword(''); setRegUserConfirm('');
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Đăng ký thất bại.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    activeTab, setActiveTab,
    error, setError,
    fieldErrors,
    isSubmitting,
    loginData: { loginEmail, setLoginEmail, loginPassword, setLoginPassword },
    regUserData: { regUserEmail, setRegUserEmail, regUserPassword, setRegUserPassword, regUserConfirm, setRegUserConfirm },
    handleLoginSubmit,
    handleRegisterUserSubmit
  };
};
