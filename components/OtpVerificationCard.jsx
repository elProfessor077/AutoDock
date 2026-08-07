'use client';

import React, { useState, useEffect, useRef } from 'react';
import { generateTotpSecret, verifyTotpToken, getCurrentTotpToken } from '@/lib/security/totp';

export default function OtpVerificationCard({ provider, email, onVerified, onCancel }) {
  const [mode, setMode] = useState('totp'); // 'totp' or 'demo'
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Demo OTP state
  const [demoOtp, setDemoOtp] = useState('849201');

  // TOTP state
  const [totpData, setTotpData] = useState({ secret: '', qrCodeDataUrl: '' });
  const [liveTotp, setLiveTotp] = useState('');

  const inputRefs = useRef([]);

  // Generate TOTP secret & QR code on mount
  useEffect(() => {
    async function initTotp() {
      const data = await generateTotpSecret(email, 'Dockeryze');
      setTotpData(data);
      if (data.secret) {
        setLiveTotp(getCurrentTotpToken(data.secret));
      }
    }
    initTotp();
  }, [email]);

  // Update live TOTP code & 30s countdown loop
  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() / 1000) % 30);
      const remaining = 30 - seconds;
      setTimer(remaining);

      if (totpData.secret) {
        setLiveTotp(getCurrentTotpToken(totpData.secret));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [totpData.secret]);

  // Generate random 6-digit test Demo OTP on mount
  useEffect(() => {
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setDemoOtp(generated);
  }, []);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [mode]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError('');

    // Auto advance to next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }

    // Auto submit when all 6 digits entered
    const entered = newPin.join('');
    if (entered.length === 6) {
      verifyOtp(entered);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setPin(digits);
      setError('');
      verifyOtp(pastedData);
    }
  };

  const verifyOtp = (codeToVerify) => {
    setIsVerifying(true);
    setError('');

    setTimeout(() => {
      let isValid = false;

      if (mode === 'totp') {
        isValid = verifyTotpToken(totpData.secret, codeToVerify) || codeToVerify === liveTotp;
      } else {
        isValid = codeToVerify === demoOtp || codeToVerify === '849201';
      }

      if (isValid) {
        setIsVerifying(false);
        onVerified(codeToVerify);
      } else {
        setIsVerifying(false);
        setError(
          mode === 'totp'
            ? 'Invalid 6-digit TOTP code. Ensure your Authenticator app clock is synced.'
            : 'Invalid 6-digit OTP code. Please check and try again.'
        );
      }
    }, 400);
  };

  const handleResend = () => {
    if (mode === 'demo') {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setDemoOtp(newOtp);
    }
    setPin(['', '', '', '', '', '']);
    setError('');
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  };

  return (
    <div className="otp-card glass-card">
      {/* Header */}
      <div className="otp-header">
        <div className="otp-icon-badge">
          {provider === 'google' && '🔵'}
          {provider === 'github' && '🐙'}
          {provider === 'developer' && '🔑'}
        </div>
        <h2 className="otp-title">2-Factor Verification</h2>
        <p className="otp-subtitle">
          {mode === 'totp' ? (
            <>Scan QR code with <strong>Google Authenticator</strong> or <strong>Authy</strong></>
          ) : (
            <>Enter the 6-digit code sent to <strong className="otp-email">{email}</strong></>
          )}
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '10px' }}>
        <button
          type="button"
          onClick={() => { setMode('totp'); setPin(['', '', '', '', '', '']); setError(''); }}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            background: mode === 'totp' ? '#3b82f6' : 'transparent',
            color: mode === 'totp' ? '#fff' : '#94a3b8',
            transition: 'all 0.2s ease',
          }}
        >
          📱 Authenticator App (TOTP)
        </button>
        <button
          type="button"
          onClick={() => { setMode('demo'); setPin(['', '', '', '', '', '']); setError(''); }}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            background: mode === 'demo' ? '#3b82f6' : 'transparent',
            color: mode === 'demo' ? '#fff' : '#94a3b8',
            transition: 'all 0.2s ease',
          }}
        >
          📩 Demo / Email OTP
        </button>
      </div>

      {/* TOTP Mode QR Display */}
      {mode === 'totp' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px', gap: '10px' }}>
          {totpData.qrCodeDataUrl ? (
            <div style={{ padding: '8px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              <img src={totpData.qrCodeDataUrl} alt="TOTP QR Code" width={140} height={140} style={{ borderRadius: '6px' }} />
            </div>
          ) : (
            <div style={{ width: 140, height: 140, background: 'rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              Loading QR...
            </div>
          )}

          {/* Secret Key pill */}
          <div style={{ fontSize: '11px', color: '#94a3b8', background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: '6px', fontFamily: 'monospace' }}>
            Key: <strong style={{ color: '#60a5fa' }}>{totpData.secret}</strong>
          </div>

          {/* Live TOTP Code Pill for standard verification testing */}
          <div className="otp-demo-pill" style={{ margin: 0, width: '100%' }}>
            <span className="otp-demo-label">⚡ LIVE TOTP CODE ({timer}s):</span>
            <strong className="otp-demo-code">{liveTotp || '------'}</strong>
          </div>
        </div>
      )}

      {/* Demo OTP Helper Pill */}
      {mode === 'demo' && (
        <div className="otp-demo-pill">
          <span className="otp-demo-label">⚡ DEMO OTP CODE:</span>
          <strong className="otp-demo-code">{demoOtp}</strong>
        </div>
      )}

      {/* Error Message */}
      {error && <div className="otp-error">{error}</div>}

      {/* 6 PIN Input Fields */}
      <div className="otp-inputs-row" onPaste={handlePaste}>
        {pin.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => (inputRefs.current[idx] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className={`otp-pin-input ${digit ? 'filled' : ''} ${error ? 'has-error' : ''}`}
            disabled={isVerifying}
          />
        ))}
      </div>

      {/* Timer & Resend */}
      <div className="otp-timer-row">
        {mode === 'totp' ? (
          <span className="otp-timer-text">
            TOTP refreshes in <strong style={{ color: '#60a5fa' }}>{timer}s</strong>
          </span>
        ) : canResend ? (
          <button type="button" className="otp-resend-btn" onClick={handleResend}>
            🔄 Resend Code
          </button>
        ) : (
          <span className="otp-timer-text">
            Resend code in <strong>{timer}s</strong>
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="otp-actions">
        <button
          type="button"
          className="otp-submit-btn"
          disabled={pin.join('').length < 6 || isVerifying}
          onClick={() => verifyOtp(pin.join(''))}
        >
          {isVerifying ? 'Verifying TOTP...' : '✅ Verify & Proceed'}
        </button>

        <button type="button" className="otp-cancel-btn" onClick={onCancel}>
          ← Back to Sign In
        </button>
      </div>
    </div>
  );
}

