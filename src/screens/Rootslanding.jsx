// RootsLanding.jsx — Rewritten with polymorphic section architecture
import React, { Component, createContext, useContext, useState, useEffect, useRef } from "react";
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

// ─── Data Context ────────────────────────────────────────────────────────────
const DataContext = createContext({});

class DataProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      testimonials: [],
      productsLoading: true,
      testimonialsLoading: true,
      productsError: null,
      testimonialsError: null,
    };
  }

  async componentDidMount() {
    this.fetchProducts();
    this.fetchTestimonials();
  }

  fetchProducts = async () => {
    this.setState({ productsLoading: true, productsError: null });
    try {
      const products = await getFeaturedProducts();
      this.setState({ products: products ?? [], productsLoading: false });
    } catch (err) {
      this.setState({ productsError: err, productsLoading: false });
    }
  };

  fetchTestimonials = async () => {
    this.setState({ testimonialsLoading: true, testimonialsError: null });
    try {
      const testimonials = await getTestimonials();
      this.setState({ testimonials: testimonials ?? [], testimonialsLoading: false });
    } catch (err) {
      this.setState({ testimonialsError: err, testimonialsLoading: false });
    }
  };

  render() {
    return (
      <DataContext.Provider
        value={{
          ...this.state,
          refetchProducts: this.fetchProducts,
          refetchTestimonials: this.fetchTestimonials,
        }}
      >
        {this.props.children}
      </DataContext.Provider>
    );
  }
}

// ─── Base Section Class ───────────────────────────────────────────────────────
// All page sections extend this — polymorphism via renderContent()
class BaseSection extends Component {
  constructor(props) {
    super(props);
    this.state = { inView: false };
    this.sectionRef = React.createRef();
    this.observer = null;
  }

  componentDidMount() {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.setState({ inView: true });
          this.observer.disconnect();
        }
      },
      { threshold: this.threshold(), rootMargin: "0px 0px -50px 0px" }
    );
    if (this.sectionRef.current) {
      this.observer.observe(this.sectionRef.current);
    }
  }

  componentWillUnmount() {
    this.observer?.disconnect();
  }

  // Override in subclasses
  threshold() {
    return 0.1;
  }

  sectionClassName() {
    return "";
  }

  // Each subclass must implement this
  renderContent() {
    throw new Error("renderContent() must be implemented by subclass");
  }

  render() {
    return (
      <section ref={this.sectionRef} className={this.sectionClassName()}>
        {this.renderContent()}
      </section>
    );
  }
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

// ─── Hero Section ─────────────────────────────────────────────────────────────
// Hero doesn't need scroll detection, so it stands alone
class HeroSection extends Component {
  constructor(props) {
    super(props);
    this.state = { loaded: false };
    this.timer = null;
  }

  componentDidMount() {
    this.timer = setTimeout(() => this.setState({ loaded: true }), 50);
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  render() {
    const { loaded } = this.state;
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
}

// ─── Marquee Banner ───────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  "Handcrafted Masks", "Tribal Sculptures", "Kente Weaves",
  "Bronze Castings", "Beadwork", "Ebony Carvings", "Ceremonial Drums",
];

class MarqueeBanner extends Component {
  render() {
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
}

// ─── Product Card ─────────────────────────────────────────────────────────────
// Functional component — uses hooks for navigate and cart mutation
function ProductCard({ product, delay }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    setAddingToCart(true);
    try {
      await addToCart(product.id, 1);
      window.dispatchEvent(new CustomEvent("roots:cart-updated"));
    } catch (err) {
      console.error("Add to cart failed:", err.message);
    } finally {
      setAddingToCart(false);
    }
  };

  const displayPrice =
    typeof product.price === "number"
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
        inView ? "product-card-visible" : "",
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
            aria-label={addingToCart ? "Adding to cart…" : `Add ${product.name} to cart`}
          >
            {addingToCart ? "ADDING…" : "ADD TO CART"}
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Collection Section ───────────────────────────────────────────────────────
class CollectionSection extends BaseSection {
  sectionClassName() {
    return "collection";
  }

  renderContent() {
    const { inView } = this.state;
    const { products, productsLoading, productsError, refetchProducts } =
      this.props.data;

    return (
      <div className="collection-container">
        <div className="collection-header">
          <SectionBadge label="FEATURED PIECES" />
          <h2 className={`section-title ${inView ? "section-title-visible" : ""}`}>
            The Collection
          </h2>
        </div>

        <div
          className="product-grid"
          aria-live="polite"
          aria-busy={productsLoading ? "true" : "false"}
        >
          {productsLoading &&
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}

          {productsError && (
            <SectionError
              message={productsError.message}
              onRetry={refetchProducts}
            />
          )}

          {!productsLoading && !productsError && products.length === 0 && (
            <p className="section-empty">No pieces available right now. Check back soon.</p>
          )}

          {!productsLoading &&
            !productsError &&
            products.map((product, i) => (
              <ProductCard key={product.id} product={product} delay={i * 80} />
            ))}
        </div>

        <div className="collection-footer">
          <button className="view-all-btn">View All 500+ Pieces</button>
        </div>
      </div>
    );
  }
}

// ─── Heritage Section ─────────────────────────────────────────────────────────
const HERITAGE_FEATURES = [
  ["🤝", "Direct from artisans", "Fair trade pricing with full community benefit"],
  ["📜", "Certified provenance", "Every piece documented and authenticated"],
  ["✈️", "Worldwide shipping", "Carefully packed and insured delivery"],
];

class HeritageSection extends BaseSection {
  sectionClassName() {
    return "heritage";
  }

