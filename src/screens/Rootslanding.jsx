// RootsLanding.jsx — Production version (FastAPI + PostgreSQL + Redis backend)
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Rootslanding.css";
import Cart from "../components/Cart";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import {
  getFeaturedProducts,
  getTestimonials,
  subscribeNewsletter,
  addToCart,
} from "../services/api";
import { useApi, useMutation } from "../hooks/useApi";

// ─── Intersection observer helper ──────────────────────────────────────────
function useInView(threshold = 0.25) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -50px 0px" }
    );

    obs.observe(currentRef);

    return () => {
      obs.disconnect();
    };
  }, [threshold]);

  return [ref, inView];
}

// ─── Skeleton loader ────────────────────────────────────────────────────────
function ProductCardSkeleton() {
  return (
    <div className="product-card product-card-skeleton" aria-hidden="true">
      <div className="product-visual skeleton-block" />
      <div className="product-info">
        <div className="skeleton-line skeleton-line-short" />
        <div className="skeleton-line" />
        <div className="skeleton-line skeleton-line-long" />
        <div className="skeleton-line skeleton-line-short" />
      </div>
    </div>
  );
}

function TestimonialSkeleton() {
  return (
    <div className="testimonials-content testimonials-skeleton" aria-hidden="true">
      <div className="skeleton-line skeleton-line-long" />
      <div className="skeleton-line skeleton-line-long" />
      <div className="skeleton-line skeleton-line-short" style={{ marginTop: "1rem" }} />
    </div>
  );
}

