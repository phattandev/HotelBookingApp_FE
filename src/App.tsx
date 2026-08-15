import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ConfirmProvider } from './components/ConfirmModal';

// --- Import Component Bảo vệ ---
import ProtectedRoute from './components/ProtectedRoute';

// --- Import Layouts ---
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import PartnerLayout from './layouts/PartnerLayout';
import ManagerLayout from './layouts/ManagerLayout';

// --- Import Pages ---
import Login from './pages/auth/Login';
import HomePage from './pages/public/HomePage';
import NotFoundPage from './pages/public/NotFoundPage';
import UnauthorizedPage from './pages/public/UnauthorizedPage';

import CustomerProfile from './pages/customer/CustomerProfile';
import BookingConfirmationPage from './pages/customer/BookingConfirmationPage';
import MyBookingsPage from './pages/customer/MyBookingsPage';

// Public hotel pages
import HotelSearchPage from './pages/public/HotelSearchPage';
import HotelDetailPage from './pages/public/HotelDetailPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import RegisterPartnerPage from './pages/public/RegisterPartnerPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import LocationManagement from './pages/admin/LocationManagement';
import AmenityManagement from './pages/admin/AmenityManagement';
import AdminHotelManagement from './pages/admin/AdminHotelManagement';
import AdminAccountManagement from './pages/admin/AdminAccountManagement';
import AdminBookingManagement from './pages/admin/AdminBookingManagement';
import AdminProfile from './pages/admin/AdminProfile';

// Partner
import PartnerDashboard from './pages/partner/PartnerDashboard';
import StaffManagement from './pages/partner/StaffManagement';
import StaffAssignment from './pages/partner/StaffAssignment';
import HotelCatalog from './pages/partner/HotelCatalog';
import PartnerProfile from './pages/partner/PartnerProfile';

// Manager
import ManagerDashboard from './pages/manager/ManagerDashboard';
import HotelInfo from './pages/manager/HotelInfo';
import RoomTypeManagement from './pages/manager/RoomTypeManagement';
import HotelBookingManagement from './pages/manager/HotelBookingManagement';
import ManagerProfile from './pages/manager/ManagerProfile';
import PolicyManagementPage from './pages/manager/PolicyManagementPage';

const App: React.FC = () => {
  return (
    <ConfirmProvider>
      {/* Toast notifications toàn cục */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            padding: '14px 18px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          },
          success: { style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' } },
          error:   { style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' } },
        }}
      />

      <Routes>
        {/* 1. Các Route Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/404" element={<NotFoundPage />} />

        {/* 2. Cụm Router dùng MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/hotels" element={<HotelSearchPage />} />
          <Route path="/hotels/:id" element={<HotelDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/register-partner" element={<RegisterPartnerPage />} />

          <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
            <Route path="/profile" element={<CustomerProfile />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/booking/:id" element={<BookingConfirmationPage />} />
          </Route>
        </Route>

        {/* 3. Admin */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/provinces" element={<LocationManagement />} />
            <Route path="/admin/hotels" element={<AdminHotelManagement />} />
            <Route path="/admin/amenities" element={<AmenityManagement />} />
            <Route path="/admin/accounts" element={<AdminAccountManagement />} />
            <Route path="/admin/bookings" element={<AdminBookingManagement />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
          </Route>
        </Route>

        {/* 4. Partner */}
        <Route element={<ProtectedRoute allowedRoles={['partner']} />}>
          <Route element={<PartnerLayout />}>
            <Route path="/partner" element={<PartnerDashboard />} />
            <Route path="/partner/staff" element={<StaffManagement />} />
            <Route path="/partner/assignments" element={<StaffAssignment />} />
            <Route path="/partner/hotels" element={<HotelCatalog />} />
            <Route path="/partner/profile" element={<PartnerProfile />} />
          </Route>
        </Route>

        {/* 5. Manager */}
        <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
          <Route element={<ManagerLayout />}>
            <Route path="/manager" element={<ManagerDashboard />} />
            <Route path="/manager/hotel" element={<HotelInfo />} />
            <Route path="/manager/roomtypes" element={<RoomTypeManagement />} />
            <Route path="/manager/bookings" element={<HotelBookingManagement />} />
            <Route path="/manager/policy" element={<PolicyManagementPage />} />
            <Route path="/manager/profile" element={<ManagerProfile />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ConfirmProvider>
  );
};

export default App;