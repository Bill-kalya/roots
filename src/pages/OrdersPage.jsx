import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./OrdersPage.css";

// Mock orders — swap with your real API/context data
const MOCK_ORDERS = [
  {
    id: "ORD-2041",
    date: "May 18, 2025",
    status: "Delivered",
    total: "$134.00",
    items: [
      { name: "Woven Sisal Basket", qty: 1, price: "$74.00", img: null },
      { name: "Terracotta Bowl Set", qty: 2, price: "$60.00", img: null },
    ],
  },
  {
    id: "ORD-1987",
    date: "Apr 2, 2025",
    status: "In Transit",
    total: "$89.00",
    items: [
      { name: "Hand-dyed Indigo Runner", qty: 1, price: "$89.00", img: null },
    ],
  },
  {
    id: "ORD-1754",
    date: "Feb 14, 2025",
    status: "Delivered",
    total: "$210.00",
    items: [
      { name: "Carved Ebony Tray", qty: 1, price: "$120.00", img: null },
      { name: "Raffia Wall Art", qty: 1, price: "$90.00", img: null },
    ],
  },
];

const STATUS_COLORS = {
  Delivered: { bg: "rgba(74,180,100,0.12)", text: "#5ecb78", border: "rgba(74,180,100,0.25)" },
  "In Transit": { bg: "rgba(247,165,75,0.12)", text: "#f7a54b", border: "rgba(247,165,75,0.3)" },
  Processing: { bg: "rgba(100,140,240,0.12)", text: "#8aabff", border: "rgba(100,140,240,0.25)" },
  Cancelled: { bg: "rgba(220,80,80,0.1)", text: "#e07070", border: "rgba(220,80,80,0.2)" },
};

function StatusBadge({ status }) {
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

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`order-card ${expanded ? "expanded" : ""}`}>
      <button className="order-card-header" onClick={() => setExpanded(p => !p)}>
        <div className="order-meta">
          <span className="order-id">{order.id}</span>
          <span className="order-date">{order.date}</span>
        </div>
        <div className="order-right">
          <StatusBadge status={order.status} />
          <span className="order-total">{order.total}</span>
          <svg
            className={`order-chevron ${expanded ? "open" : ""}`}
            width="14" height="14" viewBox="0 0 12 12" fill="none"
          >
            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="order-items">
          <div className="order-items-divider" />
          {order.items.map((item, i) => (
            <div className="order-item-row" key={i}>
              <div className="order-item-thumb">
                {item.img
                  ? <img src={item.img} alt={item.name} />
                  : <span className="thumb-placeholder">☽</span>
                }
              </div>
              <div className="order-item-info">
                <span className="item-name">{item.name}</span>
                <span className="item-qty">Qty: {item.qty}</span>
              </div>
              <span className="item-price">{item.price}</span>
            </div>
          ))}
          <div className="order-actions">
            <button className="btn-ghost">Track Order</button>
            <button className="btn-ghost">Buy Again</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Delivered", "In Transit", "Processing"];

  const visible = filter === "All"
    ? MOCK_ORDERS
    : MOCK_ORDERS.filter(o => o.status === filter);

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

        {/* Filter pills */}
        <div className="filter-pills">
          {filters.map(f => (
            <button
              key={f}
              className={`filter-pill ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Orders list */}
        <div className="orders-list">
          {visible.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📦</span>
              <p>No orders found</p>
            </div>
          ) : (
            visible.map(order => <OrderCard key={order.id} order={order} />)
          )}
        </div>

      </div>
    </div>
  );
}