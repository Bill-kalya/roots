import React from "react";
import "./Footer.css";

const Footer = () => {
  const sections = [
    ["Collection", ["Masks", "Sculptures", "Textiles", "Jewelry", "Pottery"]],
    ["Company", ["About Us", "Our Artisans", "Provenance", "Blog", "Press"]],
    ["Support", ["Shipping", "Returns", "Care Guide", "FAQ", "Contact"]],
  ];

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-brand-row">
            <img src="/logo.png" alt="Roots Logo" style={{ width: 50 }} />
            <span className="footer-logo">ROOTS</span>
          </div>

          <p className="footer-desc">
            Connecting the world to Africa's living artistic heritage. One authentic piece at a time.
          </p>
        </div>

        {sections.map(([title, links]) => (
          <div key={title}>
            <div className="footer-col-title">{title.toUpperCase()}</div>

            {links.map((link) => (
              <div key={link} className="footer-link">
                <a href="#">{link}</a>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Roots African Art & Culture. All rights reserved.</span>
        <span>Made with ✦ across Africa</span>
      </div>
    </footer>
  );
};

export default Footer;
