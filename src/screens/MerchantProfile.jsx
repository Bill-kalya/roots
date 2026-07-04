import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import "./merchant.css";

import { resolveImageUrl } from "../lib/apiClient";
import { toast } from "sonner";
import { getMerchantById, getMerchantProductsByMerchantId } from "../services/api";

export default function MerchantProfile() {
  const { merchantId } = useParams();
  const navigate = useNavigate();

  const [merchant, setMerchant] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");
      setMerchant(null);
      setProducts([]);

      try {
        if (!merchantId) throw new Error("Missing merchantId");

        const [m, p] = await Promise.all([
          getMerchantById(merchantId, controller.signal),
          getMerchantProductsByMerchantId(merchantId, controller.signal),
        ]);

        setMerchant(m?.merchant ?? m ?? null);
        const list = Array.isArray(p) ? p : p?.products ?? p?.items ?? [];
        setProducts(list);
      } catch (e) {
        if (e?.name === "CanceledError") return;
        const detail = e?.response?.data?.detail || e?.message || "Failed to load merchant";
        setError(detail);
        toast.error("Failed to load merchant");
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [merchantId]);

  if (loading) return <div className="merchant-container">Loading…</div>;

  if (error || !merchant) {
    return (
      <>
        <Nav />
        <div className="merchant-container">
          <div className="error-banner">
            <div className="error-banner__message">{error || "Merchant not found"}</div>
            <button className="btn btn-primary" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const initials = merchant?.initials
    ? merchant.initials
    : merchant?.name
      ? merchant.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "RA";

  return (
    <>
      <Nav />
      <div className="merchant-main">
        <div className="merchant-header">
          <h1 style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                background: "rgba(161,93,56,0.15)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              {initials}
            </span>
            {merchant.name || "Merchant"}
          </h1>
          <div className="merchant-subtitle">{merchant.subtitle || ""}</div>
        </div>

        <div className="merchant-section">
          <div className="merchant-cta-row" style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => {
                // Open direct chat with this merchant.
                // Chat.jsx uses router state: { roomId }.
                navigate('/chat', { state: { roomId: merchantId } });
              }}
              disabled={!merchantId}
            >
              TALK TO MERCHANT
            </button>
          </div>

          <h2>Products</h2>
          <div className="products-grid">
            {products.length === 0 ? (
              <div style={{ color: "#7A5C3A" }}>No products yet.</div>
            ) : (
              products.map((p, idx) => (
                <div key={p.id ?? idx} className="product-card product-card-visible">
                  <div className="image-container">
                    <img
                      src={resolveImageUrl(p.image_url)}
                      alt={p.name}
                      className="product-image"
                      onClick={() => p.id && navigate(`/product/${p.id}`)}
                      style={{ cursor: p.id ? "pointer" : "default" }}
                    />
                  </div>
                  <div className="product-info">
                    <h3 style={{ cursor: p.id ? "pointer" : "default" }} onClick={() => p.id && navigate(`/product/${p.id}`)}>
                      {p.name}
                    </h3>
                    <p className="product-price">${p.price}</p>
                    <button
                      className="btn btn-sm"
                      onClick={() => p.id && navigate(`/product/${p.id}`)}
                      disabled={!p.id}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

