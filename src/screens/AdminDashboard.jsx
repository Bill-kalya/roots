import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Filler,
} from 'chart.js';
import {
  getAnalytics,
  getOrders,
  updateSystemSettings,
  updateUserRole,
  getUsers,
} from '../services/api';
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
  Legend,
  Filler
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [updatingUserIds, setUpdatingUserIds] = useState({});

  const fetchUsers = async () => {
    const data = await getUsers();
    setUsers(Array.isArray(data) ? data : data?.users || []);
  };

  useEffect(() => {
    fetchUsers().catch((e) => console.error('Error fetching users:', e));
     
  }, []);

  const onPromoteDemote = async (userId, targetRole) => {
    setUpdatingUserIds((prev) => ({ ...prev, [userId]: true }));
    try {
      const res = await updateUserRole(userId, targetRole);
      await fetchUsers();

      if (res?.requires_relogin) {
        // Existing JWT for that user still contains the old role.
        // They must log out + log back in for the new token claims to take effect.
        window.dispatchEvent(
          new CustomEvent('sonner:toast', {
            detail: {
              title: 'Role updated',
              description: 'User must log out and log back in for the change to take effect.',
              type: 'info',
            },
          })
        );
      }
    } catch (e) {
      console.error('Error updating user role:', e);
    } finally {
      setUpdatingUserIds((prev) => ({ ...prev, [userId]: false }));
    }
  };
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
    const items = orders?.items || [];
    setRecentOrders(items);
    setTopProducts(analytics.top_products || []);
    setSalesData(analytics.sales_by_day || {});
    setMaintenanceMode(analytics.maintenance_mode || false);
    setLoading(false);
  };

  const normalizeOrderRow = (order) => {
    const id = order?.id ?? order?._id ?? order?.order_id ?? '';


    const customer_name =
      order?.customer_name ??
      order?.customer?.name ??
      order?.customer?.full_name ??
      order?.user?.email ??
      'Unknown';

    const rawTotal =
      order?.total_amount ??
      order?.total ??
      order?.totalAmount ??
      order?.amount_total ??
      order?.amount ??
      0;

    const totalNumber =
      typeof rawTotal === 'number'
        ? rawTotal
        : typeof rawTotal === 'string'
          ? Number(rawTotal)
          : 0;

    const total_display =
      typeof rawTotal === 'string' && rawTotal.includes('$')
        ? rawTotal
        : `$${(Number.isFinite(totalNumber) ? totalNumber : 0).toFixed(2)}`;

    const rawStatus = (order?.status ?? order?.order_status ?? '').toString();

    const status_label =
      rawStatus
        .replace(/_/g, ' ')
        .trim()
        .replace(/\b\w/g, (m) => m.toUpperCase()) || 'Unknown';

    const status_badge_key = rawStatus
      .replace(/\s+/g, '-')
      .replace(/_/g, '-')
      .toLowerCase();

    return {
      id,
      customer_name,
      total_display,
      status_label,
      status_badge_key,
    };
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [analytics, orders] = await Promise.all([
          getAnalytics(),
          getOrders({ limit: 10 }),
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
        getAnalytics(),
        getOrders({ limit: 10 }),
      ]);

      applyDashboardData(analytics, orders);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const toggleMaintenance = async () => {
    try {
      await updateSystemSettings({ maintenance_mode: !maintenanceMode });
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
          <button
            className="btn btn-ghost"
            onClick={() => navigate('/profile')}
            aria-label="Go to user dashboard"
          >
            View User Dashboard
          </button>
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

      {/* ADMIN USERS ROLE MANAGEMENT */}
      <div className="bottom-grid">
        <AdminUsersSection
          users={users}
          onPromoteDemote={onPromoteDemote}
          updatingUserIds={updatingUserIds}
        />
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
                {recentOrders.map((order) => {
                  const normalized = normalizeOrderRow(order);
                  return (
                    <tr key={normalized.id}>
                      <td>#{String(normalized.id).slice(0, 8)}</td>
                      <td>{normalized.customer_name}</td>
                      <td>{normalized.total_display}</td>
                      <td>
                        <span
                          className={`status-badge status-${normalized.status_badge_key}`}
                        >
                          {normalized.status_label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
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

// =========================
// ADMIN USERS ROLE MANAGEMENT UI
// =========================

const ROLE_BUTTONS = {
  USER: { label: 'Promote to Merchant', targetRole: 'MERCHANT' },
  MERCHANT: { label: 'Demote to User', targetRole: 'USER' },
};

const AdminUsersSection = ({ users, onPromoteDemote, updatingUserIds }) => {
  return (
    <div className="stat-card users-card">
      <div className="section-header">Admin Users</div>
      <div className="admin-users-table-hint">Role changes are applied immediately by the backend.</div>


      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const role = u.role || 'USER';
              const btnConfig = ROLE_BUTTONS[role];

              return (
                <tr key={u.id}>
                  <td>
                    <div className="user-email">{u.email}</div>
                  </td>
                  <td>{role}</td>
                  <td>
                    {btnConfig && (
                      <button
                        className={`btn ${role === 'USER' ? 'btn-success' : 'btn-primary'}`}
                        onClick={() => onPromoteDemote(u.id, btnConfig.targetRole)}
                        disabled={Boolean(updatingUserIds[u.id])}
                      >
                        {updatingUserIds[u.id]
                          ? 'Updating...'
                          : btnConfig.label}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;


