/**
 * Multi-Ecosystem Manifest Scanner
 * 
 * Scans an extracted project directory for configuration manifests across
 * 6 ecosystems. Ignores source code, node_modules, and binary files to
 * maximize speed and minimize token costs.
 */

const fs = require('fs');
const path = require('path');

// ── Manifest definitions ──────────────────────────────────────────────────────
const MANIFEST_FILES = {
  'package.json':      'nodejs',
  'package-lock.json': 'nodejs',
  'requirements.txt':  'python',
  'Pipfile':           'python',
  'pyproject.toml':    'python',
  'setup.py':          'python',
  'go.mod':            'go',
  'go.sum':            'go',
  'Cargo.toml':        'rust',
  'Gemfile':           'ruby',
  'Gemfile.lock':      'ruby',
  'pom.xml':           'java',
  'build.gradle':      'java',
  'build.gradle.kts':  'java',
  'composer.json':     'php',
};

// Directories to skip during scanning
const SKIP_DIRS = new Set([
  'node_modules', '.git', '.svn', '__pycache__', '.venv', 'venv',
  'vendor', 'target', 'dist', 'build', '.next', '.nuxt',
  'coverage', '.cache', '.idea', '.vscode',
]);

// Max depth to scan (prevents runaway traversal)
const MAX_DEPTH = 3;

/**
 * Recursively scans a directory for manifest files.
 *
 * @param {string} dir        Directory to scan
 * @param {number} depth      Current recursion depth
 * @param {Map} manifests     Accumulator map of filename → content
 * @returns {Map<string, string>}
 */
function scanDir(dir, depth, manifests) {
  if (depth > MAX_DEPTH) return manifests;

  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return manifests;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        scanDir(fullPath, depth + 1, manifests);
      }
    } else if (entry.isFile() && MANIFEST_FILES[entry.name]) {
      // Only read if not already found (prefer shallower matches)
      if (!manifests.has(entry.name)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          // Skip excessively large manifests (>500KB — likely lock files)
          if (content.length <= 500 * 1024) {
            manifests.set(entry.name, content);
          }
        } catch {
          // Skip unreadable files silently
        }
      }
    }
  }

  return manifests;
}

/**
 * Scans an extracted project directory and returns detected ecosystem + manifests.
 *
 * @param {string} extractedDir  Path to the extracted zip contents
 * @returns {{ ecosystem: string, manifests: Object<string, string>, summary: string }}
 */
function scanManifests(extractedDir) {
  const manifests = scanDir(extractedDir, 0, new Map());

  if (manifests.size === 0) {
    throw Object.assign(
      new Error(
        'No recognisable project manifests found. ' +
        'Supported: package.json, requirements.txt, go.mod, Cargo.toml, Gemfile, pom.xml, build.gradle, composer.json'
      ),
      { status: 422 }
    );
  }

  // Determine primary ecosystem by priority
  const ecosystemCounts = {};
  for (const [filename] of manifests) {
    const eco = MANIFEST_FILES[filename];
    ecosystemCounts[eco] = (ecosystemCounts[eco] || 0) + 1;
  }

  // Priority order: whichever has the most manifests, break ties alphabetically
  const ecosystem = Object.entries(ecosystemCounts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];

  // Build plain object from Map
  const manifestObj = {};
  for (const [key, value] of manifests) {
    manifestObj[key] = value;
  }

  // Build a human-readable summary for the AI prompt
  const summary = Object.entries(manifestObj)
    .map(([name, content]) => `=== ${name} ===\n${content.slice(0, 8000)}`)
    .join('\n\n');

  return { ecosystem, manifests: manifestObj, summary };
}

module.exports = { scanManifests };
