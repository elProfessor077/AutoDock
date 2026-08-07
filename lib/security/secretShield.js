/**
 * Secret Shield — parses environment variable files (.env, .env.example),
 * sanitizes credentials/API keys with safe placeholders, and provides
 * key-value editing metadata.
 */

const SENSITIVE_KEYWORDS = [
  'PASS', 'PASSWORD', 'SECRET', 'KEY', 'TOKEN', 'PRIVATE', 'AUTH',
  'CREDENTIAL', 'DATABASE_URL', 'MONGO_URI', 'REDIS_URL', 'APIKEY'
];

function sanitizeEnvValue(key = '', val = '') {
  const upperKey = key.toUpperCase();
  const isSensitive = SENSITIVE_KEYWORDS.some((kw) => upperKey.includes(kw));

  if (!val || val.trim() === '') {
    return 'your_value_here';
  }

  if (isSensitive) {
    if (upperKey.includes('URL') || upperKey.includes('URI')) {
      return 'protocol://username:CHANGEME_IN_PROD@localhost:5432/appdb';
    }
    if (upperKey.includes('KEY') || upperKey.includes('TOKEN') || upperKey.includes('SECRET')) {
      return 'CHANGEME_IN_PROD_SECRET_KEY';
    }
    return 'CHANGEME_IN_PROD_PASSWORD';
  }

  return val.trim();
}

function parseAndSanitizeEnv(rawEnvContent = '') {
  const lines = rawEnvContent.split(/\r?\n/);
  const sanitizedEntries = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      const sanitizedVal = sanitizeEnvValue(key, val);
      const isSensitive = SENSITIVE_KEYWORDS.some((kw) => key.toUpperCase().includes(kw));

      sanitizedEntries.push({
        key,
        originalValue: val,
        sanitizedValue: sanitizedVal,
        isSensitive,
      });
    }
  }

  return sanitizedEntries;
}

function generateEnvExample(entries = [], config = {}) {
  const port = config.applicationPort || 3000;
  const db = config.db || 'none';

  let output = `# ── AutoDock Generated .env.example ──────────────────────────────────
# Copy to .env and replace placeholders with production credentials.
# ─────────────────────────────────────────────────────────────────────────────

PORT=${port}
NODE_ENV=production
`;

  if (db === 'postgres') {
    output += `DATABASE_URL=postgresql://appuser:CHANGEME_IN_PROD@db:5432/appdb\nPOSTGRES_USER=appuser\nPOSTGRES_PASSWORD=CHANGEME_IN_PROD\nPOSTGRES_DB=appdb\n`;
  } else if (db === 'mysql') {
    output += `DATABASE_URL=mysql://appuser:CHANGEME_IN_PROD@db:3306/appdb\nMYSQL_USER=appuser\nMYSQL_PASSWORD=CHANGEME_IN_PROD\n`;
  } else if (db === 'mongodb') {
    output += `MONGODB_URI=mongodb://db:27017/appdb\n`;
  } else if (db === 'redis') {
    output += `REDIS_URL=redis://cache:6379\n`;
  }

  for (const entry of entries) {
    if (['PORT', 'NODE_ENV', 'DATABASE_URL', 'POSTGRES_USER', 'POSTGRES_PASSWORD', 'POSTGRES_DB', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MONGODB_URI', 'REDIS_URL'].includes(entry.key)) {
      continue;
    }
    output += `${entry.key}=${entry.sanitizedValue}\n`;
  }

  return output;
}

module.exports = {
  parseAndSanitizeEnv,
  generateEnvExample,
  sanitizeEnvValue,
};
