import React, { useEffect, useState } from 'react';
import {
  getMerchantProducts,
  getMerchantOrders,
  getMerchantAnalytics,
  createMerchantProduct,
  updateMerchantProduct,
  deleteMerchantProduct,
  updateOrderStatus,
} from '../services/api';
import './merchant.css';
import { toast } from 'sonner';


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
  const [error, setError] = useState(null);

  const applyMerchantData = (productsData, ordersData, analyticsData) => {
    setProducts(productsData?.items || []);
    setOrders(ordersData?.items || []);
    setAnalytics(analyticsData || {});
    setLoading(false);
  };

  const loadMerchantData = async () => {
    setError(null);
    setLoading(true);

    try {
      const [productsData, ordersData, analyticsData] = await Promise.all([
        getMerchantProducts(),
        getMerchantOrders(),
        getMerchantAnalytics(),
      ]);


      applyMerchantData(productsData, ordersData, analyticsData);
    } catch (err) {
      console.error('Error fetching merchant data:', err);
      setLoading(false);
      setError('Failed to load dashboard. Please check your connection and try again.');
      toast.error('Failed to load dashboard');
    }
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      await loadMerchantData();
      if (cancelled) return;
    };

    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveProduct = async (productData, isFormData = false) => {
    try {
      // Many apiClient wrappers accept either:
      // - raw JSON body
      // - FormData body (multipart)
      // If your API client already handles multipart headers, passing `isFormData` won't hurt.
      const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};

      if (editingProduct) {
        await updateMerchantProduct(editingProduct.id, productData, config);
        toast.success('Product updated!');
      } else {
        await createMerchantProduct(productData, config);
        toast.success('Product created!');
      }


      await loadMerchantData();
      setShowProductForm(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('Error saving product:', err);
      toast.error('Failed to save product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      // minimal optimistic UI
      setProducts((prev) => prev.filter((p) => p.id !== id));

      await deleteMerchantProduct(id);

      toast.success('Product deleted!');

      await loadMerchantData();
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Failed to delete product');
      // rollback by refetch
      await loadMerchantData();
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      // minimal optimistic UI
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );

      await updateOrderStatus(orderId, status);


      toast.success('Order status updated!');
      await loadMerchantData();
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('Failed to update order status');
      await loadMerchantData();
    }
  };

  const retryLoad = () => {
    loadMerchantData();
  };

  if (loading) {
    return (
      <div className="merchant-container">
        <div className="dashboard-skeleton">
          <div className="skeleton-title shimmer" />
          <div className="skeleton-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton-card shimmer" />
            ))}
          </div>
          <div className="skeleton-section">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-product shimmer" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="merchant-main">
      {error && (
        <div className="error-banner">
          <div className="error-banner__message">{error}</div>
          <button className="btn btn-primary" onClick={retryLoad}>
            Retry
          </button>
        </div>
      )}

      <div className="merchant-header">
        <h1>Merchant Dashboard</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingProduct(null);
            setShowProductForm(true);
          }}
        >
          + Add New Product
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Total Sales</div>
          <div className="stat-value">${analytics.totalSales?.toLocaleString?.() || 0}</div>
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
          <div className="stat-value">${analytics.totalRevenue?.toLocaleString?.() || 0}</div>
        </div>
      </div>

      <div className="merchant-section">
        <h2>Your Products</h2>
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <img src={product.image_url} alt={product.name} className="product-image" />
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-price">${product.price}</p>
                <p className="product-stock">Stock: {product.stock} units</p>
                <div className="product-actions">
                  <button
                    className="btn btn-sm"
                    onClick={() => {
                      setEditingProduct(product);
                      setShowProductForm(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    Delete
                  </button>
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
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Products</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{String(order.id).slice(0, 8)}</td>
                  <td>{order.customer_name}</td>
                  <td>{order.items?.length || 0} items</td>
                  <td>${order.total}</td>
                  <td>
                    <span className={`status-badge status-${order.status}`}>{order.status}</span>
                  </td>
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
    image_file: null,
    origin: product?.origin || '',
    tag: product?.tag || '',
    stock: product?.stock || 0,
    is_featured: product?.is_featured || false,
  });

  const [imagePreview, setImagePreview] = useState(product?.image_url || null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.image_file) {
      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'image_file') {
          data.append('image', value);
        } else if (key !== 'image_url') {
          data.append(key, value);
        }
      });

      onSave(data, true);
    } else {
      onSave(formData, false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Stock Quantity</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Product Image</label>

            {/* Preview */}
            {imagePreview && (
              <div style={{ marginBottom: '8px' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    width: '120px',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                  }}
                />
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                setFormData({ ...formData, image_file: file, image_url: '' });
                setImagePreview(URL.createObjectURL(file));
              }}
            />
            <small style={{ color: '#888' }}>JPG, PNG, WEBP — max 5MB</small>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Origin</label>
              <input
                type="text"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                placeholder="e.g., Kenya, Ghana"
              />
            </div>
            <div className="form-group">
              <label>Tag</label>
              <input
                type="text"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                placeholder="e.g., Handwoven, Rare"
              />
            </div>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              />
              Feature this product
            </label>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MerchantDashboard;

