'use client';

import React, { useState, useRef, useCallback } from 'react';
import JSZip from 'jszip';

const DEFAULT_EXCLUDES = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  '__pycache__',
  '.venv',
  'venv',
  '.DS_Store',
  'coverage',
  '.turbo'
];

export default function FolderToZipConverter() {
  const [files, setFiles] = useState([]);
  const [folderName, setFolderName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [zipBlob, setZipBlob] = useState(null);
  const [zipStats, setZipStats] = useState(null);
  const [excludes, setExcludes] = useState(DEFAULT_EXCLUDES);
  const [customExclude, setCustomExclude] = useState('');
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef(null);

  // Helper to calculate total size
  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Filter out excluded paths
  const getFilteredFiles = useCallback(() => {
    return files.filter(file => {
      const relPath = file.relativePath || file.webkitRelativePath || file.name;
      const pathParts = relPath.split('/');
      return !pathParts.some(part => excludes.includes(part.toLowerCase()) || excludes.includes(part));
    });
  }, [files, excludes]);

  // Handle standard folder input selection
  const handleFolderSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    // Detect top folder name
    const firstRel = selectedFiles[0].webkitRelativePath || selectedFiles[0].name;
    const rootName = firstRel.split('/')[0] || 'project';
    
    setFolderName(rootName);
    setFiles(selectedFiles.map(f => ({
      fileObj: f,
      relativePath: f.webkitRelativePath || f.name,
      size: f.size
    })));
    setZipBlob(null);
    setZipStats(null);
  };

  // Safe file loader with error handling
  const getFileFromEntry = (fileEntry) => {
    return new Promise((resolve) => {
      fileEntry.file(
        (file) => resolve(file),
        (err) => {
          console.warn('Could not read file entry:', fileEntry.name, err);
          resolve(null);
        }
      );
    });
  };

  // Safe directory reader with batch looping & error handling
  const getEntriesFromDirReader = (dirReader) => {
    return new Promise((resolve) => {
      let allEntries = [];
      const readBatch = () => {
        dirReader.readEntries(
          (batch) => {
            if (!batch || batch.length === 0) {
              resolve(allEntries);
            } else {
              allEntries = allEntries.concat(Array.from(batch));
              readBatch();
            }
          },
          (err) => {
            console.warn('Could not read directory entries:', err);
            resolve(allEntries);
          }
        );
      };
      readBatch();
    });
  };

  // Traverse file system entries recursively for Drag & Drop
  const scanFilesFromEntry = async (entry, path = '') => {
    let result = [];
    if (!entry) return result;

    if (entry.isFile) {
      const file = await getFileFromEntry(entry);
      if (file) {
        result.push({
          fileObj: file,
          relativePath: path + file.name,
          size: file.size
        });
      }
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();
      const entries = await getEntriesFromDirReader(dirReader);

      for (const childEntry of entries) {
        const childFiles = await scanFilesFromEntry(childEntry, path + entry.name + '/');
        result = result.concat(childFiles);
      }
    }
    return result;
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    if (isProcessing) return;

    setIsProcessing(true);
    setProgressStatus('Scanning dropped folder contents...');
    
    let scanned = [];
    let rootFolderName = '';

    const items = e.dataTransfer.items;
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
        if (entry) {
          if (!rootFolderName) rootFolderName = entry.name.replace('/', '');
          const entryFiles = await scanFilesFromEntry(entry, '');
          scanned = scanned.concat(entryFiles);
        }
      }
    }

    // Fallback if webkitGetAsEntry didn't find entries but files exist
    if (scanned.length === 0 && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const firstRel = droppedFiles[0].webkitRelativePath || droppedFiles[0].name;
      rootFolderName = firstRel.split('/')[0] || 'dropped-folder';

      scanned = droppedFiles.map(f => ({
        fileObj: f,
        relativePath: f.webkitRelativePath || f.name,
        size: f.size
      }));
    }

    if (scanned.length > 0) {
      setFolderName(rootFolderName || 'converted-folder');
      setFiles(scanned);
      setZipBlob(null);
      setZipStats(null);
    } else {
      alert('No files or directories were detected in the dropped selection.');
    }

    setIsProcessing(false);
    setProgressStatus('');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const toggleExclude = (item) => {
    setExcludes(prev => 
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    );
  };

  const handleAddCustomExclude = (e) => {
    e.preventDefault();
    const trimmed = customExclude.trim().toLowerCase();
    if (trimmed && !excludes.includes(trimmed)) {
      setExcludes([...excludes, trimmed]);
      setCustomExclude('');
    }
  };

  // Compress filtered files to ZIP using JSZip
  const handleConvertToZip = async () => {
    const validFiles = getFilteredFiles();
    if (validFiles.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setProgressStatus('Initializing compressor...');

    const zip = new JSZip();
    const totalOriginalBytes = validFiles.reduce((acc, f) => acc + f.size, 0);

    // Add each file to zip
    for (let i = 0; i < validFiles.length; i++) {
      const item = validFiles[i];
      zip.file(item.relativePath, item.fileObj);
      if (i % 20 === 0 || i === validFiles.length - 1) {
        const pct = Math.round(((i + 1) / validFiles.length) * 40);
        setProgress(pct);
        setProgressStatus(`Staging file ${i + 1} of ${validFiles.length}...`);
      }
    }

    setProgressStatus('Compressing archive stream...');
    try {
      const generatedBlob = await zip.generateAsync(
        {
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 }
        },
        (metadata) => {
          const zipPct = 40 + Math.round(metadata.percent * 0.6);
          setProgress(zipPct);
          setProgressStatus(`Compressing: ${Math.round(metadata.percent)}%`);
        }
      );

      setZipBlob(generatedBlob);
      setZipStats({
        compressedSize: generatedBlob.size,
        originalSize: totalOriginalBytes,
        fileCount: validFiles.length,
        savedRatio: totalOriginalBytes > 0 
          ? Math.max(0, Math.round(((totalOriginalBytes - generatedBlob.size) / totalOriginalBytes) * 100))
          : 0
      });
      setProgress(100);
      setProgressStatus('Compression complete!');
    } catch (err) {
      console.error('ZIP generation error:', err);
      setProgressStatus('Failed to create ZIP package.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!zipBlob) return;
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${folderName || 'archive'}.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const filteredList = getFilteredFiles();
  const totalFilteredSize = filteredList.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="dashboard-grid" style={{ maxWidth: '900px' }}>
      {/* Folder Selection Card */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="card-title" style={{ margin: 0 }}>
            <span>📁</span> Folder to ZIP Converter
          </h3>
          <span className="nav-badge">100% Client-Side Privacy</span>
        </div>
        
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
          Select or drag any project folder to bundle it into a clean `.zip` archive. 
          Smart filter presets automatically remove heavy build artifacts like <code>node_modules</code>.
        </p>

        {/* Hidden directory input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFolderSelect}
          style={{ display: 'none' }}
          webkitdirectory="true"
          directory="true"
          multiple
        />

        {/* Dropzone area */}
        <div
          className={`dropzone ${dragOver ? 'drag-over' : ''} ${files.length > 0 ? 'has-file' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ minHeight: '180px', padding: '24px' }}
        >
          <div className="dropzone-icon-container">
            {files.length > 0 ? '📦' : '📂'}
          </div>
          <div>
            <div className="dropzone-title">
              {files.length > 0 
                ? `Selected: "${folderName}" (${files.length} files detected)`
                : 'Click to select a Folder or drag & drop directory here'}
            </div>
            <div className="dropzone-sub">
              {files.length > 0 ? 'Click to select a different directory' : 'Supports complete project directories with subfolders'}
            </div>
          </div>
        </div>

        {/* Filter Presets Panel */}
        {files.length > 0 && (
          <div style={{ marginTop: '24px', background: 'rgba(15, 23, 42, 0.5)', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                🛡️ Smart Ignore Filters ({excludes.length} active)
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                Click badge to toggle ignore pattern
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {excludes.map(item => (
                <button
                  key={item}
                  onClick={() => toggleExclude(item)}
                  type="button"
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#fca5a5',
                    borderRadius: '20px',
                    padding: '4px 10px',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                  title="Click to include this pattern"
                >
                  ✕ {item}
                </button>
              ))}
            </div>

            <form onSubmit={handleAddCustomExclude} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={customExclude}
                onChange={(e) => setCustomExclude(e.target.value)}
                placeholder="Add custom pattern to ignore (e.g. .env, *.log)..."
                style={{
                  flex: 1,
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  color: 'var(--color-text-primary)',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                className="action-btn"
                style={{ width: 'auto', padding: '6px 14px', margin: 0, fontSize: '12px' }}
              >
                + Add Filter
              </button>
            </form>
          </div>
        )}

        {/* Action Button & Compression Controls */}
        {files.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            {isProcessing ? (
              <div style={{ background: 'rgba(15, 21, 36, 0.8)', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', color: 'var(--color-text-primary)' }}>
                  <span>{progressStatus}</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{progress}%</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${progress}%`, 
                      background: 'var(--gradient-hero)', 
                      transition: 'width 0.2s ease' 
                    }} 
                  />
                </div>
              </div>
            ) : zipBlob ? (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleDownload}
                  className="action-btn"
                  style={{ flex: 1, minWidth: '200px', background: 'var(--color-success)', boxShadow: '0 4px 15px var(--color-success-glow)' }}
                >
                  ⚡ Download {folderName}.zip ({formatBytes(zipStats?.compressedSize)})
                </button>
                <a
                  href="/workspace"
                  className="action-btn secondary"
                  style={{ flex: 1, minWidth: '200px', textAlign: 'center', textDecoration: 'none' }}
                >
                  🚀 Upload directly to Dockeryze
                </a>
              </div>
            ) : (
              <button
                onClick={handleConvertToZip}
                disabled={filteredList.length === 0}
                className="action-btn"
              >
                📦 Convert {filteredList.length} files ({formatBytes(totalFilteredSize)}) to ZIP
              </button>
            )}
          </div>
        )}
      </div>

      {/* Summary and Inspection Card */}
      {files.length > 0 && (
        <div className="glass-card">
          <h3 className="card-title">📊 Folder Summary & Inspect</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: 'var(--badge-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Raw Files</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{files.length}</div>
            </div>
            <div style={{ background: 'var(--badge-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Filtered Files</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-cyan)' }}>{filteredList.length}</div>
            </div>
            <div style={{ background: 'var(--badge-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Est. Zip Payload</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)' }}>{formatBytes(totalFilteredSize)}</div>
            </div>
            {zipStats && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-success)' }}>Saved Space</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-success)' }}>{zipStats.savedRatio}% lower</div>
              </div>
            )}
          </div>

          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
            Included Files Preview ({filteredList.slice(0, 8).length} of {filteredList.length})
          </div>

          <div style={{ 
            background: '#060913', 
            borderRadius: '8px', 
            padding: '12px', 
            border: '1px solid rgba(255,255,255,0.08)',
            maxHeight: '180px',
            overflowY: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px'
          }}>
            {filteredList.length === 0 ? (
              <div style={{ color: 'var(--color-error)' }}>All files are excluded by the ignore filters!</div>
            ) : (
              filteredList.slice(0, 20).map((f, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#9cdcfe' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>📄 {f.relativePath}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>{formatBytes(f.size)}</span>
                </div>
              ))
            )}
            {filteredList.length > 20 && (
              <div style={{ color: 'var(--color-text-muted)', paddingTop: '6px', textAlign: 'center' }}>
                ...and {filteredList.length - 20} more files
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
