import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "../hooks/useOrders.js";
import "./OrdersPage.css";

function StatusBadge({ status }) {
  const STATUS_COLORS = {
    Delivered: { bg: "rgba(74,180,100,0.12)", text: "#5ecb78", border: "rgba(74,180,100,0.25)" },
    "In Transit": { bg: "rgba(247,165,75,0.12)", text: "#f7a54b", border: "rgba(247,165,75,0.3)" },
    Processing: { bg: "rgba(100,140,240,0.12)", text: "#8aabff", border: "rgba(100,140,240,0.25)" },
    Cancelled: { bg: "rgba(220,80,80,0.1)", text: "#e07070", border: "rgba(220,80,80,0.2)" },
  };

  const c = STATUS_COLORS[status] || STATUS_COLORS["Processing"];
  return (
    <span
      className="status-badge"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      {status}
    </span>
  );
}

function OrderCard({ order, onTrack, onBuyAgain, onCancel, onReturn, isCancelling, isReturning }) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className={`order-card ${expanded ? "expanded" : ""}`}>
      <button className="order-card-header" onClick={() => setExpanded(p => !p)}>
        <div className="order-meta">
          <span className="order-id">{order.id || order.order_id}</span>
          <span className="order-date">{order.date || order.created_at}</span>
        </div>
        <div className="order-right">
          <StatusBadge status={order.status} />
          <span className="order-total">{order.total || order.total_amount}</span>
          <svg
            className={`order-chevron ${expanded ? "open" : ""}`}
            width="14"
            height="14"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="order-items">
          <div className="order-items-divider" />
          {order.items && order.items.map((item, i) => (
            <div className="order-item-row" key={i}>
              <div className="order-item-thumb">
                {item.img
                  ? <img src={item.img} alt={item.name} />
                  : <span className="thumb-placeholder">☽</span>
                }
              </div>
              <div className="order-item-info">
                <span className="item-name">{item.name}</span>
                <span className="item-qty">Qty: {item.qty || item.quantity}</span>
              </div>
              <span className="item-price">{item.price || item.unit_price}</span>
            </div>
          ))}
          <div className="order-actions">
            <button
              className="btn-ghost"
              onClick={() => onTrack(order.id || order.order_id)}
              disabled={isCancelling || isReturning}
            >
              Track Order
            </button>
            <button
              className="btn-ghost"
              onClick={() => onBuyAgain(order.id || order.order_id)}
              disabled={isCancelling || isReturning}
            >
              Buy Again
            </button>
            {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
              <button
                className="btn-ghost btn-danger-ghost"
                onClick={() => onCancel(order.id || order.order_id)}
                disabled={isCancelling || isReturning}
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
            {order.status === 'Delivered' && (
              <button
                className="btn-ghost"
                onClick={() => onReturn(order.id || order.order_id)}
                disabled={isCancelling || isReturning}
              >
                {isReturning ? 'Processing...' : 'Request Return'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const {
    visibleOrders,
    filter,
    loading,
    error,
    actionError,
    updateFilter,
    handleTrackOrder,
    handleReorder,
    handleCancelOrder,
    handleRequestReturn,
    refresh,
    cancelling,
    returning,
  } = useOrders();

  const handleTrack = useCallback(async (orderId) => {
    try {
      const trackingInfo = await handleTrackOrder(orderId);
      // Display tracking info (could be a modal or alert for now)
      alert(`Tracking: ${JSON.stringify(trackingInfo, null, 2)}`);
    } catch (err) {
      // Error is already handled in the hook
    }
  }, [handleTrackOrder]);

  const handleBuyAgain = useCallback(async (orderId) => {
    try {
      const result = await handleReorder(orderId);
      alert('Items added to cart!');
      // Optionally navigate to cart
      // navigate('/basket');
    } catch (err) {
      // Error is already handled in the hook
    }
  }, [handleReorder]);

  const handleCancel = useCallback(async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      await handleCancelOrder(orderId, 'User requested cancellation');
    }
  }, [handleCancelOrder]);

  const handleReturn = useCallback(async (orderId) => {
    const reason = prompt('Please provide a reason for the return:');
    if (reason) {
      await handleRequestReturn(orderId, reason);
    }
  }, [handleRequestReturn]);

  return (
    <div className="page-shell">
      <div className="page-container">

        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        <div className="page-header">
          <h1 className="page-title">My Orders</h1>
          <p className="page-subtitle">Track and manage your purchases</p>
        </div>

        {/* Action error */}
        {actionError && (
          <div className="action-error" role="alert">
            {actionError}
            <button className="error-dismiss" onClick={() => {}}>×</button>
          </div>
        )}

        {/* Filter pills */}
        <div className="filter-pills">
          {["All", "Delivered", "In Transit", "Processing"].map(f => (
            <button
              key={f}
              className={`filter-pill ${filter === f ? "active" : ""}`}
              onClick={() => updateFilter(f)}
              disabled={loading}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Orders list */}
        <div className="orders-list">
          {loading ? (
            <div className="empty-state">
              <span className="empty-icon">⏳</span>
              <p>Loading orders…</p>
            </div>
          ) : error ? (
            <div className="empty-state">
              <span className="empty-icon">⚠️</span>
              <p>{error}</p>
              <button className="btn-ghost" onClick={refresh}>
                Retry
              </button>
            </div>
          ) : visibleOrders.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📦</span>
              <p>No orders found</p>
            </div>
          ) : (
            visibleOrders.map((order) => (
              <OrderCard
                key={order.id || order.order_id}
                order={order}
                onTrack={handleTrack}
                onBuyAgain={handleBuyAgain}
                onCancel={handleCancel}
                onReturn={handleReturn}
                isCancelling={cancelling === (order.id || order.order_id)}
                isReturning={returning === (order.id || order.order_id)}
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
}