import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import COLORS from "../components/Colors";
import Button from "../components/Button";
import "./Nav.css";
import Cart from "./Cart";
import CartDrawer from "./CartDrawer";


/* ---------------- Basket Icon ---------------- */
const BasketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 128 128">
    <rect width="128" height="128" fill="none"/>
    <path fill="#a15d38" d="M92.25 43.43s3.5-9.84 6.82-13.94s7.73-7.48 12.86-8.73c-3.54-4.08-13.67-6.2-20.92 1.56s-9.39 19.31-9.39 19.31z"/>
    <path fill="#f7a54b" d="M104.07 15.02s11.9 1.27 16.29 8.73c2.9 4.93 4.62 15.72.85 28.42c-3.65 12.31-1.91 2.69-1.91 2.69l-9.4-5.22s5.17-19.69 1.92-26.41c-3.56-7.38-10.54-6.8-10.54-6.8z"/>
    <path fill="#a15d38" d="M19.96 35.4c-1-13.92 3.34-14.59 5.58-16.65c-5.21-3.06-11.09-1.19-13.63.81C6.33 23.95 11 46.4 11 46.4l10.1-4.13c-.01 0-.99-4.74-1.14-6.87"/>
    <path fill="#894f36" d="m15.84 51.28l-9.17-1.11l10 55.76c0 9.98 20.95 18.06 46.79 18.06s46.79-8.09 46.79-18.06l9.05-55.38z"/>
    <path fill="#e39744" d="m34.73 67.23l2.67 52.81c.01.79-.75 1.35-1.5 1.12l-2.68-.8a1.51 1.51 0 0 1-1.07-1.4l-4.02-52.67zm24.22 2.59l1.92 53.63c.01.6.5 1.09 1.1 1.09l3.76.05c.6 0 1.08-.49 1.09-1.09l-.19-53.69h-7.68z"/>
    <path fill="#ce843a" d="m90.13 120.07l.65-51.51l7.3-1.33l-2.88 51.97c-.02.42-.3.78-.71.9l-3.08.94c-.64.19-1.28-.3-1.28-.97M13.4 63.47l7.64 50.2c.07.48.34.9.74 1.16l2.16 1.41a.738.738 0 0 0 1.14-.68L20.5 65.34z"/>
    <path fill="#e39744" d="m51.79 69.82l.31 53.21c-.02.41-.39.72-.8.67l-4.14-.42a.7.7 0 0 1-.6-.69l-2.27-52.77z"/>
    <path fill="#ce843a" d="m75.41 68.56l1.3 54.32c.01.51.45.89.95.82l4.07-.55c.41-.05.71-.4.73-.81l.47-55.12zm31.29-2.67l-5.43 50.25c-.06.53.75.53 1.21.26l1.75-1.05c.22-.13.37-.35.41-.61L112.32 64z"/>
    <path fill="#ffba5f" d="M28.9 74.3c.03.59-.57 1-1.11 1.01c-2.25.06-5.41.01-10.93-1.83c-3.13-1.04-5.08-2.21-6.25-3.34c-1.07-1.03-1.36-2.35-1.39-2.92c-.03-.71-.34-4.07-.31-5.42l19.7 7.35c.08 1.77.29 5.15.29 5.15m30.36 4.08c0 .59-.71 1.21-1.27 1.41c-1.73.64-6.23 1.59-11.99.99c-5.26-.55-7.97-1.92-9.73-3.02c-.56-.35-.95-.97-.98-1.56l-.2-4.46l24.14 2.59c.02 1.79.02 2.27.03 4.05m31.32-2.42c-.03.59-.41 1.21-.98 1.56c-1.76 1.11-3.88 2.43-9.12 3.17c-5.24.73-11.23.04-12.96-.58c-.55-.2-1.25-.91-1.25-1.51c.01-1.79.07-2.62.08-4.41l24.41-2.69c.02 0-.1 2.68-.18 4.46m26.89-11.73c-.04.99-.11 1.98-.22 2.96c-.05.47-.13.98-.46 1.31c-.45.44-3.49 3.09-7.59 4.56c-5.32 1.91-8.83 2.48-10.52 2.33c-.54-.05-1.03-.48-1-1.07c.08-1.43.11-2.37.18-3.57z"/>
    <path fill="#f7a54b" d="M5.9 60.13L3.46 49.39h120l-2.44 10.74c0 7.53-25.77 13.63-57.56 13.63S5.9 67.66 5.9 60.13"/>
    <ellipse cx="63.46" cy="49.39" fill="#ffcc80" rx="60" ry="11.92"/>
    <ellipse cx="63.46" cy="47.68" fill="#784d30" rx="49.46" ry="7.68"/>
    <path fill="#ffcc80" d="M58.03 72.78s.67 2.55-10.72 2.44c-3.84-.04-5.89-1.18-6.98-4.22c-6.15-17.13-11.02-34.77-13.77-41.06c-5.12-11.72-15.39-11.51-15.39-11.51c1.28-1.13 5.06-2.33 6.36-2.46c4.74-.48 11.36-1.51 17.07 2.78c8.05 6.05 20.3 52.11 20.57 52.75c.28.64 2.38.75 2.86 1.28"/>
    <path fill="none" stroke="#ffcc80" strokeMiterlimit="10" strokeWidth="3.027" d="M82.01 39.28c0-.21 6.31-22.05 19.26-22.85c18.03-1.13 10.66 27.44 10.66 27.44"/>
  </svg>
);

/* ---------------- Basket Button ---------------- */
const BasketButton = ({ onClick, count }) => (
  <button className="basket-btn" onClick={onClick}>
    <BasketIcon />
    {count > 0 && <span className="basket-count">{count}</span>}
  </button>
);

/* ---------------- Nav Component ---------------- */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [basketCount, setBasketCount] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);

  const navigate = useNavigate(); // 👈 navigation hook

  const cartItems = [
    { name: "Wooden Mask", price: 2500, image: `${import.meta.env.BASE_URL}roots.png` },
    { name: "Tribal Necklace", price: 1800, image: `${import.meta.env.BASE_URL}roots.png` }
  ];

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <nav className={`nav ${scrolled ? "nav-scrolled" : ""}`}>
        {/* Logo */}
        <div className="nav-logo">
          <img src={`${import.meta.env.BASE_URL}roots.png`} alt="Roots Logo" className="logo-img" />
          <span className="logo-text" style={{ color: COLORS.cream }}>
            ROOTS
          </span>
        </div>

        {/* Nav Links */}
        <div className="nav-links">
          {["Collection", "Origins", "Artisans", "About"].map((label) => (
            <Button key={label}>{label}</Button>
          ))}
        </div>

        {/* Right Side */}
        <div className="nav-right">
          <BasketButton
            count={basketCount}
            onClick={() => setCartOpen(true)}
          />

          <Cart>Shop Now</Cart>
        </div>
      </nav>
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
      />
    </>
  );
}

export default Nav;