  renderContent() {
    const { inView } = this.state;

    return (
      <>
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
            origin, the artisan who made it, and the cultural tradition it
            belongs to. We work directly with communities — no middlemen, no
            exploitation.
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
      </>
    );
  }
}

// ─── Testimonials Section ─────────────────────────────────────────────────────
class TestimonialsSection extends BaseSection {
  constructor(props) {
    super(props);
    this.state = { ...this.state, activeIndex: 0 };
    this.rotationTimer = null;
  }

  sectionClassName() {
    return "testimonials";
  }

  componentDidUpdate(prevProps) {
    const prevLen = prevProps.data?.testimonials?.length;
    const nextLen = this.props.data?.testimonials?.length;

    if (prevLen !== nextLen) {
      clearInterval(this.rotationTimer);
      if (nextLen) {
        this.rotationTimer = setInterval(() => {
          this.setState((prev) => ({
            activeIndex: (prev.activeIndex + 1) % nextLen,
          }));
        }, 5000);
      }
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    clearInterval(this.rotationTimer);
  }

  setActive = (i) => this.setState({ activeIndex: i });

  renderContent() {
    const { inView, activeIndex } = this.state;
    const { testimonials, testimonialsLoading, testimonialsError, refetchTestimonials } =
      this.props.data;

    const safeIndex = testimonials.length ? activeIndex % testimonials.length : 0;
    const current = testimonials[safeIndex];

    return (
      <div className="testimonials-container">
        <SectionBadge label="TESTIMONIALS" />

        {testimonialsLoading && <SkeletonTestimonial />}

        {testimonialsError && (
          <SectionError
            message={testimonialsError.message}
            onRetry={refetchTestimonials}
          />
        )}

        {!testimonialsLoading && !testimonialsError && current && (
          <>
            <div
              className={`testimonials-content ${inView ? "testimonials-content-visible" : ""}`}
              aria-live="polite"
            >
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
                  aria-selected={i === safeIndex}
                  aria-label={`Testimonial ${i + 1}`}
                  onClick={() => this.setActive(i)}
                  className={`testimonial-dot ${i === safeIndex ? "testimonial-dot-active" : ""}`}
                />
              ))}
            </div>
          </>
        )}

        {!testimonialsLoading && !testimonialsError && !current && (
          <p className="section-empty">No testimonials to show yet.</p>
        )}
      </div>
    );
  }
}

// ─── Newsletter Section ───────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class NewsletterSection extends BaseSection {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      email: "",
      validationError: "",
      apiError: "",
      success: false,
      loading: false,
    };
    this.inputRef = React.createRef();
    this.successTimer = null;
  }

  sectionClassName() {
    return "newsletter";
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    clearTimeout(this.successTimer);
  }

  handleEmailChange = (e) => {
    this.setState({ email: e.target.value, validationError: "", apiError: "" });
  };

  handleKeyDown = (e) => {
    if (e.key === "Enter") this.handleSubmit();
  };

  handleSubmit = async () => {
    const { email } = this.state;
    this.setState({ validationError: "", apiError: "" });

    if (!EMAIL_RE.test(email)) {
      this.setState({ validationError: "Please enter a valid email address." });
      this.inputRef.current?.focus();
      return;
    }

    this.setState({ loading: true });
    try {
      await subscribeNewsletter(email);
      this.setState({ success: true, email: "", loading: false });
      this.successTimer = setTimeout(
        () => this.setState({ success: false }),
        5000
      );
    } catch (err) {
      this.setState({
        apiError: err.message || "Subscription failed. Please try again.",
        loading: false,
      });
    }
  };

  renderContent() {
    const { inView, email, validationError, apiError, success, loading } = this.state;
    const displayError = validationError || apiError;

    return (
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
                ref={this.inputRef}
                type="email"
                placeholder="Your email address"
                className={`newsletter-input ${displayError ? "newsletter-input-error" : ""}`}
                value={email}
                onChange={this.handleEmailChange}
                onKeyDown={this.handleKeyDown}
                aria-label="Email address for newsletter"
                aria-describedby={displayError ? "newsletter-error" : undefined}
                disabled={loading}
              />
              <button
                className="newsletter-btn"
                onClick={this.handleSubmit}
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
    );
  }
}

// ─── Data-connected wrappers ──────────────────────────────────────────────────
// Bridges the class-based sections with the DataContext
function ConnectedCollection() {
  const data = useContext(DataContext);
  return <CollectionSection data={data} />;
}

function ConnectedTestimonials() {
  const data = useContext(DataContext);
  return <TestimonialsSection data={data} />;
}

// ─── Session Expiry Handler ───────────────────────────────────────────────────
class SessionGuard extends Component {
  componentDidMount() {
    this.handleExpired = () => { window.location.href = "/login"; };
    window.addEventListener("roots:session-expired", this.handleExpired);
    document.body.classList.add("roots-body");
  }

  componentWillUnmount() {
    window.removeEventListener("roots:session-expired", this.handleExpired);
    document.body.classList.remove("roots-body");
  }

  render() {
    return this.props.children;
  }
}

// ─── Root Page ────────────────────────────────────────────────────────────────
export default function RootsLanding() {
  return (
    <SessionGuard>
      <DataProvider>
        <div className="roots-landing">
          <Nav />
          <HeroSection />
          <MarqueeBanner />
          <ConnectedCollection />
          <HeritageSection />
          <ConnectedTestimonials />
          <NewsletterSection />
          <Footer />
        </div>
      </DataProvider>
    </SessionGuard>
  );
}