import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../hooks/useSettings.js";
import "./SettingsPage.css";

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      className={`toggle ${checked ? "on" : ""}`}
      onClick={() => onChange(!checked)}
      type="button"
      aria-checked={checked}
      role="switch"
      disabled={disabled}
    >
      <span className="toggle-thumb" />
    </button>
  );
}

function SettingsSection({ title, children, error }) {
  return (
    <div className="settings-section">
      <h3 className="section-title">{title}</h3>
      <div className="section-rows">{children}</div>
      {error && <div className="section-error" role="alert">{error}</div>}
    </div>
  );
}

function SettingsRow({ label, description, children, disabled }) {
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
  const {
    settings,
    loading,
    fetchError,
    saving,
    saved,
    saveError,
    validationErrors,
    hasUnsavedChanges,
    deleteConfirm,
    setDeleteConfirm,
    deletePassword,
    setDeletePassword,
    deleteError,
    isDeleting,
    updateNotification,
    updatePrivacy,
    updatePreference,
    saveSettings,
    resetSettings,
    confirmDeleteAccount,
    cancelDeleteAccount,
    handleEnable2FA,
    enabling2FA,
  } = useSettings();

  const handleSave = useCallback(async () => {
    await saveSettings();
  }, [saveSettings]);

  const handleReset = useCallback(() => {
    if (window.confirm("Are you sure you want to reset all settings to defaults?")) {
      resetSettings();
    }
  }, [resetSettings]);

  const handleDeleteAccount = useCallback(async () => {
    await confirmDeleteAccount();
  }, [confirmDeleteAccount]);

  if (loading) {
    return (
      <div className="page-shell">
        <div className="page-container">
          <div className="loading-state">Loading settings...</div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="page-shell">
        <div className="page-container">
          <div className="error-state" role="alert">
            <p>Failed to load settings</p>
            <button className="btn-ghost-sm" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Saved indicator */}
        {saved && (
          <div className="saved-indicator" role="status" aria-live="polite">
            ✓ Settings saved
          </div>
        )}

        {/* Global save error */}
        {saveError && (
          <div className="global-error" role="alert">
            {saveError}
          </div>
        )}

        {/* Action buttons */}
        <div className="settings-actions">
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            className="btn-ghost-sm"
            onClick={handleReset}
            disabled={saving || !hasUnsavedChanges}
          >
            Reset to Defaults
          </button>
        </div>

        {/* Notifications */}
        <SettingsSection
          title="Notifications"
          error={validationErrors.notifications?.error}
        >
          <SettingsRow label="Order updates" description="Shipping and delivery status">
            <Toggle
              checked={settings.notifications.orderUpdates}
              onChange={() => updateNotification("orderUpdates", !settings.notifications.orderUpdates)}
              disabled={saving}
            />
          </SettingsRow>
          <SettingsRow label="Promotions" description="Deals, discounts, and seasonal sales">
            <Toggle
              checked={settings.notifications.promotions}
              onChange={() => updateNotification("promotions", !settings.notifications.promotions)}
              disabled={saving}
            />
          </SettingsRow>
          <SettingsRow label="New arrivals" description="Fresh items from our artisans">
            <Toggle
              checked={settings.notifications.newArrivals}
              onChange={() => updateNotification("newArrivals", !settings.notifications.newArrivals)}
              disabled={saving}
            />
          </SettingsRow>
          <SettingsRow label="Artisan stories" description="Behind the scenes from makers">
            <Toggle
              checked={settings.notifications.artisanStories}
              onChange={() => updateNotification("artisanStories", !settings.notifications.artisanStories)}
              disabled={saving}
            />
          </SettingsRow>
        </SettingsSection>

        {/* Preferences */}
        <SettingsSection title="Preferences">
          <SettingsRow label="Currency">
            <select
              className="settings-select"
              value={settings.currency}
              onChange={(e) => updatePreference("currency", e.target.value)}
              disabled={saving}
            >
              {["USD", "EUR", "GBP", "KES", "NGN", "ZAR"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </SettingsRow>
          <SettingsRow label="Language">
            <select
              className="settings-select"
              value={settings.language}
              onChange={(e) => updatePreference("language", e.target.value)}
              disabled={saving}
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="sw">Swahili</option>
              <option value="ar">العربية</option>
            </select>
          </SettingsRow>
          <SettingsRow label="Theme">
            <div className="theme-pills">
              {["dark", "light"].map((t) => (
                <button
                  key={t}
                  className={`theme-pill ${settings.theme === t ? "active" : ""}`}
                  onClick={() => updatePreference("theme", t)}
                  disabled={saving}
                >
                  {t === "dark" ? "🌙 Dark" : "☀️ Light"}
                </button>
              ))}
            </div>
          </SettingsRow>
        </SettingsSection>

        {/* Privacy */}
        <SettingsSection
          title="Privacy"
          error={validationErrors.privacy?.error}
        >
          <SettingsRow label="Public profile" description="Let others see your collection activity">
            <Toggle
              checked={settings.privacy.profileVisible}
              onChange={() => updatePrivacy("profileVisible", !settings.privacy.profileVisible)}
              disabled={saving}
            />
          </SettingsRow>
          <SettingsRow label="Analytics" description="Help us improve with anonymous data">
            <Toggle
              checked={settings.privacy.dataAnalytics}
              onChange={() => updatePrivacy("dataAnalytics", !settings.privacy.dataAnalytics)}
              disabled={saving}
            />
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
            <button
              className="btn-ghost-sm"
              onClick={handleEnable2FA}
              disabled={enabling2FA}
            >
              {enabling2FA ? 'Setting up...' : 'Enable →'}
            </button>
          </SettingsRow>
        </SettingsSection>

        {/* Danger zone */}
        <div className="danger-zone">
          <h3 className="danger-title">Danger Zone</h3>
          {!deleteConfirm ? (
            <button
              className="btn-danger"
              onClick={() => setDeleteConfirm(true)}
              disabled={saving}
            >
              Delete Account
            </button>
          ) : (
            <div className="delete-confirm">
              <p>Are you sure? This cannot be undone.</p>
              {deleteError && (
                <div className="delete-error" role="alert">{deleteError}</div>
              )}
              <div className="delete-actions">
                <button
                  className="btn-danger"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Yes, delete'}
                </button>

                <button
                  className="btn-ghost-sm"
                  onClick={cancelDeleteAccount}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
              </div>
              <div className="delete-password-field">
                <input
                  type="password"
                  placeholder="Enter your password to confirm"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  disabled={isDeleting}
                  onKeyDown={(e) => e.key === 'Enter' && handleDeleteAccount()}
                />
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}