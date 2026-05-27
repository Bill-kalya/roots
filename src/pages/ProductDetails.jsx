import React, { useEffect, useMemo, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import "./ProductDetails.css";

import { addToCart, getProduct } from "../services/api";
import { toast } from "sonner";

import { resolveImageUrl } from "../lib/apiClient";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeImage, setActiveImage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await getProduct(id, controller.signal);
        // Backend might return { product: ... } or raw product
        const p = res?.product ?? res;
        setProduct(p || null);

        const first = p?.gallery?.[0] || p?.image_url || "";
        setActiveImage(first);
      } catch (e) {
        if (e?.name === "CanceledError") return;
        setError(e?.response?.data?.detail || e?.message || "Failed to load product.");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    if (id) load();

    return () => controller.abort();
  }, [id]);

  const safeGallery = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.gallery)) return product.gallery;
    if (typeof product.gallery === "string") return [product.gallery];
    return product.image_url ? [product.image_url] : [];
  }, [product]);

  const mainImageSrc = useMemo(() => {
    if (!activeImage) return "";
    return resolveImageUrl(activeImage);
  }, [activeImage]);

  if (loading) return (
    <div className="product-details-page">Loading…</div>
  );

  if (error || !product) {
    return (
      <div className="product-details-page">{error || "Product not found"}</div>
    );
  }

  return (
    <>
      <Nav />

      <div className="product-details-page">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <div className="product-layout">
          {/* LEFT */}
          <div className="product-gallery">
            <div className="main-image-wrapper">
              <img
                src={mainImageSrc}
                alt={product.name}
                className="main-product-image"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>

            <div className="thumbnail-row">
              {safeGallery.map((img, i) => (
                <img
                  key={i}
                  src={resolveImageUrl(img)}
                  alt=""
                  onClick={() => setActiveImage(img)}
                  className={`thumbnail ${
                    activeImage === img
                      ? "thumbnail-active"
                      : ""
                  }`}
                />
              ))}
            </div>

          </div>

          {/* RIGHT */}
          <div className="product-info-panel">
            <div className="product-origin-label">{product.origin}</div>

            <h1 className="details-title">{product.name}</h1>

            <div className="details-price">
              KSh {product.price?.toLocaleString() ?? "—"}
            </div>


            <p className="details-description">
              {product.long_description}
            </p>


            <div className="details-grid">
              <div className="detail-item">
                <span>Artisan</span>
                <strong>{product.artisan ?? "—"}</strong>

              </div>

              <div className="detail-item">
                <span>Weight</span>
                <strong>{product.weight ?? "—"}</strong>
              </div>

              <div className="detail-item">
                <span>Dimensions</span>
                <strong>{product.dimensions ?? "—"}</strong>
              </div>

              <div className="detail-item">
                <span>Year</span>
                <strong>{product.year ?? "—"}</strong>
              </div>

            </div>

            <div className="materials-section">
              <h3>Materials</h3>

              <div className="materials-list">
                {(product.materials ?? []).map((mat) => (
                  <div key={mat} className="material-chip">
                    {mat}
                  </div>
                ))}

              </div>
            </div>

            <div className="product-merchant-cta">
              <button
                className="view-merchant-btn"
                onClick={() => {
                  // Backend must include merchant linkage in the product payload.
                  // Expected: product.merchant_id OR product.merchantId OR product.merchant.id.
                  const merchantId =
                    product?.merchant_id ??
                    product?.merchantId ??
                    product?.merchant?.id;

                  if (!merchantId) {
                    toast.error("Merchant info is unavailable for this product.");
                    return;
                  }

                  // Open direct chat with the merchant.
                  // Chat.jsx currently expects `roomId` from router state.
                  // Use merchantId as the stable room identifier.
                  navigate("/chat", { state: { roomId: merchantId } });
                }}
                disabled={!(product?.merchant_id ?? product?.merchantId ?? product?.merchant?.id)}
              >
                TALK TO MERCHANT
              </button>

              <button
                className="add-cart-large"
                onClick={async () => {
                  try {
                    await addToCart(product.id, 1);
                    window.dispatchEvent(new CustomEvent("roots:cart-updated"));
                  } catch (e) {
                    console.error("addToCart failed", e);
                  }
                }}
              >
                ADD TO BASKET
              </button>
            </div>


          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

