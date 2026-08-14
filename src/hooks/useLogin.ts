import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { toSentenceCase, isValidTaxCode, isValidPhone, isValidName, extractErrorMessage } from '../utils/formatters';

export const useLogin = () => {
  const { login, registerUser, registerBusiness } = useAuth();

  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);
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

  const handleRegisterBizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    let hasError = false;
    const errors: Record<string, string> = {};

    if (!bizName.trim()) { 
      errors.bizName = 'Tên doanh nghiệp không được để trống'; hasError = true; 
    } else if (bizName.trim().length < 2 || bizName.trim().length > 100) {
      errors.bizName = 'Tên doanh nghiệp phải từ 2 đến 100 ký tự'; hasError = true;
    }
    
    if (!bizTaxCode.trim()) { 
      errors.bizTaxCode = 'Mã số thuế không được để trống'; hasError = true; 
    } else if (!isValidTaxCode(bizTaxCode.trim())) {
      errors.bizTaxCode = 'Mã số thuế phải gồm 10 số hoặc 13 số (VD: 0123456789 hoặc 0123456789-001)'; hasError = true;
    }
    
    if (!bizAddress.trim()) { errors.bizAddress = 'Địa chỉ không được để trống'; hasError = true; }
    
    if (!repName.trim()) { 
      errors.repName = 'Họ tên người đại diện không được để trống'; hasError = true; 
    } else if (repName.trim().length < 2 || repName.trim().length > 100) {
      errors.repName = 'Họ tên phải từ 2 đến 100 ký tự'; hasError = true;
    } else if (!isValidName(repName.trim())) {
      errors.repName = 'Họ tên không được chứa số hoặc ký tự đặc biệt'; hasError = true;
    }
    
    if (!repPosition.trim()) { errors.repPosition = 'Chức vụ không được để trống'; hasError = true; }
    
    if (!repPhone.trim()) {
      errors.repPhone = 'Số điện thoại không được để trống';
      hasError = true;
    } else if (!/^[0-9]+$/.test(repPhone.trim())) {
      errors.repPhone = 'Số điện thoại chỉ được nhập số';
      hasError = true;
    } else if (!isValidPhone(repPhone.trim())) {
      errors.repPhone = 'Số điện thoại phải từ 10-11 số';
      hasError = true;
    }

    if (!repEmail) {
      errors.repEmail = 'Email không được để trống';
      hasError = true;
    } else if (!isValidEmail(repEmail)) {
      errors.repEmail = 'Email không đúng định dạng';
      hasError = true;
    }

    if (!bizPassword) {
      errors.bizPassword = 'Mật khẩu không được để trống';
      hasError = true;
    }
    if (!bizConfirm) {
      errors.bizConfirm = 'Vui lòng xác nhận mật khẩu';
      hasError = true;
    } else if (bizPassword !== bizConfirm) {
      errors.bizConfirm = 'Mật khẩu xác nhận không khớp.';
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedBizName = toSentenceCase(bizName.trim());
      const formattedRepName = toSentenceCase(repName.trim());

      await registerBusiness({
        businessName: formattedBizName,
        taxCode: bizTaxCode.trim(),
        businessAddress: bizAddress.trim(),
        representativeName: formattedRepName,
        position: repPosition.trim(),
        representativePhone: repPhone.trim(),
        representativeEmail: repEmail.trim(),
        password: bizPassword,
        confirmPassword: bizConfirm
      });
      toast.success('Đăng ký doanh nghiệp thành công! Vui lòng chờ Admin phê duyệt tài khoản.');
      setActiveTab(0);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Đăng ký doanh nghiệp thất bại.'));
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
