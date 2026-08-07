'use client';

import React, { useState } from 'react';

export default function SecurityAuditBadge({ audit }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!audit) return null;

  const { score, grade, badgeColor, checks, passedCount, totalCount } = audit;

  return (
    <div className="glass-card" style={{ marginTop: '24px', gridColumn: '1 / -1', borderLeft: `4px solid ${badgeColor}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Left: Grade Gauge & Overview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '12px',
              background: 'var(--color-surface)',
              border: `2px solid ${badgeColor}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justify: 'center',
              boxShadow: `0 0 15px ${badgeColor}33`,
            }}
          >
            <span style={{ fontSize: '20px', fontWeight: '800', color: badgeColor, lineHeight: 1 }}>{grade}</span>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{score}%</span>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 className="card-title" style={{ margin: 0 }}>DevSecOps Container Audit</h3>
              <span
                style={{
                  background: `${badgeColor}22`,
                  color: badgeColor,
                  border: `1px solid ${badgeColor}44`,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '600',
                }}
              >
                {score >= 90 ? 'PASSED · PRODUCTION READY' : 'HARDENING RECOMMENDED'}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px', margin: 0 }}>
              {passedCount} of {totalCount} DevSecOps security rules passed. Inspected privileges, LTS pinning, multi-stage isolation, and secret exposure.
            </p>
          </div>
        </div>

        {/* Right: Toggle Button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="action-btn secondary"
          style={{ padding: '8px 14px', fontSize: '13px', margin: 0 }}
        >
          {showDetails ? '▲ Hide Security Audit Details' : '▼ Inspect Security Checklist'}
        </button>
      </div>

      {/* Expanded Security Checklist */}
      {showDetails && (
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {checks.map((check) => (
              <div
                key={check.id}
                style={{
                  background: 'var(--color-surface)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  border: `1px solid ${check.passed ? 'rgba(163, 190, 140, 0.2)' : 'rgba(191, 97, 106, 0.3)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                    {check.passed ? '✅' : '⚠️'} {check.title}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: check.passed ? 'var(--color-success)' : 'var(--color-danger)',
                    }}
                  >
                    {check.passed ? `+${check.points} pts` : '0 pts'}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.4 }}>
                  {check.desc}
                </p>
                {!check.passed && check.recommendation && (
                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#ebcb8b', background: 'rgba(235, 203, 139, 0.1)', padding: '6px 8px', borderRadius: '4px' }}>
                    💡 <strong>Fix:</strong> {check.recommendation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
