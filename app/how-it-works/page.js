import { auth } from "@/auth";
import FeatureGrid from '@/components/FeatureGrid';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: '⚙️ How It Works — AutoDock',
  description: 'Learn how AutoDock transforms your project archive into production-ready Docker & Compose blueprints in three simple steps.',
};

export default async function HowItWorksPage() {
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
      <Sidebar session={session} activePath="/how-it-works" />

      {/* Main Content Layout Area */}
      <div className="main-content-layout">
        <main className="app-container" id="main-content">
          <section className="hero" aria-labelledby="how-it-works-title" style={{ marginBottom: '24px' }}>
            <h1 id="how-it-works-title" className="hero-title">
              Under the Hood of <span className="gradient-text">AutoDock</span>
            </h1>
            <p className="hero-subtitle">
              From repository submission to production-hardened containers — discover our 3-stage intelligence pipeline powered by manifest scanning, RAG vector retrieval, and Gemini 2.0.
            </p>
          </section>

          <FeatureGrid />
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
