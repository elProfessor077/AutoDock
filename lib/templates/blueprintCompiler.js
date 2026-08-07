const { compileCloudManifests } = require('./cloudCompiler');
const { auditContainerSecurity } = require('../security/auditor');
const { generateEnvExample } = require('../security/secretShield');
const { simulateDigitalTwin } = require('../simulators/digitalTwinSimulator');

// ── Database configurations for Docker Compose ─────────────────────────────

// ── Database configurations for Docker Compose ─────────────────────────────
const DB_SERVICES = {
  postgres: `  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: changeme
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U appuser -d appdb"]
      interval: 10s
      timeout: 5s
      retries: 5`,

  mysql: `  db:
    image: mysql:8.0
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: appdb
      MYSQL_USER: appuser
      MYSQL_PASSWORD: changeme
      MYSQL_ROOT_PASSWORD: rootchangeme
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5`,

  mongodb: `  db:
    image: mongo:7
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - db_data:/data/db
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh --quiet
      interval: 10s
      timeout: 5s
      retries: 5`,

  redis: `  cache:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5`,

  sqlite: '',
  none: '',
};

const DB_VOLUMES = {
  postgres: '\nvolumes:\n  db_data:',
  mysql: '\nvolumes:\n  db_data:',
  mongodb: '\nvolumes:\n  db_data:',
  redis: '',
  sqlite: '',
  none: '',
};

const DB_DEPENDS = {
  postgres: '\n    depends_on:\n      db:\n        condition: service_healthy',
  mysql: '\n    depends_on:\n      db:\n        condition: service_healthy',
  mongodb: '\n    depends_on:\n      db:\n        condition: service_healthy',
  redis: '\n    depends_on:\n      cache:\n        condition: service_healthy',
  sqlite: '',
  none: '',
};

// ── Dockerfile Generators by Ecosystem ──────────────────────────────────────

function getNodeDockerfile(config) {
  const version = config.runtimeVersion || '20';
  const port = config.applicationPort || 3000;
  const isNextJs = config.framework === 'nextjs';
  const isNestJs = config.framework === 'nestjs';

  if (isNextJs) {
    return `# ── Dockeryze Generated Dockerfile ────────────────────────────────────────
# Ecosystem: Node.js (Next.js) | Version: ${version} | Port: ${port}
# ─────────────────────────────────────────────────────────────────────────────

FROM node:${version}-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Nestjs / Next.js projects run build steps
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=${port}
ENV HOSTNAME="0.0.0.0"

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# In nextjs standalone builds, copy the build output
# Note: make sure next.config.js has config: output: 'standalone'
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER appuser
EXPOSE ${port}

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \\
  CMD wget -qO- http://localhost:${port}/ || exit 1

CMD ["node", "server.js"]
`;
  }

  if (isNestJs) {
    return `# ── Dockeryze Generated Dockerfile ────────────────────────────────────────
# Ecosystem: Node.js (NestJS) | Version: ${version} | Port: ${port}
# ─────────────────────────────────────────────────────────────────────────────

FROM node:${version}-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER appuser
EXPOSE ${port}

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \\
  CMD wget -qO- http://localhost:${port}/health || exit 1

CMD ["node", "dist/main.js"]
`;
  }

  // Standard Node app (Express, Fastify, etc.)
  const startCmdArray = config.startCommand.split(' ');
  const cmdFormatted = startCmdArray.map(part => `"${part}"`).join(', ');

  return `# ── Dockeryze Generated Dockerfile ────────────────────────────────────────
# Ecosystem: Node.js (${config.framework || 'General'}) | Version: ${version} | Port: ${port}
# ─────────────────────────────────────────────────────────────────────────────

FROM node:${version}-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN (npm ci --omit=dev || npm install --omit=dev) && npm cache clean --force

COPY . .

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE ${port}

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \\
  CMD wget -qO- http://localhost:${port}/health || wget -qO- http://localhost:${port}/ || exit 1

CMD [${cmdFormatted}]
`;
}

