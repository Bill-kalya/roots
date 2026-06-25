import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import './merchant.css';

import {
  getMerchantPayoutSettings,
  updateMerchantPayoutSettings,
} from '../services/api';

const PAYMENT_METHOD_LABELS = {
  MPESA: 'M-PESA',
  PAYPAL: 'PayPal',
  STRIPE: 'Stripe',
};

const getDefaultMethod = (methods) => {
  if (!Array.isArray(methods) || methods.length === 0) return 'MPESA';
  return methods[0];
};

export default function MerchantPayoutSettings() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [payoutMethod, setPayoutMethod] = useState('MPESA');

  // M-PESA options
  const [mpesaMode, setMpesaMode] = useState('PHONE'); // 'PHONE' | 'TILL' | 'POCHI'
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [mpesaTillNumber, setMpesaTillNumber] = useState('');
  const [pochiPhone, setPochiPhone] = useState('');


  // Other payout options
  const [paypalEmail, setPaypalEmail] = useState('');
  const [stripeAccountId, setStripeAccountId] = useState('');

  const [isVerified, setIsVerified] = useState(false);
  const [supportedMethods, setSupportedMethods] = useState(['MPESA']);

  const canSave = useMemo(() => {
    if (!supportedMethods.includes(payoutMethod)) return false;

    if (payoutMethod === 'MPESA') {
      if (mpesaMode === 'TILL') return String(mpesaTillNumber || '').trim().length > 0;
      if (mpesaMode === 'POCHI') return String(pochiPhone || '').trim().length > 0;
      // default PHONE
      return String(mpesaPhone || '').trim().length > 0;
    }

    if (payoutMethod === 'PAYPAL') return String(paypalEmail || '').trim().length > 0;
    if (payoutMethod === 'STRIPE') return String(stripeAccountId || '').trim().length > 0;
    return true;
  }, [mpesaPhone, mpesaTillNumber, pochiPhone, paypalEmail, stripeAccountId, mpesaMode, payoutMethod, supportedMethods]);



  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMerchantPayoutSettings();
      const supported = Array.isArray(data?.supported_methods) ? data.supported_methods : ['MPESA'];

      setSupportedMethods(supported);
      setPayoutMethod(
        supported.includes(data?.payout_method)
          ? data.payout_method
          : getDefaultMethod(supported)
      );

      // M-PESA: PHONE | TILL | POCHI
      if (data?.mpesa_mode === 'TILL') setMpesaMode('TILL');
      else if (data?.mpesa_mode === 'POCHI') setMpesaMode('POCHI');
      else setMpesaMode('PHONE');

      setMpesaPhone(data?.mpesa_phone || '');
      setMpesaTillNumber(data?.mpesa_till_number || '');
      setPochiPhone(data?.pochi_phone || '');


      // Other methods
      setPaypalEmail(data?.paypal_email || '');
      setStripeAccountId(data?.stripe_account_id || '');
      setIsVerified(Boolean(data?.is_verified));
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.message || 'Failed to load payout settings';
      setError(msg);
      toast.error('Failed to load payout settings');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    if (!canSave) {
      toast.error('Please complete all required fields');
      return;
    }

    setSaving(true);
    try {
      const payload = { payout_method: payoutMethod };

      if (payoutMethod === 'MPESA') {
        payload.mpesa_mode = mpesaMode;
        payload.mpesa_phone = mpesaMode === 'PHONE' ? mpesaPhone : null;
        payload.mpesa_till_number = mpesaMode === 'TILL' ? mpesaTillNumber : null;
        payload.pochi_phone = mpesaMode === 'POCHI' ? pochiPhone : null;
      }




      if (payoutMethod === 'PAYPAL') {
        payload.paypal_email = paypalEmail;
      }
      if (payoutMethod === 'STRIPE') {
        payload.stripe_account_id = stripeAccountId;
      }

      await updateMerchantPayoutSettings(payload);

      toast.success('Payout settings saved');
      await load();
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.message || 'Failed to save payout settings';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="merchant-container">
        <div className="merchant-main">Loading payout settings…</div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <div className="merchant-container">
          <div className="merchant-main">
            <div className="error-banner">
              <div className="error-banner__message">{error}</div>
              <button className="btn btn-primary" onClick={() => load()}>
                Retry
              </button>
              <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginLeft: 10 }}>
                Back
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="merchant-container">
      <div className="merchant-main">
        <div className="merchant-header">
          <h1>Payout Settings</h1>
          <div className="merchant-header-actions">
            <button className="btn btn-ghost" onClick={() => navigate('/merchant')}>
              Back to dashboard
            </button>
          </div>
        </div>

        <div className="merchant-section">
          <h2>How you receive money</h2>

          <div className="form-group">
            <label>Payment method</label>
            <select
              value={payoutMethod}
              onChange={(e) => setPayoutMethod(e.target.value)}
              disabled={supportedMethods.length === 1}
            >
              {supportedMethods.map((method) => (
                <option key={method} value={method}>
                  {PAYMENT_METHOD_LABELS[method] || method}
                </option>
              ))}
            </select>
            <div style={{ marginTop: 8, color: '#D4B896', fontSize: 13 }}>
              Supported methods: {supportedMethods.join(', ')}
            </div>
          </div>

          {payoutMethod === 'MPESA' && (
            <div className="form-group">
              <label>M-PESA receiving option</label>

              <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="radio"
                    name="mpesaMode"
                    value="PHONE"
                    checked={mpesaMode === 'PHONE'}
                    onChange={() => setMpesaMode('PHONE')}
                  />
                  Phone number
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="radio"
                    name="mpesaMode"
                    value="TILL"
                    checked={mpesaMode === 'TILL'}
                    onChange={() => setMpesaMode('TILL')}
                  />
                  Till Number (Buy Goods)
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="radio"
                    name="mpesaMode"
                    value="POCHI"
                    checked={mpesaMode === 'POCHI'}
                    onChange={() => setMpesaMode('POCHI')}
                  />
                  Pochi la Biashara
                </label>
              </div>

              {mpesaMode === 'PHONE' && (
                <input
                  type="text"
                  placeholder="e.g., 2547XXXXXXXX"
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                />
              )}

              {mpesaMode === 'TILL' && (
                <input
                  type="text"
                  placeholder="e.g., 174379"
                  value={mpesaTillNumber}
                  onChange={(e) =>
                    setMpesaTillNumber(e.target.value.replace(/\D/g, '').slice(0, 10))
                  }
                  maxLength={10}
                />
              )}

              {mpesaMode === 'POCHI' && (
                <>
                  <input
                    type="text"
                    placeholder="e.g., 2547XXXXXXXX"
                    value={pochiPhone}
                    onChange={(e) => setPochiPhone(e.target.value)}
                  />
                  <small style={{ color: '#888' }}>
                    The phone number registered to your Pochi la Biashara account
                  </small>
                </>
              )}


              <div style={{ marginTop: 8, color: '#D4B896', fontSize: 13 }}>
                {isVerified ? 'Verified' : 'Not verified yet'}
              </div>
            </div>
          )}


          {payoutMethod === 'PAYPAL' && (
            <div className="form-group">
              <label>PayPal email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
              />
            </div>
          )}

          {payoutMethod === 'STRIPE' && (
            <div className="form-group">
              <label>Stripe account ID</label>
              <input
                type="text"
                placeholder="acct_..."
                value={stripeAccountId}
                onChange={(e) => setStripeAccountId(e.target.value)}
              />
            </div>
          )}

          <div className="modal-footer" style={{ borderTop: 'none', paddingLeft: 0, paddingRight: 0 }}>
            <button className="btn btn-ghost" onClick={() => load()} disabled={saving}>
              Reset
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving || !canSave}>
              {saving ? 'Saving…' : 'Save payout settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

