import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { Button } from '../../components/ui/Button';
import OccupancyDropdown from '../../components/OccupancyDropdown';
import { DatePicker } from '../../components/ui/DatePicker';
import { format } from 'date-fns';

// ─── Slide data ────────────────────────────────────────────────────────────────
const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&h=900&fit=crop&q=80',
    title: 'Nghỉ dưỡng đẳng cấp tại Việt Nam',
    subtitle: 'Hàng nghìn khách sạn từ Bắc đến Nam — đặt phòng dễ dàng trong vài giây.',
  },
  {
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&h=900&fit=crop&q=80',
    title: 'Tìm nơi lưu trú lý tưởng',
    subtitle: 'Từ resort biển đến boutique hotel phố cổ — tất cả trên một nền tảng.',
  },
  {
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1600&h=900&fit=crop&q=80',
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
    title: 'Đặt phòng an toàn',
    desc: 'Thông tin khách sạn được xác minh và duyệt bởi đội ngũ quản trị.',
  },
  {
    title: 'Giá minh bạch',
    desc: 'Không phí ẩn, không bất ngờ — giá hiển thị là giá bạn thanh toán.',
  },
  {
    title: 'Đa dạng lựa chọn',
    desc: 'Từ homestay bình dân đến resort 5 sao — phù hợp mọi ngân sách.',
  },
  {
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
  const [occupancy, setOccupancy] = useState({ rooms: 1, adults: 2, children: 0 });
  const slideInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();

  // Ngày hôm nay theo local time
  const todayDate = new Date();
  todayDate.setMinutes(todayDate.getMinutes() - todayDate.getTimezoneOffset());

  const minCheckOutDate = checkIn ? new Date(new Date(checkIn).getTime() + 86400000) : todayDate;

  const parseDateString = (dateStr: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  };
  const formatDateString = (d: Date | null) => d ? format(d, 'yyyy-MM-dd') : '';

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
    if (occupancy.rooms > 0) params.set('rooms', occupancy.rooms.toString());
    if (occupancy.adults > 0) params.set('adults', occupancy.adults.toString());
    if (occupancy.children > 0) params.set('children', occupancy.children.toString());
    navigate(`/hotels?${params.toString()}`);
  };

  return (
    <div className="bg-white">
      {/* ===== HERO / SLIDESHOW ===== */}
      <section className="relative h-[580px]">
        {/* Slides */}
        <div className="absolute inset-0 overflow-hidden">
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
        </div>

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
            className="mt-8 w-full max-w-[1000px] bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl p-3 sm:p-4 flex flex-col lg:flex-row gap-2 border border-white/30"
          >
            <div className="flex-1 w-full bg-white rounded-lg p-2 sm:p-3 flex flex-col relative">
              <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase px-2">Điểm đến</label>
              <input
                type="text"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="Thành phố, tên khách sạn..."
                className="w-full bg-transparent border-none text-slate-900 font-medium px-2 py-2 sm:py-1 focus:outline-none placeholder:text-slate-400 placeholder:font-normal text-sm sm:text-base"
              />
            </div>
            <div className="w-full lg:w-[180px] bg-white rounded-lg p-2 sm:p-3 flex flex-col relative">
              <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase px-2">Nhận phòng</label>
              <DatePicker
                value={parseDateString(checkIn)}
                minDate={todayDate}
                onChange={(date: Date | null) => {
                  const str = formatDateString(date);
                  setCheckIn(str);
                  if (checkOut && str && checkOut <= str) setCheckOut('');
                }}
                placeholderText="Chọn ngày"
                className="w-full border-none bg-transparent p-0 text-slate-900 font-medium focus:ring-0 shadow-none px-2 py-2 sm:py-1 placeholder:font-normal placeholder:text-slate-400 text-sm sm:text-base"
              />
            </div>
            <div className="w-full lg:w-[180px] bg-white rounded-lg p-2 sm:p-3 flex flex-col relative">
              <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase px-2">Trả phòng</label>
              <DatePicker
                value={parseDateString(checkOut)}
                minDate={minCheckOutDate}
                onChange={(date: Date | null) => setCheckOut(formatDateString(date))}
                placeholderText="Chọn ngày"
                className="w-full border-none bg-transparent p-0 text-slate-900 font-medium focus:ring-0 shadow-none px-2 py-2 sm:py-1 placeholder:font-normal placeholder:text-slate-400 text-sm sm:text-base"
              />
            </div>
            <div className="w-full lg:w-[260px] bg-white rounded-lg flex items-center relative p-1 sm:p-2">
              <OccupancyDropdown
                value={occupancy}
                onChange={setOccupancy}
                className="w-full"
              />
            </div>
            <div className="flex items-stretch shrink-0 mt-1 lg:mt-0 w-full lg:w-auto">
              <Button
                type="submit"
                className="w-full lg:w-auto px-8 py-3.5 lg:py-0 font-bold text-base h-full bg-indigo-600 hover:bg-indigo-700"
              >
                Tìm kiếm
              </Button>
            </div>
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
            <h2 className="text-2xl font-bold text-slate-900">Tại sao chọn BookNow?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100">
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
                Đăng ký trở thành đối tác của BookNow — tiếp cận hàng triệu du khách trên toàn quốc, quản lý đặt phòng dễ dàng.
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