function getPythonDockerfile(config) {
  const version = config.runtimeVersion || '3.12';
  const port = config.applicationPort || 8000;
  const isFlask = config.framework === 'flask';
  const isDjango = config.framework === 'django';
  const isFastApi = config.framework === 'fastapi';
  const startCmd = config.startCommand || `gunicorn -b 0.0.0.0:${port} app:app`;
  const startCmdArray = startCmd.split(' ');
  const cmdFormatted = startCmdArray.map(part => `"${part}"`).join(', ');

  let aptDeps = '';
  if (config.database === 'postgres' || isDjango) {
    aptDeps = `RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential libpq-dev && \\
    rm -rf /var/lib/apt/lists/*
`;
  }

  return `# ── Dockeryze Generated Dockerfile ────────────────────────────────────────
# Ecosystem: Python (${config.framework || 'General'}) | Version: ${version} | Port: ${port}
# ─────────────────────────────────────────────────────────────────────────────

FROM python:${version}-slim AS base
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

${aptDeps}
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run static assets compilation for Django if applicable
${isDjango ? 'RUN python manage.py collectstatic --noinput || true' : ''}

RUN groupadd -r appgroup && useradd -r -g appgroup appuser
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE ${port}

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \\
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${port}/health')" || python -c "import urllib.request; urllib.request.urlopen('http://localhost:${port}/')" || exit 1

CMD [${cmdFormatted}]
`;
}

function getGoDockerfile(config) {
  const version = config.runtimeVersion || '1.22';
  const port = config.applicationPort || 8080;
  const buildCmd = config.buildCommand || 'go build -ldflags="-s -w" -o /app/server .';

  return `# ── Dockeryze Generated Dockerfile ────────────────────────────────────────
# Ecosystem: Go (${config.framework || 'General'}) | Version: ${version} | Port: ${port}
# ─────────────────────────────────────────────────────────────────────────────

FROM golang:${version}-alpine AS builder
WORKDIR /app

COPY go.mod go.sum* ./
RUN go mod download || true

COPY . .
RUN CGO_ENABLED=0 GOOS=linux ${buildCmd}

FROM alpine:3.20 AS runner
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/server .
# Copy static / template resources if they exist
COPY --from=builder /app/templates ./templates
COPY --from=builder /app/static ./static

USER appuser
EXPOSE ${port}

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \\
  CMD wget -qO- http://localhost:${port}/health || wget -qO- http://localhost:${port}/ || exit 1

CMD ["./server"]
`;
}

function getRubyDockerfile(config) {
  const version = config.runtimeVersion || '3.3';
  const port = config.applicationPort || 3000;
  const isRails = config.framework === 'rails';
  const startCmd = config.startCommand || 'bundle exec rails s -b 0.0.0.0';
  const startCmdArray = startCmd.split(' ');
  const cmdFormatted = startCmdArray.map(part => `"${part}"`).join(', ');

  return `# ── Dockeryze Generated Dockerfile ────────────────────────────────────────
# Ecosystem: Ruby (${config.framework || 'General'}) | Version: ${version} | Port: ${port}
# ─────────────────────────────────────────────────────────────────────────────

FROM ruby:${version}-slim AS base
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential libpq-dev nodejs && \\
    rm -rf /var/lib/apt/lists/*

ENV RAILS_ENV=production
ENV RAILS_SERVE_STATIC_FILES=true
ENV PORT=${port}

COPY Gemfile Gemfile.lock* ./
RUN bundle config set --local deployment 'true' \\
    && bundle config set --local without 'development test' \\
    && bundle install --jobs 4 --retry 3

COPY . .

${isRails ? 'RUN bundle exec rails assets:precompile || true' : ''}

RUN groupadd -r appgroup && useradd -r -g appgroup appuser
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE ${port}

CMD [${cmdFormatted}]
`;
}

