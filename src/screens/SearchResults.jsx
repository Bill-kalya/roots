import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import Footer from '../components/Footer';
import { resolveImageUrl } from '../lib/apiClient';
import { useCurrency } from '../contexts/useCurrency.js';
import { formatMoney } from '../lib/formatMoney.js';
import { addToCart } from '../services/api';
import { tokenStore } from '../lib/tokenStore';
import './SearchResults.css';

function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}

function SearchProductCard({ product, delay }) {
  const navigate = useNavigate();
  const { currency } = useCurrency();
  const [hovered, setHovered] = useState(false);
  const [adding, setAdding] = useState(false);
  const [cardRef, cardInView] = useInView(0.1);

  const productId = product?.id ?? product?.product_id;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    const accessToken = tokenStore.getAccess();
    if (!accessToken) {
      navigate('/login', { state: { next: window.location.pathname } });
      return;
    }
    if (adding || !productId) return;
    setAdding(true);
    try {
      await addToCart(productId, 1);
      window.dispatchEvent(new CustomEvent('roots:cart-updated'));
    } catch (err) {
      console.error('addToCart failed', err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <article
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        if (e.target.closest('button.product-cart-btn')) return;
        if (!productId) return;
        navigate('/product/' + productId);
      }}
      className={[
        'product-card',
        hovered ? 'product-card-hovered' : '',
        cardInView ? 'product-card-visible' : '',
      ].join(' ')}
      style={{ transitionDelay: `${delay}ms` }}
      aria-label={product.name}
    >
      <div className="product-visual">
        {product.image_url ? (
          <img
            src={resolveImageUrl(product.image_url)}
            alt={product.name}
            className="product-image"
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <span className="product-emoji" aria-hidden="true">🎭</span>
        )}
        {product.tag && <div className="product-tag">{product.tag}</div>}
      </div>
      <div className="product-info">
        <div className="product-origin">{product.origin || 'Various Origins'}</div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">{formatMoney(product.price, currency)}</span>
          <button
            className={[
              'product-cart-btn',
              hovered ? 'product-cart-btn-hovered' : '',
              adding ? 'product-cart-btn-loading' : '',
            ].join(' ')}
            onClick={handleAddToCart}
            disabled={adding}
          >
            {adding ? 'ADDING…' : 'ADD TO BASKET'}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function SearchResults() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const query = params.get('q') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    import('../services/api').then(({ getProducts }) => {
      getProducts({ search: query.trim(), limit: 50 }, controller.signal)
        .then((res) => {
          const list = res?.items ?? res?.results ?? res?.products ?? res ?? [];
          setProducts(Array.isArray(list) ? list : []);
        })
        .catch((err) => {
          if (err?.name !== 'CanceledError' && err?.name !== 'AbortError') {
            setError('Failed to load search results.');
          }
        })
        .finally(() => setLoading(false));
    });

    return () => controller.abort();
  }, [query]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    import('../services/api').then(({ getProducts }) => {
      getProducts({ search: query.trim(), limit: 50 })
        .then((res) => {
          const list = res?.items ?? res?.results ?? res?.products ?? res ?? [];
          setProducts(Array.isArray(list) ? list : []);
        })
        .catch(() => setError('Failed to load search results.'))
        .finally(() => setLoading(false));
    });
  };

  return (
    <div className="page">
      <section className="search-hero">
        <div className="search-hero-content">
          <h1 className="search-title">
            Search Results
          </h1>
          {query && (
            <p className="search-subtitle">
              {loading
                ? 'Searching…'
                : `${products.length} result${products.length !== 1 ? 's' : ''} for "${query}"`}
            </p>
          )}
        </div>
      </section>

      <section className="search-results-section">
        <div className="search-results-container">
          {loading && (
            <div className="search-product-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="product-card product-card-skeleton" aria-hidden="true">
                  <div className="product-visual skeleton-block" />
                  <div className="product-info">
                    <div className="skeleton-line skeleton-line-short" />
                    <div className="skeleton-line" />
                    <div className="skeleton-line skeleton-line-long" />
                    <div className="skeleton-line skeleton-line-short" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="search-empty">
              <p className="search-empty-text">{error}</p>
              <button className="search-retry-btn" onClick={handleRetry}>
                Retry
              </button>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="search-empty">
              <p className="search-empty-text">
                No products found for "<strong>{query}</strong>".
              </p>
              <p className="search-empty-hint">
                Try another keyword or browse our collection.
              </p>
              <button className="search-browse-btn" onClick={() => navigate('/')}>
                Browse Collection
              </button>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="search-product-grid">
              {products.map((product, i) => (
                <SearchProductCard key={product.id} product={product} delay={i * 80} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
