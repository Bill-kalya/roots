import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './merchant.css';

const MerchantDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalSales: 0,
    totalOrders: 0,
    activeProducts: 0,
    totalRevenue: 0,
  });
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyMerchantData = (productsData, ordersData, analyticsData) => {
    setProducts(productsData.items || []);
    setOrders(ordersData.items || []);
    setAnalytics(analyticsData);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [productsData, ordersData, analyticsData] = await Promise.all([
          api.getMerchantProducts(),
          api.getMerchantOrders(),
          api.getMerchantAnalytics(),
        ]);
        if (!cancelled) applyMerchantData(productsData, ordersData, analyticsData);
      } catch (error) {
        console.error('Error fetching merchant data:', error);
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const fetchMerchantData = async () => {
    try {
      const [productsData, ordersData, analyticsData] = await Promise.all([
        api.getMerchantProducts(),
        api.getMerchantOrders(),
        api.getMerchantAnalytics(),
      ]);
      applyMerchantData(productsData, ordersData, analyticsData);
    } catch (error) {
      console.error('Error fetching merchant data:', error);
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        await api.updateMerchantProduct(editingProduct.id, productData);
      } else {
        await api.createMerchantProduct(productData);
      }
      fetchMerchantData();
      setShowProductForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.deleteMerchantProduct(id);
        fetchMerchantData();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.updateOrderStatus(orderId, status);
      fetchMerchantData();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (loading) {
    return <div className="merchant-container">Loading dashboard...</div>;
  }

  return (
    <div className="merchant-main">
      <div className="merchant-header">
        <h1>Merchant Dashboard</h1>
        <button className="btn btn-primary" onClick={() => setShowProductForm(true)}>
          + Add New Product
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Total Sales</div>
          <div className="stat-value">${analytics.totalSales?.toLocaleString() || 0}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Total Orders</div>
          <div className="stat-value">{analytics.totalOrders || 0}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Active Products</div>
          <div className="stat-value">{analytics.activeProducts || 0}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Total Revenue</div>
          <div className="stat-value">${analytics.totalRevenue?.toLocaleString() || 0}</div>
        </div>
      </div>

      <div className="merchant-section">
        <h2>Your Products</h2>
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <img src={product.image_url} alt={product.name} className="product-image" />
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-price">${product.price}</p>
                <p className="product-stock">Stock: {product.stock} units</p>
                <div className="product-actions">
                  <button className="btn btn-sm" onClick={() => {
                    setEditingProduct(product);
                    setShowProductForm(true);
                  }}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="merchant-section">
        <h2>Recent Orders</h2>
        <div className="data-table">
          <table>
            <thead>
              <tr><th>Order ID</th><th>Customer</th><th>Products</th><th>Total</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id.slice(0, 8)}</td>
                  <td>{order.customer_name}</td>
                  <td>{order.items?.length || 0} items</td>
                  <td>${order.total}</td>
                  <td><span className={`status-badge status-${order.status}`}>{order.status}</span></td>
                  <td>
                    <select 
                      value={order.status} 
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showProductForm && (
        <ProductFormModal
          product={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};

const ProductFormModal = ({ product, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    image_url: product?.image_url || '',
    origin: product?.origin || '',
    tag: product?.tag || '',
    stock: product?.stock || 0,
    is_featured: product?.is_featured || false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="4"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Stock Quantity</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Image URL</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Origin</label>
              <input
                type="text"
                value={formData.origin}
                onChange={(e) => setFormData({...formData, origin: e.target.value})}
                placeholder="e.g., Kenya, Ghana"
              />
            </div>
            <div className="form-group">
              <label>Tag</label>
              <input
                type="text"
                value={formData.tag}
                onChange={(e) => setFormData({...formData, tag: e.target.value})}
                placeholder="e.g., Handwoven, Rare"
              />
            </div>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
              />
              Feature this product
            </label>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Product</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MerchantDashboard;