import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import apiService from '../services/api';
import { AdminOrder } from '../types';

const STATUS_COLORS: Record<string, string> = {
  confirmed: '#22c55e', // green
  shipped: '#3b82f6',   // blue
  cancelled: '#ef4444', // red
  'under review': '#f59e42', // orange
  pending: '#64748b',   // gray
  processing: '#a855f7', // purple
  rejected: '#f43f5e',  // pink
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
  const start = new Date(2000, 0); // Jan 2000 (arbitrary early date)
  const begin = new Date(2025, 6); // July 2025 (0-based month)
  const now = new Date();
  const months: { value: string; label: string }[] = [];
  let current = new Date(begin.getFullYear(), begin.getMonth());
  while (current <= now && current >= start) {
    const value = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
    const label = current.toLocaleString('default', { month: 'long', year: 'numeric' });
    months.push({ value, label });
    current.setMonth(current.getMonth() + 1);
  }
  months.reverse(); // Descending order: July 2025, Aug 2025, ..., now
  return months;
}

const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [monthlyProfit, setMonthlyProfit] = useState<number>(0);
  const [dailyProfits, setDailyProfits] = useState<{ [date: string]: number }>({});
  const [monthlyStatusCounts, setMonthlyStatusCounts] = useState<Record<string, number>>({});
  const [monthOptions, setMonthOptions] = useState<{ value: string; label: string }[]>([]);
  const [averageDailyProfit] = useState<number>(0);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [ordersForSelectedDay, setOrdersForSelectedDay] = useState<AdminOrder[]>([]);
  const [statusCountsForDay, setStatusCountsForDay] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
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

  useEffect(() => {
    if (!selectedMonth || orders.length === 0) return;
    // Calculate stats for selected month
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
          monthProfit += order.total_price;
        }
      }
      if (order.status === 'confirmed' && date.getFullYear() === year && date.getMonth() + 1 === month) {
        if (!daily[dateStr]) daily[dateStr] = 0;
        daily[dateStr] += order.total_price;
      }
    });
    setMonthlyStatusCounts(statusCounts);
    setMonthlyProfit(monthProfit);
    setDailyProfits(daily);
    // Set default day selection to 'All Days' or first available day
    const days = Object.keys(daily).sort();
    if (days.length > 0) {
      setSelectedDay(''); // '' means all days
    }
  }, [selectedMonth, orders]);

  // Update statistics for selected day
  useEffect(() => {
    if (!selectedDay) {
      setOrdersForSelectedDay([]);
      setStatusCountsForDay({});
      return;
    }
    const filtered = orders.filter((order) => {
      const dateStr = new Date(order.created_at).toISOString().split('T')[0];
      return dateStr === selectedDay;
    });
    setOrdersForSelectedDay(filtered);
    // Status breakdown for the day
    const statusCounts: Record<string, number> = {};
    filtered.forEach((order) => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });
    setStatusCountsForDay(statusCounts);
  }, [selectedDay, orders]);

  // Prepare day options for the selected month
  const dayOptions = [{ value: '', label: 'All Days' }].concat(
    Object.keys(dailyProfits)
      .sort()
      .map((date) => ({ value: date, label: date }))
  );

  // Prepare data for Chart.js (filtered by day if selected)
  const chartData = {
    labels:
      selectedDay && dailyProfits[selectedDay]
        ? [selectedDay]
        : Object.keys(dailyProfits).sort(),
    datasets: [
      {
        label: 'Daily Profit',
        data:
          selectedDay && dailyProfits[selectedDay]
            ? [dailyProfits[selectedDay]]
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

  // Render status cards
  const statusKeys = Object.keys({ ...STATUS_LABELS, ...monthlyStatusCounts });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #a5b4fc 0%, #f0fdfa 100%)',
      padding: '40px 0',
      fontFamily: 'Poppins, Arial, sans-serif',
      transition: 'background 0.5s',
    }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        background: 'rgba(255,255,255,0.98)',
        borderRadius: 32,
        boxShadow: '0 12px 48px rgba(99,102,241,0.13)',
        padding: 48,
        textAlign: 'center',
        position: 'relative',
        overflow: 'visible',
      }}>
        <h1 style={{ fontSize: 44, fontWeight: 900, color: '#2563eb', marginBottom: 8, letterSpacing: 1 }}>Admin Dashboard</h1>
        <p style={{ color: '#64748b', fontSize: 20, marginBottom: 36, fontWeight: 500 }}>
          Welcome, Admin! Track your monthly profit, order history, and business growth in style.
        </p>
        {/* Month & Day Selector */}
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
          <span style={{ fontWeight: 600, fontSize: 18, color: '#2563eb' }}>Select Month:</span>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            style={{
              fontSize: 18,
              padding: '8px 18px',
              borderRadius: 8,
              border: '1px solid #c7d2fe',
              background: '#f1f5f9',
              color: '#2563eb',
              fontWeight: 700,
              outline: 'none',
              boxShadow: '0 2px 8px rgba(99,102,241,0.07)',
              transition: 'border 0.2s',
            }}
          >
            {monthOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {/* Day Selector */}
          {dayOptions.length > 1 && (
            <>
              <span style={{ fontWeight: 600, fontSize: 18, color: '#2563eb' }}>Select Day:</span>
              <select
                value={selectedDay}
                onChange={e => setSelectedDay(e.target.value)}
                style={{
                  fontSize: 18,
                  padding: '8px 18px',
                  borderRadius: 8,
                  border: '1px solid #c7d2fe',
                  background: '#f1f5f9',
                  color: '#2563eb',
                  fontWeight: 700,
                  outline: 'none',
                  boxShadow: '0 2px 8px rgba(99,102,241,0.07)',
                  transition: 'border 0.2s',
                }}
              >
                {dayOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </>
          )}
        </div>
        {loading ? (
          <div style={{ fontSize: 26, color: '#2563eb', margin: '60px 0' }}>Loading...</div>
        ) : error ? (
          <div style={{ color: 'red', fontSize: 22 }}>{error}</div>
        ) : (
          <>
            {/* Monthly/Daily Profit cards */}
            <div style={{ display: 'flex', gap: 22, justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap', transition: 'gap 0.3s' }}>
              <div
                style={{
                  minWidth: 180,
                  background: 'linear-gradient(90deg, #38bdf8 0%, #6366f1 100%)',
                  color: '#fff',
                  borderRadius: 16,
                  padding: '22px 0',
                  fontWeight: 700,
                  fontSize: 20,
                  boxShadow: '0 4px 16px rgba(99,102,241,0.10)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'background 0.3s, box-shadow 0.3s',
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 500, opacity: 0.92 }}>Monthly Profit</span>
                <span style={{ fontSize: 34, fontWeight: 900, marginTop: 4 }}>
                  ${monthlyProfit.toFixed(2)}
                </span>
              </div>
              <div
                style={{
                  minWidth: 180,
                  background: 'linear-gradient(90deg, #a855f7 0%, #38bdf8 100%)',
                  color: '#fff',
                  borderRadius: 16,
                  padding: '22px 0',
                  fontWeight: 700,
                  fontSize: 20,
                  boxShadow: '0 4px 16px rgba(99,102,241,0.10)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'background 0.3s, box-shadow 0.3s',
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 500, opacity: 0.92 }}>Average Daily Profit</span>
                <span style={{ fontSize: 34, fontWeight: 900, marginTop: 4 }}>
                  ${averageDailyProfit.toFixed(2)}
                </span>
              </div>
            </div>
            {/* Status cards */}
            <div style={{ display: 'flex', gap: 22, justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap', transition: 'gap 0.3s' }}>
              {statusKeys.map((status) => (
                <div
                  key={status}
                  style={{
                    minWidth: 140,
                    background: STATUS_COLORS[status] || '#e5e7eb',
                    color: '#fff',
                    borderRadius: 16,
                    padding: '22px 0',
                    fontWeight: 700,
                    fontSize: 20,
                    boxShadow: '0 4px 16px rgba(99,102,241,0.10)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'background 0.3s, box-shadow 0.3s',
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: 500, opacity: 0.92 }}>{STATUS_LABELS[status] || status}</span>
                  <span style={{ fontSize: 34, fontWeight: 900, marginTop: 4 }}>
                    {monthlyStatusCounts[status] || 0}
                  </span>
                </div>
              ))}
            </div>
            {/* Daily Profit card (if a day is selected) */}
            {selectedDay && dailyProfits[selectedDay] !== undefined && (
              <div style={{
                minWidth: 180,
                background: 'linear-gradient(90deg, #f59e42 0%, #f43f5e 100%)',
                color: '#fff',
                borderRadius: 16,
                padding: '22px 0',
                fontWeight: 700,
                fontSize: 20,
                boxShadow: '0 4px 16px rgba(99,102,241,0.10)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                margin: '0 auto 32px auto',
                transition: 'background 0.3s, box-shadow 0.3s',
              }}>
                <span style={{ fontSize: 16, fontWeight: 500, opacity: 0.92 }}>Profit for {selectedDay}</span>
                <span style={{ fontSize: 34, fontWeight: 900, marginTop: 4 }}>
                  ${dailyProfits[selectedDay].toFixed(2)}
                </span>
              </div>
            )}
            {/* Status cards for selected day */}
            {selectedDay && Object.keys(statusCountsForDay).length > 0 && (
              <div style={{ display: 'flex', gap: 18, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
                {Object.keys({ ...STATUS_LABELS, ...statusCountsForDay }).map((status) => (
                  <div
                    key={status}
                    style={{
                      minWidth: 120,
                      background: STATUS_COLORS[status] || '#e5e7eb',
                      color: '#fff',
                      borderRadius: 12,
                      padding: '18px 0',
                      fontWeight: 700,
                      fontSize: 18,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: 15, fontWeight: 500, opacity: 0.92 }}>{STATUS_LABELS[status] || status}</span>
                    <span style={{ fontSize: 28, fontWeight: 900, marginTop: 4 }}>
                      {statusCountsForDay[status] || 0}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {/* Orders table for selected day */}
            {selectedDay && ordersForSelectedDay.length > 0 && (
              <div style={{
                background: '#f8fafc',
                borderRadius: 16,
                boxShadow: '0 2px 8px rgba(99,102,241,0.07)',
                padding: 24,
                margin: '0 auto 32px auto',
                maxWidth: 900,
                overflowX: 'auto',
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#e0e7ff' }}>
                      <th style={{ padding: 10, fontWeight: 700, color: '#2563eb' }}>Order ID</th>
                      <th style={{ padding: 10, fontWeight: 700, color: '#2563eb' }}>Customer</th>
                      <th style={{ padding: 10, fontWeight: 700, color: '#2563eb' }}>Status</th>
                      <th style={{ padding: 10, fontWeight: 700, color: '#2563eb' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersForSelectedDay.map((order) => (
                      <tr key={order.id} style={{ background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: 10, textAlign: 'center', fontWeight: 600 }}>#{order.id}</td>
                        <td style={{ padding: 10, textAlign: 'center' }}>{order.client_name || order.client_email || order.user_id}</td>
                        <td style={{ padding: 10, textAlign: 'center', color: STATUS_COLORS[order.status] || '#222', fontWeight: 700 }}>{STATUS_LABELS[order.status] || order.status}</td>
                        <td style={{ padding: 10, textAlign: 'center', fontWeight: 700 }}>${order.total_price.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div style={{
              background: 'linear-gradient(135deg, #f1f5f9 60%, #e0e7ff 100%)',
              borderRadius: 28,
              padding: 48,
              margin: '0 auto',
              boxShadow: '0 8px 32px rgba(99,102,241,0.10)',
              maxWidth: 900,
              minHeight: 480,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.3s',
            }}>
              <Line data={chartData} options={chartOptions} height={180} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
