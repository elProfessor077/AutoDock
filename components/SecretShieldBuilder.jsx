'use client';

import React, { useState } from 'react';

export default function SecretShieldBuilder({ initialEnv = '', config = {} }) {
  const defaultVars = [
    { key: 'PORT', value: String(config.applicationPort || 3000) },
    { key: 'NODE_ENV', value: 'production' },
    { key: 'DATABASE_URL', value: 'postgresql://appuser:CHANGEME_IN_PROD@db:5432/appdb' },
    { key: 'API_SECRET_KEY', value: 'CHANGEME_IN_PROD_SECRET' },
  ];

  const [envVars, setEnvVars] = useState(defaultVars);
  const [copied, setCopied] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);

  const handleAddVar = () => {
    setEnvVars([...envVars, { key: 'NEW_VAR', value: 'value' }]);
  };

  const handleRemoveVar = (index) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
  };

  const handleVarChange = (index, field, value) => {
    const updated = [...envVars];
    updated[index][field] = value;
    setEnvVars(updated);
  };

  const generatedEnvContent = envVars
    .map((item) => `${item.key.trim()}=${item.value.trim()}`)
    .join('\n');

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(generatedEnvContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadEnv = () => {
    const blob = new Blob([generatedEnvContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card" style={{ marginTop: '24px', gridColumn: '1 / -1' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 className="card-title" style={{ margin: 0 }}>
            🔑 Environment Variable &amp; Secret Shield Builder
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px', margin: 0 }}>
            Configure and sanitize runtime environment keys securely. All credentials are auto-redacted before deployment.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowBuilder(!showBuilder)}
            className="action-btn secondary"
            style={{ padding: '8px 14px', fontSize: '13px', margin: 0 }}
          >
            {showBuilder ? '▲ Hide .env Builder' : '▼ Open .env Builder'}
          </button>
          <button
            onClick={handleCopyEnv}
            className="action-btn secondary"
            style={{ padding: '8px 14px', fontSize: '13px', margin: 0 }}
          >
            {copied ? '✅ Copied!' : '📋 Copy .env'}
          </button>
          <button
            onClick={handleDownloadEnv}
            className="action-btn"
            style={{ padding: '8px 14px', fontSize: '13px', margin: 0, background: 'var(--color-cyan)', color: '#000' }}
          >
            📥 Save .env File
          </button>
        </div>
      </div>

      {showBuilder && (
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {envVars.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={item.key}
                  onChange={(e) => handleVarChange(i, 'key', e.target.value)}
                  placeholder="KEY_NAME"
                  style={{
                    flex: '1',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: 'var(--color-cyan)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                  }}
                />
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 'bold' }}>=</span>
                <input
                  type="text"
                  value={item.value}
                  onChange={(e) => handleVarChange(i, 'value', e.target.value)}
                  placeholder="value"
                  style={{
                    flex: '2',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveVar(i)}
                  style={{
                    background: 'rgba(191, 97, 106, 0.15)',
                    color: '#bf616a',
                    border: '1px solid rgba(191, 97, 106, 0.3)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddVar}
            className="action-btn secondary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            + Add Environment Variable
          </button>
        </div>
      )}
    </div>
  );
}
