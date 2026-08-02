/**
 * Local Rule-Based Analyzer — zero API key required.
 * 
 * Uses pattern matching on manifest contents to deterministically
 * produce deployment configurations. Falls back to this when no
 * AI API key is available or when the API quota is exhausted.
 */

// ── Framework Detection ─────────────────────────────────────────────────────

const NODE_FRAMEWORKS = {
  'next':      { framework: 'nextjs',  port: 3000, start: 'npm start',           build: 'npm run build' },
  '@nestjs/core': { framework: 'nestjs', port: 3000, start: 'node dist/main.js', build: 'npm run build' },
  'express':   { framework: 'express', port: 3000, start: 'node server.js',      build: '' },
  'fastify':   { framework: 'express', port: 3000, start: 'node server.js',      build: '' },
  'koa':       { framework: 'express', port: 3000, start: 'node server.js',      build: '' },
  'hapi':      { framework: 'express', port: 3000, start: 'node server.js',      build: '' },
};

const PYTHON_FRAMEWORKS = {
  'django':    { framework: 'django',  port: 8000, start: 'gunicorn --bind 0.0.0.0:8000 app.wsgi:application', build: '' },
  'flask':     { framework: 'flask',   port: 5000, start: 'gunicorn --bind 0.0.0.0:5000 app:app',              build: '' },
  'fastapi':   { framework: 'fastapi', port: 8000, start: 'uvicorn main:app --host 0.0.0.0 --port 8000',       build: '' },
};

const DB_PATTERNS = {
  // Node.js
  'pg':           'postgres',
  'knex':         'postgres',
  'prisma':       'postgres',
  'sequelize':    'postgres',
  'typeorm':      'postgres',
  'mysql2':       'mysql',
  'mysql':        'mysql',
  'mongoose':     'mongodb',
  'mongodb':      'mongodb',
  'redis':        'redis',
  'ioredis':      'redis',
  'bullmq':       'redis',
  'better-sqlite3': 'sqlite',
  'sqlite3':      'sqlite',
  // Python
  'psycopg2':     'postgres',
  'psycopg2-binary': 'postgres',
  'asyncpg':      'postgres',
  'sqlalchemy':   'postgres',
  'pymongo':      'mongodb',
  'django-redis': 'redis',
  'celery':       'redis',
  // Go (from go.mod)
  'gorm.io/driver/postgres':  'postgres',
  'gorm.io/driver/mysql':     'mysql',
  'go.mongodb.org/mongo-driver': 'mongodb',
  'github.com/go-redis/redis': 'redis',
  // Ruby
  'pg ':          'postgres',
  'mysql2 ':      'mysql',
  'mongoid':      'mongodb',
};

// ── LTS Base Images ─────────────────────────────────────────────────────────

const BASE_IMAGES = {
  nodejs: { version: '22', image: 'node:22-alpine' },
  python: { version: '3.13', image: 'python:3.13-slim' },
  go:     { version: '1.23', image: 'golang:1.23-alpine' },
  ruby:   { version: '3.3', image: 'ruby:3.3-slim' },
  rust:   { version: '1.80', image: 'rust:1.80-alpine' },
  java:   { version: '21', image: 'eclipse-temurin:21-jdk-alpine' },
  php:    { version: '8.3', image: 'php:8.3-fpm-alpine' },
};

// ── Node.js Analyzer ────────────────────────────────────────────────────────

function analyzeNodeManifests(manifests) {
  const pkg = manifests['package.json'];
  if (!pkg) return null;

  let parsed;
  try { parsed = JSON.parse(pkg); } catch { return null; }

  const allDeps = {
    ...(parsed.dependencies || {}),
    ...(parsed.devDependencies || {}),
  };

  // Detect framework
  let frameworkInfo = { framework: 'none', port: 3000, start: 'node index.js', build: '' };
  for (const [dep, info] of Object.entries(NODE_FRAMEWORKS)) {
    if (allDeps[dep]) {
      frameworkInfo = info;
      break;
    }
  }

  // Try to extract start command from scripts
  if (parsed.scripts) {
    if (parsed.scripts.start) {
      frameworkInfo.start = parsed.scripts.start;
    }
    if (parsed.scripts.build && !frameworkInfo.build) {
      frameworkInfo.build = 'npm run build';
    }
  }

  // Try to detect entry file from main
  if (parsed.main && frameworkInfo.framework === 'express') {
    frameworkInfo.start = `node ${parsed.main}`;
  }

  // Detect database
  let database = 'none';
  for (const [dep, db] of Object.entries(DB_PATTERNS)) {
    if (allDeps[dep.trim()]) {
      database = db;
      break;
    }
  }

  // Detect Node version from engines
  let version = BASE_IMAGES.nodejs.version;
  if (parsed.engines?.node) {
    const match = parsed.engines.node.match(/(\d+)/);
    if (match) {
      const v = parseInt(match[1]);
      if (v >= 18) version = String(v);
    }
  }

  return {
    runtime: 'nodejs',
    runtimeVersion: version,
    baseImage: `node:${version}-alpine`,
    database,
    applicationPort: frameworkInfo.port,
    framework: frameworkInfo.framework,
    buildCommand: frameworkInfo.build,
    startCommand: frameworkInfo.start,
  };
}

// ── Python Analyzer ─────────────────────────────────────────────────────────

