import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FaTimes, FaUsers, FaChild } from 'react-icons/fa';

interface AmenityItem { id: string; name: string; categoryName: string; }
interface RoomImage { id: string; url: string; isPrimary: boolean; displayOrder: number; }
interface RoomType {
  id: string; name: string; basePrice: number; maxAdults: number; maxChildren: number;
  totalRooms: number; description: string; availableRooms: number | null;
  images: RoomImage[]; amenities: AmenityItem[];
}

interface RoomTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomType: RoomType;
}

const RoomTypeModal: React.FC<RoomTypeModalProps> = ({ isOpen, onClose, roomType }) => {
  const [activeImg, setActiveImg] = useState(0);
  const images = roomType.images;
  const primaryImg = images.find(i => i.isPrimary) || images[0];

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <Dialog.Title className="text-xl font-bold text-gray-800">
              Chi tiết phòng: {roomType.name}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 hover:bg-gray-200 p-2 rounded-full"
            >
              <FaTimes size={16} />
            </button>
          </div>

          <div className="max-h-[80vh] overflow-y-auto">
            {/* Thư viện ảnh */}
            <div className="relative bg-gray-900 h-[300px] sm:h-[400px]">
              {images.length > 0 ? (
                <>
                  <div
                    className="w-full h-full bg-cover bg-center transition-all duration-500"
                    style={{ backgroundImage: `url(${images[activeImg]?.url || primaryImg?.url})` }}
                  />
                  {images.length > 1 && (
                    <>
                      <button onClick={() => setActiveImg(i => Math.max(0, i - 1))}
                        disabled={activeImg === 0}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition disabled:opacity-30">
                        &#8592;
                      </button>
                      <button onClick={() => setActiveImg(i => Math.min(images.length - 1, i + 1))}
                        disabled={activeImg === images.length - 1}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition disabled:opacity-30">
                        &#8594;
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 overflow-x-auto max-w-[80%] custom-scrollbar">
                        {images.map((_, i) => (
                          <button key={i} onClick={() => setActiveImg(i)}
                            className={`rounded-full shrink-0 transition-all ${i === activeImg ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <span className="text-gray-400 text-sm">Chưa có ảnh</span>
                </div>
              )}
            </div>

            <div className="p-6 space-y-6">
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2">
                  <FaUsers className="text-indigo-500" />
                  <span>Tối đa: {roomType.maxAdults} người lớn</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaChild className="text-pink-500" />
                  <span>Tối đa: {roomType.maxChildren} trẻ em</span>
                </div>
              </div>

              {roomType.description && (
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">Mô tả</h4>
                  <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">{roomType.description}</p>
                </div>
              )}

              {roomType.amenities.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-3">Tiện nghi phòng</h4>
                  <div className="flex flex-wrap gap-2">
                    {roomType.amenities.map(a => (
                      <span key={a.id} className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full font-medium border border-indigo-100">
                        {a.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
             <div>
                <span className="text-xs text-gray-500 block">Giá từ</span>
                <span className="text-indigo-600 font-bold text-xl">{roomType.basePrice.toLocaleString('vi-VN')}₫<span className="text-sm text-gray-500 font-normal">/đêm</span></span>
             </div>
             <button
               onClick={onClose}
               className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition"
             >
               Đóng
             </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default RoomTypeModal;
