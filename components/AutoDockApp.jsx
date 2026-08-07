'use client';

import React, { useState, useCallback, useEffect } from 'react';

import JSZip from 'jszip';

import HeroSection from './HeroSection';
import Dropzone from './Dropzone';
import PipelineVisualizer from './PipelineVisualizer';
import StatusBadge from './StatusBadge';
import BlueprintViewer from './BlueprintViewer';
import SecurityAuditBadge from './SecurityAuditBadge';
import SecretShieldBuilder from './SecretShieldBuilder';
import DigitalTwinCard from './DigitalTwinCard';
import { auditContainerSecurity } from '@/lib/security/auditor';
import { saveHistoryEntry } from './HistoryList';
import AuthButton from './AuthButton';
import Sidebar from './Sidebar';

import { NodeIcon, PythonIcon, GoIcon, RustIcon, JavaIcon, RubyIcon, PhpIcon, DockerIcon, GeminiIcon, RagIcon, ShieldIcon, ShredderIcon } from './EcosystemIcons';

const TECH_BADGES = [
  { label: 'Node.js', Icon: NodeIcon },
  { label: 'Python', Icon: PythonIcon },
  { label: 'Go', Icon: GoIcon },
  { label: 'Ruby', Icon: RubyIcon },
  { label: 'Rust', Icon: RustIcon },
  { label: 'Java', Icon: JavaIcon },
  { label: 'PHP', Icon: PhpIcon },
  { label: 'Docker', Icon: DockerIcon },
  { label: 'Gemini 2.0', Icon: GeminiIcon },
  { label: 'RAG Vector DB', Icon: RagIcon },
  { label: 'Zip Slip Guard', Icon: ShieldIcon },
  { label: 'Shredder', Icon: ShredderIcon },
];

