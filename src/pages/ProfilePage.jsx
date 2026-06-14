import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const derivedNameRaw = user?.name || user?.full_name || "";
  const derivedName = derivedNameRaw && derivedNameRaw.toLowerCase() !== "guest" ? derivedNameRaw : "Your Profile";


  const initials = useMemo(() => {
    return derivedName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [derivedName]);

  const [form, setForm] = useState({
    name: derivedName,

    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
    bio: user?.bio || "",
  });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      // Refresh the base fields when auth user changes
      setForm((prev) => ({
        ...prev,
        name: derivedName,
        email: user?.email || prev.email,
      }));

      // Load extended profile fields (phone/location/bio, etc.)
      try {
        setLoadingProfile(true);
        setProfileError(null);

        const res = await api.get("/api/user/profile/me");
        const profile = res?.data || {};

        if (!isMounted) return;

        setForm({
          name: profile.name ?? derivedName,
          email: profile.email ?? user?.email ?? "",
          phone: profile.phone ?? "",
          location: profile.location ?? "",
          bio: profile.bio ?? "",
        });
      } catch (err) {
        if (isMounted) {
          setProfileError(
            err?.response?.data?.message || err?.message || "Failed to load profile"
          );
        }
      } finally {
        if (isMounted) {
          setLoadingProfile(false);
        }
      }

    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [derivedName, user?.email]);

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveError(null);

      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        location: form.location,
        bio: form.bio,
      };

      await api.put("/api/user/profile/me", payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err?.response?.data?.message || err?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

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
          <form className="profile-form" onSubmit={handleSave}>
            {loadingProfile ? (
              <p className="form-error">Loading profile…</p>
            ) : profileError ? (
              <p className="form-error">{profileError}</p>
            ) : null}
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 555 000 0000" />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input name="location" value={form.location} onChange={handleChange} placeholder="City, Country" />
              </div>
            </div>
            <div className="form-group full">
              <label>Bio</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} placeholder="Tell us a little about yourself…" />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Changes"}
              </button>
            </div>

            {saveError ? <p className="form-error">{saveError}</p> : null}
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
            <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 17L15 12M15 12L10 7M15 12H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Sign Out
        </button>

      </div>
    </div>
  );
}