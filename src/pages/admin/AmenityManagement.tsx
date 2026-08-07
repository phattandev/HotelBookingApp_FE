import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useConfirm } from '../../components/ConfirmModal';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { SidePanel } from '../../components/ui/SidePanel';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

// Định nghĩa kiểu dữ liệu cho Danh mục tiện nghi (Category)
interface Category { id: string; name: string; applicableTo: string; }
// Định nghĩa kiểu dữ liệu cho Tiện nghi (Amenity)
interface Amenity { id: string; categoryId: string; categoryName: string; name: string; isActive: boolean; }
// Các trạng thái của Modal: Không mở, Thêm danh mục, Sửa danh mục, Thêm tiện nghi, Sửa tiện nghi
type ModalMode = 'none' | 'addCat' | 'editCat' | 'addAmenity' | 'editAmenity';

// Cấu hình các tùy chọn áp dụng cho Danh mục (Khách sạn, Loại phòng, Cả hai)
const APPLICABLE_OPTIONS = [
  { value: 'hotel', label: 'Khách sạn' },
  { value: 'room', label: 'Loại phòng' },
  { value: 'both', label: 'Cả hai' },
];

const AmenityManagement: React.FC = () => {
  const confirm = useConfirm();
  // State lưu trữ danh sách Danh mục và Tiện nghi lấy từ API
  const [categories, setCategories] = useState<Category[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);

  // State lưu trữ ID của danh mục đang được chọn để lọc trên giao diện (mặc định 'all' là xem tất cả)
  const [activeCat, setActiveCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // State quản lý trạng thái loading khi lần đầu gọi API
  const [loading, setLoading] = useState(true);

  // Các state quản lý Modal (Popup) hiển thị form Thêm/Sửa
  const [modal, setModal] = useState<ModalMode>('none');
  const [editTarget, setEditTarget] = useState<Category | Amenity | null>(null); // Lưu thông tin đối tượng đang được sửa

  // Các state lưu trữ dữ liệu các trường (fields) trong Form của Modal
  const [formName, setFormName] = useState('');
  const [formCatId, setFormCatId] = useState('');
  const [formApplicable, setFormApplicable] = useState('both');

  // State quản lý trạng thái nút lưu (tránh bấm 2 lần) và thông báo lỗi của Form
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Pagination state: Quản lý phân trang cho danh sách tiện nghi
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Hàm load dữ liệu danh sách danh mục và tiện nghi từ server
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      // Gọi song song 2 API bằng Promise.all để tối ưu thời gian chờ
      const [catRes, amRes] = await Promise.all([
        api.get('/amenity-categories'),
        api.get('/amenities'),
      ]);
      setCategories(catRes.data.data || []);
      setAmenities(amRes.data.data || []);
    } catch { /* Bỏ qua lỗi nếu có (silent error) */ }
    finally { setLoading(false); } // Luôn tắt loading dù thành công hay thất bại
  }, []);

  // Gọi hàm loadAll 1 lần duy nhất khi component vừa được render (mount)
  useEffect(() => { loadAll(); }, [loadAll]);

  // Lọc ra danh sách tiện nghi cần hiển thị dựa theo danh mục đang được chọn và từ khóa tìm kiếm
  const visibleAmenities = useMemo(() => {
    let filtered = activeCat === 'all'
      ? amenities
      : amenities.filter(a => a.categoryId === activeCat);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(a => a.name.toLowerCase().includes(q));
    }
    return filtered;
  }, [amenities, activeCat, searchQuery]);

  // Pagination logic: Tính toán số trang và danh sách tiện nghi cho trang hiện tại
  const totalPages = Math.ceil(visibleAmenities.length / itemsPerPage);
  const paginatedAmenities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage; // Tính vị trí bắt đầu
    return visibleAmenities.slice(startIndex, startIndex + itemsPerPage); // Lấy ra số lượng phần tử tương ứng với 1 trang
  }, [visibleAmenities, currentPage]);

  // Đưa về trang 1 mỗi khi người dùng đổi danh mục lọc hoặc tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCat, searchQuery]);

  // Hàm xử lý mở Modal và thiết lập dữ liệu mặc định cho Form dựa vào loại hành động (mode)
  const openModal = (mode: ModalMode, target?: Category | Amenity) => {
    setError(''); // Xóa lỗi cũ
    setModal(mode); // Mở modal với chế độ tương ứng
    setEditTarget(target || null);

    if (mode === 'editCat' && target) {
      // Mở form sửa danh mục -> Gán dữ liệu cũ của danh mục vào form
      const cat = target as Category;
      setFormName(cat.name);
      setFormApplicable(cat.applicableTo || 'both');
    } else if (mode === 'addAmenity') {
      // Mở form thêm tiện nghi -> Điền sẵn ID danh mục đang chọn vào form (nếu có)
      setFormName('');
      setFormCatId(activeCat === 'all' ? (categories[0]?.id || '') : activeCat);
    } else if (mode === 'editAmenity' && target) {
      // Mở form sửa tiện nghi -> Gán dữ liệu cũ của tiện nghi vào form
      const a = target as Amenity;
      setFormName(a.name);
      setFormCatId(a.categoryId);
    } else {
      // Các chế độ khác (ví dụ: thêm danh mục) -> Xóa trắng form
      setFormName('');
      setFormCatId('');
      setFormApplicable('both');
    }
  };

  // Hàm xử lý đóng Modal và xóa sạch thông tin tạm trong form
  const closeModal = () => { setModal('none'); setEditTarget(null); setError(''); };

  // Hàm xử lý khi người dùng nhấn nút Lưu trên Modal
  const handleSubmit = async () => {
    // Validate cơ bản: Tên không được để trống
    if (!formName.trim()) { setError('Tên không được để trống.'); return; }

    setSubmitting(true); setError('');
    try {
      // Tùy theo chế độ (modal) mà gọi API tương ứng (Thêm/Sửa Danh mục/Tiện nghi)
      switch (modal) {
        case 'addCat': // Gọi API thêm mới danh mục
          await api.post('/amenity-categories', { name: formName, applicableTo: formApplicable });
          break;
        case 'editCat': // Gọi API cập nhật danh mục
          await api.put(`/amenity-categories/${(editTarget as Category).id}`, { name: formName, applicableTo: formApplicable });
          break;
        case 'addAmenity': // Gọi API thêm mới tiện nghi
          if (!formCatId) { setError('Vui lòng chọn danh mục.'); setSubmitting(false); return; }
          await api.post('/amenities', { categoryId: formCatId, name: formName });
          break;
        case 'editAmenity': // Gọi API cập nhật tiện nghi
          if (!formCatId) { setError('Vui lòng chọn danh mục.'); setSubmitting(false); return; }
          await api.put(`/amenities/${(editTarget as Amenity).id}`, {
            categoryId: formCatId,
            name: formName,
            isActive: (editTarget as Amenity).isActive, // Giữ nguyên trạng thái kích hoạt cũ
          });
          break;
      }

      // Sau khi gọi API lưu thành công -> Tải lại danh sách mới nhất và đóng form
      await loadAll();
      closeModal();
      toast.success('Lưu thành công!');
    } catch (e: any) {
      // Hiển thị lỗi từ server trả về nếu lưu thất bại
      toast.error(e.response?.data?.Message || 'Thao tác thất bại.');
    } finally { setSubmitting(false); } // Tắt trạng thái đang submit
  };

  // Hàm xử lý việc xóa một Danh mục
  const handleDeleteCategory = async (cat: Category) => {
    // Kiểm tra xem danh mục này có đang chứa tiện nghi nào không
    const count = amenities.filter(a => a.categoryId === cat.id).length;
    const msg = count > 0
      ? `Danh mục "${cat.name}" còn ${count} tiện nghi. Hãy xóa tiện nghi trước.`
      : `Xóa danh mục "${cat.name}"?`;

    const ok = await confirm({
      title: 'Xóa danh mục',
      message: msg,
      confirmText: 'Xóa',
      variant: count > 0 ? 'warning' : 'danger',
    });
    if (!ok) return; // Bật popup xác nhận xóa

    try {
      // Gọi API xóa danh mục theo ID
      await api.delete(`/amenity-categories/${cat.id}`);
      // Nếu danh mục vừa xóa đang là danh mục được chọn trên giao diện thì reset bộ lọc
      if (activeCat === cat.id) setActiveCat('all');
      await loadAll(); // Cập nhật lại danh sách
      toast.success('Xóa danh mục thành công!');
    } catch (e: any) { toast.error(e.response?.data?.Message || 'Xóa thất bại.'); }
  };

  // Hàm xử lý Bật/Tắt (Kích hoạt/Vô hiệu hóa) một Tiện nghi
  const handleToggle = async (a: Amenity) => {
    const verb = a.isActive ? 'vô hiệu hóa' : 'kích hoạt';
    const ok = await confirm({
      title: `${a.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'} tiện nghi`,
      message: `${verb.charAt(0).toUpperCase() + verb.slice(1)} tiện nghi "${a.name}"?`,
      confirmText: verb.charAt(0).toUpperCase() + verb.slice(1),
      variant: a.isActive ? 'warning' : 'info',
    });
    if (!ok) return; // Bật popup xác nhận

    try {
      // Gọi API thay đổi trạng thái
      await api.patch(`/amenities/${a.id}/toggle`);
      // Tối ưu UI: Cập nhật trực tiếp state `amenities` ở client để giao diện đổi ngay lập tức mà không cần gọi lại api.get list
      setAmenities(prev => prev.map(x => x.id === a.id ? { ...x, isActive: !x.isActive } : x));
      toast.success(`Đã ${verb} tiện nghi thành công!`);
    } catch (e: any) { toast.error(e.response?.data?.Message || 'Thao tác thất bại.'); }
  };

  // Object dùng để map từ giá trị tiếng anh (value) sang tiếng Việt (label) để hiển thị trên bảng
  const applicableLabel: Record<string, string> = { hotel: 'Khách sạn', room: 'Loại phòng', both: 'Cả hai' };

  // Hiển thị màn hình Loading trong lúc đợi API trả kết quả ở lần render đầu tiên
  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Đang tải dữ liệu...</div>
  );

  return (
    <div>
      <PageHeader
        title="Danh mục tiện nghi"
        description="Quản lý các tiện nghi chuẩn — đối tác chọn khi cấu hình khách sạn và phòng"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => openModal('addCat')}>+ Danh mục</Button>
            <Button variant="primary" onClick={() => openModal('addAmenity')}>+ Tiện nghi</Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Danh mục', value: categories.length, color: 'text-violet-600' },
          { label: 'Tổng tiện nghi', value: amenities.length, color: 'text-slate-800' },
          { label: 'Đang hoạt động', value: amenities.filter(a => a.isActive).length, color: 'text-emerald-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-5 py-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main layout */}
      <div className="flex gap-4">
        {/* Category sidebar */}
        <aside className="w-52 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Danh mục</span>
            </div>
            <ul>
              <li>
                <button
                  onClick={() => setActiveCat('all')}
                  className={`w-full text-left px-4 py-2.5 text-sm flex justify-between items-center transition ${activeCat === 'all' ? 'bg-violet-50 text-violet-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <span>Tất cả</span>
                  <span className="text-xs text-slate-400">{amenities.length}</span>
                </button>
              </li>
              {categories.map(cat => {
                const cnt = amenities.filter(a => a.categoryId === cat.id).length;
                return (
                  <li key={cat.id} className="group">
                    <div
                      className={`flex items-center justify-between px-4 py-2.5 text-sm transition cursor-pointer ${activeCat === cat.id ? 'bg-violet-50 text-violet-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      onClick={() => setActiveCat(cat.id)}
                    >
                      <span className="truncate flex-1">{cat.name}</span>
                      <span className="text-xs text-slate-400 mr-1">{cnt}</span>
                      <div className="hidden group-hover:flex items-center gap-0.5">
                        <button
                          onClick={e => { e.stopPropagation(); openModal('editCat', cat); }}
                          className="p-0.5 text-slate-400 hover:text-violet-600 rounded"
                          title="Sửa"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleDeleteCategory(cat); }}
                          className="p-0.5 text-slate-400 hover:text-red-600 rounded"
                          title="Xóa"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Amenity table */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {activeCat === 'all' ? 'Tất cả tiện nghi' : categories.find(c => c.id === activeCat)?.name}
              <span className="ml-2 text-slate-400 font-normal normal-case">({visibleAmenities.length})</span>
            </span>
            <div className="w-64">
              <Input
                placeholder="Tìm theo tên tiện nghi..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {visibleAmenities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <p className="text-sm">Chưa có tiện nghi nào.</p>
              <button onClick={() => openModal('addAmenity')} className="mt-2 text-sm text-violet-600 hover:underline">
                + Thêm tiện nghi
              </button>
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100 bg-white">
                    <th className="text-center px-5 py-2.5 font-medium">Tên tiện nghi</th>
                    <th className="text-center px-5 py-2.5 font-medium">Danh mục</th>
                    <th className="text-center px-5 py-2.5 font-medium">Áp dụng cho</th>
                    <th className="text-center px-5 py-2.5 font-medium">Trạng thái</th>
                    <th className="text-center px-5 py-2.5 font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedAmenities.map(a => (
                    <tr key={a.id} className={`hover:bg-slate-50 transition text-center ${!a.isActive ? 'opacity-50' : ''}`}>
                      <td className="px-5 py-3 font-medium text-slate-900">{a.name}</td>
                      <td className="px-5 py-3">
                        <Badge variant="neutral">{a.categoryName}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant="violet">
                          {applicableLabel[categories.find(c => c.id === a.categoryId)?.applicableTo ?? 'both'] ?? 'Cả hai'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={a.isActive ? 'success' : 'neutral'}>
                          {a.isActive ? 'Hoạt động' : 'Tạm tắt'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button size="sm" variant="secondary" onClick={() => openModal('editAmenity', a)}>
                            Sửa
                          </Button>
                          <Button size="sm" variant={a.isActive ? 'danger' : 'primary'} onClick={() => handleToggle(a)}>
                            {a.isActive ? 'Tắt' : 'Bật'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>

      <SidePanel
        isOpen={modal !== 'none'}
        onClose={closeModal}
        title={modal === 'addCat' ? 'Thêm danh mục' : modal === 'editCat' ? 'Sửa danh mục' : modal === 'addAmenity' ? 'Thêm tiện nghi' : 'Sửa tiện nghi'}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal} disabled={submitting}>Hủy</Button>
            <Button variant="primary" onClick={handleSubmit} isLoading={submitting}>
              {modal.startsWith('add') ? 'Thêm mới' : 'Lưu thay đổi'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {(modal === 'addAmenity' || modal === 'editAmenity') && (
            <Select
              label="Danh mục"
              value={formCatId}
              onChange={val => setFormCatId(val)}
              options={[{ value: '', label: '— Chọn danh mục —' }, ...categories.map(c => ({ value: c.id, label: c.name }))]}
            />
          )}

          <Input
            label={modal.includes('Cat') ? 'Tên danh mục' : 'Tên tiện nghi'}
            value={formName}
            onChange={e => setFormName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder={modal.includes('Cat') ? 'Ví dụ: Phòng tắm, Khu vực ăn...' : 'Ví dụ: Wifi miễn phí, Bể bơi...'}
            autoFocus
          />

          {(modal === 'addCat' || modal === 'editCat') && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Áp dụng cho</label>
              <div className="flex gap-2">
                {APPLICABLE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormApplicable(opt.value)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition ${formApplicable === opt.value
                      ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-600'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
        </div>
      </SidePanel>
    </div>
  );
};

export default AmenityManagement;