export default function AutoDockApp({ session }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | uploading | extracting | scanning | searching | analyzing | compiling | success | error
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [blueprintFiles, setBlueprintFiles] = useState(null);

  const handleFileChange = useCallback((selectedFile) => {
    setFile(selectedFile);
    if (status !== 'idle') {
      setStatus('idle');
      setErrorMessage('');
      setBlueprintFiles(null);
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(null);
      }
    }
  }, [status, downloadUrl]);

  // Clean up URL on unmount
  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const handleSubmit = async () => {
    if (!file || status !== 'idle') return;

    setErrorMessage('');
    setBlueprintFiles(null);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }

    // Set initial pipeline step
    setStatus('uploading');

    // Simulate progress visualizer steps as we wait for the single API call
    let activeStatus = 'uploading';
    const timer = setInterval(() => {
      setStatus((current) => {
        if (current === 'uploading') { activeStatus = 'extracting'; return 'extracting'; }
        if (current === 'extracting') { activeStatus = 'scanning'; return 'scanning'; }
        if (current === 'scanning') { activeStatus = 'searching'; return 'searching'; }
        if (current === 'searching') { activeStatus = 'analyzing'; return 'analyzing'; }
        if (current === 'analyzing') { activeStatus = 'compiling'; return 'compiling'; }
        return current;
      });
    }, 1500);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      clearInterval(timer);

      if (!response.ok) {
        let msg = `Server Error (${response.status})`;
        try {
          const json = await response.json();
          msg = json.error || msg;
        } catch (_) {}
        throw new Error(msg);
      }

      // Read cache header
      const cacheHeader = response.headers.get('x-cache');
      const isCached = cacheHeader === 'HIT';

      // Read ZIP response stream
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      // Unpack blueprint files in memory for unzipped live preview & copy
      try {
        const zip = await JSZip.loadAsync(blob);
        const extracted = {};
        for (const [filename, fileObj] of Object.entries(zip.files)) {
          if (!fileObj.dir) {
            extracted[filename] = await fileObj.async('text');
          }
        }
        setBlueprintFiles(extracted);
      } catch (zipErr) {
        console.error('[Blueprint] Failed to unpack zip for preview:', zipErr);
      }

      setStatus('success');

      // Save to history
      const ecosystem = response.headers.get('x-ecosystem') || 'unknown';
      const runtime = response.headers.get('x-runtime') || '';
      const framework = response.headers.get('x-framework') || '';
      saveHistoryEntry({
        fileName: file.name,
        fileSize: file.size,
        status: 'success',
        ecosystem,
        runtime,
        framework,
        isCached,
      });

      // Trigger auto-download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'AutoDock-blueprint.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();

    } catch (err) {
      clearInterval(timer);
      console.error(err);
      setStatus('error');
      const errMsg = err.message || 'An unexpected pipeline error occurred.';
      setErrorMessage(errMsg);

      // Save failed run to history
      saveHistoryEntry({
        fileName: file?.name || 'Unknown',
        fileSize: file?.size || 0,
        status: 'error',
        errorMessage: errMsg,
      });
    }
  };

  const handleReset = () => {
    setFile(null);
    setStatus('idle');
    setErrorMessage('');
    setBlueprintFiles(null);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
  };


  const isBtnDisabled = !file || (status !== 'idle' && status !== 'error' && status !== 'success');

  return (
    <div className="sidebar-layout">
      {/* Moving Ambient Background Orbs */}
      <div className="bg-orbs" aria-hidden="true">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      {/* Sidebar Navigation */}
      <Sidebar session={session} activePath="/workspace" />

      {/* Main Content Layout Area */}
      <div className="main-content-layout">
        <main className="app-container" id="main-content">
          <HeroSection />

          <div className="dashboard-grid">
            {/* left: file upload panel */}
            <div className="glass-card">
              <h3 className="card-title">📦 Workspace Dropzone</h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
                Drop your workspace repository zip. AutoDock processes manifests securely.
              </p>

              <Dropzone
                file={file}
                onFileChange={handleFileChange}
                disabled={status !== 'idle' && status !== 'error' && status !== 'success'}
              />

              {status === 'success' && downloadUrl && (
                <a href={downloadUrl} download="AutoDock-blueprint.zip" className="action-btn" style={{ background: 'var(--color-success)', boxShadow: '0 4px 15px var(--color-success-glow)' }}>
                  📥 Download Blueprint Again
                </a>
              )}

              {status === 'error' ? (
                <button onClick={handleReset} className="action-btn secondary">
                  🔄 Clear & Retry Upload
                </button>
              ) : (
                status === 'success' ? (
                  <button onClick={handleReset} className="action-btn secondary" style={{ color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}>
                    🧹 Clear Board
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isBtnDisabled}
                    className="action-btn"
                    aria-label="Submit project for deployment packaging"
                  >
                    {status === 'idle' ? '🚀 Generate Deployment Blueprint' : '⚙️ Analyzing Container Stack...'}
                  </button>
                )
              )}

              <StatusBadge status={status} errorMessage={errorMessage} />
            </div>

            {/* right: pipeline visualizer progress */}
            <div className="glass-card">
              <PipelineVisualizer currentState={status} />
            </div>

            {/* DevSecOps Container Security Audit Badge */}
            {blueprintFiles && (
              <SecurityAuditBadge
                audit={auditContainerSecurity(
                  blueprintFiles['Dockerfile'] || '',
                  blueprintFiles['docker-compose.yml'] || ''
                )}
              />
            )}

            {/* Secret Shield Environment Variable Builder */}
            {blueprintFiles && (
              <SecretShieldBuilder
                initialEnv={blueprintFiles['.env.example'] || ''}
              />
            )}

            {/* Unzipped Live Blueprint Folder Viewer */}
            {blueprintFiles && <BlueprintViewer files={blueprintFiles} />}

            {/* Digital Twin Container Resource Simulator Card */}
            {blueprintFiles && <DigitalTwinCard ecosystem="nodejs" dependencyCount={15} databases={['postgres']} />}
          </div>

          {/* Tech badges marquee */}
          <div className="tech-marquee-wrapper" aria-label="Ecosystems Supported">
            <div className="tech-marquee-track">
              {/* Duplicate the set twice for seamless infinite scroll */}
              {[...TECH_BADGES, ...TECH_BADGES].map((badge, i) => (
                <span key={`${badge.label}-${i}`} className="tech-badge" role="listitem">
                  <badge.Icon size={16} />
                  <span>{badge.label}</span>
                </span>
              ))}
            </div>
          </div>
        </main>

        {/* Footer copyright */}
        <footer className="footer" role="contentinfo">
          <div className="nav-container">
            <p>Powered by <span>Gemini 2.0</span> &amp; Cosine RAG Vector DB · AutoDock &copy; {new Date().getFullYear()}</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
