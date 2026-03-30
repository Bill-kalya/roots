import React, { useState, useEffect } from "react";
import logo from "../assets/roots.png";
import COLORS from "../components/Colors";
import Button from "../components/Button";
import "./Nav.css";
import Cart from "./Cart";

function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav className={`nav ${scrolled ? "nav-scrolled" : ""}`}>
      {/* Logo */}
      <div className="nav-logo">
        <img src={logo} alt="Roots Logo" className="logo-img" />
        <span className="logo-text" style={{ color: COLORS.cream }}>
          ROOTS
        </span>
      </div>

      {/* Nav Links as Buttons */}
      <div className="nav-links">
        {["Collection", "Origins", "Artisans", "About"].map((label) => (
          <Button key={label}>{label}</Button> 
        ))}
      </div>

      {/* Shop Now Button */}
      <div className="nav-right">   
      <Cart>Shop Now</Cart>
    </div>
    </nav>
  );
}

export default Nav;
