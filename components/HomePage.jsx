'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Sidebar from './Sidebar';
import { NodeIcon, PythonIcon, GoIcon, RustIcon, JavaIcon, RubyIcon, PhpIcon, DockerIcon, GeminiIcon, RagIcon, ShieldIcon } from './EcosystemIcons';

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
  { name: 'Node.js', Icon: NodeIcon, color: '#339933' },
  { name: 'Python', Icon: PythonIcon, color: '#3776AB' },
  { name: 'Go', Icon: GoIcon, color: '#00ADD8' },
  { name: 'Rust', Icon: RustIcon, color: '#DEA584' },
  { name: 'Java', Icon: JavaIcon, color: '#5382A1' },
  { name: 'Ruby', Icon: RubyIcon, color: '#CC342D' },
  { name: 'PHP', Icon: PhpIcon, color: '#777BB4' },
  { name: 'Docker', Icon: DockerIcon, color: '#2496ED' },
];

const STATS = [
  { label: 'Ecosystems', value: '7+', icon: '🌍' },
  { label: 'RAG Recipes', value: '150+', icon: '📚' },
  { label: 'Avg Speed', value: '<8s', icon: '⚡' },
  { label: 'AI Model', value: 'Gemini 2.0', icon: '🤖' },
];

const DEMO_PRESETS = [
  {
    id: 'node-postgres',
    name: 'Node.js + PostgreSQL',
    Icon: NodeIcon,
    dockerfile: `# Multi-stage Node.js 20 LTS Production Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]`,
    compose: `version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://postgres:secret@db:5432/appdb
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=appdb
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:`
  },
  {
    id: 'python-fastapi',
    name: 'Python FastAPI + Redis',
    Icon: PythonIcon,
    dockerfile: `# Multi-stage Python 3.11 Slim Production Build
FROM python:3.11-slim AS builder
WORKDIR /app
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.11-slim AS runner
WORKDIR /app
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`,
    compose: `version: '3.8'
services:
  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      - REDIS_URL=redis://cache:6379/0
    depends_on:
      - cache

  cache:
    image: redis:7-alpine
    ports:
      - "6379:6379"`
  },
  {
    id: 'go-microservice',
    name: 'Go Microservice',
    Icon: GoIcon,
    dockerfile: `# Ultra-compact Go 1.22 Scratch Build
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server .

FROM scratch
COPY --from=builder /app/server /server
EXPOSE 8080
ENTRYPOINT ["/server"]`,
    compose: `version: '3.8'
services:
  api:
    build: .
    ports:
      - "8080:8080"
    restart: unless-stopped`
  }
];

export default function HomePage({ session }) {
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [activePreset, setActivePreset] = useState(DEMO_PRESETS[0]);
  const [activeTab, setActiveTab] = useState('dockerfile');
  const [copied, setCopied] = useState(false);

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

  const handleCopy = () => {
    const textToCopy = activeTab === 'dockerfile' ? activePreset.dockerfile : activePreset.compose;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
                  <Image
                    src={session.user.image}
                    alt={userName}
                    width={48}
                    height={48}
                    className="home-hero-avatar"
                    priority
                    unoptimized
                  />
                ) : (
                  <div className="home-hero-avatar-placeholder">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="home-hero-status-dot" aria-label="Online" />
              </div>
              <div className="home-hero-text">
                <div className="hero-eyebrow" style={{ marginBottom: '8px' }}>
                  <span className="dot" />
                  <span>PLATFORM ACTIVE · GEMINI 2.0 + RAG VECTOR ENGINE</span>
                </div>
                <h1 id="home-hero-title" className="home-hero-title">
                  {greeting}, <span className="gradient-text">{userName}</span>
                </h1>
                <p className="home-hero-subtitle">
                  Welcome to Dockeryze — your AI-powered containerization engine for instant Docker &amp; Compose blueprints.
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
                  <span className="home-ecosystem-icon">
                    <eco.Icon size={20} />
                  </span>
                  <span className="home-ecosystem-name">{eco.name}</span>
                  <div className="home-ecosystem-glow" aria-hidden="true" />
                </div>
              ))}
            </div>
          </section>

          {/* Interactive Live Blueprint Demo Preview */}
          <section className="home-section" aria-label="Live Interactive Blueprint Demo">
            <h2 className="home-section-title">
              ⚡ Interactive Live Blueprint Demo
            </h2>
            <div className="glass-card demo-card">
              <div className="demo-header">
                <div className="demo-presets-row">
                  {DEMO_PRESETS.map((preset) => {
                    const PresetIcon = preset.Icon;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        className={`demo-preset-btn ${activePreset.id === preset.id ? 'active' : ''}`}
                        onClick={() => setActivePreset(preset)}
                      >
                        <PresetIcon size={16} />
                        <span>{preset.name}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="demo-controls-row">
                  <div className="demo-tabs">
                    <button
                      type="button"
                      className={`demo-tab ${activeTab === 'dockerfile' ? 'active' : ''}`}
                      onClick={() => setActiveTab('dockerfile')}
                    >
                      Dockerfile
                    </button>
                    <button
                      type="button"
                      className={`demo-tab ${activeTab === 'compose' ? 'active' : ''}`}
                      onClick={() => setActiveTab('compose')}
                    >
                      docker-compose.yml
                    </button>
                  </div>

                  <button type="button" className="demo-copy-btn" onClick={handleCopy}>
                    {copied ? '✅ Copied!' : '📋 Copy Code'}
                  </button>
                </div>
              </div>

              <div className="demo-code-container">
                <pre className="demo-code-block">
                  <code>{activeTab === 'dockerfile' ? activePreset.dockerfile : activePreset.compose}</code>
                </pre>
              </div>
            </div>
          </section>

          {/* Efficiency Benchmark Comparison */}
          <section className="home-section" aria-label="Performance Benchmark">
            <h2 className="home-section-title">📊 Efficiency Comparison</h2>
            <div className="glass-card benchmark-card">
              <div className="benchmark-grid">
                <div className="benchmark-column traditional">
                  <div className="benchmark-badge error">Traditional Manual Setup</div>
                  <div className="benchmark-stat">45 Mins</div>
                  <p className="benchmark-desc">Manual configuration writing, trial &amp; error, outdated base tags, security risks.</p>
                  <div className="benchmark-bar-wrap">
                    <div className="benchmark-bar traditional-bar" style={{ width: '90%' }} />
                  </div>
                </div>

                <div className="benchmark-divider">
                  <span>VS</span>
                </div>

                <div className="benchmark-column dockeryze">
                  <div className="benchmark-badge success">Dockeryze AI Engine</div>
                  <div className="benchmark-stat">&lt; 8 Seconds</div>
                  <p className="benchmark-desc">Manifest scanning, active RAG LTS recipe matching, multi-stage Alpine builds.</p>
                  <div className="benchmark-bar-wrap">
                    <div className="benchmark-bar dockeryze-bar" style={{ width: '15%' }} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Banner */}
          <section className="home-cta-banner" aria-label="Get Started">
            <div className="home-cta-content">
              <div className="home-cta-icon">🐳</div>
              <div className="home-cta-text">
                <h3 className="home-cta-title">Ready to containerize your project?</h3>
                <p className="home-cta-desc">
                  Drop your repository ZIP archive and get production-ready Docker blueprints in seconds.
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
