import { auth } from "@/auth";
import Sidebar from '@/components/Sidebar';
import HistoryList from '@/components/HistoryList';

export const metadata = {
  title: '📜 History — Dockeryze',
  description: 'View your past blueprint generations, detected ecosystems, and re-download previous outputs.',
};

export default async function HistoryPage() {
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
      <Sidebar session={session} activePath="/history" />

      {/* Main Content Layout Area */}
      <div className="main-content-layout">
        <main className="app-container" id="main-content">
          <section className="hero" aria-labelledby="history-page-title" style={{ marginBottom: '40px' }}>
            <h1 id="history-page-title" className="hero-title">
              Pipeline <span className="gradient-text">History</span>
            </h1>
            <p className="hero-subtitle">
              Review your previous blueprint generations, detected ecosystems, and pipeline outcomes.
            </p>
          </section>

          <HistoryList />
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
