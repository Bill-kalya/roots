import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMerchantProducts,
  getMerchantOrders,
  getMerchantAnalytics,
  getMerchantEarnings,
  createMerchantProduct,
  updateMerchantProduct,
  deleteMerchantProduct,
  updateOrderStatus,
} from '../services/api';
import './merchant.css';
import { resolveImageUrl } from '../lib/apiClient';
import { toast } from 'sonner';
import { useCurrency } from '../contexts/useCurrency';
import { formatMoney } from '../lib/formatMoney';

const MerchantDashboard = () => {
  const navigate = useNavigate();
  const { currency } = useCurrency();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalSales: 0,
    totalOrders: 0,
    activeProducts: 0,
    totalRevenue: 0,
  });

  const [earnings, setEarnings] = useState({
    available_balance: 0,
    pending_balance: 0,
    total_withdrawn: 0,
  });

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [ledger, setLedger] = useState([]);
  const [showLedger, setShowLedger] = useState(false);

  const applyMerchantData = (productsData, ordersData, analyticsData) => {
    setProducts(
      Array.isArray(productsData) ? productsData : productsData?.items ?? []
    );
    setOrders(Array.isArray(ordersData) ? ordersData : ordersData?.items ?? []);
    setAnalytics(analyticsData || {});
    setLoading(false);
  };

  const loadMerchantData = async () => {
    setError(null);
    setLoading(true);

    try {
      const [productsData, ordersData, analyticsData, earningsData] = await Promise.all([
        getMerchantProducts(),
        getMerchantOrders(),
        getMerchantAnalytics(),
        getMerchantEarnings(),
      ]);

      console.log('MerchantDashboard raw productsData:', productsData);
      console.log('MerchantDashboard raw ordersData:', ordersData);
      console.log('MerchantDashboard raw analyticsData:', analyticsData);
      console.log('MerchantDashboard raw earningsData:', earningsData);

      applyMerchantData(productsData, ordersData, analyticsData);
      setEarnings({
        available_balance: Number(earningsData?.available_balance || 0),
        pending_balance: Number(earningsData?.pending_balance || 0),
        total_withdrawn: Number(earningsData?.total_withdrawn || 0),
      });
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

  const handleRequestPayout = async (amount) => {
    try {
      await requestPayout({ amount });
      toast.success(`Payout request for ${formatMoney(amount, currency)} submitted!`);
      setShowPayoutModal(false);
      await loadMerchantData();
    } catch (err) {
      console.error('Error requesting payout:', err);
      const msg = err?.response?.data?.detail || err?.message || 'Failed to request payout';
      toast.error(msg);
    }
  };

  const loadLedger = async () => {
    try {
      const data = await getMerchantLedger({ limit: 50 });
      setLedger(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      console.error('Error loading ledger:', err);
      toast.error('Failed to load transaction history');
    }
  };

  const toggleLedger = async () => {
    if (!showLedger && ledger.length === 0) {
      await loadLedger();
    }
    setShowLedger(!showLedger);
  };

  const normalizeMerchantOrderRow = (order, currency) => {
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

    const total_display = formatMoney(
      Number.isFinite(totalNumber) ? totalNumber : 0,
      currency
    );

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
            onClick={() => navigate('/merchant/payout-settings')}
            aria-label="Go to payout settings"
          >
            Payout Settings
          </button>
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
          <div className="stat-title">Available Balance</div>
          <div className="stat-value">
            {formatMoney(Number(earnings.available_balance || 0), currency)}
          </div>
          <button
            className="btn btn-primary btn-sm"
            style={{ marginTop: 8 }}
            onClick={() => setShowPayoutModal(true)}
            disabled={Number(earnings.available_balance || 0) <= 0}
          >
            Request Payout
          </button>
        </div>

        <div className="stat-card">
          <div className="stat-title">Pending Balance</div>
          <div className="stat-value">
            {formatMoney(Number(earnings.pending_balance || 0), currency)}
          </div>
          <small style={{ color: '#888', marginTop: 4, display: 'block' }}>
            In escrow (awaiting delivery)
          </small>
        </div>

        <div className="stat-card">
          <div className="stat-title">Total Withdrawn</div>
          <div className="stat-value">
            {formatMoney(Number(earnings.total_withdrawn || 0), currency)}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Total Sales</div>
          <div className="stat-value">
            {formatMoney(Number(analytics.totalSales || 0), currency)}
          </div>
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
          <div className="stat-value">
            {formatMoney(Number(analytics.totalRevenue || 0), currency)}
          </div>
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

            return (
              <div key={product.id ?? idx} className="product-card product-card-visible">
                <img src={resolved} alt={product.name} className="product-image" />
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-price">
                    {formatMoney(Number(product.price || 0), currency)}
                  </p>
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
                const normalized = normalizeMerchantOrderRow(order, currency);
                return (
                  <tr key={normalized.id}>
                    <td>#{String(normalized.id).slice(0, 8)}</td>
                    <td>{normalized.customer_name}</td>
                    <td>{normalized.items_count} items</td>
                    <td>{normalized.total_display}</td>
                    <td>
                      <span
                        className={`status-badge status-${normalized.status_badge_key}`}
                      >
                        {normalized.status_label}
                      </span>
                    </td>
                    <td>
                      <select
                        value={normalized.status}
                        onChange={(e) =>
                          handleUpdateOrderStatus(normalized.id, e.target.value)
                        }
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

      <div className="merchant-section">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Transaction History</h2>
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={toggleLedger}
          >
            {showLedger ? 'Hide' : 'Show'} Ledger
          </button>
        </div>
        
        {showLedger && (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {ledger.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                      No transactions yet
                    </td>
                  </tr>
                ) : (
                  ledger.map((entry, idx) => (
                    <tr key={idx}>
                      <td>{new Date(entry.created_at || entry.date).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge status-${entry.type?.toLowerCase() || 'pending'}`}>
                          {entry.type || 'UNKNOWN'}
                        </span>
                      </td>
                      <td>{formatMoney(Number(entry.amount || 0), currency)}</td>
                      <td>{entry.description || entry.memo || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showProductForm && (
        <ProductFormModal
          product={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
          currency={currency}
        />
      )}

      <PayoutModal
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        onConfirm={handleRequestPayout}
        availableBalance={earnings.available_balance}
        currency={currency}
      />
    </div>
  );
};

const ProductFormModal = ({ product, onSave, onClose, currency }) => {
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

    const safePrice =
      Number.isFinite(parseFloat(formData.price)) ? parseFloat(formData.price) : null;
    const safeStock =
      Number.isFinite(parseInt(formData.stock, 10)) ? parseInt(formData.stock, 10) : 0;
    const safeYearRaw = formData.year === '' || formData.year === null ? null : formData.year;
    const safeYear =
      safeYearRaw === null || !Number.isFinite(parseInt(safeYearRaw, 10))
        ? null
        : parseInt(safeYearRaw, 10);
    void safeYear;

    if (safePrice === null) {
      toast.error('Please enter a valid price');
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('long_description', formData.long_description || '');
    data.append('price', String(safePrice));
    data.append('origin', formData.origin);
    data.append('tag', formData.tag || '');
    data.append('stock', String(safeStock));
    data.append('is_featured', formData.is_featured ? 'true' : 'false');

    data.append('artisan', formData.artisan || '');
    data.append('weight', formData.weight || '');
    data.append('dimensions', formData.dimensions || '');
    if (formData.year !== '' && formData.year !== null) {
      data.append('year', String(formData.year));
    }

    data.append('materials', JSON.stringify(formData.materials));
    data.append('gallery', JSON.stringify(formData.gallery));

    if (formData.image_file) {
      data.append('image', formData.image_file);
    } else if (!isEditing) {
      toast.error('Please select a product image');
      return;
    }

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
              <label>
                Price ({currency?.code || 'KES'})
              </label>
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
                min="0"
                value={formData.stock}
                onChange={(e) => {
                  const raw = e.target.value;
                  const parsed = raw === '' ? '' : parseInt(raw, 10);
                  setFormData({ ...formData, stock: Number.isNaN(parsed) ? '' : parsed });
                }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Product Image</label>

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
                onChange={(e) => {
                  const raw = e.target.value;
                  const parsed = raw === '' ? '' : parseInt(raw, 10);
                  setFormData({ ...formData, year: Number.isNaN(parsed) ? '' : parsed });
                }}
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

const PayoutModal = ({ isOpen, onClose, onConfirm, availableBalance, currency }) => {
  const [amount, setAmount] = useState('');

  if (!isOpen) return null;

  const safeAmount = Number(amount || 0);
  const canSubmit =
    Number.isFinite(safeAmount) &&
    safeAmount > 0 &&
    safeAmount <= Number(availableBalance || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onConfirm(safeAmount);
    setAmount('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Request Payout</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Amount ({currency?.code || 'KES'})</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Max ${formatMoney(Number(availableBalance || 0), currency)}`}
            />
            <small style={{ color: '#888' }}>
              Available: {formatMoney(Number(availableBalance || 0), currency)}
            </small>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
              Submit Payout Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MerchantDashboard;

