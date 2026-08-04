import React, { useState } from 'react';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const CONTACT_INFO = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    title: 'Địa chỉ',
    lines: ['Tầng 8, Tòa nhà Innovation Tower', '99 Đường Nguyễn Huệ, Quận 1', 'TP. Hồ Chí Minh, Việt Nam'],
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
    title: 'Điện thoại',
    lines: ['Hỗ trợ khách hàng: 1800 6868', 'Doanh nghiệp: (028) 3822 1234', 'Thứ 2 – CN: 8:00 – 22:00'],
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    title: 'Email',
    lines: ['Hỗ trợ: support@staynow.vn', 'Hợp tác: partner@staynow.vn', 'Phản hồi trong vòng 4 giờ'],
    color: 'bg-purple-50 text-purple-600',
  },
];

const SUBJECTS = [
  'Hỗ trợ đặt phòng',
  'Vấn đề thanh toán',
  'Khiếu nại về khách sạn',
  'Đăng ký khách sạn đối tác',
  'Hợp tác kinh doanh',
  'Báo lỗi hệ thống',
  'Khác',
];

const FAQ = [
  {
    q: 'Làm thế nào để đặt phòng trên StayNow?',
    a: 'Tìm kiếm khách sạn theo địa điểm và ngày → Chọn loại phòng phù hợp → Điền thông tin khách → Xác nhận đặt. Sau khi quản lý duyệt, bạn sẽ nhận email yêu cầu thanh toán cọc qua VNPay.',
  },
  {
    q: 'Chính sách hủy phòng như thế nào?',
    a: 'Chính sách hủy phòng khác nhau tùy từng khách sạn và được hiển thị rõ trước khi đặt. Thông thường hủy trước ngày check-in theo quy định sẽ được hoàn cọc 100%.',
  },
  {
    q: 'Tôi có thể đăng ký khách sạn của mình lên StayNow không?',
    a: 'Có! Đăng ký tài khoản Partner, điền thông tin doanh nghiệp và chờ đội ngũ chúng tôi xét duyệt (thường trong 1-2 ngày làm việc). Sau khi được chấp thuận, bạn có thể đăng tải khách sạn ngay.',
  },
  {
    q: 'Thanh toán qua StayNow có an toàn không?',
    a: 'Hoàn toàn an toàn. Chúng tôi tích hợp cổng thanh toán VNPay với mã hóa 256-bit. Thông tin thẻ của bạn không bao giờ được lưu trên hệ thống StayNow.',
  },
];

