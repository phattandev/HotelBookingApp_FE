import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// ─── Slide data ────────────────────────────────────────────────────────────────
const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80',
    title: 'Nghỉ dưỡng đẳng cấp tại Việt Nam',
    subtitle: 'Hàng nghìn khách sạn từ Bắc đến Nam — đặt phòng dễ dàng trong vài giây.',
  },
  {
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&q=80',
    title: 'Tìm nơi lưu trú lý tưởng',
    subtitle: 'Từ resort biển đến boutique hotel phố cổ — tất cả trên một nền tảng.',
  },
  {
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1600&q=80',
    title: 'Trải nghiệm không thể quên',
    subtitle: 'Đặt phòng an toàn, giá minh bạch, hỗ trợ 24/7.',
  },
];

// ─── Destinations ──────────────────────────────────────────────────────────────
const DESTINATIONS = [
  { name: 'Đà Nẵng', image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&q=80', count: '120+ khách sạn' },
  { name: 'Hội An', image: 'https://media.istockphoto.com/id/174855640/photo/bridge-in-hoi-an-vietnam.jpg?b=1&s=170667a&w=0&k=20&c=XvJzqp2dNpGgJVaZQMP-0OMrUn95uAB4WXF5idjyAtw=', count: '85+ khách sạn' },
  { name: 'Nha Trang', image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=600&q=80', count: '20+ khách sạn' },
  { name: 'Phú Quốc', image: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=600&q=80', count: '30+ khách sạn' },
  { name: 'Hà Nội', image: 'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=600&q=80', count: '60+ khách sạn' },
  { name: 'Sapa', image: 'https://media.istockphoto.com/id/174855640/photo/bridge-in-hoi-an-vietnam.jpg?b=1&s=170667a&w=0&k=20&c=XvJzqp2dNpGgJVaZQMP-0OMrUn95uAB4WXF5idjyAtw=', count: '30+ khách sạn' },
];

// ─── USP features ──────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Đặt phòng an toàn',
    desc: 'Thông tin khách sạn được xác minh và duyệt bởi đội ngũ quản trị.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Giá minh bạch',
    desc: 'Không phí ẩn, không bất ngờ — giá hiển thị là giá bạn thanh toán.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    title: 'Đa dạng lựa chọn',
    desc: 'Từ homestay bình dân đến resort 5 sao — phù hợp mọi ngân sách.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: 'Hỗ trợ nhanh chóng',
    desc: 'Đội ngũ hỗ trợ luôn sẵn sàng giải đáp mọi thắc mắc của bạn.',
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────
const HomePage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const slideInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();

  // Ngày hôm nay theo local time
  const todayStr = (() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  })();

  // Ngày tối thiểu cho checkout = ngày checkIn + 1 ngày
  const minCheckOut = (() => {
    if (!checkIn) return todayStr;
    const d = new Date(checkIn);
    d.setDate(d.getDate() + 1);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  })();

  useEffect(() => {
    slideInterval.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => { if (slideInterval.current) clearInterval(slideInterval.current); };
  }, []);

  const goToSlide = (i: number) => {
    setCurrentSlide(i);
    if (slideInterval.current) clearInterval(slideInterval.current);
    slideInterval.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % SLIDES.length);
    }, 5000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkIn && checkOut && checkOut <= checkIn) {
      toast.error('Ngày trả phòng phải sau ngày nhận phòng!');
      return;
    }
    const params = new URLSearchParams();
    if (destination) params.set('q', destination);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests);
    navigate(`/hotels?${params.toString()}`);
  };

  return (
    <div className="bg-white">
      {/* ===== HERO / SLIDESHOW ===== */}
      <section className="relative h-[580px] overflow-hidden">
        {/* Slides */}
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: currentSlide === i ? 1 : 0 }}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />
          </div>
        ))}

        {/* Hero text */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight max-w-2xl drop-shadow-lg">
            {SLIDES[currentSlide].title}
          </h1>
          <p className="mt-4 text-lg text-white/85 max-w-xl drop-shadow">
            {SLIDES[currentSlide].subtitle}
          </p>

          {/* Search form */}
          <form
            onSubmit={handleSearch}
            className="mt-8 w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row gap-2"
          >
            <div className="flex-1 flex flex-col px-3 py-1.5 border-b sm:border-b-0 sm:border-r border-slate-100">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Điểm đến</label>
              <input
                type="text"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="Thành phố, tên khách sạn..."
                className="text-sm text-slate-800 outline-none placeholder-slate-400 bg-transparent"
              />
            </div>
            <div className="flex flex-col px-3 py-1.5 border-b sm:border-b-0 sm:border-r border-slate-100">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nhận phòng</label>
              <input
                type="date"
                value={checkIn}
                min={todayStr}
                onChange={e => {
                  setCheckIn(e.target.value);
                  if (checkOut && checkOut <= e.target.value) setCheckOut('');
                }}
                className="text-sm text-slate-800 outline-none bg-transparent"
              />
            </div>
            <div className="flex flex-col px-3 py-1.5 border-b sm:border-b-0 sm:border-r border-slate-100">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trả phòng</label>
              <input
                type="date"
                value={checkOut}
                min={minCheckOut}
                onChange={e => setCheckOut(e.target.value)}
                className="text-sm text-slate-800 outline-none bg-transparent"
              />
            </div>
            <div className="flex flex-col px-3 py-1.5 border-b sm:border-b-0 sm:border-r border-slate-100">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Số khách</label>
              <select
                value={guests}
                onChange={e => setGuests(e.target.value)}
                className="text-sm text-slate-800 outline-none bg-transparent"
              >
                {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} khách</option>)}
              </select>
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition text-sm shrink-0"
            >
              Tìm kiếm
            </button>
          </form>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`h-1.5 rounded-full transition-all ${currentSlide === i ? 'w-8 bg-white' : 'w-2 bg-white/50'
                }`}
            />
          ))}
        </div>
      </section>

      {/* ===== POPULAR DESTINATIONS ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">Điểm đến</p>
            <h2 className="text-2xl font-bold text-slate-900">Điểm đến phổ biến</h2>
          </div>
          <Link to="/hotels" className="text-sm text-indigo-600 font-medium hover:underline">
            Xem tất cả →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {DESTINATIONS.map((dest) => (
            <Link
              key={dest.name}
              to={`/hotels?q=${encodeURIComponent(dest.name)}`}
              className="group relative rounded-xl overflow-hidden aspect-[3/4] block"
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-3">
                <p className="text-white font-bold text-sm">{dest.name}</p>
                <p className="text-white/70 text-xs">{dest.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== USP / WHY US ===== */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">Ưu điểm</p>
            <h2 className="text-2xl font-bold text-slate-900">Tại sao chọn StayNow?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA — Partner ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative bg-indigo-600 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-white" />
          </div>
          <div className="relative px-8 py-12 md:flex md:items-center md:justify-between">
            <div className="text-white">
              <h2 className="text-2xl font-bold">Bạn là chủ khách sạn?</h2>
              <p className="mt-2 text-indigo-100 max-w-md">
                Đăng ký trở thành đối tác của StayNow — tiếp cận hàng triệu du khách trên toàn quốc, quản lý đặt phòng dễ dàng.
              </p>
            </div>
            <div className="mt-6 md:mt-0 shrink-0">
              <Link
                to="/login"
                className="inline-block bg-white text-indigo-600 font-semibold px-6 py-3 rounded-xl hover:bg-indigo-50 transition"
              >
                Đăng ký đối tác
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
