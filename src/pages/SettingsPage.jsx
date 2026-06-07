import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SettingsPage.css";

function Toggle({ checked, onChange }) {
  return (
    <button
      className={`toggle ${checked ? "on" : ""}`}
      onClick={() => onChange(!checked)}
      type="button"
      aria-checked={checked}
      role="switch"
    >
      <span className="toggle-thumb" />
    </button>
  );
}

function SettingsSection({ title, children }) {
  return (
    <div className="settings-section">
      <h3 className="section-title">{title}</h3>
      <div className="section-rows">{children}</div>
    </div>
  );
}

function SettingsRow({ label, description, children }) {
  return (
    <div className="settings-row">
      <div className="row-text">
        <span className="row-label">{label}</span>
        {description && <span className="row-desc">{description}</span>}
      </div>
      <div className="row-control">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();

  const [notifs, setNotifs] = useState({
    orderUpdates: true,
    promotions: false,
    newArrivals: true,
    artisanStories: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    dataAnalytics: true,
  });

  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("dark");

  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const toggle = (group, setter) => (key) => (val) =>
    setter(prev => ({ ...prev, [key]: val }));

  return (
    <div className="page-shell">
      <div className="page-container">

        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        <div className="page-header">
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your preferences and account</p>
        </div>

        {/* Notifications */}
        <SettingsSection title="Notifications">
          <SettingsRow label="Order updates" description="Shipping and delivery status">
            <Toggle checked={notifs.orderUpdates} onChange={toggle(notifs, setNotifs)("orderUpdates")} />
          </SettingsRow>
          <SettingsRow label="Promotions" description="Deals, discounts, and seasonal sales">
            <Toggle checked={notifs.promotions} onChange={toggle(notifs, setNotifs)("promotions")} />
          </SettingsRow>
          <SettingsRow label="New arrivals" description="Fresh items from our artisans">
            <Toggle checked={notifs.newArrivals} onChange={toggle(notifs, setNotifs)("newArrivals")} />
          </SettingsRow>
          <SettingsRow label="Artisan stories" description="Behind the scenes from makers">
            <Toggle checked={notifs.artisanStories} onChange={toggle(notifs, setNotifs)("artisanStories")} />
          </SettingsRow>
        </SettingsSection>

        {/* Preferences */}
        <SettingsSection title="Preferences">
          <SettingsRow label="Currency">
            <select
              className="settings-select"
              value={currency}
              onChange={e => setCurrency(e.target.value)}
            >
              {["USD", "EUR", "GBP", "KES", "NGN", "ZAR"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </SettingsRow>
          <SettingsRow label="Language">
            <select
              className="settings-select"
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="sw">Swahili</option>
              <option value="ar">العربية</option>
            </select>
          </SettingsRow>
          <SettingsRow label="Theme">
            <div className="theme-pills">
              {["dark", "light"].map(t => (
                <button
                  key={t}
                  className={`theme-pill ${theme === t ? "active" : ""}`}
                  onClick={() => setTheme(t)}
                >
                  {t === "dark" ? "🌙 Dark" : "☀️ Light"}
                </button>
              ))}
            </div>
          </SettingsRow>
        </SettingsSection>

        {/* Privacy */}
        <SettingsSection title="Privacy">
          <SettingsRow label="Public profile" description="Let others see your collection activity">
            <Toggle checked={privacy.profileVisible} onChange={toggle(privacy, setPrivacy)("profileVisible")} />
          </SettingsRow>
          <SettingsRow label="Analytics" description="Help us improve with anonymous data">
            <Toggle checked={privacy.dataAnalytics} onChange={toggle(privacy, setPrivacy)("dataAnalytics")} />
          </SettingsRow>
        </SettingsSection>

        {/* Security */}
        <SettingsSection title="Security">
          <SettingsRow label="Change password">
            <button className="btn-ghost-sm" onClick={() => navigate("/change-password")}>
              Update →
            </button>
          </SettingsRow>
          <SettingsRow label="Two-factor authentication" description="Add an extra layer of protection">
            <button className="btn-ghost-sm">Enable →</button>
          </SettingsRow>
        </SettingsSection>

        {/* Danger zone */}
        <div className="danger-zone">
          <h3 className="danger-title">Danger Zone</h3>
          {!deleteConfirm ? (
            <button className="btn-danger" onClick={() => setDeleteConfirm(true)}>
              Delete Account
            </button>
          ) : (
            <div className="delete-confirm">
              <p>Are you sure? This cannot be undone.</p>
              <div className="delete-actions">
                <button
                  className="btn-danger"
                  onClick={() => {
                    // No confirmed backend endpoint for deleting the current user account.
                    // Keep UI honest instead of claiming a success.
                    setDeleteConfirm(false);
                    window.alert("Account deletion is not available yet.");
                  }}
                >
                  Yes, delete
                </button>

                <button className="btn-ghost-sm" onClick={() => setDeleteConfirm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}