import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';


// ═══════════════════════════════════════════════════════════
// ABOUT PAGE
// ═══════════════════════════════════════════════════════════
const VALUES = [
  { icon: "🌍", name: "Authenticity", desc: "Every piece comes with documented provenance tracing its origin, maker, and cultural context." },
  { icon: "🤝", name: "Fairness", desc: "Artisans set their own prices. We take no more than 15%. Their community prospers first." },
  { icon: "📜", name: "Preservation", desc: "We document endangered techniques, creating archives that outlast the objects themselves." },
  { icon: "✈️", name: "Access", desc: "We bring the rarest works from the most remote communities to collectors worldwide." },
];
 
const TEAM = [
  { photo: "/daviso.jpeg", initials: "CD", name: "Carter Dave", role: "Founder & CEO", bio: "Former Art Enthusiasit and Collector, Carter founded Roots after witnessing how little of the art's value reached its makers." },
  { initials: "DM", name: "Domnic Murray", role: "Head of Curation", bio: "An art historian specialising in West African material culture, Domnic has authenticated over 3,000 pieces across 15 countries." },
  { initials: "EK", name: "Edward Kiprotich", role: "Artisan Relations", bio: "Born in the interior of Kenya, Edward manages relationships with 200+ artisan cooperatives across East Africa." },
  { initials: "SL", name: "Sara Lindqvist", role: "Conservation", bio: "A trained conservator from the Rijksmuseum, Sara ensures every piece is preserved for centuries to come." },
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
import './About.css';

export default function AboutPage() {
  const navigate = useNavigate();
  const [heroRef, heroVis] = useReveal();

  const [splitRef, splitVis] = useReveal();
  const [valuesRef, valuesVis] = useReveal();
  const [teamRef, teamVis] = useReveal();
  const [ctaRef, ctaVis] = useReveal();
 
  return (
    <div className="page">
      <section className="about-hero">
        <div ref={heroRef} className={`reveal ${heroVis ? "visible" : ""}`}>
          <div className="about-our-story-cta">
            <button type="button" className="about-our-story-btn" onClick={() => navigate('/about')}>OUR STORY</button>
          </div>
          <h1 className="about-title">Art Is Not<br /><em style={{ color: "var(--gold)" }}>Decoration.</em><br />It Is Memory.</h1>

          <p className="about-subtitle" style={{ marginTop: 24 }}>
            Roots was founded on a simple belief: that the people who create the world's most powerful art
            should be the ones who benefit most from its existence.
          </p>
        </div>
      </section>
 
      <section className="about-split" ref={splitRef}>
        <div className={`about-visual reveal-left ${splitVis ? "visible" : ""}`}>
          <div className="about-logo-ring">
            <span className="about-logo-letter">R</span>
          </div>
          <p className="about-mission-text">
            "To make the world's rarest African art accessible to those who will love it most —
            while ensuring those who made it are honoured and sustained."
          </p>
          <div style={{ display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap" }}>
            {[["2018", "Founded"], ["28", "Countries"], ["500+", "Artisans"]].map(([n, l]) => (
              <div key={l} className="stat-item" style={{ textAlign: "center" }}>
                <div className="num" style={{ fontSize: 28 }}>{n}</div>
                <div className="lbl">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className={`about-content reveal-right ${splitVis ? "visible" : ""}`}>
          <h2>Why We Started</h2>
          <p>
            In 2026, our founders Carter Dave and Domnic Murray was cataloguing a collection at auction and realised that a Ghanaian
            Ashanti seat fetching £40,000 had been acquired from its maker for less than £200. The artisan —
            a master carver with forty years of skill — had received less than 0.5% of its market value.
          </p>
          <p>
            That moment of clarity became Roots. Not another gallery, not another middleman — a direct bridge
            between maker and collector, with radical transparency at every step.
          </p>
          <p>
            Today, our artisans earn on average 6.4x what they received through traditional channels.
            We share our full pricing model publicly. We believe in showing our working.
          </p>
        </div>
      </section>
 
      <section className="about-values" ref={valuesRef}>
        <div className={`reveal ${valuesVis ? "visible" : ""}`}>
          <h2 className="values-title">What We Stand For</h2>
        </div>
        <div className="values-grid">
          {VALUES.map((v, i) => (
            <div key={i} className={`value-card reveal ${valuesVis ? "visible" : ""}`} style={{ transitionDelay: `${i * 100}ms` }}>
              <span className="value-icon">{v.icon}</span>
              <div className="value-name">{v.name}</div>
              <div className="value-desc">{v.desc}</div>
            </div>
          ))}
        </div>
      </section>
 
      <section className="about-team" ref={teamRef}>
        <div className={`reveal ${teamVis ? "visible" : ""}`}>
          <Badge label="THE TEAM" />
          <h2 className="team-title">The People Behind Roots</h2>
        </div>
        <div className="team-grid">
          {TEAM.map((m, i) => (
            <div key={i} className={`team-member reveal ${teamVis ? "visible" : ""}`} style={{ transitionDelay: `${i * 120}ms` }}>
              <div className={`team-avatar${m.photo ? ' has-photo' : ''}`}>
            {m.photo ? <img src={m.photo} alt={m.name} /> : m.initials}
          </div>
              <div className="team-name">{m.name}</div>
              <div className="team-role">{m.role}</div>
              <div className="team-bio">{m.bio}</div>
            </div>
          ))}
        </div>
      </section>
 
      <section className="about-cta" ref={ctaRef}>
        <div className={`reveal ${ctaVis ? "visible" : ""}`}>
          <Badge label="JOIN US" />
          <h2 className="cta-title">Start Your Collection</h2>
          <p className="cta-sub">Every purchase directly sustains an artisan family and preserves a living tradition.</p>
          <button
            type="button"
            className="cta-btn"
            onClick={() =>
              navigate('/', { state: { scrollToCollection: true, scrollToTop: true } })
            }
          >
            EXPLORE THE COLLECTION
          </button>


        </div>
      </section>
 
      <Footer />
    </div>
  );
}
 