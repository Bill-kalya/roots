import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../contexts/CartContext.jsx";

import COLORS from "./Colors";
import Button from "./Button";
import Search from "./Search";
import "./Nav.css";
import CartDrawer from "./CartDrawer";

function ProfileWrapper({ user, logout, navigate }) {

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="profile-wrapper" ref={profileRef}>
      <button
        className="profile-trigger"
        onClick={() => setProfileOpen((prev) => !prev)}
        aria-expanded={profileOpen}
        aria-label="Profile menu"
        type="button"
      >
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="profile-avatar" />
        ) : (
          <span className="profile-initials">{initials}</span>
        )}
        <span className="profile-name">{user.name?.split(" ")[0]}</span>
        <svg
          className={`profile-chevron ${profileOpen ? "open" : ""}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 4L6 8L10 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {profileOpen && (
        <div className="profile-dropdown">
          <div className="profile-dropdown-header">
            <span className="dropdown-name">{user.name}</span>
            <span className="dropdown-email">{user.email}</span>
          </div>
          <div className="profile-dropdown-divider" />

          <button
            className="dropdown-item"
            type="button"
            onClick={() => {
              navigate("/profile");
              setProfileOpen(false);
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M3 22C3 17.0294 7.02944 13 12 13C16.9706 13 21 17.0294 21 22"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            My Profile
          </button>

          <button
            className="dropdown-item"
            type="button"
            onClick={() => {
              navigate("/orders");
              setProfileOpen(false);
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 5.55228 9.44772 6 10 6H14C14.5523 6 15 5.55228 15 5M9 5C9 4.44772 9.44772 4 10 4H14C14.5523 4 15 4.44772 15 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M9 12H15M9 16H12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            My Orders
          </button>

          <button
            className="dropdown-item"
            type="button"
            onClick={() => {
              navigate("/settings");
              setProfileOpen(false);
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M19.4 15C19.1277 15.6171 19.2583 16.3378 19.73 16.82L19.79 16.88C20.1656 17.2551 20.3766 17.7642 20.3766 18.295C20.3766 18.8258 20.1656 19.3349 19.79 19.71C19.4149 20.0856 18.9058 20.2966 18.375 20.2966C17.8442 20.2966 17.3351 20.0856 16.96 19.71L16.9 19.65C16.4178 19.1783 15.6971 19.0477 15.08 19.32C14.4755 19.5791 14.0826 20.1724 14.08 20.83V21C14.08 22.1046 13.1846 23 12.08 23C10.9754 23 10.08 22.1046 10.08 21V20.91C10.0642 20.2327 9.63587 19.6339 9 19.4C8.38291 19.1277 7.66219 19.2583 7.18 19.73L7.12 19.79C6.74485 20.1656 6.23582 20.3766 5.705 20.3766C5.17418 20.3766 4.66515 20.1656 4.29 19.79C3.91435 19.4149 3.70343 18.9058 3.70343 18.375C3.70343 17.8442 3.91435 17.3351 4.29 16.96L4.35 16.9C4.82167 16.4178 4.95231 15.6971 4.68 15.08C4.42093 14.4755 3.82764 14.0826 3.17 14.08H3C1.89543 14.08 1 13.1846 1 12.08C1 10.9754 1.89543 10.08 3 10.08H3.09C3.76733 10.0642 4.36613 9.63587 4.6 9C4.87231 8.38291 4.74167 7.66219 4.27 7.18L4.21 7.12C3.83435 6.74485 3.62343 6.23582 3.62343 5.705C3.62343 5.17418 3.83435 4.66515 4.21 4.29C4.58515 3.91435 5.09418 3.70343 5.625 3.70343C6.15582 3.70343 6.66485 3.91435 7.04 4.29L7.1 4.35C7.58219 4.82167 8.30291 4.95231 8.92 4.68H9C9.60447 4.42093 9.99738 3.82764 10 3.17V3C10 1.89543 10.8954 1 12 1C13.1046 1 14 1.89543 14 3V3.09C14.0026 3.74764 14.3955 4.34093 15 4.6C15.6171 4.87231 16.3378 4.74167 16.82 4.27L16.88 4.21C17.2551 3.83435 17.7642 3.62343 18.295 3.62343C18.8258 3.62343 19.3349 3.83435 19.71 4.21C20.0856 4.58515 20.2966 5.09418 20.2966 5.625C20.2966 6.15582 20.0856 6.66485 19.71 7.04L19.65 7.1C19.1783 7.58219 19.0477 8.30291 19.32 8.92V9C19.5791 9.60447 20.1724 9.99738 20.83 10H21C22.1046 10 23 10.8954 23 12C23 13.1046 22.1046 14 21 14H20.91C20.2524 14.0026 19.6591 14.3955 19.4 15Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            Settings
          </button>

          <div className="profile-dropdown-divider" />

          <button
            className="dropdown-item dropdown-item--logout"
            type="button"
            onClick={() => {
              logout();
              setProfileOpen(false);
              navigate("/");
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 17L15 12M15 12L10 7M15 12H3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

function Nav() {
  const { user, logout } = useAuth();
  const { itemCount: basketCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);



  const toggleMenu = () => setMenuOpen(prev => !prev);


  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigate = useNavigate();
  
const handleCollectionClick = (e) => {
    e.preventDefault();
    navigate('/');
  };

  const handleArtisansClick = (e) => {
    e.preventDefault();
    navigate('/artisans');
  };

  const handleOriginsClick = (e) => {
    e.preventDefault();
    navigate('/origins');
  };

  const handleAboutClick = (e) => {
    e.preventDefault();
    navigate('/about');
  };

  const toggleCart = () => setCartOpen(prev => !prev);

  return (
    <>
      <nav className={`nav ${scrolled ? "nav-scrolled" : ""}`}>
        <div className="nav-logo">
          <img src={`${import.meta.env.BASE_URL}roots.png`} alt="Roots Logo" className="logo-img" />
          <span className="logo-text" style={{ color: COLORS.cream }}>
            ROOTS
          </span>
        </div>

        <div className="nav-links">
          {["Collection", "Origins", "Artisans", "About"].map((label) => (
            <Button 
              key={label} 
              onClick={
                label === "Collection" ? handleCollectionClick : 
                label === "Artisans" ? handleArtisansClick :
                label === "Origins" ? handleOriginsClick :
                label === "About" ? handleAboutClick :
                undefined
              }
            >
              {label}
            </Button>
          ))}
        </div>

        <div className="nav-right">
          <button className="menu-toggle" onClick={toggleMenu}>
            ☰
          </button>
          <Search value={searchQuery} onChange={setSearchQuery} placeholder="Search collection..." />
          <button className="basket-btn" onClick={toggleCart}>
            <span className="basket-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 128 128"
              >
                <rect width="128" height="128" fill="none"/>
                <path fill="#a15d38" d="M92.25 43.43s3.5-9.84 6.82-13.94s7.73-7.48 12.86-8.73c-3.54-4.08-13.67-6.2-20.92 1.56s-9.39 19.31-9.39 19.31z"/>
                <path fill="#f7a54b" d="M104.07 15.02s11.9 1.27 16.29 8.73c2.9 4.93 4.62 15.72.85 28.42c-3.65 12.31-1.91 2.69-1.91 2.69l-9.4-5.22s5.17-19.69 1.92-26.41c-3.56-7.38-10.54-6.8-10.54-6.8z"/>
                <path fill="#a15d38" d="M19.96 35.4c-1-13.92 3.34-14.59 5.58-16.65c-5.21-3.06-11.09-1.19-13.63.81C6.33 23.95 11 46.4 11 46.4l10.1-4.13c-.01 0-.99-4.74-1.14-6.87"/>
                <path fill="#894f36" d="m15.84 51.28l-9.17-1.11l10 55.76c0 9.98 20.95 18.06 46.79 18.06s46.79-8.09 46.79-18.06l9.05-55.38z"/>
                <path fill="#e39744" d="m34.73 67.23l2.67 52.81c.01.79-.75 1.35-1.5 1.12l-2.68-.8a1.51 1.51 0 0 1-1.07-1.4l-4.02-52.67zm24.22 2.59l1.92 53.63c.01.6.5 1.09 1.1 1.09l3.76.05c.6 0 1.08-.49 1.09-1.09l-.19-53.69h-7.68z"/>
                <path fill="#ce843a" d="m90.13 120.07l.65-51.51l7.3-1.33l-2.88 51.97c-.02.42-.3.78-.71.9l-3.08.94c-.64.19-1.28-.3-1.28-.97M13.4 63.47l7.64 50.2c.07.48.34.9.74 1.16l2.16 1.41a.738.738 0 0 0 1.14-.68L20.5 65.34z"/>
                <path fill="#e39744" d="m51.79 69.82l.31 53.21c-.02.41-.39.72-.8.67l-4.14-.42a.7.7 0 0 1-0.6-.69l-2.27-52.77z"/>
                <path fill="#ce843a" d="m75.41 68.56l1.3 54.32c.01.51.45.89.95.82l4.07-.55c.41-.05.71-.4.73-.81l.47-55.12zm31.29-2.67l-5.43 50.25c-.06.53.75.53 1.21.26l1.75-1.05c.22-.13.37-.35.41-.61L112.32 64z"/>
                <path fill="#ffba5f" d="M28.9 74.3c.03.59-.57 1-1.11 1.01c-2.25.06-5.41.01-10.93-1.83c-3.13-1.04-5.08-2.21-6.25-3.34c-1.07-1.03-1.36-2.35-1.39-2.92c-.03-.71-.34-4.07-.31-5.42l19.7 7.35c.08 1.77.29 5.15.29 5.15m30.36 4.08c0 .59-.71 1.21-1.27 1.41c-1.73.64-6.23 1.59-11.99.99c-5.26-.55-7.97-1.92-9.73-3.02c-.56-.35-.95-.97-.98-1.56l-.2-4.46l24.14 2.59c.02 1.79.02 2.27.03 4.05m31.32-2.42c-.03.59-.41 1.21-.98 1.56c-1.76 1.11-3.88 2.43-9.12 3.17c-5.24.73-11.23.04-12.96-.58c-.55-.2-1.25-.91-1.25-1.51c.01-1.79.07-2.62.08-4.41l24.41-2.69c.02 0-.1 2.68-.18 4.46m26.89-11.73c-.04.99-.11 1.98-.22 2.96c-.05.47-.13.98-.46 1.31c-.45.44-3.49 3.09-7.59 4.56c-5.32 1.91-8.83 2.48-10.52 2.33c-.54-.05-1.03-.48-1-1.07c.08-1.43.11-2.37.18-3.57z"/>
                <path fill="#ffd58a" d="M60.01 99.47c.03.59-.39 1.15-.96 1.37c-1.78.71-6.48 1.83-11.97 1.34c-5.5-.49-7.81-2.12-9.69-3.15c-.6-.33-1.12-1.03-1.17-1.62l-.26-4.83c-.08-.92.64-1.23 1.63-.86c2.18.81 4.1 1.85 8.95 2.27s9.17.09 11.28-.36c.96-.20 1.99.53 2.04 1.45z"/>
                <path fill="#ffba5f" d="M90.4 96.88c-.03.59-.41 1.57-1.5 2.27c-1.81 1.17-4.22 2.26-9.69 2.99c-5.47.74-10.15-.26-11.95-.88c-.58-.20-.96-.72-.95-1.31c.01-1.79.01-2.68.02-4.46c0-.92.92-1.64 1.88-1.48c2.13.35 6.39.57 11.22-.07s7.04-1.72 9.18-2.63c.97-.41 1.85.06 1.80.98zM114 86.43c-.27 2.26-.50 3.38-1.29 4.08c0 0-1.72 2-5.53 3.41c-2.91 1.08-8.84 2.48-9.89 2.15c-.46-.15-.78-.46-.75-1.05c.09-1.78.13-2.67.22-4.46c.05-.92.86-1.87 1.67-1.96c1.93-.22 7.32-1.80 8.75-2.47c3.06-1.44 5.84-3.32 5.84-3.32c.52-.35.88-.16.98.14c.28.84.12 2.49 0 3.48"/>
                <path fill="#ffd58a" d="M60.73 120.32c0 .59-.45 1.37-1.57 1.46c0 0-4.61.74-10.68.09c-5.54-.59-9.97-2.79-9.97-2.79c-.84-.48-1.24-1.12-1.27-1.71l-.19-4.72c-.04-.92.69-1.37 1.62-.96c2.06.90 5.17 1.99 9.80 2.48c5.38.57 8.42.40 9.83.38s2.20.31 2.24 1.39z"/>
                <path fill="#ffba5f" d="M90.16 117.28c-.03.59-.45 1.17-1.01 1.53c-1.76 1.11-4.80 2.64-10.03 3.38s-9.86 0-11.59-.63c-.55-.20-.91-.72-.91-1.31c.01-1.79.01-2.68.02-4.46c0-.92.88-1.64 1.80-1.48c2.03.35 6.28.31 10.89-.33s7.02-1.64 9.07-2.55c.93-.41 1.85.05 1.81.97zm19.87-14.38c.52-.27 1.01.05.99.74c-.04 1.62-.30 3.78-1.99 5.68c-.79.89-5.95 6.02-12.82 6.51c-.81.06-.75-1.31-.75-1.31l.21-3.74c.05-.92.68-1.75 1.75-1.96c.99-.20 3.85-.92 7.34-2.59c1.67-.81 3.01-2.13 5.27-3.33"/>
                <path fill="#ffd58a" d="M45.20 87.94c.05.59-.36 1.23-1.17 1.43c-1.68.41-6.85.35-12.07-.79s-8.85-4.03-8.85-4.03c-.58-.40-.92-.97-1.00-1.55l-.45-4.94c-.10-1.09.96-.87 1.90-.38c2.09 1.06 2.93 1.77 7.53 2.74c4.60 0.99 10.19 1.69 12.17 1.50c.90-.09 1.71.35 1.82 1.51c.09 1.80 .08 2.42 .16 4.20m30.77 0.85c0 .75-.87 1.25-1.46 1.53c-1.84.87-5.72 2.09-11.25 2.09c-5.52 0-9.3-1.22-11.13-2.09c-.59-.28-1.46-.78-1.46-1.53v-4.21c0-.92.87-1.58 1.75-1.32c1.97.58 6.1 1.47 10.84 1.47s8.87-.89 10.84-1.47c.88-.26 1.75.4 1.75 1.32z"/>
              </svg>
            </span>
            {basketCount > 0 && (
              <span className="basket-count">{basketCount}</span>
            )}
          </button>
          {user ? (
            <ProfileWrapper
              user={user}
              logout={logout}
              navigate={navigate}
            />
          ) : (
            <Button
              className="shop-now-btn"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <rect width="24" height="24" fill="none" />
                  <path
                    fill="#fff"
                    fillRule="evenodd"
                    d="M12 4a8 8 0 0 0-6.96 11.947A4.99 4.99 0 0 1 9 14h6a4.99 4.99 0 0 1 3.96 1.947A8 8 0 0 0 12 4m7.943 14.076q.188-.245.36-.502A9.96 9.96 0 0 0 22 12c0-5.523-4.477-10-10-10S2 6.477 2 12a9.96 9.96 0 0 0 2.057 6.076l-.005.018l.355.413A9.98 9.98 0 0 0 12 22q.324 0 .644-.02a9.95 9.95 0 0 0 5.031-1.745a10 10 0 0 0 1.918-1.728l.355-.413zM12 6a3 3 0 1 0 0 6a3 3 0 0 0 0-6"
                    clipRule="evenodd"
                  />
                </svg>
              }
              onClick={() => navigate('/login')}
            >
              Shop Now
            </Button>
          )}
        </div>

      </nav>

      {menuOpen && (
        <div className="mobile-menu">
          {["Collection", "Origins", "Artisans", "About"].map((label) => (
            <Button 
              key={label}
              onClick={(e) => {
                (label === "Collection" ? handleCollectionClick : 
                 label === "Artisans" ? handleArtisansClick :
                 label === "Origins" ? handleOriginsClick :
                 label === "About" ? handleAboutClick : undefined)(e);
                setMenuOpen(false);
              }}
            >
              {label}
            </Button>
          ))}
        </div>
      )}

      <CartDrawer isOpen={cartOpen} onClose={toggleCart} />
    </>
  );
}

export default Nav;

