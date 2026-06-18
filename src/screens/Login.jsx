import './Login.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, resendVerification } from '../services/api.js';
import { useAuth } from '../context/auth-context.js';
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

  // Email verification gate UX
  const [verifyEmailMode, setVerifyEmailMode] = useState(false);
  const [verifyEmailBusy, setVerifyEmailBusy] = useState(false);
  const [verifyEmailMessage, setVerifyEmailMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login(email, password, rememberMe);

      // MFA required — redirect to challenge screen
      if (res?.requires_mfa) {
        const challenge_id = res?.challenge_id;
        navigate('/login/mfa', {
          state: { email, password, rememberMe, challenge_id },
        });
        return;
      }

      // Sync AuthContext with the new token (tokens are persisted by services/api.js login)
      syncUser();

      // Role-based redirect based on decoded token
      const accessToken = tokenStore.getAccess();
      const role = accessToken
        ? JSON.parse(
            atob(accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
          )?.role
        : 'USER';

      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'MERCHANT') navigate('/merchant');
      else navigate('/');
    } catch (err) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail || err?.message;
      const lowered = String(detail || '').toLowerCase();

      // Backend email-gate guard
      const needsVerification =
        status === 401 &&
        (lowered.includes('verify') || lowered.includes('verification')) &&
        lowered.includes('email');

      if (needsVerification) {
        setVerifyEmailMode(true);
        setError('');
        setVerifyEmailMessage(
          'Please verify your email before logging in. Check your inbox for the verification link.'
        );
        return;
      }

      setError(detail || 'Login failed. Try again.');
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

        {verifyEmailMode ? (
          <div className="verify-email-inline" role="status" aria-live="polite">
            <div className="fe">Verify your email</div>
            <div className="ft">{verifyEmailMessage}</div>

            <button
              type="button"
              className="sbtn"
              disabled={verifyEmailBusy}
              onClick={async () => {
                setVerifyEmailBusy(true);
                setVerifyEmailMessage('Sending a new verification email...');
                setError('');

                try {
                  await resendVerification();
                  setVerifyEmailMessage(
                    'Verification email resent. Please check your inbox.'
                  );
                } catch (e) {
                  const detail = e?.response?.data?.detail || e?.message;
                  setVerifyEmailMessage(detail || 'Could not resend verification.');
                } finally {
                  setVerifyEmailBusy(false);
                }
              }}
            >
              {verifyEmailBusy ? 'Resending…' : 'Resend verification'}
            </button>

            <div className="sig">
              <Link to="/register">Back to Register</Link> •{' '}
              <Link to="/login">Try signing in again</Link>
            </div>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default Login;

