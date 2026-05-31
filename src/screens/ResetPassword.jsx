import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/api/auth/reset-password", {
        token,
        new_password: password,
      });
      setDone(true);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Reset link is invalid or has expired. Request a new one."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2 className="auth-title">Password updated</h2>
          <p className="auth-subtitle">Your password has been reset successfully.</p>
          <button
            className="auth-btn"
            onClick={() => navigate("/login")}
            type="button"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Set new password</h2>
        <p className="auth-subtitle">Choose a strong password for your account.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm"
              type="password"
              placeholder="Repeat your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-btn" type="submit" disabled={submitting}>
            {submitting ? "Updating…" : "Reset Password"}
          </button>
        </form>

        <button
          className="auth-link"
          onClick={() => navigate("/login")}
          type="button"
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}