function analyzePythonManifests(manifests) {
  const req = manifests['requirements.txt'] || manifests['Pipfile'] || manifests['pyproject.toml'] || '';

  let frameworkInfo = { framework: 'none', port: 8000, start: 'python app.py', build: '' };
  for (const [dep, info] of Object.entries(PYTHON_FRAMEWORKS)) {
    if (req.toLowerCase().includes(dep)) {
      frameworkInfo = info;
      break;
    }
  }

  let database = 'none';
  for (const [dep, db] of Object.entries(DB_PATTERNS)) {
    if (req.toLowerCase().includes(dep.trim().toLowerCase())) {
      database = db;
      break;
    }
  }

  return {
    runtime: 'python',
    runtimeVersion: BASE_IMAGES.python.version,
    baseImage: BASE_IMAGES.python.image,
    database,
    applicationPort: frameworkInfo.port,
    framework: frameworkInfo.framework,
    buildCommand: frameworkInfo.build,
    startCommand: frameworkInfo.start,
  };
}

// ── Go Analyzer ─────────────────────────────────────────────────────────────

function analyzeGoManifests(manifests) {
  const goMod = manifests['go.mod'] || '';

  let framework = 'none';
  if (goMod.includes('github.com/gin-gonic/gin'))   framework = 'gin';
  if (goMod.includes('github.com/gofiber/fiber'))    framework = 'fiber';
  if (goMod.includes('github.com/labstack/echo'))    framework = 'gin';

  let database = 'none';
  for (const [dep, db] of Object.entries(DB_PATTERNS)) {
    if (goMod.includes(dep)) {
      database = db;
      break;
    }
  }

  return {
    runtime: 'go',
    runtimeVersion: BASE_IMAGES.go.version,
    baseImage: BASE_IMAGES.go.image,
    database,
    applicationPort: 8080,
    framework,
    buildCommand: 'go build -ldflags="-s -w" -o /app/server .',
    startCommand: './server',
  };
}

// ── Ruby Analyzer ───────────────────────────────────────────────────────────

function analyzeRubyManifests(manifests) {
  const gemfile = manifests['Gemfile'] || '';
  const isRails = gemfile.includes('rails');

  let database = 'none';
  for (const [dep, db] of Object.entries(DB_PATTERNS)) {
    if (gemfile.includes(dep.trim())) {
      database = db;
      break;
    }
  }

  return {
    runtime: 'ruby',
    runtimeVersion: BASE_IMAGES.ruby.version,
    baseImage: BASE_IMAGES.ruby.image,
    database,
    applicationPort: 3000,
    framework: isRails ? 'rails' : 'none',
    buildCommand: isRails ? 'bundle exec rails assets:precompile' : '',
    startCommand: isRails ? 'bundle exec puma -C config/puma.rb' : 'bundle exec ruby app.rb',
  };
}

// ── Rust Analyzer ───────────────────────────────────────────────────────────

function analyzeRustManifests(manifests) {
  const cargo = manifests['Cargo.toml'] || '';

  let framework = 'none';
  if (cargo.includes('actix-web'))  framework = 'actix';
  if (cargo.includes('axum'))       framework = 'axum';
  if (cargo.includes('rocket'))     framework = 'none';

  // Try to extract binary name
  const nameMatch = cargo.match(/name\s*=\s*"([^"]+)"/);
  const binaryName = nameMatch ? nameMatch[1] : 'app';

  return {
    runtime: 'rust',
    runtimeVersion: BASE_IMAGES.rust.version,
    baseImage: BASE_IMAGES.rust.image,
    database: 'none',
    applicationPort: 8080,
    framework,
    buildCommand: 'cargo build --release',
    startCommand: `./${binaryName}`,
  };
}

// ── Java Analyzer ───────────────────────────────────────────────────────────

function analyzeJavaManifests(manifests) {
  const pom = manifests['pom.xml'] || '';
  const gradle = manifests['build.gradle'] || manifests['build.gradle.kts'] || '';
  const content = pom + gradle;

  const isSpring = content.includes('spring-boot') || content.includes('springframework');
  const hasGradle = !!manifests['build.gradle'] || !!manifests['build.gradle.kts'];

  let database = 'none';
  if (content.includes('postgresql') || content.includes('postgres')) database = 'postgres';
  else if (content.includes('mysql')) database = 'mysql';
  else if (content.includes('mongodb') || content.includes('mongo')) database = 'mongodb';

  return {
    runtime: 'java',
    runtimeVersion: BASE_IMAGES.java.version,
    baseImage: BASE_IMAGES.java.image,
    database,
    applicationPort: 8080,
    framework: isSpring ? 'spring' : 'none',
    buildCommand: hasGradle ? './gradlew build -x test' : './mvnw clean package -DskipTests',
    startCommand: 'java -jar app.jar',
  };
}

// ── Main Entry Point ────────────────────────────────────────────────────────

/**
 * Locally analyze project manifests without any API call.
 *
 * @param {string} ecosystem   Detected primary ecosystem
 * @param {Object} manifests   Map of filename → content
 * @returns {Object}           Deployment configuration (same shape as AI output)
 */
function analyzeLocally(ecosystem, manifests) {
  console.log(`[Local Analyzer] Running rule-based analysis for ecosystem: ${ecosystem}`);

  switch (ecosystem) {
    case 'nodejs': return analyzeNodeManifests(manifests);
    case 'python': return analyzePythonManifests(manifests);
    case 'go':     return analyzeGoManifests(manifests);
    case 'ruby':   return analyzeRubyManifests(manifests);
    case 'rust':   return analyzeRustManifests(manifests);
    case 'java':   return analyzeJavaManifests(manifests);
    default: {
      // Fallback: try Node first, then Python
      const nodeResult = analyzeNodeManifests(manifests);
      if (nodeResult) return nodeResult;
      return analyzePythonManifests(manifests);
    }
  }
}

module.exports = { analyzeLocally };
