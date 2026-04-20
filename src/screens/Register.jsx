import React, { useState } from "react";
import "./Register.css";

const API_URL = "http://localhost:8000/auth/register";

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

  const stepTitles = {
    1: { eye: "Your Identity", title: "Begin your story with us" },
    2: { eye: "Your Security", title: "Protect your heritage account" },
    3: { eye: "Your Passion", title: "Tell us what moves your soul" },
  };

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
    if (!form.firstName || !form.lastName) {
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
  // REGISTER (JWT FLOW)
  // =========================
  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          full_name: `${form.firstName} ${form.lastName}`,
          interests: chips
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Registration failed");
      }

      // OPTIONAL: auto-login after register
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password
        })
      });

      const loginData = await loginRes.json();

      // ✅ Store JWT securely
      localStorage.setItem("access_token", loginData.access_token);

      // Redirect
      window.location.href = "/dashboard";

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="card">

        <div className="lp">

          {/* Progress */}
          <div className="progress-wrap">
            <span>Step {step} of 3</span>
          </div>

          <h2>{stepTitles[step].title}</h2>

          {error && <div className="error">{error}</div>}

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <input name="firstName" placeholder="First Name" onChange={handleChange} />
              <input name="lastName" placeholder="Last Name" onChange={handleChange} />
              <input name="email" placeholder="Email" onChange={handleChange} />

              <button onClick={handleNext}>Continue →</button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
              />

              <div>{pw.label}</div>

              <button onClick={handleBack}>← Back</button>
              <button onClick={handleNext}>Continue →</button>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <div className="chips">
                {["Masks", "Textiles", "Jewellery", "Drums", "Paintings"].map(chip => (
                  <div
                    key={chip}
                    className={chips.includes(chip) ? "selected" : ""}
                    onClick={() => toggleChip(chip)}
                  >
                    {chip}
                  </div>
                ))}
              </div>

              <button onClick={handleBack}>← Back</button>
              <button onClick={handleSubmit} disabled={loading}>
                {loading ? "Creating..." : "Create Account"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Register;
