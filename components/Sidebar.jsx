'use client';

import React from 'react';
import Image from 'next/image';
import AuthButton from './AuthButton';
import { useTheme } from './ThemeProvider';

export default function Sidebar({ session, activePath }) {
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/workspace', label: 'Workspace', icon: '🚀' },
    { href: '/folder-to-zip', label: 'Folder to ZIP', icon: '📦' },
    { href: '/how-it-works', label: 'How It Works', icon: '⚙️' },
    { href: '/security', label: 'Security', icon: '🛡️' },
    { href: '/history', label: 'History', icon: '📜' },
    { href: '/docs', label: 'Docs', icon: '📚' },
  ];

  return (
    <header className="top-header">
      <div className="top-header-container">
        <div className="top-header-left">
          <a href="/" className="top-header-logo">
            <div className="nav-logo-icon" aria-hidden="true">
              <Image
                src="/dockeryze-icon.png"
                alt="Dockeryze Logo"
                width={26}
                height={26}
                style={{ borderRadius: '50%', objectFit: 'cover' }}
                priority
              />
            </div>
            <span className="nav-logo-text">Dockeryze</span>
          </a>
          <span className="nav-badge">v2.0</span>
        </div>

        <nav className="top-header-nav">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`top-header-link ${activePath === link.href ? 'active' : ''}`}
            >
              <span>{link.icon}</span> {link.label}
            </a>
          ))}
        </nav>

        <div className="top-header-right">
          <AuthButton session={session} />
        </div>
      </div>
    </header>
  );
}
