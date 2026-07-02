import React, { useMemo } from "react";
import { useAuth } from "../context/auth-context.js";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../hooks/useProfile.js";
import "./ProfilePage.css";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const {
    profile,
    form,
    loadingProfile,
    saving,
    profileError,
    saveError,
    validationErrors,
    saved,
    handleChange,
    handleSubmit,
    refetchProfile,
  } = useProfile();

  const derivedNameRaw = user?.name || user?.full_name || "";
  const derivedName = derivedNameRaw && derivedNameRaw.toLowerCase() !== "guest" ? derivedNameRaw : "Your Profile";

  const initials = useMemo(() => {
    return derivedName
      ?.trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [derivedName]);

  return (
    <div className="page-shell">
      <div className="page-container">

        {/* Back */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        {/* Hero card */}
        <div className="profile-hero">
          <div className="profile-hero-bg" />
          <div className="avatar-ring">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="avatar-img" />
            ) : (
              <span className="avatar-initials">{initials}</span>
            )}
          </div>
          <div className="profile-hero-info">
            <h1 className="hero-name">{derivedName}</h1>
            <p className="hero-email">{user?.email}</p>
            <span className="hero-badge">Member</span>
          </div>
        </div>

        {/* Edit form */}
        <div className="card">
          <h2 className="card-title">Edit Profile</h2>
          <form className="profile-form" onSubmit={handleSubmit}>
            {loadingProfile ? (
              <p className="form-error">Loading profile…</p>
            ) : profileError ? (
              <p className="form-error">{profileError}</p>
            ) : null}

            {Object.keys(validationErrors).length > 0 && (
              <p className="form-error">Please fix the errors below</p>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  disabled={loadingProfile}
                />
                {validationErrors.name && (
                  <span className="field-error">{validationErrors.name}</span>
                )}
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  disabled={loadingProfile}
                />
                {validationErrors.email && (
                  <span className="field-error">{validationErrors.email}</span>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+1 555 000 0000"
                  disabled={loadingProfile}
                />
                {validationErrors.phone && (
                  <span className="field-error">{validationErrors.phone}</span>
                )}
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                  disabled={loadingProfile}
                />
                {validationErrors.location && (
                  <span className="field-error">{validationErrors.location}</span>
                )}
              </div>
            </div>
            <div className="form-group full">
              <label>Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={3}
                placeholder="Tell us a little about yourself…"
                disabled={loadingProfile}
              />
              {validationErrors.bio && (
                <span className="field-error">{validationErrors.bio}</span>
              )}
            </div>
            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={saving || loadingProfile}
              >
                {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Changes"}
              </button>
            </div>

            {saveError && <p className="form-error">{saveError}</p>}
          </form>
        </div>

        {/* Stats row (no mock data) */}
        <div className="stats-row">
          {[
            { label: "Orders", value: user?.orders_count },
            { label: "Wishlist", value: user?.wishlist_count },
            { label: "Reviews", value: user?.reviews_count },
          ].map((s) => (
            <div className="stat-card" key={s.label}>
              <span className="stat-value">{typeof s.value === "number" ? s.value : "—"}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Sign out */}
        <button
          className="signout-btn"
          onClick={() => { logout(); navigate("/"); }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 21 19 21H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 17L15 12M15 12L10 7M15 12H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Sign Out
        </button>

      </div>
    </div>
  );
}