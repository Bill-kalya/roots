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

      {/* TOP METRICS */}
      <div className="top-stats-grid">
        <div className="stat-card large-card">
          <div className="stat-title">Revenue Overview</div>

          <div className="big-stat">
            ${stats.totalSales.toLocaleString()}
          </div>

          <div className="stat-change">
            ↑ {stats.revenueGrowth}% this month
          </div>

          <div className="chart-wrapper">
            <Line data={salesChartData} options={{ responsive: true }} />
          </div>
        </div>

        <div className="side-column">
          <div className="stat-card">
            <div className="stat-title">Orders</div>
            <div className="stat-value">
              {stats.totalOrders}
            </div>

            <div className="stat-change">
              ↑ {stats.orderGrowth}% growth
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-title">Order Distribution</div>

            <div className="small-chart">
              <Doughnut
                data={orderStatusData}
                options={{ responsive: true }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* MINI CARDS */}
      <div className="mini-stats-grid">
        <div className="stat-card">
          <div className="stat-title">Users</div>
          <div className="stat-value">
            {stats.totalUsers}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Products</div>
          <div className="stat-value">
            {stats.totalProducts}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Pending Orders</div>
          <div className="stat-value">
            {stats.pendingOrders}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Avg Order Value</div>
          <div className="stat-value">
            ${(stats.totalSales / stats.totalOrders || 0).toFixed(2)}
          </div>
        </div>
      </div>

      {/* LOWER SECTION */}
      <div className="bottom-grid">
        {/* RECENT ORDERS */}
        <div className="stat-card orders-card">
          <div className="section-header">Recent Orders</div>

          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id.slice(0, 8)}</td>
                    <td>{order.customer_name}</td>
                    <td>${order.total}</td>
                    <td>
                      <span
                        className={`status-badge status-${order.status}`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TOP PRODUCTS */}
        <div className="stat-card products-card">
          <div className="section-header">Top Products</div>

          <Bar
            data={topProductsData}
            options={{ responsive: true }}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;