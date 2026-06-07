import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { resolveImageUrl } from '../lib/apiClient';
import { toast } from 'sonner';

const MerchantDashboard = () => {
  const navigate = useNavigate();
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
    setProducts(Array.isArray(productsData) ? productsData : (productsData?.items ?? []));
    setOrders(Array.isArray(ordersData) ? ordersData : (ordersData?.items ?? []));
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

      console.log('MerchantDashboard raw productsData:', productsData);
      console.log('MerchantDashboard raw ordersData:', ordersData);
      console.log('MerchantDashboard raw analyticsData:', analyticsData);

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

  const handleSaveProduct = async (productData) => {
    try {
      // For FormData, do NOT manually set Content-Type (axios will add boundary correctly).
      const config = {};

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

  const handleUpdateOrderStatus = async (orderId, status) => {
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

  const normalizeMerchantOrderRow = (order) => {
    const id = order?.id ?? order?._id ?? order?.order_id ?? '';

    const customer_name =
      order?.customer_name ??
      order?.customer?.name ??
      order?.customer?.full_name ??
      order?.user?.email ??
      'Unknown';

    const itemsArray = Array.isArray(order?.items) ? order.items : [];

    const rawTotal =
      order?.total_amount ??
      order?.total ??
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
      items_count: itemsArray.length,
      total_display,
      status: rawStatus ? status_badge_key : 'pending',
      status_label,
      status_badge_key,
    };
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

  console.log('MerchantDashboard Products state:', products);

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
        <div className="merchant-header-actions">
          <button
            className="btn btn-ghost"
            onClick={() => navigate('/profile')}
            aria-label="Go to user dashboard"
          >
            View User Dashboard
          </button>
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
          {products.map((product, idx) => {
            const resolved = resolveImageUrl(product.image_url);
            if (idx < 5) {
              console.log('MerchantDashboard product image:', {
                raw: product.image_url,
                resolved,
                productId: product.id,
              });
            }
            // Ensure visibility even if the global landing page animation CSS
            // expects `product-card-visible`.
            return (
              <div key={product.id ?? idx} className="product-card product-card-visible">
                <img
                  src={resolved}
                  alt={product.name}
                  className="product-image"
                />
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
            );
          })}
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
              {orders.map((order) => {
                const normalized = normalizeMerchantOrderRow(order);
                return (
                  <tr key={normalized.id}>
                    <td>#{String(normalized.id).slice(0, 8)}</td>
                    <td>{normalized.customer_name}</td>
                    <td>{normalized.items_count} items</td>
                    <td>{normalized.total_display}</td>
                    <td>
                      <span className={`status-badge status-${normalized.status_badge_key}`}>{normalized.status_label}</span>
                    </td>
                    <td>
                      <select
                        value={normalized.status}
                        onChange={(e) => handleUpdateOrderStatus(normalized.id, e.target.value)}
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
                );
              })}
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
    long_description: product?.long_description || '',
    price: product?.price || '',
    image_url: product?.image_url || '',
    image_file: null,
    gallery: Array.isArray(product?.gallery) ? product.gallery : [],
    origin: product?.origin || '',
    tag: product?.tag || '',
    stock: product?.stock || 0,
    is_featured: product?.is_featured || false,
    artisan: product?.artisan || '',
    weight: product?.weight || '',
    dimensions: product?.dimensions || '',
    year: product?.year ?? '',
    materials: Array.isArray(product?.materials) ? product.materials : [],
    materials_text: (Array.isArray(product?.materials) ? product.materials : []).join(', '),
  });

  const isEditing = Boolean(product);


  const [imagePreview, setImagePreview] = useState(product?.image_url || null);

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('long_description', formData.long_description || '');
    data.append('price', formData.price);
    data.append('origin', formData.origin);
    data.append('tag', formData.tag || '');
    data.append('stock', formData.stock);
    data.append('is_featured', formData.is_featured ? 'true' : 'false');

    // NEW optional product fields
    data.append('artisan', formData.artisan || '');
    data.append('weight', formData.weight || '');
    data.append('dimensions', formData.dimensions || '');
    data.append('year', formData.year === '' || formData.year === null ? '' : String(formData.year));

    // Materials text field -> array expected by backend (e.g., ['cotton','wool'])
    // If your backend accepts comma-separated strings, keep as string.
    // Otherwise, adjust backend parsing accordingly.
    data.append('materials', formData.materials_text || '');

    if (formData.image_file) {
      data.append('image', formData.image_file);
    } else if (!isEditing) {
      // New product — image is required
      toast.error('Please select a product image');
      return;
    }
    // Editing with no new file: do not append `image` so backend keeps existing image.

    onSave(data);
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

          <div className="form-group">
            <label>Long Description</label>
            <textarea
              value={formData.long_description}
              onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
              rows="4"
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
                required
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

          <div className="form-row">
            <div className="form-group">
              <label>Artisan</label>
              <input
                type="text"
                value={formData.artisan}
                onChange={(e) => setFormData({ ...formData, artisan: e.target.value })}
                placeholder="e.g., Kofi Asante"
              />
            </div>
            <div className="form-group">
              <label>Weight</label>
              <input
                type="text"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="e.g., 1200g"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Dimensions</label>
              <input
                type="text"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                placeholder="e.g., 30x10x5 cm"
              />
            </div>
            <div className="form-group">
              <label>Year</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value === '' ? '' : parseInt(e.target.value, 10) })}
                placeholder="e.g., 2024"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Materials (comma-separated)</label>
            <input
              type="text"
              value={formData.materials_text}
              onChange={(e) => {
                const text = e.target.value;
                setFormData({
                  ...formData,
                  materials_text: text,
                  materials: text
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                });
              }}
              placeholder="e.g., Wood, Brass, Cotton"
            />
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

