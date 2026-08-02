'use client';

import React, { useState } from 'react';
import AuthButton from './AuthButton';

export default function Sidebar({ session, activePath }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="sidebar-toggle-btn" 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle Navigation Sidebar"
      >
        ☰
      </button>

      {/* Sidebar Overlay for Mobile */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Left Sidebar Navigation */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <a href="/" className="sidebar-logo">
            <div className="nav-logo-icon" aria-hidden="true">
              <img src="/dockeryze-icon.png?v=2" alt="" width={28} height={28} style={{ borderRadius: '50%', objectFit: 'cover' }} />
            </div>
            <span className="nav-logo-text">Dockeryze</span>
          </a>
          <span className="nav-badge" style={{ alignSelf: 'flex-start' }}>v2.0</span>
        </div>

        <nav className="sidebar-nav">
          <a 
            href="/" 
            className={`sidebar-link ${activePath === '/' ? 'active' : ''}`}
          >
            <span>🏠</span> Home
          </a>
          <a 
            href="/workspace" 
            className={`sidebar-link ${activePath === '/workspace' ? 'active' : ''}`}
          >
            <span>🚀</span> Workspace
          </a>
          <a 
            href="/folder-to-zip" 
            className={`sidebar-link ${activePath === '/folder-to-zip' ? 'active' : ''}`}
          >
            <span>📦</span> Folder to ZIP
          </a>

          <div className="sidebar-divider-line" />

          <a 
            href="/how-it-works" 
            className={`sidebar-link ${activePath === '/how-it-works' ? 'active' : ''}`}
          >
            <span>⚙️</span> How It Works
          </a>
          <a 
            href="/security" 
            className={`sidebar-link ${activePath === '/security' ? 'active' : ''}`}
          >
            <span>🛡️</span> Security
          </a>
          <a 
            href="/history" 
            className={`sidebar-link ${activePath === '/history' ? 'active' : ''}`}
          >
            <span>📜</span> History
          </a>
          <a 
            href="/docs" 
            className={`sidebar-link ${activePath === '/docs' ? 'active' : ''}`}
          >
            <span>📚</span> Docs
          </a>
        </nav>

        <div className="sidebar-footer">
          <AuthButton session={session} />
        </div>
      </aside>
    </>
  );
}
