import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const useLogin = () => {
  const { login, registerUser, registerBusiness } = useAuth();

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
    setError('');
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
      await registerUser({
        email: regUserEmail,
        password: regUserPassword,
        confirmPassword: regUserConfirm
      });
      toast.success('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
      setActiveTab(0);
      setRegUserEmail(''); setRegUserPassword(''); setRegUserConfirm('');
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
      toast.success('Đăng ký doanh nghiệp thành công! Vui lòng chờ Admin phê duyệt tài khoản.');
      setActiveTab(0);
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

  return {
    activeTab, setActiveTab,
    error, setError,
    isSubmitting,
    loginData: { loginEmail, setLoginEmail, loginPassword, setLoginPassword },
    regUserData: { regUserEmail, setRegUserEmail, regUserPassword, setRegUserPassword, regUserConfirm, setRegUserConfirm },
    regBizData: { 
      bizName, setBizName, bizTaxCode, setBizTaxCode, bizAddress, setBizAddress,
      repName, setRepName, repPosition, setRepPosition, repPhone, setRepPhone, repEmail, setRepEmail,
      bizPassword, setBizPassword, bizConfirm, setBizConfirm
    },
    handleLoginSubmit,
    handleRegisterUserSubmit,
    handleRegisterBizSubmit
  };
};
