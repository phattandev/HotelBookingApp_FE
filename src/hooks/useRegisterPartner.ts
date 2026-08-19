import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { toSentenceCase, isValidTaxCode, isValidPhone, isValidName, extractErrorMessage } from '../utils/formatters';

export const useRegisterPartner = () => {
  const { registerBusiness } = useAuth();

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Thông tin pháp lý
  const [bizName, setBizName] = useState('');
  const [bizTaxCode, setBizTaxCode] = useState('');
  const [bizAddress, setBizAddress] = useState('');
  
  // Người đại diện
  const [repName, setRepName] = useState('');
  const [repPosition, setRepPosition] = useState('');
  const [repPhone, setRepPhone] = useState('');
  const [repEmail, setRepEmail] = useState('');
  
  // Mật khẩu
  const [bizPassword, setBizPassword] = useState('');
  const [bizConfirm, setBizConfirm] = useState('');

  // Files
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const pdfFiles = filesArray.filter(file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
      
      if (pdfFiles.length !== filesArray.length) {
        toast.error('Chỉ hỗ trợ upload file PDF.');
      }

      const validSizeFiles = pdfFiles.filter(file => file.size <= 10 * 1024 * 1024);
      if (validSizeFiles.length !== pdfFiles.length) {
        toast.error('Có file vượt quá dung lượng tối đa 10MB.');
      }

      const newFiles = [...selectedFiles, ...validSizeFiles];
      if (newFiles.length > 10) {
        toast.error('Bạn chỉ được upload tối đa 10 file.');
        setSelectedFiles(newFiles.slice(0, 10));
      } else {
        setSelectedFiles(newFiles);
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Chặn double click

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
      errors.bizTaxCode = 'Mã số thuế phải gồm 10 số hoặc 13 số'; hasError = true;
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
      const formData = new FormData();
      formData.append('BusinessName', toSentenceCase(bizName.trim()));
      formData.append('TaxCode', bizTaxCode.trim());
      formData.append('BusinessAddress', bizAddress.trim());
      formData.append('RepresentativeName', toSentenceCase(repName.trim()));
      formData.append('Position', repPosition.trim());
      formData.append('RepresentativePhone', repPhone.trim());
      formData.append('RepresentativeEmail', repEmail.trim());
      formData.append('Password', bizPassword);
      formData.append('ConfirmPassword', bizConfirm);

      selectedFiles.forEach((file) => {
        formData.append('Documents', file);
      });

      await registerBusiness(formData);
      toast.success('Đăng ký doanh nghiệp thành công! Vui lòng chờ Admin phê duyệt tài khoản.');
      
      // Reset form
      setBizName(''); setBizTaxCode(''); setBizAddress('');
      setRepName(''); setRepPosition(''); setRepPhone(''); setRepEmail('');
      setBizPassword(''); setBizConfirm('');
      setSelectedFiles([]);
      
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Đăng ký doanh nghiệp thất bại.'));
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    error, setError,
    fieldErrors,
    isSubmitting,
    formData: { 
      bizName, setBizName, bizTaxCode, setBizTaxCode, bizAddress, setBizAddress,
      repName, setRepName, repPosition, setRepPosition, repPhone, setRepPhone, repEmail, setRepEmail,
      bizPassword, setBizPassword, bizConfirm, setBizConfirm
    },
    selectedFiles,
    handleFileChange,
    removeFile,
    handleSubmit
  };
};
