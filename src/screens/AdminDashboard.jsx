import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../services/api';
import './admin.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    lowStock: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesData, setSalesData] = useState({});
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const applyDashboardData = (analytics, orders) => {
    setStats({
      totalSales: analytics.total_sales || 0,
      totalOrders: analytics.total_orders || 0,
      totalUsers: analytics.total_users || 0,
      totalProducts: analytics.total_products || 0,
      pendingOrders: analytics.pending_orders || 0,
      lowStock: analytics.low_stock || 0,
      revenueGrowth: analytics.revenue_growth || 0,
      orderGrowth: analytics.order_growth || 0,
    });
    setRecentOrders(orders.items || []);
    setTopProducts(analytics.top_products || []);
    setSalesData(analytics.sales_by_day || {});
    setMaintenanceMode(analytics.maintenance_mode || false);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [analytics, orders] = await Promise.all([
          api.getAnalytics(),
          api.getOrders({ limit: 10 }),
        ]);
        if (!cancelled) applyDashboardData(analytics, orders);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analytics, orders] = await Promise.all([
        api.getAnalytics(),
        api.getOrders({ limit: 10 }),
      ]);
      applyDashboardData(analytics, orders);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const toggleMaintenance = async () => {
    try {
      await api.updateSystemSettings({ maintenance_mode: !maintenanceMode });
      setMaintenanceMode(!maintenanceMode);
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
    }
  };

  const salesChartData = {
    labels: salesData.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sales ($)',
        data: salesData.values || [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#2a5298',
        backgroundColor: 'rgba(42, 82, 152, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const topProductsData = {
    labels: topProducts.map(p => p.name),
    datasets: [
      {
        label: 'Units Sold',
        data: topProducts.map(p => p.units_sold),
        backgroundColor: '#2a5298',
      },
    ],
  };

  const orderStatusData = {
    labels: ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'],
    datasets: [
      {
        data: [
          stats.pendingOrders,
          stats.totalOrders * 0.3,
          stats.totalOrders * 0.2,
          stats.totalOrders * 0.4,
          stats.totalOrders * 0.1,
        ],
        backgroundColor: ['#ffc107', '#17a2b8', '#007bff', '#28a745', '#dc3545'],
      },
    ],
  };

  if (loading) {
    return <div className="admin-container">Loading dashboard...</div>;
  }

  return (
    <div className="admin-main">
      <div className="admin-header">
        <h1>Dashboard Overview</h1>
        <div className="admin-header-actions">
          <button className="btn btn-primary" onClick={fetchDashboardData}>
            Refresh Data
          </button>
        </div>
      </div>

      {maintenanceMode && (
        <div className="maintenance-mode">
          <span>⚠️ Maintenance mode is currently ACTIVE. Website is in read-only mode.</span>
          <button className="btn btn-danger" onClick={toggleMaintenance}>
            Disable Maintenance
          </button>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Total Revenue</div>
          <div className="stat-value">${stats.totalSales.toLocaleString()}</div>
          <div className="stat-change">↑ {stats.revenueGrowth}% from last month</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Total Orders</div>
          <div className="stat-value">{stats.totalOrders.toLocaleString()}</div>
          <div className="stat-change">↑ {stats.orderGrowth}% from last month</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Total Users</div>
          <div className="stat-value">{stats.totalUsers.toLocaleString()}</div>
          <div className="stat-change">Active customers</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Total Products</div>
          <div className="stat-value">{stats.totalProducts}</div>
          <div className="stat-change">{stats.lowStock} low stock items</div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Pending Orders</div>
          <div className="stat-value">{stats.pendingOrders}</div>
          <div className="stat-change">Awaiting processing</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Average Order Value</div>
          <div className="stat-value">${(stats.totalSales / stats.totalOrders || 0).toFixed(2)}</div>
          <div className="stat-change">Per transaction</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Conversion Rate</div>
          <div className="stat-value">3.2%</div>
          <div className="stat-change">Visitors to customers</div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ gridColumn: 'span 2' }}>
          <div className="stat-title">Sales Trend (Last 7 Days)</div>
          <Line data={salesChartData} options={{ responsive: true }} />
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Top Products</div>
          <Bar data={topProductsData} options={{ responsive: true }} />
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Order Distribution</div>
          <Doughnut data={orderStatusData} options={{ responsive: true }} />
        </div>
        
        <div className="stat-card" style={{ gridColumn: 'span 2' }}>
          <div className="stat-title">Recent Orders</div>
          <div className="data-table">
            <table>
              <thead>
                <tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id.slice(0, 8)}</td>
                    <td>{order.customer_name}</td>
                    <td>${order.total}</td>
                    <td><span className={`status-badge status-${order.status}`}>{order.status}</span></td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;