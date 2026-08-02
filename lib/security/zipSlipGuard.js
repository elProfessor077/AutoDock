/**
 * Zip Slip Guard — validates every zip entry path before extraction
 * to block directory traversal attacks (e.g., ../../etc/passwd).
 */

const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

/**
 * Safely extracts a zip archive into a scoped directory,
 * guarding against zip-slip path traversal attacks.
 *
 * @param {string} zipPath   Absolute path to the uploaded .zip file
 * @param {string} runDir    Absolute path to the temp/<runId>/ extraction scope
 * @returns {string}         The resolved extraction directory path
 * @throws {Error}           If any entry attempts directory traversal
 */
function safeExtract(zipPath, runDir) {
  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries();
  const resolvedBase = path.resolve(runDir) + path.sep;

  // Phase 1: Validate ALL entries before extracting anything
  for (const entry of entries) {
    const target = path.normalize(path.join(runDir, entry.entryName));
    const resolvedTarget = path.resolve(target);

    if (!resolvedTarget.startsWith(resolvedBase)) {
      throw Object.assign(
        new Error(`Zip-slip attempt detected: "${entry.entryName}"`),
        { status: 400 }
      );
    }
  }

  // Phase 2: All entries are safe — extract
  fs.mkdirSync(runDir, { recursive: true });
  zip.extractAllTo(runDir, /* overwrite */ true);
  return runDir;
}

module.exports = { safeExtract };
