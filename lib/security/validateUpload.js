/**
 * Upload Validation — enforces size and extension constraints on incoming files.
 * All uploaded zip archives are treated as untrusted payloads.
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSION = '.zip';

/**
 * Validates an uploaded file from FormData.
 *
 * @param {File} file  The File object from the FormData request
 * @returns {{ valid: boolean, error?: string, status?: number }}
 */
function validateUpload(file) {
  if (!file) {
    return { valid: false, error: 'No file was uploaded.', status: 400 };
  }

  // ── Extension check ──────────────────────────────────────────────────────
  const name = file.name || '';
  const ext = name.slice(name.lastIndexOf('.')).toLowerCase();

  if (ext !== ALLOWED_EXTENSION) {
    return {
      valid: false,
      error: `Only .zip files are accepted. Received: "${ext || 'no extension'}"`,
      status: 400,
    };
  }

  // ── Size check ───────────────────────────────────────────────────────────
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File too large (${sizeMB} MB). Maximum allowed size is 10 MB.`,
      status: 413,
    };
  }

  return { valid: true };
}

module.exports = { validateUpload, MAX_FILE_SIZE, ALLOWED_EXTENSION };
