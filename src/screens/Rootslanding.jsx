import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Rootslanding.css";
import Cart from "../components/Cart";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import Theme from "../components/Theme";

// ─── Static Data (replaces broken API calls) ──────────────────────────────────
const STATIC_PRODUCTS = [
  {
    id: 1,
    name: "Ebony Queen Mask",
    description: "Hand-carved ceremonial mask from Ghanaian Ashanti artisans.",
    origin: "Ghana",
    price: 12800,
    image_url: `${import.meta.env.BASE_URL}mask.jpg`,
    tag: "Featured"
  },
  {
    id: 2,
    name: "Kente Royal Stole",
    description: "Handwoven Kente cloth using 7 traditional colors.",
    origin: "Ghana",
    price: 4500,
    image_url: null,
    tag: "New"
  },
  {
    id: 3,
    name: "Bronze Warrior",
    description: "Lost-wax cast Benin bronze sculpture.",
    origin: "Nigeria",
    price: 28500,
    image_url: `${import.meta.env.BASE_URL}necklace.jpg`,
  }
];

const STATIC_TESTIMONIALS = [
  {
    id: 1,
    text: "The quality and authenticity exceeded my expectations. Each piece tells a powerful story.",
    name: "Amina Okek",
    location: "Nairobi, Kenya"
  },
  {
    id: 2,
    text: "Working directly with Roots transformed our artisan cooperative. Fair trade done right.",
    name: "Kwame Asante",
    location: "Kumasi, Ghana"
  }
];

// ─── Data Context ────────────────────────────────────────────────────────────
const DataContext = createContext();

