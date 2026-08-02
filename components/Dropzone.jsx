'use client';

import React, { useRef, useState, useCallback } from 'react';
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

export default function Dropzone({ file, onFileChange, disabled }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isZippingFolder, setIsZippingFolder] = useState(false);
  const [zippingStatus, setZippingStatus] = useState('');
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || isZippingFolder) return;

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, [disabled, isZippingFolder]);

  // Recursively scan dropped folder entries
  const scanFilesFromEntry = async (entry, path = '') => {
    let result = [];
    if (entry.isFile) {
      const f = await new Promise((resolve) => entry.file(resolve));
      result.push({
        fileObj: f,
        relativePath: path + f.name,
        size: f.size
      });
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();
      const entries = await new Promise((resolve) => {
        let allEntries = [];
        const readEntries = () => {
          dirReader.readEntries((batch) => {
            if (!batch.length) {
              resolve(allEntries);
            } else {
              allEntries = allEntries.concat(Array.from(batch));
              readEntries();
            }
          });
        };
        readEntries();
      });

      for (const childEntry of entries) {
        const childFiles = await scanFilesFromEntry(childEntry, path + entry.name + '/');
        result = result.concat(childFiles);
      }
    }
    return result;
  };

  // Convert array of scanned folder files into a single .zip File
  const createZipFromScanned = async (scannedFiles, rootFolderName) => {
    setIsZippingFolder(true);
    setZippingStatus('Filtering node_modules & build files...');

    const filtered = scannedFiles.filter(item => {
      const parts = item.relativePath.split('/');
      return !parts.some(p => DEFAULT_EXCLUDES.includes(p.toLowerCase()) || DEFAULT_EXCLUDES.includes(p));
    });

    if (filtered.length === 0) {
      alert('The dropped folder contains no valid files (or all files were ignored).');
      setIsZippingFolder(false);
      setZippingStatus('');
      return;
    }

    setZippingStatus(`Zipping ${filtered.length} files...`);
    const zip = new JSZip();
    filtered.forEach(item => {
      zip.file(item.relativePath, item.fileObj);
    });

    try {
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
      const zipFileName = `${rootFolderName || 'project'}.zip`;
      const zipFile = new File([blob], zipFileName, { type: 'application/zip' });

      // Enforce 10MB limit
      if (zipFile.size > 10 * 1024 * 1024) {
        alert(`Compressed ZIP size (${(zipFile.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 10MB limit.`);
        setIsZippingFolder(false);
        setZippingStatus('');
        return;
      }

      onFileChange(zipFile);
    } catch (err) {
      console.error('Folder auto-zip error:', err);
      alert('Failed to auto-compress dropped folder.');
    } finally {
      setIsZippingFolder(false);
      setZippingStatus('');
    }
  };

  const validateAndSetFile = useCallback((selectedFile) => {
    if (!selectedFile) return;

    // Validate type (.zip only)
    if (!selectedFile.name.toLowerCase().endsWith('.zip')) {
      alert('Only .zip archives are supported! You can drop an uncompressed folder directly to auto-zip it.');
      return;
    }

    // Validate size (10MB ceiling)
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit!');
      return;
    }

    onFileChange(selectedFile);
  }, [onFileChange]);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (disabled || isZippingFolder) return;

    const items = e.dataTransfer.items;
    if (items && items.length > 0) {
      const firstEntry = items[0].webkitGetAsEntry ? items[0].webkitGetAsEntry() : null;
      if (firstEntry && firstEntry.isDirectory) {
        // User dropped a folder! Auto-zip it
        let scanned = [];
        let folderName = firstEntry.name.replace('/', '');
        for (let i = 0; i < items.length; i++) {
          const entry = items[i].webkitGetAsEntry ? items[i].webkitGetAsEntry() : null;
          if (entry) {
            const entryFiles = await scanFilesFromEntry(entry, '');
            scanned = scanned.concat(entryFiles);
          }
        }
        if (scanned.length > 0) {
          await createZipFromScanned(scanned, folderName);
        }
        return;
      }
    }

    // Standard zip file drop
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }, [disabled, isZippingFolder, validateAndSetFile]);

  const handleChange = useCallback((e) => {
    e.preventDefault();
    if (disabled || isZippingFolder) return;

    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  }, [disabled, isZippingFolder, validateAndSetFile]);

  const handleFolderSelectChange = useCallback(async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const firstRel = selectedFiles[0].webkitRelativePath || selectedFiles[0].name;
    const folderName = firstRel.split('/')[0] || 'project';

    const scanned = selectedFiles.map(f => ({
      fileObj: f,
      relativePath: f.webkitRelativePath || f.name,
      size: f.size
    }));

    await createZipFromScanned(scanned, folderName);
  }, []);

  const onButtonClick = () => {
    if (disabled || isZippingFolder) return;
    fileInputRef.current.click();
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onFileChange(null);
  };

  const handleKeyDown = (e) => {
    if (disabled || isZippingFolder) return;
    if (e.key === 'Enter' || e.key === ' ') {
      onButtonClick();
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="dropzone-wrapper">
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        onChange={handleChange}
        disabled={disabled || isZippingFolder}
        style={{ display: 'none' }}
        aria-label="Upload zip archive"
      />

      <input
        ref={folderInputRef}
        type="file"
        onChange={handleFolderSelectChange}
        disabled={disabled || isZippingFolder}
        style={{ display: 'none' }}
        webkitdirectory="true"
        directory="true"
        multiple
        aria-label="Upload folder"
      />

      {!file ? (
        <div
          className={`dropzone ${isDragActive ? 'drag-over' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          onKeyDown={handleKeyDown}
          tabIndex={disabled || isZippingFolder ? -1 : 0}
          role="button"
          aria-disabled={disabled || isZippingFolder}
        >
          {isZippingFolder ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div className="spinner" style={{ width: '28px', height: '28px', borderWidth: '3px' }} />
              <div className="dropzone-title" style={{ color: 'var(--color-primary)' }}>
                {zippingStatus}
              </div>
              <div className="dropzone-sub">Converting folder to `.zip` in browser memory...</div>
            </div>
          ) : (
            <>
              <div className="dropzone-icon-container">
                📦
              </div>
              <div className="dropzone-text-group">
                <p className="dropzone-title">
                  Drag & drop your project <span className="dropzone-browse">ZIP</span> or <span className="dropzone-browse">Folder</span>
                </p>
                <p className="dropzone-sub">
                  Supports raw <strong>folders</strong> &amp; <strong>.zip</strong> archives up to 10MB
                </p>
              </div>
              <div className="dropzone-constraints">
                <span>🗜️ .zip or raw folder</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    folderInputRef.current.click();
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-cyan)',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  📁 Select Folder
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="file-preview">
          <span className="file-preview-icon">🗂️</span>
          <div className="file-preview-info">
            <p className="file-preview-name">{file.name}</p>
            <p className="file-preview-size">{formatBytes(file.size)}</p>
          </div>
          {!disabled && (
            <button
              type="button"
              className="file-preview-remove"
              onClick={handleRemove}
              aria-label="Remove uploaded file"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
}
