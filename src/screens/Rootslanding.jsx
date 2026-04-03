// RootsLanding.jsx
import React, { useState, useEffect, useRef } from "react";
import "./RootsLanding.css";
import Cart from "../components/Cart";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import Card from "../components/Card";
import Button from "../components/Button";
import CartButton from "../components/Cart";
import Search from "../components/Search";

const products = [
  { id: 1, name: "Ogun War Mask", origin: "Yoruba, Nigeria", price: "KSh 28,500", tag: "Rare", desc: "Hand-carved from iroko wood, adorned with copper inlays. A ceremonial piece used in Ogun festivals.", emoji: "🎭" },
  { id: 2, name: "Kente Woven Panel", origin: "Ashanti, Ghana", price: "KSh 14,200", tag: "Handwoven", desc: "Silk and cotton blend in the royal Adweneasa pattern. Each strip hand-woven by a master craftsman.", emoji: "🧵" },
  { id: 3, name: "Makonde Figure", origin: "Tanzania", price: "KSh 42,000", tag: "Museum Quality", desc: "Ebony wood carving depicting the ujamaa (family tree). A UNESCO-recognised art form.", emoji: "🪵" },
  { id: 4, name: "Tuareg Silver Cuff", origin: "Mali", price: "KSh 9,800", tag: "Artisan", desc: "Hand-beaten silver with geometric Tifinagh engravings by a Tuareg silversmith.", emoji: "💠" },
  { id: 5, name: "Ndebele Wall Art", origin: "South Africa", price: "KSh 18,600", tag: "Geometric", desc: "Painted on canvas using traditional mineral pigments in bold Ndebele geometric patterns.", emoji: "🎨" },
  { id: 6, name: "Benin Bronze Plaque", origin: "Edo Kingdom, Nigeria", price: "KSh 67,000", tag: "Heritage", desc: "Lost-wax cast bronze reproduction of a 16th-century Benin Court plaque. Museum-grade casting.", emoji: "🏺" },
];