function DataProvider({ children }) {
  const [data, setData] = useState({
    products: [],
    testimonials: [],
    productsLoading: false,
    testimonialsLoading: false,
    productsError: null,
    testimonialsError: null
  });

  useEffect(() => {
    // Simulate async load with static data
    const timer = setTimeout(() => {
      setData({
        products: STATIC_PRODUCTS,
        testimonials: STATIC_TESTIMONIALS,
        productsLoading: false,
        testimonialsLoading: false,
        productsError: null,
        testimonialsError: null
      });
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const refetchProducts = useCallback(() => {
    setData(prev => ({ ...prev, productsLoading: true, productsError: null }));
    setTimeout(() => {
      setData(prev => ({ ...prev, products: STATIC_PRODUCTS, productsLoading: false }));
    }, 500);
  }, []);

  const refetchTestimonials = useCallback(() => {
    setData(prev => ({ ...prev, testimonialsLoading: true, testimonialsError: null }));
    setTimeout(() => {
      setData(prev => ({ ...prev, testimonials: STATIC_TESTIMONIALS, testimonialsLoading: false }));
    }, 500);
  }, []);

  return (
    <DataContext.Provider value={{ ...data, refetchProducts, refetchTestimonials }}>
      {children}
    </DataContext.Provider>
  );
}

// ─── Custom Hook: useInView ───────────────────────────────────────────────────
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
      { threshold, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}

// ─── Shared UI Primitives ─────────────────────────────────────────────────────
function SectionBadge({ label }) {
  return (
    <div className="section-badge">
      <div className="section-badge-line" />
      <span>{label}</span>
      <div className="section-badge-line" />
    </div>
  );
}

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

function SkeletonCard() {
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

function SkeletonTestimonial() {
  return (
    <div className="testimonials-content testimonials-skeleton" aria-hidden="true">
      <div className="skeleton-line skeleton-line-long" />
      <div className="skeleton-line skeleton-line-long" />
      <div className="skeleton-line skeleton-line-short" style={{ marginTop: "1rem" }} />
    </div>
  );
}

// ─── Hero Section (Functional) ────────────────────────────────────────────────
function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleExploreClick = useCallback(() => {
    document.querySelector('.collection')?.scrollIntoView({ 
      behavior: 'smooth', block: 'start' 
    });
  }, []);

  const STATS = [
    ["500+", "Artisan Pieces"],
    ["32", "Countries"],
    ["100%", "Authentic"],
  ];

  return (
    <section className="hero">
      <div className="hero-accent-line" />
      <div className="hero-orb" />
      <div className={`hero-logo-right ${loaded ? "hero-logo-right-visible" : ""}`}>
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Roots Logo" />
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
          Handpicked carvings, masks, textiles and artifacts directly from master artisans across the continent.
        </p>
        <div className={`hero-buttons ${loaded ? "hero-buttons-visible" : ""}`}>
          <button className="hero-btn-primary" onClick={handleExploreClick}>
            Explore Collection
          </button>
          <button className="hero-btn-secondary">Our Story →</button>
        </div>
        <div className={`hero-stats ${loaded ? "hero-stats-visible" : ""}`}>
          {STATS.map(([number, label]) => (
            <div key={label}>
              <div className="hero-stat-number">{number}</div>
              <div className="hero-stat-label">{label}</div>
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

// ─── Marquee Banner ───────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  "Handcrafted Masks", "Tribal Sculptures", "Kente Weaves",
  "Bronze Castings", "Beadwork", "Ebony Carvings", "Ceremonial Drums",
];

function MarqueeBanner() {
  return (
    <section className="featured-banner" aria-hidden="true">
      <div className="marquee">
        {[0, 1].flatMap((i) =>
          MARQUEE_ITEMS.map((text) => (
            <span key={`${text}-${i}`} className="marquee-item">
              <span className="marquee-star">✦</span>{text}
            </span>
          ))
        )}
      </div>
    </section>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, delay }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cardRef, cardInView] = useInView(0.1);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    setAddingToCart(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    window.dispatchEvent(new CustomEvent("roots:cart-updated"));
    setAddingToCart(false);
  };

  const displayPrice = typeof product.price === "number"
    ? `KSh ${product.price.toLocaleString("en-KE")}`
    : product.price;

  return (
    <article
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate("/checkout")}
      className={[
        "product-card",
        hovered ? "product-card-hovered" : "",
        cardInView ? "product-card-visible" : "",
      ].join(" ")}
      style={{ transitionDelay: `${delay}ms` }}
      aria-label={product.name}
    >
      <div className="product-visual">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="product-image"
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        ) : (
          <span className="product-emoji" aria-hidden="true">🎭</span>
        )}
        {product.tag && <div className="product-tag">{product.tag}</div>}
      </div>
      <div className="product-info">
        <div className="product-origin">{product.origin || "Various Origins"}</div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">{displayPrice}</span>
          <button
            className={[
              "product-cart-btn",
              hovered ? "product-cart-btn-hovered" : "",
              addingToCart ? "product-cart-btn-loading" : "",
            ].join(" ")}
            onClick={handleAddToCart}
            disabled={addingToCart}
          >
            {addingToCart ? "ADDING…" : "ADD TO BASKET"}
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Collection Section ───────────────────────────────────────────────────────
function CollectionSection() {
  const [sectionRef, inView] = useInView();
  const data = useContext(DataContext);

  return (
    <section ref={sectionRef} className="collection">
      <div className="collection-container">
        <div className="collection-header">
          <SectionBadge label="FEATURED PIECES" />
          <h2 className={`section-title ${inView ? "section-title-visible" : ""}`}>
            The Collection
          </h2>
        </div>
        <div className="product-grid" aria-live="polite" aria-busy={data.productsLoading ? "true" : "false"}>
          {data.productsLoading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          {data.productsError && <SectionError message={data.productsError.message} onRetry={data.refetchProducts} />}
          {!data.productsLoading && !data.productsError && data.products.length === 0 && (
            <p className="section-empty">No pieces available right now. Check back soon.</p>
          )}
          {!data.productsLoading && !data.productsError && data.products.map((product, i) => (
            <ProductCard key={product.id} product={product} delay={i * 80} />
          ))}
        </div>
        <div className="collection-footer">
          <button className="view-all-btn">View All 500+ Pieces</button>
        </div>
      </div>
    </section>
  );
}

// ─── Heritage Section ─────────────────────────────────────────────────────────
const HERITAGE_FEATURES = [
  ["🤝", "Direct from artisans", "Fair trade pricing with full community benefit"],
  ["📜", "Certified provenance", "Every piece documented and authenticated"],
  ["✈️", "Worldwide shipping", "Carefully packed and insured delivery"],
];

function HeritageSection() {
  const [sectionRef, inView] = useInView();

  return (
    <section ref={sectionRef} className="heritage">
      <div className={`heritage-visual ${inView ? "heritage-visual-visible" : ""}`}>
        <div className="heritage-circle">
          <div className="heritage-circle-inner" />
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Roots Logo" style={{ width: "160px", height: "auto" }} />
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
          Every piece on Roots comes with a provenance document tracing its origin...
        </p>
        {HERITAGE_FEATURES.map(([icon, title, sub]) => (
          <div key={title} className="heritage-feature">
            <span className="heritage-feature-icon">{icon}</span>
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

// ─── Testimonials Section ─────────────────────────────────────────────────────
function TestimonialsSection() {
  const [sectionRef, inView] = useInView();
  const data = useContext(DataContext);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (data.testimonials.length > 0) {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % data.testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [data.testimonials.length]);

  const current = data.testimonials[data.testimonials.length ? activeIndex % data.testimonials.length : 0];

  return (
    <section ref={sectionRef} className="testimonials">
      <div className="testimonials-container">
        <SectionBadge label="TESTIMONIALS" />
        {data.testimonialsLoading && <SkeletonTestimonial />}
        {data.testimonialsError && <SectionError message={data.testimonialsError.message} onRetry={data.refetchTestimonials} />}
        {current && (
          <>
            <div className={`testimonials-content ${inView ? "testimonials-content-visible" : ""}`} aria-live="polite">
              <p className={`testimonials-text ${inView ? "testimonials-text-visible" : ""}`}>
                "{current.text}"
              </p>
              <div className="testimonials-name">{current.name}</div>
              <div className="testimonials-location">{current.location}</div>
            </div>
            <div className="testimonials-dots" role="tablist" aria-label="Testimonials">
              {data.testimonials.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === activeIndex}
                  onClick={() => setActiveIndex(i)}
                  className={`testimonial-dot ${i === activeIndex ? "testimonial-dot-active" : ""}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// ─── Newsletter Section ───────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function NewsletterSection() {
  const [sectionRef, inView] = useInView();
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = async () => {
    if (!EMAIL_RE.test(email)) {
      alert("Please enter a valid email address.");
      inputRef.current?.focus();
      return;
    }
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API
    setSuccess(true);
    setEmail("");
    setLoading(false);
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <section ref={sectionRef} className="newsletter">
      <div className={`newsletter-content ${inView ? "newsletter-content-visible" : ""}`}>
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Roots Logo" style={{ width: "40px" }} />
        <h2 className="newsletter-title">Join the Inner Circle</h2>
        <p className="newsletter-desc">New arrivals, artisan stories, and exclusive offers — delivered to your inbox.</p>
        {success ? (
          <p className="newsletter-success" role="status">✓ You're in!</p>
        ) : (
          <>
            <div className="newsletter-form">
              <input
                ref={inputRef}
                type="email"
                placeholder="Your email address"
                className="newsletter-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                disabled={loading}
              />
              <button className="newsletter-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? "SUBSCRIBING…" : "SUBSCRIBE"}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// ─── Session Guard ────────────────────────────────────────────────────────────
function SessionGuard({ children }) {
  useEffect(() => {
    const handleExpired = () => { window.location.href = "/login"; };
    window.addEventListener("roots:session-expired", handleExpired);
    document.body.classList.add("roots-body");
    return () => {
      window.removeEventListener("roots:session-expired", handleExpired);
      document.body.classList.remove("roots-body");
    };
  }, []);

  return children;
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function RootsLanding() {
  return (
    <SessionGuard>
      <DataProvider>
        <div className="roots-landing" style={{position: 'relative'}}>
          <div className="theme-switch-top-right">
            <Theme />
          </div>
          <Nav />
          <HeroSection />
          <MarqueeBanner />
          <CollectionSection />
          <HeritageSection />
          <TestimonialsSection />
          <NewsletterSection />
          <Footer />
        </div>
      </DataProvider>
    </SessionGuard>
  );
}

