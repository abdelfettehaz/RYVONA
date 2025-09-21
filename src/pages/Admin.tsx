import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRef } from 'react';
import { 
  Users, 
  TrendingUp
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import apiService from '../services/api';
import { AdminOrder, User } from '../types';

const STATUS_COLORS: Record<string, string> = {
  confirmed: '#22c55e',
  shipped: '#3b82f6',
  cancelled: '#ef4444',
  'under review': '#f59e42',
  pending: '#64748b',
  processing: '#a855f7',
  rejected: '#f43f5e',
};
const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  cancelled: 'Cancelled',
  'under review': 'Under Review',
  pending: 'Pending',
  processing: 'Processing',
  rejected: 'Rejected',
};
function getCalendarMonthOptions(): { value: string; label: string }[] {
  const start = new Date(2000, 0);
  const begin = new Date(2025, 6);
  const now = new Date();
  const months: { value: string; label: string }[] = [];
  let current = new Date(begin.getFullYear(), begin.getMonth());
  while (current <= now && current >= start) {
    const value = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
    const label = current.toLocaleString('default', { month: 'long', year: 'numeric' });
    months.push({ value, label });
    current.setMonth(current.getMonth() + 1);
  }
  months.reverse();
  return months;
}

const Admin: React.FC = () => {
  const { user } = useAuth();
  // Analytics state
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [_loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [monthlyProfit, setMonthlyProfit] = useState<number>(0);
  const [dailyProfits, setDailyProfits] = useState<{ [date: string]: number }>({});
  const [monthlyStatusCounts, setMonthlyStatusCounts] = useState<Record<string, number>>({});
  const [monthOptions, setMonthOptions] = useState<{ value: string; label: string }[]>([]);
  // Add state for selectedDate (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>('');
  // No need for averageDailyProfit, use dailyProfits[selectedDay] instead
  const [ordersForSelectedDay, setOrdersForSelectedDay] = useState<AdminOrder[]>([]);
  const [_statusCountsForDay, setStatusCountsForDay] = useState<Record<string, number>>({});
  const [_selectedDay, setSelectedDay] = useState<string>('');
  // State for confirmed_orders.txt daily profit
  const [txtDailyProfit, setTxtDailyProfit] = useState<number>(0);
  // State for confirmed count from txt
  const [txtConfirmedCount, setTxtConfirmedCount] = useState<number>(0);
  const lastFetchedDate = useRef<string>('');

  // Tab state
  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'users'>('dashboard');

  // Users tab state
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    if (selectedTab === 'users') {
      apiService.getAdminUsers().then(res => {
        if (res.success && Array.isArray(res.data)) {
          setUsers(res.data);
        } else {
          setUsers([]);
        }
      });
    }
  }, [selectedTab]);

  // Fetch from orders_admin for all analytics
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use admin orders endpoint (orders_admin table)
        const res = await apiService.getAdminOrders();
        const adminOrders: AdminOrder[] = res.data || [];
        setOrders(adminOrders);
        const options = getCalendarMonthOptions();
        setMonthOptions(options);
        if (options.length > 0 && !selectedMonth) {
          setSelectedMonth(options[0].value);
        }
      } catch (err: any) {
        setError(err.message || 'Error fetching orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  // All profit calculations below use only orders from orders_admin (already set in state)
  useEffect(() => {
    if (!selectedMonth || orders.length === 0) return;
    const [year, month] = selectedMonth.split('-').map(Number);
    const statusCounts: Record<string, number> = {};
    let monthProfit = 0;
    const daily: { [date: string]: number } = {};
    orders.forEach((order: AdminOrder) => {
      const date = new Date(order.created_at);
      const dateStr = date.toISOString().split('T')[0];
      if (date.getFullYear() === year && date.getMonth() + 1 === month) {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
        if (order.status === 'confirmed') {
          monthProfit += order.design_price;
          if (!daily[dateStr]) daily[dateStr] = 0;
          daily[dateStr] += order.design_price;
        }
      }
    });
    setMonthlyStatusCounts(statusCounts);
    setMonthlyProfit(monthProfit);
    setDailyProfits(daily);
    const days = Object.keys(daily).sort();
    if (days.length > 0) {
      setSelectedDay('');
    }
  }, [selectedMonth, orders]);

  useEffect(() => {
    if (!selectedDate) {
      setOrdersForSelectedDay([]);
      setStatusCountsForDay({});
      return;
    }
    const filtered = orders.filter((order) => {
      const dateStr = new Date(order.created_at).toISOString().split('T')[0];
      return dateStr === selectedDate;
    });
    setOrdersForSelectedDay(filtered);
    const statusCounts: Record<string, number> = {};
    filtered.forEach((order) => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });
    setStatusCountsForDay(statusCounts);
  }, [selectedDate, orders]);


  // Fetch and sum from confirmed_orders.txt when selectedDate changes
  useEffect(() => {
    if (!selectedDate) {
      setTxtDailyProfit(0);
      setTxtConfirmedCount(0);
      return;
    }
    // Only fetch if date changes
    if (lastFetchedDate.current === selectedDate) return;
    lastFetchedDate.current = selectedDate;
    fetch('/api/admin/confirmed_orders.txt')
      .then(res => res.ok ? res.text() : '')
      .then(text => {
        if (!text) { setTxtDailyProfit(0); setTxtConfirmedCount(0); return; }
        const lines = text
          .split('\n')
          .filter(line => line.includes(`ConfirmedAt: ${selectedDate}`));
        const sum = lines
          .reduce((acc, line) => {
            const match = line.match(/DesignPrice: ([0-9.]+)/);
            return acc + (match ? parseFloat(match[1]) : 0);
          }, 0);
        setTxtConfirmedCount(lines.length);
        setTxtDailyProfit(sum);
      })
      .catch(() => { setTxtDailyProfit(0); setTxtConfirmedCount(0); });
  }, [selectedDate]);

  // Helper to get min/max date for the selected month
  function getMonthDateRange(monthValue: string) {
    if (!monthValue) return { min: '', max: '' };
    const [year, month] = monthValue.split('-').map(Number);
    const min = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const max = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return { min, max };
  }

  const chartData = {
    labels:
      selectedDate && dailyProfits[selectedDate]
        ? [selectedDate]
        : Object.keys(dailyProfits).sort(),
    datasets: [
      {
        label: 'Daily Profit',
        data:
          selectedDate && dailyProfits[selectedDate]
            ? [dailyProfits[selectedDate]]
            : Object.keys(dailyProfits)
                .sort()
                .map((date) => dailyProfits[date]),
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.25)',
        borderColor: 'rgba(54, 162, 235, 1)',
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 10,
        borderWidth: 4,
        shadowColor: 'rgba(54, 162, 235, 0.4)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#222',
          font: { size: 18, weight: 700 },
        },
      },
      title: {
        display: true,
        text: 'Profit Trend (Daily)',
        color: '#222',
        font: { size: 26, weight: 700 },
        padding: { top: 20, bottom: 20 },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Profit: $${context.parsed.y.toFixed(2)}`,
        },
        backgroundColor: 'rgba(54, 162, 235, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#2563eb',
        borderWidth: 2,
        padding: 16,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
          color: '#222',
          font: { size: 18, weight: 700 },
        },
        ticks: { color: '#222', font: { size: 15 } },
        grid: { color: 'rgba(0,0,0,0.04)' },
      },
      y: {
        title: {
          display: true,
          text: 'Profit ($)',
          color: '#222',
          font: { size: 18, weight: 700 },
        },
        ticks: { color: '#222', font: { size: 15 } },
        grid: { color: 'rgba(0,0,0,0.04)' },
      },
    },
  };

  const statusKeys = Object.keys({ ...STATUS_LABELS, ...monthlyStatusCounts });


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-16">
      {/* Header */}
      <section className="bg-white shadow-sm border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.firstname}!</p>
            </div>
            {/* Removed Add New button */}
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-white border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'users', label: 'Users', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </section>

      <div className="w-full px-4 py-8 mt-24">
        {selectedTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Advanced Analytics Section */}
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
              {/* Month & Day Selector */}
              <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
                <span className="font-semibold text-lg text-blue-700">Select Month:</span>
                <select
                  value={selectedMonth}
                  onChange={e => {
                    setSelectedMonth(e.target.value);
                    setSelectedDate(''); // Reset day when month changes
                  }}
                  className="text-lg px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 font-bold focus:ring-2 focus:ring-blue-400"
                >
                  {monthOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {/* Day Picker */}
                {selectedMonth && (
                  <>
                    <span className="font-semibold text-lg text-blue-700">Select Day:</span>
                    <input
                      type="date"
                      value={selectedDate}
                      min={getMonthDateRange(selectedMonth).min}
                      max={getMonthDateRange(selectedMonth).max}
                      onChange={e => setSelectedDate(e.target.value)}
                      className="text-lg px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 font-bold focus:ring-2 focus:ring-blue-400"
                    />
                  </>
                )}
                  </div>
              {/* Monthly/Daily Profit cards */}
              <div className="flex flex-wrap gap-8 justify-center mb-8">
                <div className="min-w-[180px] bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl p-6 font-bold text-xl flex flex-col items-center shadow-md">
                  <span className="text-base font-medium opacity-90">Monthly Profit</span>
                  <span className="text-3xl font-extrabold mt-2">${monthlyProfit.toFixed(2)}</span>
                </div>
                <div className="min-w-[180px] bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl p-6 font-bold text-xl flex flex-col items-center shadow-md">
                  <span className="text-base font-medium opacity-90">Daily Profit</span>
                  <span className="text-3xl font-extrabold mt-2">${txtDailyProfit.toFixed(2)}</span>
                </div>
              </div>
              {/* Status cards (monthly or daily) */}
                <div className="flex flex-wrap gap-6 justify-center mb-8">
                  {statusKeys.map((status) => (
                    status === 'confirmed' && selectedDate ? (
                      <div
                        key={status}
                        className="min-w-[120px] rounded-lg p-4 font-bold text-lg flex flex-col items-center shadow"
                        style={{ background: STATUS_COLORS[status] || '#e5e7eb', color: '#fff' }}
                      >
                        <span className="text-base font-medium opacity-90">{STATUS_LABELS[status] || status}</span>
                        <span className="text-2xl font-extrabold mt-1">{txtConfirmedCount}</span>
                      </div>
                    ) : (
                      <div
                        key={status}
                        className="min-w-[120px] rounded-lg p-4 font-bold text-lg flex flex-col items-center shadow"
                        style={{ background: STATUS_COLORS[status] || '#e5e7eb', color: '#fff' }}
                      >
                        <span className="text-base font-medium opacity-90">{STATUS_LABELS[status] || status}</span>
                        <span className="text-2xl font-extrabold mt-1">{monthlyStatusCounts[status] || 0}</span>
                      </div>
                    )
                  ))}
                </div>
              {/* Orders table for selected day */}
              {selectedDate && ordersForSelectedDay.length > 0 && (
                <div className="bg-blue-50 rounded-xl shadow p-6 mb-8 overflow-x-auto">
                <table className="w-full">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="px-4 py-2 font-bold text-blue-700">Order ID</th>
                        <th className="px-4 py-2 font-bold text-blue-700">Customer</th>
                        <th className="px-4 py-2 font-bold text-blue-700">Status</th>
                        <th className="px-4 py-2 font-bold text-blue-700">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordersForSelectedDay.map((order) => (
                        <tr key={order.id} className="bg-white border-b border-blue-100">
                          <td className="px-4 py-2 text-center font-semibold">#{order.id}</td>
                          <td className="px-4 py-2 text-center">{order.client_name || order.client_email || order.user_id}</td>
                          <td className="px-4 py-2 text-center font-bold" style={{ color: STATUS_COLORS[order.status] || '#222' }}>{STATUS_LABELS[order.status] || order.status}</td>
                          <td className="px-4 py-2 text-center font-bold">${order.total_price.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
              {/* Profit Graph */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 shadow-lg flex items-center justify-center min-h-[400px]">
                <Line data={chartData} options={chartOptions} height={180} />
              </div>
            </div>
            {/* End Analytics Section */}
          </div>
        )}
        {/* Users Tab */}
        {selectedTab === 'users' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User List</h3>
            <div className="mb-4 text-blue-700 font-bold text-lg">Total Users: {users.filter(u => u.role === 'user').length}</div>
                <table className="w-full">
              <thead>
                <tr className="bg-blue-50">
                  <th className="px-4 py-2 font-bold text-blue-700">Email</th>
                  <th className="px-4 py-2 font-bold text-blue-700">First Name</th>
                  <th className="px-4 py-2 font-bold text-blue-700">Last Name</th>
                    </tr>
                  </thead>
              <tbody>
                {users.filter(u => u.role === 'user').map((user) => (
                  <tr key={user.id} className="bg-white border-b border-blue-100">
                    <td className="px-4 py-2 text-center">{user.email}</td>
                    <td className="px-4 py-2 text-center">{user.firstname}</td>
                    <td className="px-4 py-2 text-center">{user.lastname}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin; 