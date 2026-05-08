import './LoginMfaChallenge.css';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { validatePassword, login } from '../services/api';
import apiClient from '../lib/apiClient.js';

const getFromLocation = (location) => location?.state || {};

const LoginMfaChallenge = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = getFromLocation(location);

  const [mfaCode, setMfaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const backendRequiresMfaDetails = useMemo(() => {
    // We do not have MFA endpoints in backend routes provided.
    // This screen exists to provide UX scaffolding; it will display a clear message.
    return state;
  }, [state]);

  useEffect(() => {
    if (!backendRequiresMfaDetails || Object.keys(backendRequiresMfaDetails).length === 0) {
      toast.error('MFA challenge data missing. Please sign in again.');
    }
  }, [backendRequiresMfaDetails]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Step 2: POST /api/auth/login/verify-mfa
      // Backend contract: { email, password, mfa_code }
      const payload = {
        email: state?.email,
        password: state?.password,
        mfa_code: mfaCode,
      };

      const res = await apiClient.post('/api/auth/login/verify-mfa', payload);
      const { access_token, refresh_token } = res.data || {};

      if (access_token) localStorage.setItem('access_token', access_token);
      if (refresh_token) localStorage.setItem('refresh_token', refresh_token);

      toast.success('MFA verified');
      navigate('/dashboard');
    } catch (err) {
      const detail = err?.response?.data?.detail || 'Invalid MFA code.';
      setError(detail);
      toast.error('Invalid MFA code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-mfa-page" role="main">
      <div className="login-mfa-card">
        <div className="login-mfa-title">Multi-Factor Authentication</div>
        <div className="login-mfa-body">
          Enter the 6-digit code from your authenticator app to continue.
        </div>

        {error && <div className="login-mfa-error">{error}</div>}

        <form className="login-mfa-form" onSubmit={handleSubmit}>
          <label className="login-mfa-label">TOTP code</label>
          <input
            className="login-mfa-input"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            inputMode="numeric"
            placeholder="e.g., 123456"
            required
          />

          <button className="login-mfa-submit" type="submit" disabled={loading}>
            {loading ? 'Verifying…' : 'Verify & Sign In'}
          </button>
        </form>

        <div className="login-mfa-footer">
          <button
            className="login-mfa-link"
            type="button"
            onClick={() => navigate('/login')}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginMfaChallenge;