function getRustDockerfile(config) {
  const version = config.runtimeVersion || '1.80';
  const port = config.applicationPort || 8080;
  const binaryName = config.startCommand.replace('./', '').split(' ')[0] || 'app';

  return `# ── Dockeryze Generated Dockerfile ────────────────────────────────────────
# Ecosystem: Rust (${config.framework || 'General'}) | Version: ${version} | Port: ${port}
# ─────────────────────────────────────────────────────────────────────────────

FROM rust:${version}-alpine AS builder
WORKDIR /app
RUN apk add --no-cache musl-dev

COPY Cargo.toml Cargo.lock* ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
RUN rm -rf src

COPY . .
RUN touch src/main.rs
RUN cargo build --release

FROM alpine:3.20 AS runner
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/target/release/${binaryName} ./server

USER appuser
EXPOSE ${port}

CMD ["./server"]
`;
}

function getJavaDockerfile(config) {
  const version = config.runtimeVersion || '21';
  const port = config.applicationPort || 8080;
  const hasGradle = config.buildCommand?.includes('gradle') || false;
  const buildStageImage = `eclipse-temurin:${version}-jdk-alpine`;
  const runStageImage = `eclipse-temurin:${version}-jre-alpine`;

  return `# ── Dockeryze Generated Dockerfile ────────────────────────────────────────
# Ecosystem: Java (${config.framework || 'General'}) | Version: ${version} | Port: ${port}
# ─────────────────────────────────────────────────────────────────────────────

FROM ${buildStageImage} AS builder
WORKDIR /app

COPY . .
# Run gradle/maven build
RUN ${config.buildCommand || './mvnw clean package -DskipTests || ./gradlew build -x test'}

FROM ${runStageImage} AS runner
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Attempting to copy generated jar file dynamically
COPY --from=builder /app/build/libs/*.jar ./app.jar || COPY --from=builder /app/target/*.jar ./app.jar

USER appuser
EXPOSE ${port}

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \\
  CMD wget -qO- http://localhost:${port}/actuator/health || wget -qO- http://localhost:${port}/health || wget -qO- http://localhost:${port}/ || exit 1

CMD ["java", "-jar", "app.jar"]
`;
}

// ── Dockerignore Template ───────────────────────────────────────────────────
const DOCKERIGNORE_CONTENT = `# ── Dockeryze .dockerignore ─────────────────────────────────────────────
node_modules
npm-debug.log*
.git
.gitignore
.env
.env.*
!.env.example
Dockerfile
docker-compose*.yml
.dockerignore
README.md
LICENSE
.vscode
.idea
coverage
__pycache__
*.pyc
.pytest_cache
target/
.next
.nuxt
build/
dist/
`;

// ── README Generator ────────────────────────────────────────────────────────
function getReadmeContent(config) {
  return `# 🐳 DOCKERYZE BLUEPRINT

This container package was automatically generated by Dockeryze.

## 📦 What's Included
1. **Dockerfile**: Multi-stage, optimized, non-root user execution, lightweight.
2. **docker-compose.yml**: Ready-wired with dependencies and internal container networks.
3. **.dockerignore**: Excludes dev files, dependencies, and caching folders.

## 🚀 How to Run

1. Make sure you have [Docker](https://www.docker.com/) installed.
2. Open your terminal in this directory.
3. Boot the environment with:
   \`\`\`bash
   docker compose up --build -d
   \`\`\`
4. Access your application at: http://localhost:${config.applicationPort}

## ⚙️ Configuration Details
- **Ecosystem**: ${config.runtime}
- **Version**: ${config.runtimeVersion}
- **Base Image**: ${config.baseImage}
- **Framework**: ${config.framework || 'General'}
- **Internal Port**: ${config.applicationPort}
- **Wired Database**: ${config.database}

## 🛡️ Security Best Practices Implemented
- **Non-Root Privilege**: The container runs under a dedicated, low-privilege \`appuser\`.
- **Layer Caching**: Manifests are copied and built separately to keep builds sub-second on source modifications.
- **Auto-Healthchecks**: Built-in container health checks query the app port automatically.
`;
}

