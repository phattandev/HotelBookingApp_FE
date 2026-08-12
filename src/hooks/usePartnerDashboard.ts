import { useState, useEffect } from 'react';
import api from '../services/api';

export interface BusinessDailyCount {
  date: string;
  count: number;
}

export interface BusinessRecentBooking {
  id: string;
  guestName: string;
  hotelName: string;
  createdAt: string;
  status: string;
  totalPrice: number;
}

export interface PartnerStats {
  totalRevenue: number;
  totalDepositCollected: number;
  
  bookingsTrend: BusinessDailyCount[];
  bookingStatusBreakdown: Record<string, number>;
  
  totalHotels: number;
  activeHotels: number;
  pendingHotels: number;
  totalStaffAssigned: number;
  
  recentBookings: BusinessRecentBooking[];
}

export const usePartnerDashboard = () => {
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Mặc định lọc 30 ngày gần nhất
  const [dateRange, setDateRange] = useState({
    fromDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0]
  });

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/businessstaff/stats', {
        params: {
          fromDate: dateRange.fromDate,
          toDate: dateRange.toDate
        }
      });
      setStats(res.data.data);
    } catch (error) {
      console.error('Failed to fetch partner stats:', error);
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
