import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AmenityItem { id: string; name: string; categoryName: string; }
interface RoomImage { id: string; url: string; isPrimary: boolean; displayOrder: number; }
interface RoomTypePublic {
  id: string; name: string; basePrice: number; maxAdults: number; maxChildren: number;
  totalRooms: number; description: string; availableRooms: number | null;
  images: RoomImage[]; amenities: AmenityItem[];
}
interface GuestForm { guestName: string; guestPhone: string; guestEmail: string; specialRequests: string; numRooms: number; numAdults: number; numChildren: number; }

// ─── BookingForm Component ────────────────────────────────────────────────────
interface BookingFormProps {
  room: RoomTypePublic;
}

const BookingForm: React.FC<BookingFormProps> = ({ room }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Khởi tạo state từ search params nếu có
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [form, setForm] = useState<GuestForm>({ guestName: '', guestPhone: '', guestEmail: '', specialRequests: '', numRooms: 1, numAdults: 1, numChildren: 0 });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Tính số đêm và tổng tiền
  const numNights = checkIn && checkOut
    ? Math.max(0, Math.floor((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 0;
  const totalPrice = room.basePrice * form.numRooms * Math.max(1, numNights);
  const maxRooms = room.availableRooms ?? room.totalRooms ?? 1;

  // Sửa lỗi ngày quá khứ: dùng Local Time của trình duyệt thay vì UTC
  const todayDate = new Date();
  todayDate.setMinutes(todayDate.getMinutes() - todayDate.getTimezoneOffset());
  const todayStr = todayDate.toISOString().split('T')[0];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.guestName.trim()) e.guestName = 'Vui lòng nhập họ tên';
    if (!form.guestPhone.trim()) e.guestPhone = 'Vui lòng nhập số điện thoại';
    if (!form.guestEmail.trim()) e.guestEmail = 'Vui lòng nhập email';
    if (!checkIn) e.checkIn = 'Vui lòng chọn ngày nhận phòng';
    if (!checkOut) e.checkOut = 'Vui lòng chọn ngày trả phòng';
    if (checkIn && checkIn < todayStr) e.checkIn = 'Ngày nhận phòng không thể là ngày trong quá khứ';
    if (checkIn && checkOut && checkOut <= checkIn) e.checkOut = 'Ngày trả phòng phải sau ngày nhận phòng';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Vui lòng đăng nhập để đặt phòng!');
      navigate('/login');
      return;
    }
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }

    setSubmitting(true);
    try {
      const res = await api.post('/bookings', {
        roomTypeId: room.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numRooms: form.numRooms,
        numAdults: form.numAdults,
        numChildren: form.numChildren,
        guestName: form.guestName,
        guestPhone: form.guestPhone,
        guestEmail: form.guestEmail,
        specialRequests: form.specialRequests || null,
      });
      const bookingId: string = res.data.data;
      toast.success('Đặt phòng thành công!');
      navigate(`/booking/${bookingId}`);
    } catch (err: any) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        toast.error(err.response.data.errors.join('\n'));
      } else {
        toast.error(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Ngày */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">Nhận phòng</label>
          <input type="date" value={checkIn} min={todayStr}
            onChange={e => { setCheckIn(e.target.value); if (checkOut && checkOut <= e.target.value) setCheckOut(''); }}
            className={`w-full border rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.checkIn ? 'border-red-400' : 'border-slate-200'}`} />
          {errors.checkIn && <p className="text-red-500 text-xs mt-1">{errors.checkIn}</p>}
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">Trả phòng</label>
          <input type="date" value={checkOut}
            min={(() => { if (!checkIn) return todayStr; const d = new Date(checkIn); d.setDate(d.getDate() + 1); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().split('T')[0]; })()}
            onChange={e => setCheckOut(e.target.value)}
            className={`w-full border rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.checkOut ? 'border-red-400' : 'border-slate-200'}`} />
          {errors.checkOut && <p className="text-red-500 text-xs mt-1">{errors.checkOut}</p>}
        </div>
      </div>

      {/* Số phòng và số khách */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">Số phòng</label>
          <input type="number" min={1} max={maxRooms} value={form.numRooms}
            onChange={e => setForm(f => ({ ...f, numRooms: Math.min(maxRooms, Math.max(1, parseInt(e.target.value) || 1)) }))}
            className="w-full border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">Người lớn</label>
          <input type="number" min={1} value={form.numAdults}
            onChange={e => setForm(f => ({ ...f, numAdults: Math.max(1, parseInt(e.target.value) || 1) }))}
            className="w-full border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">Trẻ em</label>
          <input type="number" min={0} value={form.numChildren}
            onChange={e => setForm(f => ({ ...f, numChildren: Math.max(0, parseInt(e.target.value) || 0) }))}
            className="w-full border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      {/* Thông tin khách */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Thông tin liên hệ</p>
        <input type="text" placeholder="Họ và tên *" value={form.guestName}
          onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.guestName ? 'border-red-400' : 'border-slate-200'}`} />
        {errors.guestName && <p className="text-red-500 text-xs">{errors.guestName}</p>}

        <input type="tel" placeholder="Số điện thoại *" value={form.guestPhone}
          onChange={e => setForm(f => ({ ...f, guestPhone: e.target.value }))}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.guestPhone ? 'border-red-400' : 'border-slate-200'}`} />
        {errors.guestPhone && <p className="text-red-500 text-xs">{errors.guestPhone}</p>}

        <input type="email" placeholder="Email *" value={form.guestEmail}
          onChange={e => setForm(f => ({ ...f, guestEmail: e.target.value }))}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.guestEmail ? 'border-red-400' : 'border-slate-200'}`} />
        {errors.guestEmail && <p className="text-red-500 text-xs">{errors.guestEmail}</p>}

        <textarea placeholder="Yêu cầu đặc biệt (không bắt buộc)" value={form.specialRequests}
          onChange={e => setForm(f => ({ ...f, specialRequests: e.target.value }))}
          rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
      </div>

      {/* Tóm tắt giá */}
      {numNights > 0 && (
        <div className="bg-indigo-50 rounded-xl p-3 text-sm space-y-1 border border-indigo-100">
          <div className="flex justify-between text-slate-600">
            <span>{room.basePrice.toLocaleString('vi-VN')}₫ × {numNights} đêm × {form.numRooms} phòng</span>
          </div>
          <div className="flex justify-between font-bold text-indigo-700 text-base pt-1 border-t border-indigo-200">
            <span>Tổng cộng</span>
            <span>{totalPrice.toLocaleString('vi-VN')}₫</span>
          </div>
        </div>
      )}

      <button type="submit" disabled={submitting}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition text-sm">
        {submitting ? 'Đang xử lý...' : 'Xác nhận đặt phòng'}
      </button>
    </form>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const RoomTypeDetailPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState<RoomTypePublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';

  const fetchRoomDetail = useCallback(async () => {
    if (!roomId) return;
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (checkIn) params.checkIn = checkIn;
      if (checkOut) params.checkOut = checkOut;
      const res = await api.get(`/hotels/room-types/${roomId}`, { params });
      setRoom(res.data.data);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không thể tải thông tin phòng.');
    } finally {
      setLoading(false);
    }
  }, [roomId, checkIn, checkOut]);

  useEffect(() => { fetchRoomDetail(); }, [fetchRoomDetail]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="animate-pulse space-y-6">
        <div className="h-80 bg-slate-200 rounded-2xl" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-64 bg-slate-100 rounded-xl" />
          <div className="h-80 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    </div>
  );

  if (!room) return (
    <div className="max-w-4xl mx-auto px-4 py-24 text-center">
      <p className="text-slate-500 font-medium mb-4">Không tìm thấy thông tin loại phòng.</p>
      <button onClick={() => navigate(-1)} className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm">Quay lại</button>
    </div>
  );

  const allImages = room.images;
  const primaryImg = allImages.find(i => i.isPrimary) || allImages[0];

  const amenityByCategory = room.amenities.reduce<Record<string, AmenityItem[]>>((acc, a) => {
    (acc[a.categoryName] ||= []).push(a);
    return acc;
  }, {});

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* ── Breadcrumb ── */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
          <span>&larr;</span> Quay lại khách sạn
        </button>
      </div>

      {/* ── Hình ảnh to rõ ràng ── */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden h-[300px] md:h-[500px]">
          <div className="md:col-span-3 bg-slate-900 relative">
            {allImages.length > 0 ? (
              <img src={allImages[activeImg]?.url || primaryImg?.url} alt={room.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">Chưa có ảnh</div>
            )}
          </div>
          <div className="hidden md:flex flex-col gap-2 overflow-y-auto">
            {allImages.map((img, i) => (
              <div key={i} onClick={() => setActiveImg(i)} className={`cursor-pointer h-[120px] shrink-0 border-4 ${i === activeImg ? 'border-indigo-500' : 'border-transparent'}`}>
                <img src={img.url} alt="Room view" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Nội dung chi tiết ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-10">
          
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{room.name}</h1>
              <div className="flex gap-4 mt-2 text-sm text-slate-500 font-medium">
                <span className="flex items-center gap-1">👤 Người lớn: {room.maxAdults}</span>
                <span className="flex items-center gap-1">👶 Trẻ em: {room.maxChildren}</span>
                {room.availableRooms !== null && (
                  <span className={room.availableRooms > 0 ? 'text-emerald-600' : 'text-red-500'}>
                    &#10003; Còn {room.availableRooms} phòng
                  </span>
                )}
              </div>
            </div>

            {room.description && (
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-2">Mô tả phòng</h2>
                <p className="text-slate-600 leading-relaxed">{room.description}</p>
              </div>
            )}

            {room.amenities.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4">Tiện nghi có trong phòng</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(amenityByCategory).map(([cat, items]) => (
                    <div key={cat} className="bg-slate-50 p-4 rounded-xl">
                      <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-3">{cat}</h4>
                      <ul className="space-y-2">
                        {items.map(a => (
                          <li key={a.id} className="text-sm text-slate-700 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                            {a.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Form Đặt phòng bên phải ── */}
          <div className="mt-8 lg:mt-0">
            <div className="sticky top-6 bg-white border-2 border-indigo-100 rounded-2xl p-6 shadow-xl shadow-indigo-50">
              <h3 className="font-bold text-slate-900 text-lg mb-4">Đặt phòng tại đây</h3>
              <BookingForm room={room} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RoomTypeDetailPage;
