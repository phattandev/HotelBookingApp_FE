import React, { useRef } from 'react';
import { useRegisterPartner } from '../../hooks/useRegisterPartner';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const RegisterPartnerPage: React.FC = () => {
  const {
    error,
    fieldErrors,
    isSubmitting,
    formData,
    selectedFiles,
    handleFileChange,
    removeFile,
    handleSubmit
  } = useRegisterPartner();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    bizName, setBizName, bizTaxCode, setBizTaxCode, bizAddress, setBizAddress,
    repName, setRepName, repPosition, setRepPosition, repPhone, setRepPhone, repEmail, setRepEmail,
    bizPassword, setBizPassword, bizConfirm, setBizConfirm
  } = formData;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const event = { target: { files: e.dataTransfer.files } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(event);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-indigo-600 font-semibold tracking-wider uppercase text-sm">Hợp tác cùng BookNow</span>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">Trở thành Đối Tác của chúng tôi</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-500 mx-auto">
            Tiếp cận hàng triệu khách hàng tiềm năng và quản lý kinh doanh hiệu quả với nền tảng của chúng tôi.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm max-w-3xl mx-auto">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Cột trái: Form đăng ký */}
          <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-8">

              {/* Section 1: Thông tin pháp lý */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 border-b pb-2 mb-4">1. Thông tin Doanh nghiệp</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="Tên doanh nghiệp / Hộ kinh doanh"
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    error={fieldErrors.bizName}
                  />
                  <Input
                    label="Mã số thuế"
                    value={bizTaxCode}
                    onChange={(e) => setBizTaxCode(e.target.value)}
                    error={fieldErrors.bizTaxCode}
                  />
                  <Input
                    label="Địa chỉ đăng ký kinh doanh"
                    className="sm:col-span-2"
                    value={bizAddress}
                    onChange={(e) => setBizAddress(e.target.value)}
                    error={fieldErrors.bizAddress}
                  />
                </div>
              </div>

              {/* Section 2: Người đại diện */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 border-b pb-2 mb-4">2. Thông tin Người đại diện</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="Họ và tên"
                    value={repName}
                    onChange={(e) => setRepName(e.target.value)}
                    error={fieldErrors.repName}
                  />
                  <Input
                    label="Chức vụ"
                    value={repPosition}
                    onChange={(e) => setRepPosition(e.target.value)}
                    error={fieldErrors.repPosition}
                  />
                  <Input
                    label="Số điện thoại"
                    type="text"
                    value={repPhone}
                    onChange={(e) => setRepPhone(e.target.value)}
                    error={fieldErrors.repPhone}
                  />
                  <Input
                    label="Email làm việc"
                    type="email"
                    value={repEmail}
                    onChange={(e) => setRepEmail(e.target.value)}
                    error={fieldErrors.repEmail}
                  />
                </div>
              </div>

              {/* Section 3: Mật khẩu */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 border-b pb-2 mb-4">3. Thông tin đăng nhập</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="Mật khẩu"
                    type="password"
                    value={bizPassword}
                    onChange={(e) => setBizPassword(e.target.value)}
                    error={fieldErrors.bizPassword}
                  />
                  <Input
                    label="Xác nhận mật khẩu"
                    type="password"
                    value={bizConfirm}
                    onChange={(e) => setBizConfirm(e.target.value)}
                    error={fieldErrors.bizConfirm}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3 text-base !bg-indigo-600 hover:!bg-indigo-700 !text-white"
                >
                  Gửi Yêu Cầu Hợp Tác
                </Button>
              </div>

            </form>
          </div>

          {/* Cột phải: Điều khoản */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Chính Sách & Quy Trình Thẩm Định Đối Tác
              </h3>

              <div className="space-y-5 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 bg-indigo-50 text-indigo-600 rounded-full p-1.5 shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">Tính minh bạch & Phòng chống gian lận</h4>
                    <p className="mt-1 leading-relaxed">Để ngăn chặn triệt để tình trạng <strong>"doanh nghiệp ảo"</strong> và <strong>"khách sạn ma"</strong>, mọi thông tin bạn cung cấp phải đảm bảo 100% trung thực. Chúng tôi cam kết xây dựng một hệ sinh thái an toàn tuyệt đối cho người dùng.</p>
                  </div>
                </div>


                <div className="flex items-start gap-3">
                  <div className="mt-0.5 bg-indigo-50 text-indigo-600 rounded-full p-1.5 shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">Phạm vi dịch vụ & Đồng bộ hệ thống</h4>
                    <p className="mt-1 leading-relaxed">Nền tảng của chúng tôi chỉ hỗ trợ dịch vụ lưu trú ngắn ngày (Khách sạn, Resort, Homestay). <strong>Không hỗ trợ cho thuê phòng trọ dài hạn</strong>. Nếu bạn đang đăng ký trên nhiều nền tảng khác nhau, vui lòng thiết lập đồng bộ số lượng phòng hợp lý để tránh xung đột overbooking. <em>Chúng tôi rất hoan nghênh nếu BookNow là nền tảng phân phối độc quyền của bạn!</em></p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 bg-indigo-50 text-indigo-600 rounded-full p-1.5 shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">Xác minh thực địa</h4>
                    <p className="mt-1 leading-relaxed">Khi bạn được duyệt và bắt đầu đăng thông tin phòng, chúng tôi sẽ yêu cầu bổ sung các giấy phép như <em>ANTT, PCCC, Vệ sinh an toàn thực phẩm</em> cùng với video quay cận cảnh thực tế cơ sở vật chất. Đội ngũ nhân viên BookNow cũng sẽ tổ chức các chuyến đi kiểm tra xác minh tại địa chỉ thực tế của khách sạn.</p>
                  </div>
                </div>
              </div>
            </div>


          </div>

        </div>
      </div>
    </div>
  );
};

export default RegisterPartnerPage;
