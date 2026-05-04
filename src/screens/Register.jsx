import React, { useState } from "react";
import "./Register.css";
import { register, login } from "../services/api.js";

const INTERESTS = [
  "Jewelry", 
  "Fashion", 
  "Heritage Crafts", 
  "Gold Work", 
  "Cultural Artifacts", 
  "Handmade Accessories", 
  "Traditional Designs", 
  "Gemstones"
];

const Register = () => {
  const [step, setStep] = useState(1);
  const [chips, setChips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });
  const [focusedInput, setFocusedInput] = useState(null);

  const stepTitles = {
    1: "Begin your story with us",
    2: "Protect your heritage account",
    3: "Tell us what moves your soul"
  };

  const S = {
    fieldWrap: {
      display: "flex",
      flexDirection: "column",
      gap: "15px"
    },
    label: {
      display: "block",
      marginBottom: "5px",
      fontSize: "13px",
      color: "#c9a96a",
      fontWeight: "500"
    },
    btnRow: {
      display: "flex",
      gap: "10px",
      marginTop: "10px"
    },
    btnPrimary: {
      flex: 1,
      background: "linear-gradient(to bottom, #e0a12a, #C4861A)",
      color: "#2a1d00",
      border: "none",
      padding: "12px",
      borderRadius: "10px",
      fontWeight: "bold",
      cursor: "pointer",
      boxShadow: "inset 0 3px 6px rgba(255, 230, 150, 0.3), inset 0 -3px 6px rgba(90, 60, 0, 0.4), 0 4px 12px rgba(80, 50, 0, 0.4)"
    },
    btnSecondary: {
      flex: 1,
      background: "transparent",
      color: "rgba(245,230,211,0.5)",
      border: "1px solid rgba(196,134,26,0.25)",
      padding: "12px",
      borderRadius: "10px",
      fontWeight: "bold",
      cursor: "pointer"
    },
    strengthBar: {
      display: "flex",
      gap: "2px",
      marginTop: "8px"
    },
    strengthSegment: (active, score) => ({
      height: "4px",
      flex: 1,
      borderRadius: "2px",
      background: active ? "#c4861a" : score < 1 ? "rgba(255,80,80,0.3)" : "rgba(245,230,211,0.3)"
    }),
    strengthLabel: {
      marginTop: "5px",
      fontSize: "13px",
      color: "#c9a96a"
    },
    hint: {
      margin: "0 0 15px 0",
      fontSize: "14px",
      color: "#c9a96a",
      fontStyle: "italic"
    },
    chipsWrap: {
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      margin: "15px 0"
    },
    chip: (isActive) => ({
      padding: "8px 12px",
      borderRadius: "20px",
      fontSize: "13px",
      cursor: "pointer",
      border: "1px solid rgba(196,134,26,0.2)",
      background: "#2a2222",
      color: "#f5e6d3",
      transition: "all 0.2s",
      ...(isActive && {
        background: "linear-gradient(to bottom, #e0a12a, #C4861A)",
        color: "#2a1d00",
        fontWeight: "bold",
        borderColor: "#c4861a",
        boxShadow: "inset 0 2px 4px rgba(255, 230, 150, 0.3), 0 2px 6px rgba(80, 50, 0, 0.4)"
      })
    })
  };

  const inputStyle = (field) => ({
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    outline: "none",
    background: "#2a2222",
    color: "#fff",
    fontSize: "14px",
    marginBottom: "10px",
    boxShadow: focusedInput === field 
      ? "0 0 0 2px #c4861a" 
      : "none"
  });

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(prev => Math.min(prev + 1, 3));
  };

  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleChip = (chip) => {
    setChips(prev =>
      prev.includes(chip)
        ? prev.filter(c => c !== chip)
        : [...prev, chip]
    );
  };

  // =========================
  // VALIDATION
  // =========================
  const validateStep1 = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("Name is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError("Invalid email");
      return false;
    }
    setError("");
    return true;
  };

  const validateStep2 = () => {
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    setError("");
    return true;
  };

  // =========================
  // PASSWORD STRENGTH
  // =========================
  const getPasswordStrength = () => {
    let score = 0;
    if (form.password.length >= 8) score++;
    if (/[A-Z]/.test(form.password)) score++;
    if (/[0-9]/.test(form.password)) score++;
    if (/[^A-Za-z0-9]/.test(form.password)) score++;

    const labels = ["Too weak", "Fair", "Good", "Strong"];
    return { score, label: labels[score - 1] || "Enter password" };
  };

  const pw = getPasswordStrength();

  // =========================
  // REGISTER & AUTO-LOGIN
  // =========================
  const handleSubmit = async () => {
    if (chips.length === 0) {
      setError("Select at least one interest");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await register(form.email, form.password, `${form.firstName} ${form.lastName}`, chips);
      
      // Auto-login
      await login(form.email, form.password);
      
      // Redirect to landing
      window.location.href = "/";
      
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-lp">
          {/* Progress */}
          <div className="progress-wrap">
            <span>Step {step} of 3</span>
          </div>

          <h2>{stepTitles[step]}</h2>

          {error && <div className="error">{error}</div>}

          {/* STEP 1: Identity */}
          {step === 1 && (
            <div style={S.fieldWrap}>
              <div>
                <label style={S.label}>First Name</label>
                <input
                  name="firstName"
                  placeholder="Amara"
                  value={form.firstName}
                  onChange={handleChange}
                  style={inputStyle("firstName")}
                  onFocus={() => setFocusedInput("firstName")}
                  onBlur={() => setFocusedInput(null)}
                />
              </div>
              <div>
                <label style={S.label}>Last Name</label>
                <input
                  name="lastName"
                  placeholder="Osei"
                  value={form.lastName}
                  onChange={handleChange}
                  style={inputStyle("lastName")}
                  onFocus={() => setFocusedInput("lastName")}
                  onBlur={() => setFocusedInput(null)}
                />
              </div>
              <div>
                <label style={S.label}>Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  style={inputStyle("email")}
                  onFocus={() => setFocusedInput("email")}
                  onBlur={() => setFocusedInput(null)}
                />
              </div>
              <div style={S.btnRow}>
                <button
                  style={S.btnPrimary}
                  onClick={handleNext}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Security */}
          {step === 2 && (
            <div style={S.fieldWrap}>
              <div>
                <label style={S.label}>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  style={inputStyle("password")}
                  onFocus={() => setFocusedInput("password")}
                  onBlur={() => setFocusedInput(null)}
                />
                {/* Strength bar */}
                <div style={S.strengthBar}>
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} style={S.strengthSegment(pw.score >= n, pw.score)} />
                  ))}
                </div>
                {pw.label && <div style={S.strengthLabel}>{pw.label}</div>}
              </div>
              <div style={S.btnRow}>
                <button
                  style={S.btnSecondary}
                  onClick={handleBack}
                >
                  ← Back
                </button>
                <button
                  style={S.btnPrimary}
                  onClick={handleNext}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Interests */}
          {step === 3 && (
            <>
              <p style={S.hint}>Select all that interest you — you can change this later.</p>
              <div style={S.chipsWrap}>
                {INTERESTS.map(chip => (
                  <div
                    key={chip}
                    style={S.chip(chips.includes(chip))}
                    onClick={() => toggleChip(chip)}
                  >
                    {chip}
                  </div>
                ))}
              </div>
              <div style={S.btnRow}>
                <button
                  style={S.btnSecondary}
                  onClick={handleBack}
                >
                  ← Back
                </button>
                <button
                  style={{ 
                    ...S.btnPrimary, 
                    opacity: loading ? 0.6 : 1, 
                    cursor: loading ? "not-allowed" : "pointer" 
                  }}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Creating…" : "Create Account"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;

