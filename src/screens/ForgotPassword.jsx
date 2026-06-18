import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await api.post("/api/auth/forgot-password", { email });
      setSent(true);
    } catch {

      // Always show success to prevent email enumeration
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="forgot-page">
        <div className="forgot-card">
          <h2 className="forgot-title">Check your email</h2>
          <p className="forgot-subtitle">
            If an account exists for {email}, you will receive a password reset
            link shortly.
          </p>
          <button
            className="forgot-btn"
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
    <div className="forgot-page">
      <div className="forgot-card">
        <h2 className="forgot-title">Reset your password</h2>
        <p className="forgot-subtitle">Enter your email and we'll send you a reset link.</p>

        <form onSubmit={handleSubmit} className="forgot-form">
          <div className="field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="amara@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />
          </div>

          {error && <p className="forgot-error">{error}</p>}

          <button
            className="forgot-btn"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Sending…" : "Send Reset Link"}
          </button>
        </form>

        <button
          className="forgot-link"
          onClick={() => navigate("/login")}
          type="button"
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}

