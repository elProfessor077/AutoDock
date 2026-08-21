'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from './ThemeProvider';
import { handleSignOut } from '@/app/actions/auth';

export default function AuthButton({ session }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const dropdownRef = useRef(null);

  // Close dropdown on click outside or escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setShowSettingsModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'Developer';
  const userEmail = session?.user?.email || 'guest@AutoDock.local';
  const userImage = session?.user?.image;

  return (
    <div className="user-dropdown-container" ref={dropdownRef}>
      {/* Username / Avatar Trigger Button */}
      <button
        type="button"
        className="user-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="User Menu"
      >
        <div className="user-avatar-wrap">
          {userImage ? (
            <Image src={userImage} alt={userName} className="auth-avatar" width={26} height={26} style={{ borderRadius: '50%' }} unoptimized />
          ) : (
            <div className="user-avatar-placeholder">{userName.charAt(0).toUpperCase()}</div>
          )}
        </div>
        <span className="user-name-text">{userName}</span>
        <span className={`user-caret ${isOpen ? 'open' : ''}`}>▾</span>
      </button>

      {/* Interactive Username Dropdown Menu */}
      {isOpen && (
        <div className="user-dropdown-menu">
          {/* User Details Header */}
          <div className="user-dropdown-header">
            <div className="user-dropdown-info">
              <span className="user-dropdown-name">{userName}</span>
              <span className="user-dropdown-email">{userEmail}</span>
            </div>
          </div>

          <div className="user-dropdown-divider" />

          {/* Theme Mode Toggle Option */}
          <div className="user-dropdown-item theme-item">
            <span className="dropdown-item-label">
              <span className="dropdown-icon">🎨</span> Theme Mode
            </span>
            <button
              type="button"
              className={`theme-pill-toggle ${theme}`}
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <span className={`theme-pill-knob ${theme}`}>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="12" y1="2" x2="12" y2="4" />
                  <line x1="12" y1="20" x2="12" y2="22" />
                  <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
                  <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
                  <line x1="2" y1="12" x2="4" y2="12" />
                  <line x1="20" y1="12" x2="22" y2="12" />
                  <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
                  <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
                  <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 7a5 5 0 0 1 0 10V7z" fill="currentColor" />
                </svg>
              </span>
            </button>
          </div>

          {/* Settings Button Option */}
          <button
            type="button"
            className="user-dropdown-item dropdown-btn-item"
            onClick={() => {
              setIsOpen(false);
              setShowSettingsModal(true);
            }}
          >
            <span className="dropdown-icon">⚙️</span>
            <span>Settings</span>
          </button>

          <div className="user-dropdown-divider" />

          {/* Sign Out / Sign In Action */}
          {session?.user ? (
            <button
              type="button"
              className="user-dropdown-item dropdown-btn-item signout-item"
              style={{ width: '100%' }}
              onClick={async () => {
                setIsOpen(false);
                await handleSignOut();
                window.location.href = '/signin';
              }}
            >
              <span className="dropdown-icon">🚪</span>
              <span>Sign Out</span>
            </button>
          ) : (
            <a href="/signin" className="user-dropdown-item dropdown-btn-item signin-item">
              <span className="dropdown-icon">🔑</span>
              <span>Sign In</span>
            </a>
          )}
        </div>
      )}

      {/* Quick Settings Modal */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 className="modal-title" style={{ margin: 0, fontSize: '16px' }}>⚙️ Workspace Settings</h3>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setShowSettingsModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div className="setting-row">
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>AI Model Engine</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Gemini 2.0 Flash + Cosine RAG Vector DB</div>
                </div>
                <span className="nav-badge">Active</span>
              </div>
              <div className="setting-row">
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>Ephemeral Memory Purge</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Automatic temp file shredding post compilation</div>
                </div>
                <span className="nav-badge">60 Sec SLA</span>
              </div>
              <div className="setting-row">
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>Zip Slip Shield</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Strict path traversal extraction guards</div>
                </div>
                <span className="nav-badge">Protected</span>
              </div>
            </div>
            <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="demo-copy-btn"
                onClick={() => setShowSettingsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
