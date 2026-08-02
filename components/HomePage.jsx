'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import AuthButton from './AuthButton';

const QUICK_ACTIONS = [
  {
    id: 'generate',
    icon: '🚀',
    title: 'Generate Blueprint',
    desc: 'Upload your project archive and get instant Docker & Compose configs.',
    href: '/workspace',
    accent: 'var(--color-primary)',
    accentGlow: 'var(--color-primary-glow)',
  },
  {
    id: 'folder-to-zip',
    icon: '📦',
    title: 'Folder to ZIP',
    desc: 'Convert any folder or repository into a zip archive with smart node_modules filters.',
    href: '/folder-to-zip',
    accent: '#a3be8c',
    accentGlow: 'var(--color-success-glow)',
  },
  {
    id: 'history',
    icon: '📜',
    title: 'View History',
    desc: 'Browse your past blueprint generations and download previous configs.',
    href: '/history',
    accent: 'var(--color-cyan)',
    accentGlow: 'var(--color-cyan-glow)',
  },
  {
    id: 'how-it-works',
    icon: '⚙️',
    title: 'How It Works',
    desc: 'Explore the AI pipeline: manifest scanning, RAG retrieval & Gemini orchestration.',
    href: '/how-it-works',
    accent: 'var(--color-warning)',
    accentGlow: 'rgba(235, 203, 139, 0.2)',
  },
  {
    id: 'security',
    icon: '🛡️',
    title: 'Security',
    desc: 'Learn about zip-slip guards, shredder cleanup, and our isolation architecture.',
    href: '/security',
    accent: 'var(--color-success)',
    accentGlow: 'var(--color-success-glow)',
  },
  {
    id: 'docs',
    icon: '📚',
    title: 'Documentation',
    desc: 'API reference, supported ecosystems, configuration options & best practices.',
    href: '/docs',
    accent: '#b48ead',
    accentGlow: 'rgba(180, 142, 173, 0.2)',
  },
];

const SUPPORTED_ECOSYSTEMS = [
  { name: 'Node.js', icon: '🟢', color: '#a3be8c' },
  { name: 'Python', icon: '🐍', color: '#ebcb8b' },
  { name: 'Go', icon: '🐹', color: '#88c0d0' },
  { name: 'Ruby', icon: '💎', color: '#bf616a' },
  { name: 'Rust', icon: '🦀', color: '#d08770' },
  { name: 'Java', icon: '☕', color: '#81a1c1' },
];

const STATS = [
  { label: 'Ecosystems', value: '6+', icon: '🌍' },
  { label: 'RAG Recipes', value: '150+', icon: '📚' },
  { label: 'Avg Speed', value: '<8s', icon: '⚡' },
  { label: 'AI Model', value: 'Gemini 2.0', icon: '🤖' },
];

export default function HomePage({ session }) {
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      if (hour < 12) setGreeting('Good morning');
      else if (hour < 17) setGreeting('Good afternoon');
      else setGreeting('Good evening');
      setCurrentTime(now.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'Developer';

  return (
    <div className="sidebar-layout">
      {/* Moving Ambient Background Orbs */}
      <div className="bg-orbs" aria-hidden="true">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      {/* Sidebar Navigation */}
      <Sidebar session={session} activePath="/" />

      {/* Main Content Layout Area */}
      <div className="main-content-layout">
        <main className="app-container" id="main-content">
          {/* Welcome Hero Section */}
          <section className="home-hero" aria-labelledby="home-hero-title">
            <div className="home-hero-greeting">
              <div className="home-hero-avatar-ring">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={userName}
                    className="home-hero-avatar"
                  />
                ) : (
                  <div className="home-hero-avatar-placeholder">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="home-hero-status-dot" aria-label="Online" />
              </div>
              <div className="home-hero-text">
                <p className="home-hero-time">{currentTime}</p>
                <h1 id="home-hero-title" className="home-hero-title">
                  {greeting}, <span className="gradient-text">{userName}</span>
                </h1>
                <p className="home-hero-subtitle">
                  Welcome to Dockeryze — your AI-powered containerization engine.
                </p>
              </div>
            </div>
          </section>

          {/* Stats Overview */}
          <section className="home-stats-row" aria-label="Platform Statistics">
            {STATS.map((stat) => (
              <div key={stat.label} className="home-stat-card">
                <span className="home-stat-icon">{stat.icon}</span>
                <div className="home-stat-info">
                  <span className="home-stat-value">{stat.value}</span>
                  <span className="home-stat-label">{stat.label}</span>
                </div>
              </div>
            ))}
          </section>

          {/* Quick Actions Grid */}
          <section className="home-section" aria-label="Quick Actions">
            <h2 className="home-section-title">Quick Actions</h2>
            <div className="home-actions-grid">
              {QUICK_ACTIONS.map((action, i) => (
                <a
                  key={action.id}
                  href={action.href}
                  className="home-action-card"
                  id={`action-${action.id}`}
                  style={{
                    '--card-accent': action.accent,
                    '--card-glow': action.accentGlow,
                    animationDelay: `${i * 0.08}s`,
                  }}
                >
                  <div className="home-action-icon-wrap">
                    <span className="home-action-icon">{action.icon}</span>
                  </div>
                  <div className="home-action-content">
                    <h3 className="home-action-title">{action.title}</h3>
                    <p className="home-action-desc">{action.desc}</p>
                  </div>
                  <div className="home-action-arrow" aria-hidden="true">→</div>
                </a>
              ))}
            </div>
          </section>

          {/* Supported Ecosystems */}
          <section className="home-section" aria-label="Supported Ecosystems">
            <h2 className="home-section-title">Supported Ecosystems</h2>
            <div className="home-ecosystems-grid">
              {SUPPORTED_ECOSYSTEMS.map((eco) => (
                <div
                  key={eco.name}
                  className="home-ecosystem-chip"
                  style={{ '--eco-color': eco.color }}
                >
                  <span className="home-ecosystem-icon">{eco.icon}</span>
                  <span className="home-ecosystem-name">{eco.name}</span>
                  <div className="home-ecosystem-glow" aria-hidden="true" />
                </div>
              ))}
            </div>
          </section>

          {/* CTA Banner */}
          <section className="home-cta-banner" aria-label="Get Started">
            <div className="home-cta-content">
              <div className="home-cta-icon">🐳</div>
              <div className="home-cta-text">
                <h3 className="home-cta-title">Ready to containerize?</h3>
                <p className="home-cta-desc">
                  Drop your project archive and get production-ready Docker blueprints in seconds.
                </p>
              </div>
            </div>
            <a href="/workspace" className="home-cta-btn">
              🚀 Launch Workspace
            </a>
          </section>
        </main>

        {/* Footer copyright */}
        <footer className="footer" role="contentinfo">
          <div className="nav-container">
            <p>Powered by <span>Gemini 2.0</span> &amp; Cosine RAG Vector DB · Dockeryze &copy; {new Date().getFullYear()}</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