const ContactPage: React.FC = () => {
  const [form, setForm] = useState<FormData>({
    fullName: '', email: '', phone: '', subject: '', message: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (!form.fullName.trim()) e.fullName = 'Vui lòng nhập họ tên';
    if (!form.email.trim()) e.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email không hợp lệ';
    if (!form.subject) e.subject = 'Vui lòng chọn chủ đề';
    if (!form.message.trim()) e.message = 'Vui lòng nhập nội dung';
    else if (form.message.trim().length < 20) e.message = 'Nội dung phải có ít nhất 20 ký tự';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSending(true);
    // Simulate sending
    await new Promise(r => setTimeout(r, 1500));
    setSending(false);
    setSubmitted(true);
  };

  const inputCls = (field: keyof FormData) =>
    `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition ${
      errors[field]
        ? 'border-red-300 focus:ring-red-400 bg-red-50'
        : 'border-slate-200 focus:ring-indigo-500 bg-white'
    }`;

  return (
    <div className="bg-white">
      {/* Hero — cards nằm trong hero section, không dùng negative margin */}
      <section className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-300 rounded-full blur-3xl" />
        </div>
        {/* Hero text */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <span className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wider uppercase">
            Liên hệ
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Chúng tôi luôn sẵn sàng hỗ trợ</h1>
          <p className="text-indigo-200 text-lg max-w-xl mx-auto">
            Có câu hỏi hay cần hỗ trợ? Đội ngũ StayNow sẽ phản hồi bạn trong vòng 4 giờ làm việc.
          </p>
        </div>
        {/* Contact cards bên trong hero */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid sm:grid-cols-3 gap-5">
            {CONTACT_INFO.map((info) => (
              <div
                key={info.title}
                className="bg-white rounded-2xl border border-slate-100 shadow-xl p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200"
              >
                <div className={`w-11 h-11 ${info.color} rounded-xl flex items-center justify-center mb-4`}>
                  {info.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{info.title}</h3>
                {info.lines.map((line, i) => (
                  <p key={i} className={`text-sm ${i === info.lines.length - 1 ? 'text-slate-400 mt-1' : 'text-slate-600'}`}>{line}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Form + FAQ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Gửi tin nhắn cho chúng tôi</h2>
            <p className="text-slate-500 text-sm mb-8">Điền thông tin bên dưới, chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.</p>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-10 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-emerald-800 mb-2">Gửi thành công!</h3>
                <p className="text-emerald-700 text-sm mb-6">
                  Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi đến <strong>{form.email}</strong> trong vòng 4 giờ làm việc.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ fullName: '', email: '', phone: '', subject: '', message: '' }); }}
                  className="text-sm text-emerald-700 font-medium underline hover:no-underline"
                >
                  Gửi tin nhắn khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                      placeholder="Nguyễn Văn A"
                      className={inputCls('fullName')}
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="0901 234 567"
                      className={inputCls('phone')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="email@example.com"
                    className={inputCls('email')}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Chủ đề <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    className={inputCls('subject')}
                  >
                    <option value="">-- Chọn chủ đề --</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Nội dung <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Mô tả chi tiết vấn đề hoặc câu hỏi của bạn..."
                    className={`${inputCls('message')} resize-none`}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.message
                      ? <p className="text-red-500 text-xs">{errors.message}</p>
                      : <span />
                    }
                    <p className="text-xs text-slate-400">{form.message.length}/500</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-sm shadow-indigo-200"
                >
                  {sending ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                      Gửi tin nhắn
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Câu hỏi thường gặp</h2>
            <p className="text-slate-500 text-sm mb-8">Tìm câu trả lời nhanh cho những thắc mắc phổ biến nhất.</p>
            <div className="space-y-3">
              {FAQ.map((item, i) => (
                <div
                  key={i}
                  className="border border-slate-200 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full text-left px-5 py-4 flex justify-between items-center hover:bg-slate-50 transition"
                  >
                    <span className="font-semibold text-slate-800 text-sm pr-4">{item.q}</span>
                    <svg
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      <p className="pt-3">{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Social links */}
            <div className="mt-10 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
              <h3 className="font-bold text-slate-900 mb-1">Theo dõi chúng tôi</h3>
              <p className="text-sm text-slate-500 mb-4">Cập nhật ưu đãi và tin tức mới nhất từ StayNow.</p>
              <div className="flex gap-3">
                {[
                  { name: 'Facebook', bg: 'bg-blue-600', icon: 'f' },
                  { name: 'Zalo', bg: 'bg-sky-500', icon: 'Z' },
                  { name: 'Instagram', bg: 'bg-gradient-to-tr from-purple-600 to-pink-500', icon: '📷' },
                ].map(s => (
                  <button
                    key={s.name}
                    className={`${s.bg} text-white text-sm font-bold w-10 h-10 rounded-xl flex items-center justify-center hover:opacity-80 transition shadow-sm`}
                    title={s.name}
                  >
                    {s.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map placeholder */}
      <section className="border-t border-slate-100">
        <div className="h-72 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-300">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <p className="font-bold text-slate-700">99 Nguyễn Huệ, Q.1, TP.HCM</p>
              <p className="text-slate-500 text-sm mt-1">Tầng 8, Tòa nhà Innovation Tower</p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-indigo-600 text-sm font-semibold hover:underline"
              >
                Xem trên Google Maps →
              </a>
            </div>
          </div>
          {/* decorative grid */}
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
