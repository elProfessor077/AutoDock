import { auth } from "@/auth";
import SecurityShield from '@/components/SecurityShield';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: '🔒 Security — AutoDock',
  description: 'Learn about AutoDock\'s multi-layered security architecture: payload limits, Zip Slip protection, strict schema validation, and zero persistent storage.',
};

export default async function SecurityPage() {
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
      <Sidebar session={session} activePath="/security" />

      {/* Main Content Layout Area */}
      <div className="main-content-layout">
        <main className="app-container" id="main-content">
          <section className="hero" aria-labelledby="security-page-title" style={{ marginBottom: '24px' }}>
            <h1 id="security-page-title" className="hero-title">
              Multi-Layered <span className="gradient-text">Security Architecture</span>
            </h1>
            <p className="hero-subtitle">
              Every archive submission is processed through active Zip Slip path traversal defenses and ephemeral memory shredders. No project data or source code is ever persisted.
            </p>
          </section>

          <SecurityShield />
        </main>

        {/* Footer */}
        <footer className="footer" role="contentinfo">
          <div className="nav-container">
            <p>Powered by <span>Gemini 2.0</span> &amp; Cosine RAG Vector DB · AutoDock &copy; {new Date().getFullYear()}</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