// ─── Error state ─────────────────────────────────────────────────────────────
function SectionError({ message, onRetry }) {
  return (
    <div className="section-error" role="alert">
      <span>⚠ {message || "Failed to load. Please try again."}</span>
      {onRetry && (
        <button className="section-error-retry" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

// ─── Hero ───────────────────────────────────────────────────────────────────
function Hero() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Small delay to ensure CSS transitions work properly
    const timer = setTimeout(() => setLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="hero">
      <div className="hero-accent-line" />
      <div className="hero-orb" />

      <div className={`hero-logo-right ${loaded ? "hero-logo-right-visible" : ""}`}>
        <img
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt="Roots Logo"
          style={{ width: "auto", height: "auto" }}
        />
      </div>

      <div className="hero-content">
        <div className={`hero-label ${loaded ? "hero-label-visible" : ""}`}>
          <div className="hero-label-line" />
          <span>African Art & Culture</span>
        </div>
        <h1 className={`hero-title ${loaded ? "hero-title-visible" : ""}`}>
          Where Heritage<br />
          <span className="hero-title-accent">Lives On.</span>
        </h1>
        <p className={`hero-desc ${loaded ? "hero-desc-visible" : ""}`}>
          Handpicked carvings, masks, textiles and artifacts directly from
          master artisans across the continent. Every piece carries a story
          centuries in the making.
        </p>
        <div className={`hero-buttons ${loaded ? "hero-buttons-visible" : ""}`}>
          <button className="hero-btn-primary">Explore Collection</button>
          <button className="hero-btn-secondary">Our Story →</button>
        </div>
        <div className={`hero-stats ${loaded ? "hero-stats-visible" : ""}`}>
          {[["500+", "Artisan Pieces"], ["32", "Countries"], ["100%", "Authentic"]].map(([n, l]) => (
            <div key={l}>
              <div className="hero-stat-number">{n}</div>
              <div className="hero-stat-label">{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="scroll-indicator">
        <span>SCROLL</span>
        <div className="scroll-indicator-line" />
      </div>
    </section>
  );
}

// ─── Marquee ────────────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  "Handcrafted Masks", "Tribal Sculptures", "Kente Weaves",
  "Bronze Castings", "Beadwork", "Ebony Carvings", "Ceremonial Drums",
];

function FeaturedBanner() {
  return (
    <section className="featured-banner" aria-hidden="true">
      <div className="marquee">
        {[...Array(2)].flatMap((_, i) =>
          MARQUEE_ITEMS.map((t) => (
            <span key={`${t}-${i}`} className="marquee-item">
              <span className="marquee-star">✦</span>{t}
            </span>
          ))
        )}
      </div>
    </section>
  );
}

// ─── Product Card ────────────────────────────────────────────────────────────
function ProductCard({ product, delay }) {
  const [ref, inView] = useInView(0.1);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const { mutate: doAddToCart, loading: addingToCart } = useMutation(
    useCallback((id) => addToCart(id, 1), [])
  );

  const handleAddToCart = async () => {
    try {
      await doAddToCart(product.id);
      window.dispatchEvent(new CustomEvent("roots:cart-updated"));
    } catch (err) {
      console.error("Add to cart failed:", err.message);
    }
  };

  const visual = product.image_url ? (
    <img
      src={product.image_url}
      alt={product.name}
      className="product-image"
      loading="lazy"
      onError={(e) => { e.currentTarget.style.display = "none"; }}
    />
  ) : (
    <span className="product-emoji" aria-hidden="true">🎭</span>
  );

  const displayPrice =
    typeof product.price === "number"
      ? `KSh ${product.price.toLocaleString("en-KE")}`
      : product.price;

  return (
    <article
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate('/checkout')}
      className={`product-card ${hovered ? "product-card-hovered" : ""} ${inView ? "product-card-visible" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
      aria-label={product.name}
    >
      <div className="product-visual">
        {visual}
        {product.tag && <div className="product-tag">{product.tag}</div>}
      </div>
      <div className="product-info">
        <div className="product-origin">{product.origin || "Various Origins"}</div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">{displayPrice}</span>
          <button
            className={`product-cart-btn ${hovered ? "product-cart-btn-hovered" : ""} ${addingToCart ? "product-cart-btn-loading" : ""}`}
            onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
            disabled={addingToCart}
            aria-label={addingToCart ? "Adding to cart…" : `Add ${product.name} to cart`}
          >
            {addingToCart ? "ADDING…" : "ADD TO CART"}
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Collection ──────────────────────────────────────────────────────────────
function Collection() {
  const [ref, inView] = useInView(0.1);

  const {
    data: products,
    loading,
    error,
    refetch,
  } = useApi(getFeaturedProducts, []);

  return (
    <section className="collection" ref={ref}>
      <div className="collection-container">
        <div className="collection-header">
          <div className="section-badge">
            <div className="section-badge-line" />
            <span>FEATURED PIECES</span>
            <div className="section-badge-line" />
          </div>
          <h2 className={`section-title ${inView ? "section-title-visible" : ""}`}>
            The Collection
          </h2>
        </div>

        <div className="product-grid" aria-live="polite" aria-busy={loading ? "true" : "false"}>
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}

          {error && (
            <SectionError
              message={error.message}
              onRetry={refetch}
            />
          )}

          {!loading && !error && products?.length === 0 && (
            <p className="section-empty">No pieces available right now. Check back soon.</p>
          )}

          {!loading && !error && products?.map((p, i) => (
            <ProductCard key={p.id} product={p} delay={i * 80} />
          ))}
        </div>

        <div className="collection-footer">
          <button className="view-all-btn">View All 500+ Pieces</button>
        </div>
      </div>
    </section>
  );
}

// ─── Heritage ────────────────────────────────────────────────────────────────
function Heritage() {
  const [ref, inView] = useInView(0.1);
  
  return (
    <section ref={ref} className="heritage">
      <div className={`heritage-visual ${inView ? "heritage-visual-visible" : ""}`}>
        <div className="heritage-circle">
          <div className="heritage-circle-inner" />
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Roots Logo"
            style={{ width: "160px", height: "auto" }}
          />
        </div>
        <div className="heritage-badge">Est. Authenticity 100%</div>
      </div>
      <div className={`heritage-content ${inView ? "heritage-content-visible" : ""}`}>
        <div className="section-badge">
          <div className="section-badge-line" />
          <span>OUR PROMISE</span>
        </div>
        <h2 className="heritage-title">
          Art That Honours<br /><em>Its Origins</em>
        </h2>
        <p className="heritage-text">
          Every piece on Roots comes with a provenance document tracing its
          origin, the artisan who made it, and the cultural tradition it belongs
          to. We work directly with communities — no middlemen, no exploitation.
        </p>
        {[
          ["🤝", "Direct from artisans", "Fair trade pricing with full community benefit"],
          ["📜", "Certified provenance", "Every piece documented and authenticated"],
          ["✈️", "Worldwide shipping", "Carefully packed and insured delivery"],
        ].map(([ic, title, sub]) => (
          <div key={title} className="heritage-feature">
            <span className="heritage-feature-icon">{ic}</span>
            <div>
              <div className="heritage-feature-title">{title}</div>
              <div className="heritage-feature-desc">{sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function Testimonials() {
  const [active, setActive] = useState(0);
  const [ref, inView] = useInView(0.1);

  const { data: testimonials, loading, error, refetch } = useApi(
    getTestimonials,
    []
  );

  useEffect(() => {
    if (!testimonials?.length) return;
    const interval = setInterval(
      () => setActive((current) => (current + 1) % testimonials.length),
      5000
    );
    return () => clearInterval(interval);
  }, [testimonials?.length]);

  const safeActive = testimonials?.length ? active % testimonials.length : 0;
  const current = testimonials?.[safeActive];

  return (
    <section ref={ref} className="testimonials">
      <div className="testimonials-container">
        <div className="section-badge">
          <div className="section-badge-line" />
          <span>TESTIMONIALS</span>
          <div className="section-badge-line" />
        </div>

        {loading && <TestimonialSkeleton />}
        {error && <SectionError message={error.message} onRetry={refetch} />}

        {!loading && !error && current && (
          <>
            <div className={`testimonials-content ${inView ? "testimonials-content-visible" : ""}`} aria-live="polite">
<p className={`testimonials-text ${inView ? "testimonials-text-visible" : ""}`}>
                "{current.text}"

              </p>
              <div className="testimonials-name">{current.name}</div>
              <div className="testimonials-location">{current.location}</div>
            </div>

            <div className="testimonials-dots" role="tablist" aria-label="Testimonials">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === safeActive}
                  aria-label={`Testimonial ${i + 1}`}
                  onClick={() => setActive(i)}
                  className={`testimonial-dot ${i === safeActive ? "testimonial-dot-active" : ""}`}
                />
              ))}
            </div>
          </>
        )}

        {!loading && !error && !current && (
          <p className="section-empty">No testimonials to show yet.</p>
        )}
      </div>
    </section>
  );
}

// ─── Newsletter ───────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Newsletter() {
  const [ref, inView] = useInView(0.1);
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState("");
  const [success, setSuccess] = useState(false);
  const inputRef = useRef(null);

  const { mutate: subscribe, loading, error: apiError } = useMutation(subscribeNewsletter);

  const handleSubmit = async () => {
    setValidationError("");
    if (!EMAIL_RE.test(email)) {
      setValidationError("Please enter a valid email address.");
      inputRef.current?.focus();
      return;
    }
    try {
      await subscribe(email);
      setSuccess(true);
      setEmail("");
      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch {
      // Error is handled by useMutation
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  const displayError = validationError || apiError?.message;

  return (
    <section ref={ref} className="newsletter">
      <div className={`newsletter-content ${inView ? "newsletter-content-visible" : ""}`}>
        <img
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt="Roots Logo"
          style={{ width: "40px", height: "auto" }}
        />
        <h2 className="newsletter-title">Join the Inner Circle</h2>
        <p className="newsletter-desc">
          New arrivals, artisan stories, and exclusive offers — delivered to your inbox.
        </p>

        {success ? (
          <p className="newsletter-success" role="status">
            ✓ You're in! Watch your inbox for artisan stories and new arrivals.
          </p>
        ) : (
          <>
            <div className="newsletter-form">
              <input
                ref={inputRef}
                type="email"
                placeholder="Your email address"
                className={`newsletter-input ${displayError ? "newsletter-input-error" : ""}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Email address for newsletter"
                aria-describedby={displayError ? "newsletter-error" : undefined}
                disabled={loading}
              />
              <button
                className="newsletter-btn"
                onClick={handleSubmit}
                disabled={loading}
                aria-busy={loading ? "true" : "false"}
              >
                {loading ? "SUBSCRIBING…" : "SUBSCRIBE"}
              </button>
            </div>
            {displayError && (
              <p id="newsletter-error" className="newsletter-error" role="alert">
                {displayError}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function RootsLanding() {
  useEffect(() => {
    document.body.classList.add("roots-body");
    const onExpired = () => { window.location.href = "/login"; };
    window.addEventListener("roots:session-expired", onExpired);
    return () => {
      document.body.classList.remove("roots-body");
      window.removeEventListener("roots:session-expired", onExpired);
    };
  }, []);

  return (
    <div className="roots-landing">
      <Nav />
      <Hero />
      <FeaturedBanner />
      <Collection />
      <Heritage />
      <Testimonials />
      <Newsletter />
      <Footer />
    </div>
  );
}