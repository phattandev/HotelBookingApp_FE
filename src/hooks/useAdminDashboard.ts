import { useState, useEffect } from 'react';
import api from '../services/api';

export interface DailyCount {
  date: string;
  count: number;
}

export interface HotelRevenueSummary {
  hotelId: string;
  hotelName: string;
  revenue: number;
}

export interface AdminStats {
  totalRevenue: number;
  totalDepositCollected: number;
  
  bookingsTrend: DailyCount[];
  bookingStatusBreakdown: Record<string, number>;
  topHotelsByRevenue: HotelRevenueSummary[];

  totalBusinesses: number;
  pendingBusinesses: number;
  approvedBusinesses: number;
  
  totalHotels: number;
  pendingHotels: number;
  activeHotels: number;
  
  totalBookings: number;
  bookingsToday: number;
  pendingBookings: number;
  confirmedBookings: number;
  
  totalUsers: number;
  totalCustomers: number;
}

export const useAdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Mặc định lọc 7 ngày gần nhất
  const [dateRange, setDateRange] = useState({
    fromDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0]
  });

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/adminbusiness/stats', {
        params: {
          fromDate: dateRange.fromDate,
          toDate: dateRange.toDate
        }
      });
      setStats(res.data.data);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const handleDateChange = (from: string, to: string) => {
    setDateRange({ fromDate: from, toDate: to });
  };

  return {
    stats,
    loading,
    dateRange,
    handleDateChange,
    refetch: fetchStats
  };
};
