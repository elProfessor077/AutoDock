'use client';

import React from 'react';
import Image from 'next/image';
import AuthButton from './AuthButton';
import { useTheme } from './ThemeProvider';

export default function Sidebar({ session, activePath }) {
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/workspace', label: 'Workspace' },
    { href: '/folder-to-zip', label: 'Folder to ZIP' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/security', label: 'Security' },
    { href: '/history', label: 'History' },
    { href: '/docs', label: 'Docs' },
    { href: '/pricing', label: 'Pricing 💳' },
  ];

  return (
    <header className="top-header">
      <div className="top-header-container">
        <div className="top-header-left">
          <a href="/" className="top-header-logo">
            <div className="nav-logo-icon" aria-hidden="true" style={{ background: 'transparent', boxShadow: 'none' }}>
              <img
                src="/AutoDock-icon.png?v=3"
                alt="AutoDock Logo"
                width={28}
                height={28}
                style={{ borderRadius: '6px', objectFit: 'cover' }}
              />
            </div>
            <span className="nav-logo-text">AutoDock</span>
          </a>
        </div>

        <nav className="top-header-nav">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`top-header-link ${activePath === link.href ? 'active' : ''}`}
            >
              {link.label}
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
