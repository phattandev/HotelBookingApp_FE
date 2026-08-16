import React, { useState } from 'react';
import { isValidPhone } from '../../utils/formatters';


const CONTACT_INFO = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    title: 'Địa chỉ',
    lines: ['Đại học Công nghệ Sài Gòn', '180 Cao Lỗ, Phường Chánh Hưng, Quận 8', 'TP. Hồ Chí Minh, Việt Nam'],
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
    title: 'Điện thoại',
    lines: ['Hỗ trợ khách hàng: 0909 173 399', 'Doanh nghiệp: 0366 012 844', 'Thứ 2 – CN: 8:00 – 22:00'],
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    title: 'Email',
    lines: ['Hỗ trợ: support@booknow.vn', 'Hợp tác: partner@booknow.vn'],
    color: 'bg-purple-50 text-purple-600',
  },
];


const FAQ = [
  {
    q: 'Làm thế nào để đặt phòng trên BookNow?',
    a: 'Tìm kiếm khách sạn theo địa điểm và ngày → Chọn loại phòng phù hợp → Điền thông tin khách → Xác nhận đặt. Sau khi quản lý duyệt, bạn sẽ nhận email yêu cầu thanh toán cọc qua VNPay.',
  },
  {
    q: 'Chính sách hủy phòng như thế nào?',
    a: 'Chính sách hủy phòng khác nhau tùy từng khách sạn và được hiển thị rõ trước khi đặt. Thông thường hủy trước ngày check-in theo quy định sẽ được hoàn cọc 100%.',
  },
  {
    q: 'Tôi có thể đăng ký khách sạn của mình lên BookNow không?',
    a: 'Có! Đăng ký tài khoản Partner, điền thông tin doanh nghiệp và chờ đội ngũ chúng tôi xét duyệt (thường trong 1-2 ngày làm việc). Sau khi được chấp thuận, bạn có thể đăng tải khách sạn ngay.',
  },
  {
    q: 'Thanh toán qua BookNow có an toàn không?',
    a: 'Hoàn toàn an toàn. Chúng tôi tích hợp cổng thanh toán VNPay với mã hóa 256-bit. Thông tin thẻ của bạn không bao giờ được lưu trên hệ thống BookNow.',
  },
];

const ContactPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
            Có câu hỏi hay cần hỗ trợ?
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


      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Câu hỏi thường gặp</h2>
        <p className="text-slate-500 text-sm mb-8 text-center">Tìm câu trả lời nhanh cho những thắc mắc phổ biến nhất.</p>
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
      </section>

      {/* Map */}
      <section className="border-t border-slate-100 pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-900 text-lg">Đại học Công Nghệ Sài Gòn</p>
              <p className="text-slate-500 text-sm">180 Cao Lỗ, Phường 4, Quận 8, Hồ Chí Minh 700000, Vietnam</p>
            </div>
          </div>
        </div>
        <div className="h-[450px] bg-slate-100 relative overflow-hidden">
          <iframe
            src={`https://maps.google.com/maps?q=${encodeURIComponent('Đại học Công Nghệ Sài Gòn, 180 Cao Lỗ, Phường 4, Quận 8, Hồ Chí Minh')}&t=&z=17&ie=UTF8&iwloc=&output=embed`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 z-0"
            title="Bản đồ"
          ></iframe>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
