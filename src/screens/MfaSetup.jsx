import './LoginMfaChallenge.css';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import apiClient from '../lib/apiClient.js';

const MfaSetup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [qrCode, setQrCode] = useState('');
  const [provisioningUri, setProvisioningUri] = useState('');
  const [secret, setSecret] = useState('');

  const [code, setCode] = useState('');

  const accessToken = localStorage.getItem('access_token');

  useEffect(() => {
    if (!accessToken) {
      toast.error('Please sign in to enable MFA.');
      window.location.href = '/login';
      return;
    }

    const runSetup = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiClient.post(
          '/api/auth/mfa/setup',
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = res.data || {};
        setSecret(data.secret || '');
        setProvisioningUri(data.provisioning_uri || '');
        setQrCode(data.qr_code || '');
      } catch (err) {
        const detail = err?.response?.data?.detail || 'Failed to load MFA setup.';
        setError(detail);
        toast.error(detail);
      } finally {
        setLoading(false);
      }
    };

    runSetup();
  }, [accessToken]);

  const handleEnroll = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await apiClient.post(
        '/api/auth/mfa/verify-enroll',
        { code },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = res.data || {};
      if (data?.success) {
        toast.success('MFA enabled successfully.');
        window.location.href = '/dashboard';
      } else {
        const detail = data?.detail || 'Failed to enable MFA.';
        setError(detail);
        toast.error(detail);
      }
    } catch (err) {
      const detail = err?.response?.data?.detail || 'Invalid enrollment code.';
      setError(detail);
      toast.error(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-mfa-page" role="main">
      <div className="login-mfa-card">
        <div className="login-mfa-title">Enable Multi-Factor Authentication</div>
        <div className="login-mfa-body">
          Scan the QR code with your authenticator app, then enter the 6-digit code to verify.
        </div>

        {error && <div className="login-mfa-error">{error}</div>}

        {loading ? null : qrCode || provisioningUri ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            {qrCode ? (
              <img
                src={qrCode}
                alt="MFA QR Code"
                style={{ width: 220, height: 220, objectFit: 'contain', alignSelf: 'center' }}
              />
            ) : null}

            {provisioningUri ? (
              <div style={{ color: '#c9a96a', fontSize: 12, wordBreak: 'break-word', textAlign: 'center' }}>
                provisioning_uri: {provisioningUri}
              </div>
            ) : null}

            {secret ? (
              <div style={{ color: '#c9a96a', fontSize: 12, wordBreak: 'break-word', textAlign: 'center' }}>
                secret: {secret}
              </div>
            ) : null}
          </div>
        ) : null}

        <form className="login-mfa-form" onSubmit={handleEnroll}>
          <label className="login-mfa-label">Enrollment code</label>
          <input
            className="login-mfa-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode="numeric"
            placeholder="e.g., 123456"
            required
          />

          <button className="login-mfa-submit" type="submit" disabled={loading}>
            {loading ? 'Verifying8…' : 'Enable MFA'}
          </button>
        </form>

        <div className="login-mfa-footer">
          <button
            className="login-mfa-link"
            type="button"
            onClick={() => (window.location.href = '/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default MfaSetup;

