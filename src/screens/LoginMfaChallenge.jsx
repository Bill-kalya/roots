import './LoginMfaChallenge.css';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import {
  loginWithMfa,
  resendVerification,
  verifyMfaLogin,
} from '../services/api';

const getFromLocation = (location) => location?.state || {};

const LoginMfaChallenge = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = getFromLocation(location);

  const [mfaCode, setMfaCode] = useState('');
  const [challengeId, setChallengeId] = useState(state?.challenge_id || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [verifyEmailMode, setVerifyEmailMode] = useState(false);
  const [verifyEmailBusy, setVerifyEmailBusy] = useState(false);
  const [verifyEmailMessage, setVerifyEmailMessage] = useState(
    'Please verify your email before continuing.'
  );

  const backendRequiresMfaDetails = useMemo(() => {
    return state;
  }, [state]);

  useEffect(() => {
    if (
      !backendRequiresMfaDetails ||
      Object.keys(backendRequiresMfaDetails).length === 0
    ) {
      toast.error('MFA challenge data missing. Please sign in again.');
    }
  }, [backendRequiresMfaDetails]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Step 2: POST /api/auth/login/verify-mfa
      const payload = {
        email: state?.email,
        password: state?.password,
        challenge_id: challengeId,
        mfa_code: mfaCode,
      };

      const res = await verifyMfaLogin(payload);

      const access_token = res?.access_token;
      const refresh_token = res?.refresh_token;

      // verifyMfaLogin writes tokens via tokenStore.
      if (!access_token || !refresh_token) {
        // Some backends might only return access; still proceed to protected area.
      }

      toast.success('MFA verified');
      navigate('/');
    } catch (err) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail || 'Invalid MFA code.';

      // Spec: if step 2 fails (401/400), discard challenge_id and redo step 1
      if ((status === 400 || status === 401) && state?.email && state?.password) {
        try {
          const step1Res = await loginWithMfa(state.email, state.password, true);
          if (step1Res?.requires_mfa && step1Res?.challenge_id) {
            setChallengeId(step1Res.challenge_id);
            setError('MFA code expired. Enter your new code to continue.');
            toast.error('MFA expired. Please enter the fresh code.');
            return;
          }
        } catch {
          // fall through to show original detail
        }
      }

      // Backend email verification gate (if applicable)
      const lowered = String(detail || '').toLowerCase();
      const needsVerification =
        status === 401 &&
        (lowered.includes('verify') || lowered.includes('verification')) &&
        lowered.includes('email');

      if (needsVerification) {
        setVerifyEmailMode(true);
        setVerifyEmailMessage(
          'Please verify your email before continuing. Click “Resend verification” below.'
        );
        setError('');
        setChallengeId('');
        toast.error('Please verify your email');
        return;
      }

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
          {verifyEmailMode
            ? 'Verify your email to continue logging in.'
            : 'Enter the 6-digit code from your authenticator app to continue.'}
        </div>

        {verifyEmailMode ? (
          <>
            <div className="login-mfa-error">{verifyEmailMessage}</div>

            <button
              className="login-mfa-submit"
              type="button"
              disabled={verifyEmailBusy}
              onClick={async () => {
                setVerifyEmailBusy(true);
                setVerifyEmailMessage('Sending a new verification email...');
                try {
                  await resendVerification();
                  setVerifyEmailMessage(
                    'Verification email resent. Please check your inbox.'
                  );
                } catch (e) {
                  const d = e?.response?.data?.detail || e?.message;
                  setVerifyEmailMessage(d || 'Could not resend verification.');
                } finally {
                  setVerifyEmailBusy(false);
                }
              }}
            >
              {verifyEmailBusy ? 'Resending…' : 'Resend verification'}
            </button>

            <div className="login-mfa-footer">
              <button
                className="login-mfa-link"
                type="button"
                onClick={() => navigate('/login')}
              >
                Back to Login
              </button>
            </div>
          </>
        ) : (
          <>
            {error && <div className="login-mfa-error">{error}</div>}

            {!challengeId && (
              <div className="login-mfa-error">
                Missing challenge id. Please sign in again.
              </div>
            )}

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

              <button
                className="login-mfa-submit"
                type="submit"
                disabled={loading}
              >
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
          </>
        )}
      </div>
    </div>
  );
};

export default LoginMfaChallenge;