const testimonials = [
  { name: "Amara Diallo", location: "Nairobi, Kenya", text: "Every piece I've received tells a story. Roots connects me to a heritage I thought I'd lost. The craftsmanship is extraordinary." },
  { name: "Kwame Asante", location: "Accra, Ghana", text: "I've been collecting African art for 20 years. Roots has the most carefully curated selection I've ever seen, and the provenance documentation is impeccable." },
  { name: "Zola Mokoena", location: "Johannesburg, SA", text: "My Makonde sculpture arrived wrapped in kente cloth. That detail alone told me everything about how much they care." },
];

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function Hero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);
  return (
    <section className="hero">
      <div className="hero-accent-line" />
      <div className="hero-orb" />

      {/* Logo pinned to the right */}
      <div className={`hero-logo-right ${loaded ? 'hero-logo-right-visible' : ''}`}>
        <img src="/logo.png" alt="Roots Logo" style={{ width: 'auto', height: 'auto' }} />
      </div>

      <div className="hero-content">
        <div className={`hero-label ${loaded ? 'hero-label-visible' : ''}`}>
          <div className="hero-label-line" />
          <span>African Art & Culture</span>
        </div>
        <h1 className={`hero-title ${loaded ? 'hero-title-visible' : ''}`}>
          Where Heritage<br/>
          <span className="hero-title-accent">Lives On.</span>
        </h1>
        <p className={`hero-desc ${loaded ? 'hero-desc-visible' : ''}`}>
          Handpicked carvings, masks, textiles and artifacts directly from master artisans across the continent. Every piece carries a story centuries in the making.
        </p>
        <div className={`hero-buttons ${loaded ? 'hero-buttons-visible' : ''}`}>
          <button className="hero-btn-primary">Explore Collection</button>
          <button className="hero-btn-secondary">Our Story →</button>
        </div>
        <div className={`hero-stats ${loaded ? 'hero-stats-visible' : ''}`}>
          {[["500+","Artisan Pieces"],["32","Countries"],["100%","Authentic"]].map(([n,l]) => (
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

function FeaturedBanner() {
  const [ref] = useInView();
  return (
    <section ref={ref} className="featured-banner">
      <div className="marquee">
        {[...Array(3)].flatMap(() =>
          ["Handcrafted Masks","Tribal Sculptures","Kente Weaves","Bronze Castings","Beadwork","Ebony Carvings","Ceremonial Drums"].map(t => (
            <span key={t+Math.random()} className="marquee-item">
              <span className="marquee-star">✦</span>{t}
            </span>
          ))
        )}
      </div>
    </section>
  );
}

function ProductCard({ product, delay }) {
  const [ref, inView] = useInView();
  const [hovered, setHovered] = useState(false);
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`product-card ${hovered ? 'product-card-hovered' : ''} ${inView ? 'product-card-visible' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="product-visual">
        <span className="product-emoji">{product.emoji}</span>
        <div className="product-tag">{product.tag}</div>
      </div>
      <div className="product-info">
        <div className="product-origin">{product.origin}</div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.desc}</p>
        <div className="product-footer">
          <span className="product-price">{product.price}</span>
          <Cart className={`product-cart-btn ${hovered ? 'product-cart-btn-hovered' : ''}`}>ADD TO CART</Cart>
        </div>
      </div>
    </div>
  );
}

function Collection() {
  const [ref, inView] = useInView();
  return (
    <section className="collection">
      <div ref={ref} className="collection-container">
        <div className="collection-header">
          <div className="section-badge">
            <div className="section-badge-line" />
            <span>FEATURED PIECES</span>
            <div className="section-badge-line" />
          </div>
          <h2 className={`section-title ${inView ? 'section-title-visible' : ''}`}>The Collection</h2>
        </div>
        <div className="product-grid">
          {products.map((p, i) => <ProductCard key={p.id} product={p} delay={i * 80} />)}
        </div>
        <div className="collection-footer">
          <button className="view-all-btn">View All 500+ Pieces</button>
        </div>
      </div>
    </section>
  );
}

function Heritage() {
  const [ref, inView] = useInView();
  return (
    <section ref={ref} className="heritage">
      <div className={`heritage-visual ${inView ? 'heritage-visual-visible' : ''}`}>
        <div className="heritage-circle">
          <div className="heritage-circle-inner" />
          <img src="/logo.png" alt="Roots Logo" style={{ width: '160px', height: 'auto' }} />
        </div>
        <div className="heritage-badge">Est. Authenticity 100%</div>
      </div>
      <div className={`heritage-content ${inView ? 'heritage-content-visible' : ''}`}>
        <div className="section-badge">
          <div className="section-badge-line" />
          <span>OUR PROMISE</span>
        </div>
        <h2 className="heritage-title">Art That Honours<br/><em>Its Origins</em></h2>
        <p className="heritage-text">
          Every piece on Roots comes with a provenance document tracing its origin, the artisan who made it, and the cultural tradition it belongs to. We work directly with communities — no middlemen, no exploitation.
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

function Testimonials() {
  const [active, setActive] = useState(0);
  const [ref, inView] = useInView();
  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % testimonials.length), 4500);
    return () => clearInterval(t);
  }, []);
  return (
    <section ref={ref} className="testimonials">
      <div className="testimonials-container">
        <div className="section-badge">
          <div className="section-badge-line" />
          <span>TESTIMONIALS</span>
          <div className="section-badge-line" />
        </div>
        <div className="testimonials-content">
          <p className={`testimonials-text ${inView ? 'testimonials-text-visible' : ''}`}>
            "{testimonials[active].text}"
          </p>
          <div className="testimonials-name">{testimonials[active].name}</div>
          <div className="testimonials-location">{testimonials[active].location}</div>
        </div>
        <div className="testimonials-dots">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`testimonial-dot ${i === active ? 'testimonial-dot-active' : ''}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Newsletter() {
  const [ref, inView] = useInView();
  return (
    <section ref={ref} className="newsletter">
      <div className={`newsletter-content ${inView ? 'newsletter-content-visible' : ''}`}>
        <img src="/logo.png" alt="Roots Logo" style={{ width: '40px', height: 'auto' }} />
        <h2 className="newsletter-title">Join the Inner Circle</h2>
        <p className="newsletter-desc">New arrivals, artisan stories, and exclusive offers — delivered to your inbox.</p>
        <div className="newsletter-form">
          <input type="email" placeholder="Your email address" className="newsletter-input" />
          <button className="newsletter-btn">SUBSCRIBE</button>
        </div>
      </div>
    </section>
  );
}

export default function RootsLanding() {
  useEffect(() => {
    document.body.classList.add('roots-body');
    return () => document.body.classList.remove('roots-body');
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