import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

// ─── Types ─────────────────────────────────────────────────────────────────────────────────
interface AmenityItem { id: string; name: string; categoryName: string; }
interface RoomImage { id: string; url: string; isPrimary: boolean; displayOrder: number; }
interface RoomType {
  id: string; name: string; basePrice: number; maxAdults: number; maxChildren: number;
  totalRooms: number; description: string; availableRooms: number | null;
  images: RoomImage[]; amenities: AmenityItem[];
}
interface HotelDetail {
  id: string; name: string; addressLine: string; provinceName: string; wardName: string;
  starRating: number | null; description: string | null;
  images: RoomImage[]; amenities: AmenityItem[]; roomTypes: RoomType[];
}
interface ReviewItem {
  id: string;
  customerName: string;
  createdAt: string;
  comment: string | null;
  averageScore: number | null;
  scoreSpace: number | null; scoreService: number | null; scoreExperience: number | null;
  scoreSafety: number | null; scoreCleanliness: number | null; scoreView: number | null;
  scoreRoomQuality: number | null; scoreFood: number | null; scoreQuietness: number | null;
  scoreStaffFriendliness: number | null;
}

const SCORE_LABELS: Record<string, string> = {
  scoreSpace: 'Không gian', scoreService: 'Dịch vụ', scoreExperience: 'Trải nghiệm',
  scoreSafety: 'An toàn', scoreCleanliness: 'Vệ sinh', scoreView: 'View & Vị trí',
  scoreRoomQuality: 'Chất lượng phòng', scoreFood: 'Ẩm thực',
  scoreQuietness: 'Yên tĩnh', scoreStaffFriendliness: 'Thân thiện',
};

