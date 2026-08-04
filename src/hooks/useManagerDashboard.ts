import { useState, useEffect } from 'react';
import api from '../services/api';

export interface ManagerDailyCount {
  date: string;
  count: number;
}

export interface ManagerMonthlyRevenue {
  month: string;
  revenue: number;
}

export interface Booking {
  id: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  numRooms: number;
  totalPrice: number;
}

export interface ManagerStats {
  totalRevenue: number;
  totalDepositCollected: number;
  
  bookingsTrend: ManagerDailyCount[];
  revenueTrend: ManagerMonthlyRevenue[];
  bookingStatusBreakdown: Record<string, number>;
  
  occupancyToday: number;
  checkInsToday: number;
  checkOutsToday: number;
  pendingBookings: number;
  totalRooms: number;
}

export const useManagerDashboard = () => {
  const [stats, setStats] = useState<ManagerStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Mặc định lọc 7 ngày gần nhất
  const [dateRange, setDateRange] = useState({
    fromDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        api.get('/manager/hotel/stats', {
          params: {
            fromDate: dateRange.fromDate,
            toDate: dateRange.toDate
          }
        }),
        api.get('/manager/bookings') // Lấy list booking hiện có
      ]);
      setStats(statsRes.data.data);
      setRecentBookings(bookingsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch manager data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const handleDateChange = (from: string, to: string) => {
    setDateRange({ fromDate: from, toDate: to });
  };

  return {
    stats,
    recentBookings,
    loading,
    dateRange,
    handleDateChange,
    refetch: fetchData
  };
};
