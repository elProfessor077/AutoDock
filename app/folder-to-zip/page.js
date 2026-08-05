import { auth } from "@/auth";
import Sidebar from '@/components/Sidebar';
import FolderToZipConverter from '@/components/FolderToZipConverter';

export const metadata = {
  title: '📦 Folder to ZIP Converter — Dockeryze',
  description: 'Convert any folder or repository directly into a clean compressed ZIP archive with smart node_modules and build artifact filters.',
};

export default async function FolderToZipPage() {
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
      <Sidebar session={session} activePath="/folder-to-zip" />

      {/* Main Content Layout Area */}
      <div className="main-content-layout">
        <main className="app-container" id="main-content">
          <section className="hero" aria-labelledby="folder-to-zip-title" style={{ marginBottom: '24px' }}>
            <div className="hero-eyebrow">
              <span className="dot" />
              <span>IN-BROWSER ARCHIVER</span>
            </div>
            <h1 id="folder-to-zip-title" className="hero-title">
              Local Folder to <span className="gradient-text">ZIP Converter</span>
            </h1>
            <p className="hero-subtitle">
              Compress local folders and source code repositories directly in your browser with automated filters for <code>node_modules</code>, <code>.git</code>, and build caches before container analysis.
            </p>
          </section>

          <FolderToZipConverter />
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