// ─── Main Component ──────────────────────────────────────────────────────────────────
const HotelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);

  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';

  // Lấy chi tiết khách sạn, truyền thêm checkIn/checkOut để tính phòng còn trống
  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (checkIn) params.checkIn = checkIn;
      if (checkOut) params.checkOut = checkOut;
      const res = await api.get(`/hotels/${id}/detail`, { params });
      setHotel(res.data.data);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Không thể tải thông tin khách sạn.');
    } finally {
      setLoading(false);
    }
  }, [id, checkIn, checkOut]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  // Fetch reviews
  const fetchReviews = useCallback(async (page = 1, append = false) => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const res = await api.get(`/reviews/hotel/${id}`, { params: { page, pageSize: 5 } });
      const data: ReviewItem[] = res.data.data || [];
      setReviews(prev => append ? [...prev, ...data] : data);
      setHasMoreReviews(data.length === 5);
      setReviewPage(page);
    } catch { /* silent */ }
    finally { setReviewsLoading(false); }
  }, [id]);

  useEffect(() => { fetchReviews(1, false); }, [fetchReviews]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="animate-pulse space-y-6">
        <div className="h-80 bg-slate-200 rounded-2xl" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 bg-slate-200 rounded w-2/3" />
            <div className="h-4 bg-slate-100 rounded w-1/2" />
            <div className="h-32 bg-slate-100 rounded" />
          </div>
          <div className="h-80 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    </div>
  );

  if (error || !hotel) return (
    <div className="max-w-4xl mx-auto px-4 py-24 text-center">
      <p className="text-red-500 font-medium mb-4">{error || 'Không tìm thấy khách sạn.'}</p>
      <Link to="/hotels" className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm hover:bg-indigo-700 transition">
        Quay lại tìm kiếm
      </Link>
    </div>
  );

  const allImages = hotel.images;
  const primaryImg = allImages.find(i => i.isPrimary) || allImages[0];

  // Nhóm tiện nghi theo danh mục
  const amenityByCategory = hotel.amenities.reduce<Record<string, AmenityItem[]>>((acc, a) => {
    (acc[a.categoryName] ||= []).push(a);
    return acc;
  }, {});

  return (
    <div className="bg-white min-h-screen">
      {/* Thư viện ảnh */}
      <div className="relative bg-slate-900" style={{ height: '420px' }}>
        {allImages.length > 0 ? (
          <>
            <img src={allImages[activeImg]?.url || primaryImg?.url} alt={hotel.name}
              className="w-full h-full object-cover opacity-90" />
            {allImages.length > 1 && (
              <>
                <button onClick={() => setActiveImg(i => Math.max(0, i - 1))}
                  disabled={activeImg === 0}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition disabled:opacity-30">
                  &#8592;
                </button>
                <button onClick={() => setActiveImg(i => Math.min(allImages.length - 1, i + 1))}
                  disabled={activeImg === allImages.length - 1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition disabled:opacity-30">
                  &#8594;
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {allImages.map((_, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`rounded-full transition-all ${i === activeImg ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50'}`} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
            <span className="text-slate-400 text-sm">Chưa có ảnh</span>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-10">
          {/* ── Cột trái: Nội dung khách sạn ── */}
          <div className="lg:col-span-3 space-y-8">
            {/* Tên & địa chỉ */}
            <div>
              <div className="flex items-start gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex-1">{hotel.name}</h1>
                {hotel.starRating && (
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: hotel.starRating }).map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-slate-500 mt-1">{hotel.addressLine}, {hotel.wardName}, {hotel.provinceName}</p>
            </div>

            {/* Mô tả */}
            {hotel.description && (
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-2">Giới thiệu</h2>
                <p className="text-slate-600 leading-relaxed text-sm">{hotel.description}</p>
              </div>
            )}

            {/* Tiện nghi khách sạn */}
            {hotel.amenities.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4">Tiện nghi khách sạn</h2>
                <div className="space-y-4">
                  {Object.entries(amenityByCategory).map(([cat, items]) => (
                    <div key={cat}>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{cat}</h4>
                      <div className="flex flex-wrap gap-2">
                        {items.map(a => (
                          <span key={a.id} className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium">
                            {a.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Danh sách loại phòng */}
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-4">Các loại phòng</h2>
              <div className="space-y-4">
                {hotel.roomTypes.map(rt => {
                  const rtImg = rt.images.find(i => i.isPrimary) || rt.images[0];
                  const isFull = rt.availableRooms === 0;
                  
                  return (
                    <div key={rt.id}
                      className={`border-2 rounded-2xl overflow-hidden transition-all ${
                        isFull ? 'border-slate-100 opacity-60 cursor-not-allowed' :
                        'border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                      }`}>
                      <div className="sm:flex">
                        {/* Ảnh phòng */}
                        <div className="sm:w-52 h-40 sm:h-auto bg-slate-100 shrink-0 relative overflow-hidden">
                          {rtImg ? (
                            <img src={rtImg.url} alt={rt.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">Chưa có ảnh</div>
                          )}
                          {isFull && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="text-white font-bold text-sm">Hết phòng</span>
                            </div>
                          )}
                        </div>

                        {/* Thông tin phòng */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-slate-900 text-base">{rt.name}</h3>
                            </div>
                            <div className="flex gap-4 mt-1 text-xs text-slate-500">
                              <span>Người lớn: {rt.maxAdults}</span>
                              <span>Trẻ em: {rt.maxChildren}</span>
                              {rt.availableRooms !== null && (
                                <span className={rt.availableRooms > 0 ? 'text-emerald-600 font-semibold' : 'text-red-500 font-semibold'}>
                                  Còn {rt.availableRooms} phòng
                                </span>
                              )}
                            </div>
                            {rt.description && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{rt.description}</p>}
                            {rt.amenities.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {rt.amenities.slice(0, 5).map(a => (
                                  <span key={a.id} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{a.name}</span>
                                ))}
                                {rt.amenities.length > 5 && <span className="text-[10px] text-slate-400">+{rt.amenities.length - 5}</span>}
                              </div>
                            )}
                          </div>
                          <div className="flex justify-between items-end mt-3 pt-3 border-t border-slate-100">
                            <div>
                              <span className="text-indigo-600 font-bold text-xl">{rt.basePrice.toLocaleString('vi-VN')}₫</span>
                              <span className="text-xs text-slate-400">/đêm/phòng</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isFull) {
                                  navigate(`/hotels/${id}/room/${rt.id}?checkIn=${checkIn}&checkOut=${checkOut}`);
                                }
                              }}
                              disabled={isFull}
                              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-semibold px-4 py-2 rounded-xl transition">
                              Xem chi tiết & Đặt phòng
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SECTION: Đánh giá khách hàng ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 pb-16 mt-12">
        <div className="border-t pt-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Đánh giá từ khách hàng</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-400 text-white text-3xl font-bold rounded-xl px-4 py-2">
                {(reviews.filter(r => r.averageScore != null).reduce((sum, r) => sum + (r.averageScore ?? 0), 0) /
                  Math.max(reviews.filter(r => r.averageScore != null).length, 1)).toFixed(1)}
              </div>
              <div>
                <p className="text-slate-700 font-semibold">{reviews.length}+ đánh giá</p>
                <div className="flex gap-0.5 mt-0.5">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  ))}
                </div>
              </div>
            </div>
          )}

          {reviewsLoading && reviews.length === 0 ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="bg-slate-100 rounded-2xl h-32 animate-pulse" />)}
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl p-10 text-center border border-slate-200">
              <p className="text-slate-400">Chưa có đánh giá nào cho khách sạn này.</p>
              <p className="text-slate-400 text-sm mt-1">Hãy là người đầu tiên đánh giá sau khi trải nghiệm!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                        {review.customerName.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{review.customerName}</p>
                        <p className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    {review.averageScore != null && (
                      <div className="bg-amber-400 text-white text-sm font-bold rounded-lg px-2.5 py-1">
                        ⭐ {review.averageScore.toFixed(1)}
                      </div>
                    )}
                  </div>

                  {/* Điểm các tiêu chí */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                    {Object.entries(SCORE_LABELS).map(([key, label]) => {
                      const score = review[key as keyof ReviewItem] as number | null;
                      if (score == null) return null;
                      return (
                        <div key={key} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-1.5">
                          <span className="text-xs text-slate-500">{label}</span>
                          <span className={`text-xs font-bold ml-2 ${
                            score >= 8 ? 'text-green-600' : score >= 5 ? 'text-amber-600' : 'text-red-600'
                          }`}>{score}/10</span>
                        </div>
                      );
                    })}
                  </div>

                  {review.comment && (
                    <p className="text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-3 italic">
                      "{review.comment}"
                    </p>
                  )}
                </div>
              ))}
              {hasMoreReviews && (
                <div className="text-center pt-2">
                  <button
                    onClick={() => fetchReviews(reviewPage + 1, true)}
                    disabled={reviewsLoading}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-2.5 rounded-xl transition text-sm"
                  >
                    {reviewsLoading ? 'Đang tải...' : 'Xem thêm đánh giá'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelDetailPage;
