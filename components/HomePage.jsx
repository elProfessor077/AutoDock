'use client';

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import { NodeIcon, PythonIcon, GoIcon, RustIcon, JavaIcon, RubyIcon, PhpIcon, DockerIcon } from './EcosystemIcons';

/* --- Data ------------------------------------------------------------------ */

const TYPEWRITER_PHRASES = [
  'Instant Dockerfiles.',
  'Multi-stage builds.',
  'Zero config. Zero guesswork.',
  'Production-ready in seconds.',
  'AI-powered containerization.',
];

const QUICK_ACTIONS = [
  {
    id: 'generate',
    title: 'Generate Blueprint',
    desc: 'Upload your project archive and get instant Docker & Compose configs.',
    href: '/workspace',
    accent: 'var(--color-primary)',
    accentGlow: 'var(--color-primary-glow)',
    isPrimary: true,
    badge: 'Start Here',
  },
  {
    id: 'folder-to-zip',
    title: 'Folder to ZIP',
    desc: 'Convert any folder into a zip archive with smart node_modules filters.',
    href: '/folder-to-zip',
    accent: '#a3be8c',
    accentGlow: 'var(--color-success-glow)',
  },
  {
    id: 'history',
    title: 'View History',
    desc: 'Browse your past blueprint generations and download previous configs.',
    href: '/history',
    accent: 'var(--color-cyan)',
    accentGlow: 'var(--color-cyan-glow)',
  },
  {
    id: 'how-it-works',
    title: 'How It Works',
    desc: 'Explore the AI pipeline: manifest scanning, RAG retrieval & Gemini orchestration.',
    href: '/how-it-works',
    accent: 'var(--color-warning)',
    accentGlow: 'rgba(235, 203, 139, 0.2)',
  },
  {
    id: 'security',
    title: 'Security',
    desc: 'Learn about zip-slip guards, shredder cleanup, and our isolation architecture.',
    href: '/security',
    accent: 'var(--color-success)',
    accentGlow: 'var(--color-success-glow)',
  },
  {
    id: 'docs',
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
  { label: 'Ecosystems', value: 7, suffix: '+' },
  { label: 'RAG Recipes', value: 150, suffix: '+' },
  { label: 'Avg Speed', value: 8, suffix: 's', prefix: '<' },
  { label: 'AI Model', value: 'Gemini 2.0', isText: true },
];


const DEMO_PRESETS = [
  {
    id: 'node-postgres',
    name: 'Node.js + PostgreSQL',
    Icon: NodeIcon,
    dockerfile: [
      { t: 'cm', v: '# Multi-stage Node.js 20 LTS Production Build\n' },
      { t: 'kw', v: 'FROM' }, { t: 'pl', v: ' node:20-alpine ' }, { t: 'kw', v: 'AS' }, { t: 'pl', v: ' builder\n' },
      { t: 'kw', v: 'WORKDIR' }, { t: 'pl', v: ' /app\n' },
      { t: 'kw', v: 'COPY' }, { t: 'pl', v: ' package*.json ./\n' },
      { t: 'kw', v: 'RUN' }, { t: 'pl', v: ' npm ci --only=production\n' },
      { t: 'kw', v: 'COPY' }, { t: 'pl', v: ' . .\n' },
      { t: 'kw', v: 'RUN' }, { t: 'pl', v: ' npm run build\n\n' },
      { t: 'kw', v: 'FROM' }, { t: 'pl', v: ' node:20-alpine ' }, { t: 'kw', v: 'AS' }, { t: 'pl', v: ' runner\n' },
      { t: 'kw', v: 'WORKDIR' }, { t: 'pl', v: ' /app\n' },
      { t: 'kw', v: 'ENV' }, { t: 'pl', v: ' NODE_ENV=' }, { t: 'st', v: 'production\n' },
      { t: 'kw', v: 'USER' }, { t: 'pl', v: ' node\n' },
      { t: 'kw', v: 'EXPOSE' }, { t: 'nu', v: ' 3000\n' },
      { t: 'kw', v: 'CMD' }, { t: 'st', v: ' ["node", "dist/index.js"]' },
    ],
    compose: [
      { t: 'kv', v: 'version' }, { t: 'pl', v: ': ' }, { t: 'st', v: "'3.8'\n" },
      { t: 'kv', v: 'services:\n' },
      { t: 'kv', v: '  app:\n' },
      { t: 'pl', v: '    ' }, { t: 'kv', v: 'build' }, { t: 'pl', v: ': .\n' },
      { t: 'pl', v: '    ' }, { t: 'kv', v: 'ports' }, { t: 'pl', v: ':\n' }, { t: 'st', v: '      - "3000:3000"\n' },
      { t: 'pl', v: '    ' }, { t: 'kv', v: 'depends_on' }, { t: 'pl', v: ':\n      - db\n' },
      { t: 'pl', v: '    ' }, { t: 'kv', v: 'restart' }, { t: 'pl', v: ': unless-stopped\n\n' },
      { t: 'kv', v: '  db:\n' },
      { t: 'pl', v: '    ' }, { t: 'kv', v: 'image' }, { t: 'pl', v: ': postgres:16-alpine\n' },
      { t: 'pl', v: '    ' }, { t: 'kv', v: 'volumes' }, { t: 'pl', v: ':\n      - pgdata:/var/lib/postgresql/data' },
    ],
  },
  {
    id: 'python-fastapi',
    name: 'Python FastAPI + Redis',
    Icon: PythonIcon,
    dockerfile: [
      { t: 'cm', v: '# Multi-stage Python 3.11 Slim Production Build\n' },
      { t: 'kw', v: 'FROM' }, { t: 'pl', v: ' python:3.11-slim ' }, { t: 'kw', v: 'AS' }, { t: 'pl', v: ' builder\n' },
      { t: 'kw', v: 'WORKDIR' }, { t: 'pl', v: ' /app\n' },
      { t: 'kw', v: 'RUN' }, { t: 'pl', v: ' python -m venv /opt/venv\n' },
      { t: 'kw', v: 'ENV' }, { t: 'pl', v: ' PATH=' }, { t: 'st', v: '"/opt/venv/bin:$PATH"\n' },
      { t: 'kw', v: 'COPY' }, { t: 'pl', v: ' requirements.txt .\n' },
      { t: 'kw', v: 'RUN' }, { t: 'pl', v: ' pip install --no-cache-dir -r requirements.txt\n\n' },
      { t: 'kw', v: 'FROM' }, { t: 'pl', v: ' python:3.11-slim ' }, { t: 'kw', v: 'AS' }, { t: 'pl', v: ' runner\n' },
      { t: 'kw', v: 'EXPOSE' }, { t: 'nu', v: ' 8000\n' },
      { t: 'kw', v: 'CMD' }, { t: 'st', v: ' ["uvicorn", "main:app", "--host", "0.0.0.0"]' },
    ],
    compose: [
      { t: 'kv', v: 'version' }, { t: 'pl', v: ': ' }, { t: 'st', v: "'3.8'\n" },
      { t: 'kv', v: 'services:\n' },
      { t: 'kv', v: '  web:\n' },
      { t: 'pl', v: '    ' }, { t: 'kv', v: 'build' }, { t: 'pl', v: ': .\n' },
      { t: 'pl', v: '    ' }, { t: 'kv', v: 'ports' }, { t: 'pl', v: ':\n' }, { t: 'st', v: '      - "8000:8000"\n' },
      { t: 'pl', v: '    ' }, { t: 'kv', v: 'depends_on' }, { t: 'pl', v: ':\n      - cache\n\n' },
      { t: 'kv', v: '  cache:\n' },
      { t: 'pl', v: '    ' }, { t: 'kv', v: 'image' }, { t: 'pl', v: ': redis:7-alpine' },
    ],
  },
  {
    id: 'go-microservice',
    name: 'Go Microservice',
    Icon: GoIcon,
    dockerfile: [
      { t: 'cm', v: '# Ultra-compact Go 1.22 Scratch Build\n' },
      { t: 'kw', v: 'FROM' }, { t: 'pl', v: ' golang:1.22-alpine ' }, { t: 'kw', v: 'AS' }, { t: 'pl', v: ' builder\n' },
      { t: 'kw', v: 'WORKDIR' }, { t: 'pl', v: ' /app\n' },
      { t: 'kw', v: 'COPY' }, { t: 'pl', v: ' go.mod go.sum ./\n' },
      { t: 'kw', v: 'RUN' }, { t: 'pl', v: ' go mod download\n' },
      { t: 'kw', v: 'COPY' }, { t: 'pl', v: ' . .\n' },
      { t: 'kw', v: 'RUN' }, { t: 'pl', v: ' CGO_ENABLED=' }, { t: 'nu', v: '0' }, { t: 'pl', v: ' GOOS=linux go build -o server .\n\n' },
      { t: 'kw', v: 'FROM' }, { t: 'pl', v: ' scratch\n' },
      { t: 'kw', v: 'COPY' }, { t: 'pl', v: ' --from=builder /app/server /server\n' },
      { t: 'kw', v: 'EXPOSE' }, { t: 'nu', v: ' 8080\n' },
      { t: 'kw', v: 'ENTRYPOINT' }, { t: 'st', v: ' ["/server"]' },
    ],
    compose: [
      { t: 'kv', v: 'version' }, { t: 'pl', v: ': ' }, { t: 'st', v: "'3.8'\n" },
      { t: 'kv', v: 'services:\n' },
      { t: 'kv', v: '  api:\n' },
      { t: 'pl', v: '    ' }, { t: 'kv', v: 'build' }, { t: 'pl', v: ': .\n' },
      { t: 'pl', v: '    ' }, { t: 'kv', v: 'ports' }, { t: 'pl', v: ':\n' }, { t: 'st', v: '      - "8080:8080"\n' },
      { t: 'pl', v: '    ' }, { t: 'kv', v: 'restart' }, { t: 'pl', v: ': unless-stopped' },
    ],
  },
];

/* --- Hooks ----------------------------------------------------------------- */

function useTypewriter(phrases, speed = 65, pause = 1800) {
  const [displayed, setDisplayed] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIdx];
    let timeout;
    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx((c) => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx((c) => c - 1), speed / 2);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setPhraseIdx((i) => (i + 1) % phrases.length);
    }
    setDisplayed(current.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, phraseIdx, phrases, speed, pause]);

  return displayed;
}

