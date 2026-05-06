import Footer from '../components/Footer';
// ═══════════════════════════════════════════════════════════
// ORIGINS PAGE
// ═══════════════════════════════════════════════════════════
const REGIONS = [
  { id: "gh", flag: "🇬🇭", name: "Ghana", craft: "Kente & Masks", dot: { top: "42%", left: "28%" }, desc: "Home to the Ashanti kingdom's master carvers and Kente weavers of the Volta region. Ghana's artisan heritage spans over 400 years of unbroken tradition." },
  { id: "ng", flag: "🇳🇬", name: "Nigeria", craft: "Benin Bronzes", dot: { top: "44%", left: "35%" }, desc: "The Benin kingdom perfected lost-wax bronze casting centuries before European contact. Each sculpture carries royal iconography passed down through generations." },
  { id: "et", flag: "🇪🇹", name: "Ethiopia", craft: "Coptic Textiles", dot: { top: "36%", left: "58%" }, desc: "Ethiopia's weavers create intricate Coptic crosses and ceremonial robes using techniques unchanged since the 4th century." },
  { id: "ke", flag: "🇰🇪", name: "Kenya", craft: "Maasai Beadwork", dot: { top: "47%", left: "60%" }, desc: "Maasai beadwork is a living language — each colour and pattern communicates age, status, and clan identity across generations." },
  { id: "za", flag: "🇿🇦", name: "South Africa", craft: "Ndebele Murals", dot: { top: "72%", left: "50%" }, desc: "Ndebele women transform homestead walls into geometric masterpieces, each pattern a unique family signature recognised across communities." },
];
 
const TIMELINE = [
  { year: "3000 BCE", event: "Ancient Egyptians pioneer goldsmithing, setting foundations for sub-Saharan metal work traditions." },
  { year: "900 CE", event: "Benin kingdom artisans develop lost-wax bronze casting, creating works of unparalleled sophistication." },
  { year: "1400s", event: "Kente weaving emerges among Ashanti royalty in Ghana, each colour carrying divine meaning." },
  { year: "1800s", event: "Colonial disruption fragments trade networks, forcing artisan communities underground to preserve traditions." },
  { year: "1960s", event: "African independence movements spark cultural renaissance — traditional crafts reclaim their dignity." },
  { year: "Today", event: "Roots connects master artisans directly with a global audience, ensuring traditions thrive for generations." },
];
 
function useReveal(threshold = 0.1) {
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

function Badge({ label }) {
  return (
    <div className="section-badge">
      <div className="section-badge-line" />
      <span>{label}</span>
      <div className="section-badge-line" />
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import './Origins.css';

export default function OriginsPage() {
  const [activeRegion, setActiveRegion] = useState("gh");
  const [heroRef, heroVis] = useReveal();
  const [mapRef, mapVis] = useReveal();
  const [tlRef, tlVis] = useReveal();
  const active = REGIONS.find(r => r.id === activeRegion);
 
  return (
    <div className="page">
      {/* Hero */}
      <section className="origins-hero">
        <div className="origins-hero-bg">
          <div className="origins-orb" style={{ width: 400, height: 400, right: -100, top: -100 }} />
          <div className="origins-orb" style={{ width: 200, height: 200, left: 100, bottom: 0 }} />
        </div>
        <div ref={heroRef} className={`reveal ${heroVis ? "visible" : ""}`}>
          <Badge label="THE CONTINENT" />
          <h1 className="origins-title">Where<br /><em style={{ color: "var(--gold)" }}>It Begins.</em></h1>
          <p className="origins-subtitle">
            Every piece in our collection traces its roots to a specific village, a specific hand,
            a specific lineage stretching back centuries across the African continent.
          </p>
          <div className="origins-stat-bar">
            {[["28", "Countries"], ["500+", "Artisans"], ["4,000+", "Years of Heritage"], ["100%", "Provenance Certified"]].map(([n, l]) => (
              <div key={l} className="stat-item"><div className="num">{n}</div><div className="lbl">{l}</div></div>
            ))}
          </div>
        </div>
      </section>
 
      {/* Map */}
      <section className="origins-map-section">
        <div className="map-grid" ref={mapRef}>
          <div className={`reveal-left ${mapVis ? "visible" : ""}`}>
            <div className="map-visual">
              <div className="map-africa">
                <svg viewBox="0 0 260 320" style={{ width: "100%", height: "100%", opacity: 0.25 }}>
                  <path d="M130 20 C80 20 40 50 30 90 C20 130 25 160 20 200 C15 240 30 270 60 290 C90 310 110 300 130 300 C150 300 170 310 200 290 C230 270 245 240 240 200 C235 160 240 130 230 90 C220 50 180 20 130 20Z" fill="var(--gold)" />
                </svg>
                {REGIONS.map(r => (
                  <div key={r.id} style={{ position: "absolute", ...r.dot }}>
                    <div className={`region-dot ${activeRegion === r.id ? "active" : ""}`} onClick={() => setActiveRegion(r.id)} />
                    <div className="region-label" style={{ top: -18, left: 14 }}>{r.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className={`map-info reveal-right ${mapVis ? "visible" : ""}`}>
            <Badge label="SOURCE REGIONS" />
            <h2 className="map-section-title">Across the Continent</h2>
            <p className="map-desc">{active.desc}</p>
            <div className="region-list">
              {REGIONS.map(r => (
                <div key={r.id} className={`region-item ${activeRegion === r.id ? "active" : ""}`} onClick={() => setActiveRegion(r.id)}>
                  <span className="region-flag">{r.flag}</span>
                  <div>
                    <div className="region-name">{r.name}</div>
                    <div className="region-craft">{r.craft}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
 
      {/* Timeline */}
      <section className="origins-timeline" ref={tlRef}>
        <div className={`reveal ${tlVis ? "visible" : ""}`}>
          <h2 className="timeline-title">A Living Heritage</h2>
        </div>
        <div className="timeline">
          {TIMELINE.map((item, i) => (
            <div key={i} className="timeline-item">
              <div className="timeline-left">
                {i % 2 === 0 && <><div className="timeline-year">{item.year}</div><div className="timeline-event">{item.event}</div></>}
              </div>
              <div className="timeline-center"><div className="timeline-dot" /></div>
              <div className="timeline-right">
                {i % 2 !== 0 && <><div className="timeline-year">{item.year}</div><div className="timeline-event">{item.event}</div></>}
              </div>
            </div>
          ))}
        </div>
      </section>
 
   
        <span>ORIGINS — THE STORY OF WHERE</span>
      <Footer />
    </div>

  );
}
 