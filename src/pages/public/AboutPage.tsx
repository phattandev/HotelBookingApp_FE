import React from 'react';
import { Link } from 'react-router-dom';

const TEAM = [
  {
    name: 'Nguyễn Văn An',
    role: 'Founder & CEO',
    avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+An&background=6366f1&color=fff&size=128',
    desc: 'Với hơn 10 năm kinh nghiệm trong ngành du lịch và công nghệ, An đã xây dựng StayNow từ tầm nhìn đơn giản: đặt phòng khách sạn phải dễ như nhắn tin.',
  },
  {
    name: 'Trần Thị Minh',
    role: 'CTO',
    avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+Minh&background=8b5cf6&color=fff&size=128',
    desc: 'Kỹ sư phần mềm với bề dày tại các công ty công nghệ hàng đầu. Minh chịu trách nhiệm xây dựng nền tảng kỹ thuật vững chắc và bảo mật của StayNow.',
  },
  {
    name: 'Lê Hoàng Nam',
    role: 'Head of Operations',
    avatar: 'https://ui-avatars.com/api/?name=Le+Hoang+Nam&background=0ea5e9&color=fff&size=128',
    desc: 'Chuyên gia vận hành với kinh nghiệm quản lý đối tác khách sạn trên khắp Việt Nam, đảm bảo chất lượng dịch vụ đến từng chi tiết nhỏ.',
  },
];

const STATS = [
  { value: '500+', label: 'Khách sạn đối tác' },
  { value: '50,000+', label: 'Khách hàng hài lòng' },
  { value: '63', label: 'Tỉnh thành phủ sóng' },
  { value: '24/7', label: 'Hỗ trợ khách hàng' },
];

const VALUES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Minh bạch',
    desc: 'Giá hiển thị là giá thực. Không phí ẩn, không bất ngờ sau khi đặt phòng.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
      </svg>
    ),
    title: 'Tin cậy',
    desc: 'Mỗi khách sạn được xác minh và duyệt bởi đội ngũ. Đánh giá thật từ khách hàng thật.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'Nhanh chóng',
    desc: 'Từ tìm kiếm đến xác nhận đặt phòng — chỉ trong vài phút, mọi lúc mọi nơi.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: 'Cộng đồng',
    desc: 'Kết nối hàng nghìn du khách với những khách sạn tốt nhất trên khắp Việt Nam.',
  },
];

const AboutPage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <span className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wider uppercase">
            Về chúng tôi
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Chúng tôi kết nối<br />
            <span className="text-indigo-300">du khách & khách sạn</span>
          </h1>
          <p className="text-lg sm:text-xl text-indigo-200 max-w-2xl mx-auto leading-relaxed">
            StayNow ra đời từ niềm tin rằng mỗi chuyến đi đều xứng đáng được bắt đầu bằng một trải nghiệm đặt phòng hoàn hảo — đơn giản, an toàn và đáng tin cậy.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-bold text-indigo-600 mb-2">{stat.value}</p>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-indigo-600 text-sm font-semibold uppercase tracking-wider">Sứ mệnh của chúng tôi</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-3 mb-6 leading-snug">
              Đặt du khách Việt Nam vào trung tâm của mọi quyết định
            </h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                StayNow được thành lập năm 2024 với một mục tiêu rõ ràng: xây dựng nền tảng kết nối khách sạn và du khách tốt nhất Việt Nam, dựa trên sự tin tưởng và minh bạch.
              </p>
              <p>
                Chúng tôi tin rằng du lịch không chỉ là di chuyển từ điểm A đến điểm B — đó là những kỷ niệm được tạo ra, những câu chuyện được kể lại. Và một nơi lưu trú tốt là nền tảng cho mọi chuyến đi đáng nhớ.
              </p>
              <p>
                Từ resort 5 sao ven biển đến homestay bình dân giữa lòng phố cổ — StayNow mang đến mọi lựa chọn, với mức giá minh bạch và quy trình đặt phòng đơn giản đến mức ai cũng làm được.
              </p>
            </div>
            <Link
              to="/hotels"
              className="inline-flex items-center gap-2 mt-8 bg-indigo-600 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition"
            >
              Khám phá ngay
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=700&q=80"
              alt="Khách sạn cao cấp"
              className="rounded-2xl shadow-2xl w-full object-cover h-80 md:h-auto"
            />
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">Đặt phòng thành công</p>
                <p className="text-xs text-slate-500">2 phút trước • Đà Nẵng</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <span className="text-indigo-600 text-sm font-semibold uppercase tracking-wider">Giá trị cốt lõi</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-3">Những điều chúng tôi luôn giữ vững</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  {v.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{v.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <span className="text-indigo-600 text-sm font-semibold uppercase tracking-wider">Đội ngũ</span>
          <h2 className="text-3xl font-bold text-slate-900 mt-3">Những người đứng sau StayNow</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">Một đội ngũ nhỏ, đam mê lớn — cùng nhau tạo ra sản phẩm mà triệu du khách Việt tin dùng.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {TEAM.map((member) => (
            <div key={member.name} className="text-center bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-20 h-20 rounded-full mx-auto mb-4 ring-4 ring-indigo-50"
              />
              <h3 className="font-bold text-slate-900 text-lg">{member.name}</h3>
              <p className="text-indigo-600 text-sm font-medium mb-3">{member.role}</p>
              <p className="text-slate-500 text-sm leading-relaxed">{member.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Sẵn sàng bắt đầu chuyến đi?</h2>
          <p className="text-indigo-200 mb-8 max-w-xl mx-auto">Hàng nghìn khách sạn đang chờ bạn khám phá. Đặt phòng ngay hôm nay với StayNow.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/hotels"
              className="bg-white text-indigo-600 font-semibold px-8 py-3 rounded-xl hover:bg-indigo-50 transition"
            >
              Tìm khách sạn
            </Link>
            <Link
              to="/contact"
              className="bg-white/10 border border-white/30 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/20 transition"
            >
              Liên hệ chúng tôi
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
