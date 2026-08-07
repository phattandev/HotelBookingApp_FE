import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FaTimes, FaCommentDots, FaInfoCircle } from 'react-icons/fa';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

interface SelectedRoom {
  roomTypeId: string;
  name: string;
  quantity: number;
  basePrice: number;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelId: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  numNights: number;
  adults: number;
  children: number;
  selectedRooms: SelectedRoom[];
  totalPrice: number;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen, onClose, hotelId, hotelName, checkIn, checkOut, numNights,
  adults, children, selectedRooms, totalPrice
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    specialRequests: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        hotelId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numAdults: adults,
        numChildren: children,
        guestName: formData.guestName,
        guestPhone: formData.guestPhone,
        guestEmail: formData.guestEmail,
        specialRequests: formData.specialRequests,
        items: selectedRooms.map(r => ({
          roomTypeId: r.roomTypeId,
          numRooms: r.quantity
        }))
      };

      const res = await api.post('/bookings', payload);
      toast.success(res.data.message || 'Đặt phòng thành công!');
      navigate('/my-bookings');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi đặt phòng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={!loading ? onClose : () => {}} className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl bg-gray-50 rounded-2xl shadow-xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex justify-between items-center p-5 bg-white border-b border-gray-100 shrink-0">
            <div>
              <Dialog.Title className="text-xl font-bold text-gray-900">
                Xác nhận thông tin đặt phòng
              </Dialog.Title>
              <p className="text-sm text-gray-500 mt-1">{hotelName}</p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 hover:bg-gray-200 p-2 rounded-full disabled:opacity-50"
            >
              <FaTimes size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Cột trái: Form thông tin */}
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">1</span>
                    Thông tin liên hệ
                  </h3>
                  <form id="booking-form" onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      label="Họ và tên"
                      name="guestName"
                      required
                      value={formData.guestName}
                      onChange={handleChange}
                      placeholder="Nhập họ tên người nhận phòng"
                    />
                    <Input
                      label="Số điện thoại"
                      name="guestPhone"
                      required
                      value={formData.guestPhone}
                      onChange={handleChange}
                      placeholder="Nhập số điện thoại"
                    />
                    <Input
                      label="Email"
                      type="email"
                      name="guestEmail"
                      required
                      value={formData.guestEmail}
                      onChange={handleChange}
                      placeholder="Nhập địa chỉ email"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Yêu cầu đặc biệt (không bắt buộc)
                      </label>
                      <div className="relative">
                        <div className="absolute top-3 left-3 pointer-events-none">
                          <FaCommentDots className="text-gray-400" />
                        </div>
                        <textarea
                          name="specialRequests"
                          value={formData.specialRequests}
                          onChange={handleChange}
                          rows={3}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                          placeholder="Ví dụ: Phòng tầng cao, nhận phòng sớm..."
                        />
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* Cột phải: Tóm tắt đơn hàng */}
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                   <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">2</span>
                    Chi tiết đặt phòng
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium">NHẬN PHÒNG</p>
                        <p className="font-bold text-gray-900">{new Date(checkIn).toLocaleDateString('vi-VN')}</p>
                      </div>
                      <div className="w-px bg-gray-300"></div>
                      <div className="flex-1">
                         <p className="text-xs text-gray-500 font-medium">TRẢ PHÒNG</p>
                        <p className="font-bold text-gray-900">{new Date(checkOut).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Thời gian lưu trú:</span>
                      <span className="font-medium">{numNights} đêm</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Số lượng khách:</span>
                      <span className="font-medium">{adults} người lớn, {children} trẻ em</span>
                    </div>

                    <div className="border-t border-dashed border-gray-200 pt-4 mt-2">
                      <p className="font-bold text-gray-800 mb-3">Phòng đã chọn:</p>
                      <div className="space-y-3">
                        {selectedRooms.map((room, idx) => (
                          <div key={idx} className="flex justify-between items-start text-sm">
                            <div>
                              <p className="font-medium text-gray-900">{room.quantity}x {room.name}</p>
                              <p className="text-xs text-gray-500">{room.basePrice.toLocaleString('vi-VN')}₫ / đêm</p>
                            </div>
                            <p className="font-semibold text-gray-800">
                              {(room.quantity * room.basePrice * numNights).toLocaleString('vi-VN')}₫
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-bold text-gray-800">Tổng cộng</span>
                    <div className="text-right">
                       <span className="block text-2xl font-black text-indigo-600">{totalPrice.toLocaleString('vi-VN')}₫</span>
                       <span className="text-xs text-indigo-500">Đã bao gồm thuế và phí</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 mt-4 text-xs text-indigo-700 bg-white/50 p-3 rounded-lg">
                    <FaInfoCircle className="mt-0.5 shrink-0" />
                    <p>Bạn sẽ thanh toán tiền cọc theo chính sách của khách sạn sau khi đơn đặt phòng được xác nhận.</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-white border-t border-gray-100 shrink-0 flex justify-end gap-3">
             <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
               Hủy
             </Button>
             <Button type="submit" form="booking-form" isLoading={loading} className="px-8 bg-indigo-600 hover:bg-indigo-700">
               Xác nhận đặt phòng
             </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default BookingModal;
