import { auth } from "@/auth";
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: '📚 Documentation — Dockeryze',
  description: 'Understand how Dockeryze works and critical security precautions to take during containerization.',
};

export default async function DocsPage() {
  const session = await auth();

  return (
    <div className="sidebar-layout">
      {/* Moving Ambient Background Orbs */}
      <div className="bg-orbs" aria-hidden="true">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      {/* Sidebar Navigation */}
      <Sidebar session={session} activePath="/docs" />

      {/* Main Content Layout Area */}
      <div className="main-content-layout">
        <main className="app-container" id="main-content">
          <section className="hero" aria-labelledby="docs-page-title" style={{ marginBottom: '40px' }}>
            <h1 id="docs-page-title" className="hero-title">
              Platform &amp; <span className="gradient-text">Security Docs</span>
            </h1>
            <p className="hero-subtitle">
              Comprehensive reference guide for supported build manifests, RAG vector retrieval pipelines, and pre-upload credential sanitization best practices.
            </p>
          </section>

          <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
            
            {/* Section 1: How It Works */}
            <div className="glass-card" style={{ padding: '40px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-primary)' }}>
                ⚙️ How It Works
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', lineHeight: '1.7', marginBottom: '20px' }}>
                Dockeryze simplifies containerization by scanning project manifests and building optimized blueprints using RAG (Retrieval-Augmented Generation) and Gemini 2.0.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ paddingLeft: '15px', borderLeft: '3px solid var(--color-cyan)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '5px' }}>1. Project Zip Submission</h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    Upload your project workspace as a `.zip` archive. Files must be within the 10MB payload ceiling limit.
                  </p>
                </div>
                
                <div style={{ paddingLeft: '15px', borderLeft: '3px solid var(--color-primary)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '5px' }}>2. Manifest Scan & RAG Query</h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    Dockeryze parses workspace manifests (e.g., `package.json`, `requirements.txt`, `go.mod`, etc.) and queries our vector database for matching LTS (Long Term Support) base images.
                  </p>
                </div>

                <div style={{ paddingLeft: '15px', borderLeft: '3px solid var(--color-success)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '5px' }}>3. Intelligent Blueprint Generation</h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    The AI engine integrates discovered patterns to synthesize optimized Dockerfiles, `.dockerignore` files, and `docker-compose.yml` setups.
                  </p>
                </div>

                <div style={{ paddingLeft: '15px', borderLeft: '3px solid #a78bfa' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '5px' }}>4. Ephemeral Compilation</h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    Files are bundled into a download zip. Immediately after packaging is complete, the workspace files are shredded and deleted.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Security Considerations */}
            <div className="glass-card" style={{ padding: '40px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-error)' }}>
                🛡️ Security Concerns & Best Practices
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', lineHeight: '1.7', marginBottom: '20px' }}>
                While Dockeryze goes to extreme lengths to handle your data securely, users must practice standard hygiene to avoid exposure.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                <div style={{ padding: '20px', background: 'rgba(244, 63, 94, 0.03)', border: '1px solid rgba(244, 63, 94, 0.1)', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-error)', marginBottom: '8px' }}>
                    🔑 Strip Active API Keys & Secrets
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                    Never upload raw `.env` files, SSH keys, credentials, or production databases. Always check your archive to ensure active API secrets are removed before submission.
                  </p>
                </div>

                <div style={{ padding: '20px', background: 'rgba(99, 102, 241, 0.03)', border: '1px solid rgba(99, 102, 241, 0.1)', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '8px' }}>
                    📦 Manifest-focused Analysis
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                    Dockeryze's pipeline only inspects code structure and build manifests to identify ecosystems and libraries. It does not parse application business logic or database values.
                  </p>
                </div>

                <div style={{ padding: '20px', background: 'rgba(6, 182, 212, 0.03)', border: '1px solid rgba(6, 182, 212, 0.1)', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-cyan)', marginBottom: '8px' }}>
                    🌪️ Path Traversal Defenses
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                    The backend features Zip Slip mitigation. Any archive attempting to write files outside of its extraction sandbox will be instantly blocked and deleted.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: User Checklist */}
            <div className="glass-card" style={{ padding: '40px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>
                ✅ Pre-upload Checklist
              </h2>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span>✔️</span> <span>Double-check that the file extension is exactly <strong>.zip</strong>.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span>✔️</span> <span>Verify size is under 10MB.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span>✔️</span> <span>Ensure <strong>.git</strong> directories and heavy cache folders (e.g. <code>node_modules</code>, <code>venv</code>) are excluded.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span>✔️</span> <span>Confirm no live credential or password strings reside in config files.</span>
                </li>
              </ul>
            </div>

          </div>
        </main>

        {/* Footer */}
        <footer className="footer" role="contentinfo">
          <div className="nav-container">
            <p>Powered by <span>Gemini 2.0</span> &amp; Cosine RAG Vector DB · Dockeryze &copy; {new Date().getFullYear()}</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