function useCountUp(target, duration = 1600) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (typeof target !== 'number') return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setCount(Math.round(eased * target));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function useScrollReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* --- Sub-components ------------------------------------------------------- */

function StatCard({ stat }) {
  const { count, ref } = useCountUp(stat.isText ? null : stat.value);
  const display = stat.isText
    ? stat.value
    : `${stat.prefix || ''}${count}${stat.suffix || ''}`;
  return (
    <div className="home-stat-card" ref={ref}>
      <div className="home-stat-info">
        <span className="home-stat-value">{display}</span>
        <span className="home-stat-label">{stat.label}</span>
      </div>
    </div>
  );
}

const SYN_CLASS = { kw: 'syn-kw', st: 'syn-st', cm: 'syn-cm', kv: 'syn-kv', nu: 'syn-nu', pl: '' };

function SyntaxCode({ tokens }) {
  return (
    <pre className="demo-code-block">
      <code>
        {tokens.map((tok, i) => {
          const cls = SYN_CLASS[tok.t] || '';
          return cls ? <span key={i} className={cls}>{tok.v}</span> : <span key={i}>{tok.v}</span>;
        })}
      </code>
    </pre>
  );
}

function BenchmarkSection() {
  const { ref, visible } = useScrollReveal(0.2);
  return (
    <div className="glass-card benchmark-card" ref={ref}>
      <div className="benchmark-grid">
        <div className="benchmark-column traditional">
          <div className="benchmark-badge error">Traditional Manual Setup</div>
          <div className="benchmark-stat benchmark-stat-bad">45 Mins</div>
          <p className="benchmark-desc">Manual config writing, trial &amp; error, outdated base tags, security risks.</p>
          <div className="bm-feat-list">
            <span className="bm-feat bm-no">❌ Error-prone</span>
            <span className="bm-feat bm-no">❌ Hours of research</span>
            <span className="bm-feat bm-no">❌ Security gaps</span>
            <span className="bm-feat bm-no">❌ Outdated images</span>
          </div>
          <div className="benchmark-bar-wrap">
            <div className="benchmark-bar traditional-bar" style={{ width: visible ? '92%' : '0%' }} />
          </div>
        </div>
        <div className="benchmark-divider"><span>VS</span></div>
        <div className="benchmark-column dockeryze">
          <div className="benchmark-badge success">Dockeryze AI Engine</div>
          <div className="benchmark-stat benchmark-stat-good">&lt; 8 Seconds</div>
          <p className="benchmark-desc">Manifest scanning, RAG LTS recipe matching, multi-stage Alpine builds.</p>
          <div className="bm-feat-list">
            <span className="bm-feat bm-yes">✅ AI-powered</span>
            <span className="bm-feat bm-yes">✅ Instant generation</span>
            <span className="bm-feat bm-yes">✅ Security-first</span>
            <span className="bm-feat bm-yes">✅ LTS best practices</span>
          </div>
          <div className="benchmark-bar-wrap">
            <div className="benchmark-bar dockeryze-bar" style={{ width: visible ? '14%' : '0%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Main Component -------------------------------------------------------- */

export default function HomePage({ session }) {
  const [activePreset, setActivePreset] = useState(DEMO_PRESETS[0]);
  const [activeTab, setActiveTab] = useState('dockerfile');
  const [copied, setCopied] = useState(false);
  const typewriterText = useTypewriter(TYPEWRITER_PHRASES);

  const statsReveal    = useScrollReveal();
  const actionsReveal  = useScrollReveal();
  const ecoReveal      = useScrollReveal();
  const demoReveal     = useScrollReveal();
  const benchReveal    = useScrollReveal();
  const ctaReveal      = useScrollReveal();

  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'Developer';

  const handleCopy = () => {
    const tokens = activeTab === 'dockerfile' ? activePreset.dockerfile : activePreset.compose;
    navigator.clipboard.writeText(tokens.map((t) => t.v).join(''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sidebar-layout">
      {/* Ambient Background Orbs */}
      <div className="bg-orbs" aria-hidden="true">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      <Sidebar session={session} activePath="/" />

      <div className="main-content-layout">
        <main className="app-container" id="main-content">

          {/* ── SaaS Hero ─────────────────────────────────────────────────── */}
          <section className="home-hero-saas" aria-labelledby="home-hero-title">

            <div className="home-welcome-pill">
              👋 Welcome back, <strong>{userName}</strong>
            </div>

            <h1 id="home-hero-title" className="home-hero-saas-title">
              Ship Container-Ready Code<br />
              <span className="gradient-text">in Seconds.</span>
            </h1>

            <p className="home-hero-saas-sub">
              <span className="typewriter-text">{typewriterText}</span>
              <span className="typewriter-caret" aria-hidden="true">|</span>
            </p>

            <div className="home-hero-cta-row">
              <a href="/workspace" className="home-cta-btn home-cta-btn-primary" id="hero-cta-launch">
                🚀 Launch Workspace
              </a>
              <a href="/how-it-works" className="home-cta-btn home-cta-btn-ghost">
                ⚙️ How It Works
              </a>
            </div>
          </section>


          {/* ── Stats ─────────────────────────────────────────────────────── */}
          <section
            className={`home-stats-row scroll-reveal ${statsReveal.visible ? 'visible' : ''}`}
            ref={statsReveal.ref}
            aria-label="Platform Statistics"
          >
            {STATS.map((stat) => <StatCard key={stat.label} stat={stat} />)}
          </section>

          {/* ── Quick Actions ─────────────────────────────────────────────── */}
          <section
            className={`home-section scroll-reveal ${actionsReveal.visible ? 'visible' : ''}`}
            ref={actionsReveal.ref}
            aria-label="Quick Actions"
          >
            <h2 className="home-section-title">Jump Right In</h2>
            <div className="home-actions-grid">
              {QUICK_ACTIONS.map((action, i) => (
                <a
                  key={action.id}
                  href={action.href}
                  className={`home-action-card ${action.isPrimary ? 'home-action-card-primary' : ''}`}
                  id={`action-${action.id}`}
                  style={{
                    '--card-accent': action.accent,
                    '--card-glow': action.accentGlow,
                    animationDelay: `${i * 0.08}s`,
                  }}
                >
                  {action.isPrimary && (
                    <div className="home-action-primary-badge">{action.badge}</div>
                  )}
                  <div className="home-action-content">
                    <h3 className="home-action-title">{action.title}</h3>
                    <p className="home-action-desc">{action.desc}</p>
                  </div>
                  <div className="home-action-arrow" aria-hidden="true">→</div>
                </a>
              ))}
            </div>
          </section>

          {/* ── Supported Ecosystems ──────────────────────────────────────── */}
          <section
            className={`home-section scroll-reveal ${ecoReveal.visible ? 'visible' : ''}`}
            ref={ecoReveal.ref}
            aria-label="Supported Ecosystems"
          >
            <h2 className="home-section-title">Works With Your Stack</h2>
            <div className="home-ecosystems-grid">
              {SUPPORTED_ECOSYSTEMS.map((eco) => (
                <div key={eco.name} className="home-ecosystem-chip" style={{ '--eco-color': eco.color }}>
                  <span className="home-ecosystem-icon"><eco.Icon size={28} /></span>
                  <span className="home-ecosystem-name">{eco.name}</span>
                  <div className="home-ecosystem-glow" aria-hidden="true" />
                </div>
              ))}
            </div>
          </section>

          {/* ── Live Demo ─────────────────────────────────────────────────── */}
          <section
            className={`home-section scroll-reveal ${demoReveal.visible ? 'visible' : ''}`}
            ref={demoReveal.ref}
            aria-label="Live Interactive Blueprint Demo"
          >
            <h2 className="home-section-title">⚡ See It In Action</h2>
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
                    <button type="button" className={`demo-tab ${activeTab === 'dockerfile' ? 'active' : ''}`} onClick={() => setActiveTab('dockerfile')}>
                      Dockerfile
                    </button>
                    <button type="button" className={`demo-tab ${activeTab === 'compose' ? 'active' : ''}`} onClick={() => setActiveTab('compose')}>
                      docker-compose.yml
                    </button>
                  </div>
                  <button type="button" className="demo-copy-btn" onClick={handleCopy}>
                    {copied ? '✅ Copied!' : '📋 Copy Code'}
                  </button>
                </div>
              </div>
              <div className="demo-code-container">
                <SyntaxCode tokens={activeTab === 'dockerfile' ? activePreset.dockerfile : activePreset.compose} />
              </div>
            </div>
          </section>

          {/* ── Benchmark ─────────────────────────────────────────────────── */}
          <section
            className={`home-section scroll-reveal ${benchReveal.visible ? 'visible' : ''}`}
            ref={benchReveal.ref}
            aria-label="Performance Benchmark"
          >
            <h2 className="home-section-title">📊 Why Developers Choose Dockeryze</h2>
            <BenchmarkSection />
          </section>

          {/* ── CTA Banner ────────────────────────────────────────────────── */}
          <section
            className={`home-cta-banner scroll-reveal ${ctaReveal.visible ? 'visible' : ''}`}
            ref={ctaReveal.ref}
            aria-label="Get Started"
          >
            <div className="home-cta-content">
              <div className="home-cta-icon">
                <img src="/dockeryze-icon.png?v=3" alt="Dockeryze Logo" width={52} height={52} style={{ borderRadius: '10px' }} />
              </div>
              <div className="home-cta-text">
                <h3 className="home-cta-title">Ready to containerize your project?</h3>
                <p className="home-cta-desc">
                  Drop your repository ZIP archive and get production-ready Docker blueprints in seconds.
                </p>
              </div>
            </div>
            <a href="/workspace" className="home-cta-btn home-cta-btn-pulse" id="bottom-cta-launch">
              🚀 Launch Workspace
            </a>
          </section>
        </main>

        {/* ── Rich Footer ─────────────────────────────────────────────────── */}
        <footer className="footer-rich" role="contentinfo">
          <div className="footer-rich-inner">
            <div className="footer-brand">
              <span className="footer-logo-text" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/dockeryze-icon.png?v=3" alt="Dockeryze Logo" width={28} height={28} style={{ borderRadius: '6px' }} />
                Dockeryze
              </span>
              <p className="footer-tagline">AI-powered containerization for modern developers.</p>
              <p className="footer-powered">Powered by <span>Gemini 2.0</span> &amp; Cosine RAG Vector DB</p>
            </div>
            <nav className="footer-nav-cols" aria-label="Footer Navigation">
              <div className="footer-nav-col">
                <span className="footer-nav-heading">Tools</span>
                <a href="/workspace" className="footer-nav-link">Workspace</a>
                <a href="/folder-to-zip" className="footer-nav-link">Folder to ZIP</a>
                <a href="/history" className="footer-nav-link">History</a>
              </div>
              <div className="footer-nav-col">
                <span className="footer-nav-heading">Learn</span>
                <a href="/how-it-works" className="footer-nav-link">How It Works</a>
                <a href="/docs" className="footer-nav-link">Documentation</a>
                <a href="/security" className="footer-nav-link">Security</a>
              </div>
            </nav>
          </div>
          <div className="footer-bottom">
            <span>Dockeryze &copy; {new Date().getFullYear()} — All rights reserved.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
