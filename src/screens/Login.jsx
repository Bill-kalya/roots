import './Login.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { tokenStore } from '../lib/tokenStore.js';


const Login = () => {
  const navigate = useNavigate();
  const { syncUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login(email, password, rememberMe);


      // MFA required — redirect to challenge screen
      if (res?.requires_mfa) {
        navigate('/login/mfa', { state: { email, password, rememberMe } });
        return;
      }

      // Sync AuthContext with the new token (tokens are persisted by services/api.js login)
      syncUser();

      // Role-based redirect based on decoded token inside AuthContext
      const accessToken = tokenStore.getAccess();
      const role = accessToken
        ? JSON.parse(
            atob(accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
          )?.role
        : 'USER';


      if (role === 'ADMIN') {
        navigate('/admin');
      } else if (role === 'MERCHANT') {
        navigate('/merchant');
      } else {
        navigate('/');
      }


    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-card">
      {/* LEFT PANEL */}
      <div className="login-lp">
        <div className="brand">
          <div className="brand-orb">
            <img
              src={`${import.meta.env.BASE_URL}roots.png`}
              alt="Roots Logo"
              className="logo-img"
            />
          </div>
          <div className="brand-name">ROOTS</div>
          <div className="brand-tag">Heritage Collective</div>
          <div className="brand-desc">
            "When the roots are deep, there is no reason to fear the wind."
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="rp">
        <div className="fh">
          <div className="fe">Karibu Tena</div>
          <div className="ft">
            Sign <em>in to your account</em>
          </div>
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
            <div className="pw-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
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
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
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

