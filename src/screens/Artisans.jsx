import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Artisans.css';

// Data from task
const ARTISANS = [
  { initials: "KA", name: "Kofi Asante", location: "Kumasi, Ghana", craft: "Mask Carver", years: "38 yrs", bio: "Kofi learned to carve from his grandfather at age seven. His ceremonial masks are used in Ashanti royal ceremonies and held in three museum collections.", pieces: ["Ceremonial Masks", "Fertility Figures", "Ancestral Busts"] },
  { initials: "AM", name: "Amara Mensah", location: "Accra, Ghana", craft: "Kente Weaver", years: "25 yrs", bio: "Using a traditional loom passed down four generations, Amara weaves royal Kente cloth using hand-spun silk thread in patterns carrying royal lineage codes.", pieces: ["Royal Stoles", "Kente Yardage", "Ceremonial Cloth"] },
  { initials: "OE", name: "Ola Emeka", location: "Benin City, Nigeria", craft: "Bronze Caster", years: "42 yrs", bio: "A direct descendant of the Benin court's royal bronze guild, Ola uses the ancient lost-wax technique unchanged since the 13th century.", pieces: ["Bronze Plaques", "Warrior Sculptures", "Royal Portraits"] },
  { initials: "FN", name: "Fatuma Njoroge", location: "Narok, Kenya", craft: "Beadwork Artist", years: "20 yrs", bio: "Fatuma's beaded collars and ceremonial jewellery have been commissioned by collectors on five continents. Each piece encodes Maasai cosmology in colour and form.", pieces: ["Maasai Collars", "Ceremonial Belts", "Wedding Pieces"] },
  { initials: "ZM", name: "Zanele Mokoena", location: "Polokwane, South Africa", craft: "Ndebele Painter", years: "30 yrs", bio: "Zanele translates ancient Ndebele mural traditions onto canvas and ceramic, each piece a geometric meditation on identity and belonging.", pieces: ["Canvas Works", "Ceramic Tiles", "Mural Commissions"] },
  { initials: "TG", name: "Tesfaye Girma", location: "Addis Ababa, Ethiopia", craft: "Coptic Weaver", years: "35 yrs", bio: "Tesfaye weaves liturgical textiles for the Ethiopian Orthodox Church and private collectors, preserving Coptic pattern-making alive since the 4th century.", pieces: ["Liturgical Robes", "Coptic Crosses", "Wall Hangings"] },
];

const PROCESS_STEPS = [
  { n: "01", title: "Selection", desc: "Our team travels to source communities, spending weeks evaluating craft quality, authenticity, and cultural significance." },
  { n: "02", title: "Partnership", desc: "We establish long-term fair trade agreements — artisans set their own prices. Roots takes no more than 15%." },
  { n: "03", title: "Documentation", desc: "Each piece is photographed and recorded with full provenance: artisan biography, technique, and cultural context." },
  { n: "04", title: "Conservation", desc: "Expert conservators advise on preservation. Pieces are packed with archival materials and fully insured." },
];

// useInView hook (copied/adapted from Rootslanding.jsx, renamed from useReveal)
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

// SectionBadge (copied from Rootslanding.jsx, renamed from Badge)
function SectionBadge({ label }) {
  return (
    <div className="section-badge">
      <div className="section-badge-line" />
      <span>{label}</span>
      <div className="section-badge-line" />
    </div>
  );
}

function ArtisansPage() {
  const [heroRef, heroVis] = useInView();
  const [quoteRef, quoteVis] = useInView();
  const [processRef, processVis] = useInView();

  return (
    <div className="page">
      <section className="artisans-hero">
        <div ref={heroRef} className={`reveal ${heroVis ? "visible" : ""}`}>
          <SectionBadge label="THE MAKERS" />
          <h1 className="artisans-title">Hands That<br /><em style={{ color: "var(--gold)" }}>Remember.</em></h1>
          <p className="artisans-subtitle">
            Meet the custodians of tradition — master artisans whose work doesn't just decorate space,
            it carries the weight of generations.
          </p>
        </div>
      </section>

      <div className="artisan-grid">
        {ARTISANS.map((a, i) => (
          <ArtisanCard key={i} artisan={a} delay={i * 80} />
        ))}
      </div>

      <section className="artisan-quote-section" ref={quoteRef}>
        <div className={`reveal ${quoteVis ? "visible" : ""}`}>
          <SectionBadge label="ON CRAFT" />
          <p className="artisan-pullquote">
            "When I carve, I am not making an object. I am continuing a conversation that began with my ancestors
            and will outlast my grandchildren."
          </p>
          <p className="artisan-pullquote-attr">— KOFI ASANTE · MASTER CARVER · KUMASI</p>
        </div>
      </section>

      <section className="artisan-process" ref={processRef}>
        <div className={`reveal ${processVis ? "visible" : ""}`} style={{ opacity: 1, transform: "none" }}>
          <SectionBadge label="OUR PROCESS" />
          <h2 className="map-section-title" style={{ marginBottom: 0 }}>How We Work With Artisans</h2>
        </div>
        <div className="process-grid">
          {PROCESS_STEPS.map((s, i) => (
            <div key={i} className="process-step">
              <div className="process-num">{s.n}</div>
              <div className="process-title">{s.title}</div>
              <div className="process-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="page-footer">
        <span>© 2025 ROOTS</span>
        <span>ARTISANS — THE HANDS BEHIND THE ART</span>
        <span>FAIR TRADE CERTIFIED</span>
      </footer>
    </div>
  );
}

function ArtisanCard({ artisan, delay }) {
  const [ref, vis] = useInView();
  return (
    <article ref={ref} className={`artisan-card reveal ${vis ? "visible" : ""}`} style={{ transitionDelay: `${delay}ms` }}>
      <div className="artisan-portrait">
        <div className="artisan-initials">{artisan.initials}</div>
        <div className="artisan-craft-badge">{artisan.craft}</div>
        <div className="artisan-years-badge">{artisan.years}</div>
      </div>
      <div className="artisan-body">
        <div className="artisan-name">{artisan.name}</div>
        <div className="artisan-location">{artisan.location}</div>
        <div className="artisan-bio">{artisan.bio}</div>
        <div className="artisan-pieces">
          {artisan.pieces.map(p => <span key={p} className="artisan-piece-tag">{p}</span>)}
        </div>
      </div>
    </article>
  );
}

export default ArtisansPage;

