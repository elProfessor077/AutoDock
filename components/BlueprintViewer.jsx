'use client';

import React, { useState } from 'react';

export default function BlueprintViewer({ files }) {
  const fileKeys = Object.keys(files || {});
  const [activeFile, setActiveFile] = useState(fileKeys[0] || 'Dockerfile');
  const [copied, setCopied] = useState(false);

  if (!files || fileKeys.length === 0) return null;

  const currentContent = files[activeFile] || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = (filename) => {
    const content = files[filename];
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const getFileIcon = (name) => {
    if (name.includes('Dockerfile')) return '🐳';
    if (name.includes('docker-compose')) return '🐙';
    if (name.includes('k8s')) return '☸️';
    if (name.includes('fly.toml')) return '🎈';
    if (name.includes('render.yaml')) return '🌐';
    if (name.includes('.env')) return '🔑';
    if (name.includes('dockerignore')) return '🚫';
    if (name.includes('README')) return '📘';
    return '📄';
  };

  return (
    <div className="glass-card" style={{ marginTop: '24px', gridColumn: '1 / -1' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            📁 Generated Blueprint Folder (Unzipped)
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px', margin: 0 }}>
            Inspect, copy, or save unzipped deployment files directly without extracting a zip archive.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleCopy}
            className="action-btn secondary"
            style={{ padding: '8px 14px', fontSize: '13px', margin: 0 }}
          >
            {copied ? '✅ Copied to Clipboard!' : '📋 Copy File Content'}
          </button>
          <button
            onClick={() => handleDownloadSingle(activeFile)}
            className="action-btn"
            style={{ padding: '8px 14px', fontSize: '13px', margin: 0, background: 'var(--color-primary)' }}
          >
            📥 Save {activeFile}
          </button>
        </div>
      </div>

      {/* File Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', borderBottom: '1px solid var(--color-border)', marginBottom: '16px' }}>
        {fileKeys.map((filename) => {
          const isActive = filename === activeFile;
          return (
            <button
              key={filename}
              onClick={() => setActiveFile(filename)}
              style={{
                background: isActive ? 'var(--color-surface-hover)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: isActive ? '600' : '400',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              <span>{getFileIcon(filename)}</span>
              <span>{filename}</span>
            </button>
          );
        })}
      </div>

      {/* File Content Preview Code Block */}
      <div style={{ position: 'relative' }}>
        <pre
          style={{
            background: 'var(--color-bg-dark, #0d1117)',
            color: '#e6edf3',
            padding: '16px',
            borderRadius: '10px',
            fontSize: '13px',
            fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
            lineHeight: '1.5',
            maxHeight: '400px',
            overflowY: 'auto',
            border: '1px solid var(--color-border)',
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          <code>{currentContent}</code>
        </pre>
      </div>
    </div>
  );
}
