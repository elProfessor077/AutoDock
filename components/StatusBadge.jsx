'use client';

import React from 'react';

export default function StatusBadge({ status, errorMessage }) {
  if (status === 'idle') return null;

  return (
    <div className={`status-badge ${status === 'error' ? 'error' : 'success'}`} role="alert">
      <span>{status === 'error' ? '🚨' : '🎉'}</span>
      <div>
        <strong>
          {status === 'error' ? 'Analysis Failed' : 'Compilation Complete'}
        </strong>
        <p style={{ fontSize: '13px', marginTop: '2px', opacity: 0.9 }}>
          {status === 'error' ? errorMessage : 'Your blueprint packages are ready for download!'}
        </p>
      </div>
    </div>
  );
}
