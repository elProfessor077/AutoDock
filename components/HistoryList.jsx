'use client';

import React, { useState, useEffect } from 'react';

const HISTORY_KEY = 'dockeryze-history';

/**
 * Retrieves pipeline history entries from localStorage.
 * @returns {Array} History entries sorted newest-first.
 */
function getHistory() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves a new pipeline result to history.
 * Keeps a maximum of 50 entries.
 */
export function saveHistoryEntry(entry) {
  if (typeof window === 'undefined') return;
  try {
    const history = getHistory();
    history.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      ...entry,
      timestamp: new Date().toISOString(),
    });
    // Cap at 50 entries
    if (history.length > 50) history.length = 50;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

function formatTimestamp(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getStatusIcon(status) {
  switch (status) {
    case 'success': return '✅';
    case 'error': return '❌';
    default: return '⏳';
  }
}

function getEcosystemColor(eco) {
  const colors = {
    nodejs: '#a3be8c',
    python: '#ebcb8b',
    go: '#81a1c1',
    ruby: '#bf616a',
    rust: '#d08770',
    java: '#b48ead',
  };
  return colors[eco?.toLowerCase()] || 'var(--color-primary)';
}

export default function HistoryList() {
  const [history, setHistory] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHistory(getHistory());
  }, []);

  const handleClearHistory = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(HISTORY_KEY);
      setHistory([]);
    }
  };

  if (!mounted) {
    return (
      <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Loading history...</p>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>
        <div className="glass-card history-empty-card">
          <div className="history-empty-icon">📜</div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>No History Yet</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
            Your pipeline runs will appear here after you generate your first deployment blueprint.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* History Header Bar */}
      <div className="history-header-bar">
        <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '600' }}>
          {history.length} {history.length === 1 ? 'entry' : 'entries'}
        </span>
        <button className="history-clear-btn" onClick={handleClearHistory}>
          🗑️ Clear All
        </button>
      </div>

      {/* History Entries */}
      {history.map((entry) => (
        <div key={entry.id} className="glass-card history-entry">
          <div className="history-entry-header">
            <div className="history-entry-title">
              <span className="history-status-icon">{getStatusIcon(entry.status)}</span>
              <span className="history-filename">{entry.fileName || 'Unknown file'}</span>
            </div>
            <span className="history-timestamp">{formatTimestamp(entry.timestamp)}</span>
          </div>

          <div className="history-entry-meta">
            {entry.ecosystem && (
              <span className="history-eco-tag" style={{ borderColor: getEcosystemColor(entry.ecosystem) }}>
                <span className="history-eco-dot" style={{ background: getEcosystemColor(entry.ecosystem) }} />
                {entry.ecosystem}
              </span>
            )}
            {entry.runtime && (
              <span className="history-meta-tag">⚙️ {entry.runtime}</span>
            )}
            {entry.framework && (
              <span className="history-meta-tag">📦 {entry.framework}</span>
            )}
            {entry.fileSize && (
              <span className="history-meta-tag">💾 {(entry.fileSize / 1024).toFixed(1)} KB</span>
            )}
          </div>

          {entry.status === 'error' && entry.errorMessage && (
            <div className="history-error-msg">
              ⚠️ {entry.errorMessage}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
