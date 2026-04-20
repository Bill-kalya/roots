import './Login.css';
import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "/api/auth/login";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(API_URL, {
        email,
        password
      });

      const { access_token, refresh_token } = res.data;

      // =========================
      // TOKEN STORAGE STRATEGY
      // =========================

      if (rememberMe) {
        // persists even after closing browser
        localStorage.setItem("access_token", access_token);
      } else {
        // cleared on tab close (safer)
        sessionStorage.setItem("access_token", access_token);
      }

      // Store refresh token (better: HttpOnly cookie via backend)
      localStorage.setItem("refresh_token", refresh_token);

      // Redirect after login
      navigate("/dashboard");

    } catch (err) {
      setError(
        err.response?.data?.detail || "Login failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">

      {/* LEFT PANEL (unchanged UI) */}
      <div className="lp">
        <div className="brand">
          <div className="brand-orb">☥</div>
          <div className="brand-name">ROOTS</div>
          <div className="brand-tag">Heritage Collective</div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="rp">

        <div className="fh">
          <div className="fe">Welcome</div>
          <div className="ft">Sign <em>in to your account</em></div>
        </div>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit} className="form">

          <div className="ig">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="ig">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="opts">
            <label className="rem">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="fgot">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="sbtn" disabled={loading}>
            <span>{loading ? "Signing in..." : "Sign In"}</span>
          </button>

          <div className="sig">
            Don't have an account? <Link to="/register">Sign up</Link>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Login;