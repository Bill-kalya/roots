import './VerifyEmail.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { toast } from 'sonner';
import apiClient from '../lib/apiClient.js';

function getTokenFromQuery(search) {
  const params = new URLSearchParams(search);
  return params.get('token');
}

const VerifyEmail = () => {
  const location = useLocation();
  const token = useMemo(() => getTokenFromQuery(location.search), [location.search]);

  const calledRef = useRef(false);

  const missingToken = !token;

  // Derive initial state from missingToken so we don't setState in an effect
  const [status, setStatus] = useState(() => (missingToken ? 'error' : 'loading')); // loading | success | error
  const [message, setMessage] = useState(() => (missingToken ? 'Missing verification token.' : ''));
  const [errorKey, setErrorKey] = useState(() => (missingToken ? 'invalid' : null));

  useEffect(() => {
    if (missingToken) return;
    if (calledRef.current) return;
    calledRef.current = true;

    async function run() {
      setStatus('loading');
      setMessage('Verifying your email...');

      try {
        const res = await apiClient.get('/api/auth/verify-email', {
          params: { token },
        });

        setStatus('success');
        setMessage(res.data?.message || 'Email verified successfully.');
      } catch (err) {
        const detail = err?.response?.data?.detail || 'Verification failed.';

        let key = 'invalid';
        const lowered = String(detail).toLowerCase();
        if (lowered.includes('expired')) key = 'expired';
        else if (lowered.includes('already verified') || lowered.includes('already')) key = 'already_verified';
        else if (lowered.includes('invalid')) key = 'invalid';

        setErrorKey(key);
        setStatus('error');
        setMessage(detail);

        toast.error('Email verification failed');
      }
    }

    run();
  }, [token, missingToken]);

  const friendly = useMemo(() => {
    if (status === 'success') {
      return {
        title: 'Email verified ✅',
        body: message,
      };
    }

    if (status === 'error') {
      if (errorKey === 'expired') {
        return {
          title: 'Verification link expired',
          body: 'Your verification link has expired. Use the sign up flow again or contact support.',
        };
      }
      if (errorKey === 'already_verified') {
        return {
          title: 'Already verified',
          body: 'This email is already verified. You can log in now.',
        };
      }

      return {
        title: 'Invalid verification link',
        body: message || 'The verification token is invalid.',
      };
    }

    return {
      title: 'Verifying...',
      body: message,
    };
  }, [status, message, errorKey]);

  return (
    <div className="verify-email-page" role="main">
      <div className={`verify-email-card ${status}`}>
        <div className="verify-email-title">{friendly.title}</div>
        <div className="verify-email-body">{friendly.body}</div>

        <div className="verify-email-actions">
          {status === 'success' ? (
            <Link className="verify-email-link" to="/login">
              Go to Login
            </Link>
          ) : (
            <>
              <Link className="verify-email-link" to="/register">
                Back to Register
              </Link>
              <Link className="verify-email-link secondary" to="/login">
                Go to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;