// ── Main Compiler function ──────────────────────────────────────────────────
/**
 * Synthesizes AI JSON output into configuration files.
 *
 * @param {Object} config  JSON output from Gemini Pipeline
 * @returns {{ dockerfile: string, dockerCompose: string, dockerignore: string, readme: string }}
 */
function compileBlueprint(config) {
  const runtime = (config.runtime || 'nodejs').toLowerCase();
  const db = (config.database || 'none').toLowerCase();

  // Generate Dockerfile
  let dockerfile = '';
  switch (runtime) {
    case 'nodejs':
      dockerfile = getNodeDockerfile(config);
      break;
    case 'python':
      dockerfile = getPythonDockerfile(config);
      break;
    case 'go':
      dockerfile = getGoDockerfile(config);
      break;
    case 'ruby':
      dockerfile = getRubyDockerfile(config);
      break;
    case 'rust':
      dockerfile = getRustDockerfile(config);
      break;
    case 'java':
      dockerfile = getJavaDockerfile(config);
      break;
    default:
      dockerfile = getNodeDockerfile(config);
  }

  // Generate docker-compose.yml
  const dbService = DB_SERVICES[db] || '';
  const dbVolume = DB_VOLUMES[db] || '';
  const dbDepends = DB_DEPENDS[db] || '';
  const port = config.applicationPort || 3000;

  // Run Digital Twin Resource Simulation
  const databasesList = db && db !== 'none' && db !== 'sqlite' ? [db] : [];
  const digitalTwin = simulateDigitalTwin({
    ecosystem: runtime,
    dependencyCount: config.dependenciesCount || 15,
    databases: databasesList,
    concurrencyTarget: 50
  });

  const appMemoryLimit = digitalTwin.appMetrics.recommendedMemoryLimitMb;
  const appCpuLimit = digitalTwin.appMetrics.recommendedCpuLimit;

  const dockerCompose = `# ── Dockeryze Generated docker-compose.yml ────────────────────────────────
# Ecosystem: ${config.runtime} | Framework: ${config.framework || 'General'} | Port: ${port}
# Digital Twin Profile: Limit ${appMemoryLimit}MB RAM, ${appCpuLimit} CPU Cores | Est. Idle: ${digitalTwin.appMetrics.idleMemoryMb}MB
# ─────────────────────────────────────────────────────────────────────────────

version: "3.9"

services:
  app:
    build: .
    restart: unless-stopped
    ports:
      - "${port}:${port}"
    environment:
      - NODE_ENV=production
      - PORT=${port}
    env_file:
      - .env${dbDepends}
    deploy:
      resources:
        limits:
          cpus: '${appCpuLimit}'
          memory: ${appMemoryLimit}M
        reservations:
          memory: ${digitalTwin.appMetrics.recommendedMemoryReservationMb}M
${dbService}${dbVolume}
`;

  // Compile Cloud Manifests (K8s, Fly.io, Render)
  const cloudManifests = compileCloudManifests(config);

  // Generate .env.example
  const envExample = generateEnvExample([], config);

  // Perform DevSecOps Container Security Audit
  const securityAudit = auditContainerSecurity(dockerfile, dockerCompose, config);

  return {
    dockerfile,
    dockerCompose,
    dockerignore: DOCKERIGNORE_CONTENT,
    k8sDeployment: cloudManifests.k8sDeployment,
    k8sService: cloudManifests.k8sService,
    flyToml: cloudManifests.flyToml,
    renderYaml: cloudManifests.renderYaml,
    envExample,
    readme: getReadmeContent(config),
    securityAudit,
    digitalTwin,
  };
}

module.exports = { compileBlueprint };
