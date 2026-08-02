/**
 * RAG Knowledge Base — Verified Docker deployment recipes, LTS tags,
 * security patterns, and multi-container configurations.
 *
 * Each document is a structured knowledge unit that will be embedded
 * and stored in the vector database for retrieval during analysis.
 */

const KNOWLEDGE_DOCUMENTS = [
  // ── Node.js LTS Images ────────────────────────────────────────────────────
  {
    id: 'node-lts-images',
    title: 'Node.js LTS Docker Images',
    tags: ['nodejs', 'lts', 'docker', 'alpine'],
    content: `Node.js Active LTS Docker Images (verified):
- node:22-alpine — Node.js 22 LTS (Active), Alpine-based, ~50MB
- node:20-alpine — Node.js 20 LTS (Maintenance), Alpine-based, ~50MB
- node:18-alpine — Node.js 18 LTS (EOL April 2025, avoid for new projects)
Best practice: Always use Alpine variants for production. Use exact LTS major versions, never "latest" or "current".
Pin with node:<major>-alpine for reproducible builds.`,
  },

  // ── Python Images ─────────────────────────────────────────────────────────
  {
    id: 'python-images',
    title: 'Python Docker Images',
    tags: ['python', 'lts', 'docker', 'slim'],
    content: `Python Docker Images (verified):
- python:3.13-slim — Python 3.13 (Latest stable), Debian slim, ~150MB
- python:3.12-slim — Python 3.12 (Widely supported), Debian slim
- python:3.11-slim — Python 3.11 (Maintenance)
Best practice: Use "slim" variants (not Alpine) for Python because Alpine uses musl instead of glibc, which causes compilation issues with many Python packages (numpy, pandas, etc.).
For Alpine: python:3.12-alpine works only if no C-extension packages are needed.`,
  },

  // ── Go Images ─────────────────────────────────────────────────────────────
  {
    id: 'go-images',
    title: 'Go Docker Images',
    tags: ['go', 'golang', 'docker', 'alpine'],
    content: `Go Docker Images (verified):
- golang:1.23-alpine — Go 1.23 (Latest stable)
- golang:1.22-alpine — Go 1.22 (Previous stable)
Best practice: Use multi-stage builds. Build in golang:<version>-alpine, then copy the static binary to "alpine:3.20" or "scratch" for minimal final image (~10MB).
Always set CGO_ENABLED=0 for static binaries when using scratch/Alpine final images.`,
  },

  // ── Ruby Images ───────────────────────────────────────────────────────────
  {
    id: 'ruby-images',
    title: 'Ruby Docker Images',
    tags: ['ruby', 'docker', 'slim', 'rails'],
    content: `Ruby Docker Images (verified):
- ruby:3.3-slim — Ruby 3.3 (Latest stable), Debian slim
- ruby:3.2-slim — Ruby 3.2 (Maintenance)
Best practice: Use slim variants. Install build-essential for native gem compilation. Use bundle install --deployment --without development test for production.`,
  },

  // ── Rust Images ───────────────────────────────────────────────────────────
  {
    id: 'rust-images',
    title: 'Rust Docker Images',
    tags: ['rust', 'docker', 'alpine', 'musl'],
    content: `Rust Docker Images (verified):
- rust:1.80-alpine — Rust 1.80 (Latest stable)
- rust:1.80-slim — Rust 1.80 (Debian slim)
Best practice: Use multi-stage builds. Build in rust:<version> then copy the binary to debian:bookworm-slim or alpine:3.20. For musl targets (Alpine), use: rustup target add x86_64-unknown-linux-musl.
Cargo build with --release for production.`,
  },

  // ── Java Images ───────────────────────────────────────────────────────────
  {
    id: 'java-images',
    title: 'Java/JDK Docker Images',
    tags: ['java', 'jdk', 'docker', 'eclipse-temurin'],
    content: `Java Docker Images (verified):
- eclipse-temurin:21-jre-alpine — Java 21 LTS JRE (runtime only)
- eclipse-temurin:21-jdk-alpine — Java 21 LTS JDK (build + runtime)
- eclipse-temurin:17-jre-alpine — Java 17 LTS JRE
Best practice: Use multi-stage builds. Build with JDK image, run with JRE image. Use eclipse-temurin (official Adoptium builds) instead of openjdk (deprecated).`,
  },

  // ── Non-Root User Security Pattern ────────────────────────────────────────
  {
    id: 'security-nonroot',
    title: 'Docker Non-Root User Security Pattern',
    tags: ['security', 'non-root', 'user', 'dockerfile', 'best-practice'],
    content: `Docker Non-Root User Security Pattern:
Never run containers as root in production. Create a dedicated app user:

For Alpine images:
  RUN addgroup -S appgroup && adduser -S appuser -G appgroup
  USER appuser

For Debian/Ubuntu images:
  RUN groupadd -r appgroup && useradd -r -g appgroup -s /bin/false appuser
  USER appuser

Place USER directive AFTER package installation (which requires root) but BEFORE CMD.
Ensure WORKDIR ownership: RUN chown -R appuser:appgroup /app`,
  },

  // ── Healthcheck Pattern ───────────────────────────────────────────────────
  {
    id: 'healthcheck-pattern',
    title: 'Docker HEALTHCHECK Best Practice',
    tags: ['healthcheck', 'dockerfile', 'best-practice', 'monitoring'],
    content: `Docker HEALTHCHECK Best Practice:
Always include a HEALTHCHECK instruction for production containers:

For HTTP services:
  HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \\
    CMD wget -qO- http://localhost:<PORT>/health || exit 1

Or with curl:
  HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \\
    CMD curl -f http://localhost:<PORT>/health || exit 1

Use wget for Alpine (smaller, pre-installed). Use curl for Debian/Ubuntu.
start-period gives the app time to boot before health checks begin.`,
  },

  // ── Multi-Stage Build Pattern ─────────────────────────────────────────────
  {
    id: 'multistage-build',
    title: 'Docker Multi-Stage Build Pattern',
    tags: ['multi-stage', 'dockerfile', 'optimization', 'best-practice'],
    content: `Docker Multi-Stage Build Pattern:
Multi-stage builds reduce final image size by separating build and runtime stages:

FROM <build-image> AS builder
WORKDIR /app
COPY . .
RUN <build-command>

FROM <runtime-image> AS runner
WORKDIR /app
COPY --from=builder /app/<output> ./<output>
CMD [<start-command>]

Benefits: Build tools, dev dependencies, and source code are excluded from the final image.
Typical size reduction: 500MB → 50MB for Go, 1GB → 200MB for Node.js/Next.js.`,
  },

  // ── PostgreSQL Docker Compose ─────────────────────────────────────────────
  {
    id: 'postgres-compose',
    title: 'PostgreSQL Docker Compose Configuration',
    tags: ['postgres', 'postgresql', 'database', 'docker-compose', 'pg'],
    content: `PostgreSQL Docker Compose Service (verified):
  db:
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
      retries: 5

volumes:
  db_data:

App connection string: postgresql://appuser:changeme@db:5432/appdb
Driver packages: pg, knex, prisma, sequelize, typeorm with pg driver.`,
  },

  // ── MySQL Docker Compose ──────────────────────────────────────────────────
  {
    id: 'mysql-compose',
    title: 'MySQL Docker Compose Configuration',
    tags: ['mysql', 'database', 'docker-compose', 'mysql2'],
    content: `MySQL Docker Compose Service (verified):
  db:
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
      retries: 5

volumes:
  db_data:

App connection string: mysql://appuser:changeme@db:3306/appdb
Driver packages: mysql2, sequelize with mysql2, knex with mysql2.`,
  },

  // ── MongoDB Docker Compose ────────────────────────────────────────────────
  {
    id: 'mongodb-compose',
    title: 'MongoDB Docker Compose Configuration',
    tags: ['mongodb', 'mongo', 'database', 'docker-compose', 'mongoose'],
    content: `MongoDB Docker Compose Service (verified):
  db:
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
      retries: 5

volumes:
  db_data:

App connection string: mongodb://db:27017/appdb
Driver packages: mongoose, mongodb (native driver).`,
  },

  // ── Redis Docker Compose ──────────────────────────────────────────────────
  {
    id: 'redis-compose',
    title: 'Redis Docker Compose Configuration',
    tags: ['redis', 'cache', 'docker-compose', 'ioredis'],
    content: `Redis Docker Compose Service (verified):
  cache:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

App connection string: redis://cache:6379
Driver packages: redis, ioredis, bull (job queue), bullmq.`,
  },

  // ── Express.js Dockerfile ─────────────────────────────────────────────────
  {
    id: 'express-dockerfile',
    title: 'Express.js Production Dockerfile',
    tags: ['express', 'nodejs', 'dockerfile', 'production'],
    content: `Express.js Production Dockerfile Pattern:
FROM node:<lts-version>-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE <port>

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \\
  CMD wget -qO- http://localhost:<port>/health || exit 1

CMD ["node", "<entry-file>"]

Default port: 3000 (or PORT env variable).
Common entry files: server.js, index.js, app.js, src/index.js.`,
  },

  // ── Next.js Dockerfile ────────────────────────────────────────────────────
  {
    id: 'nextjs-dockerfile',
    title: 'Next.js Multi-Stage Production Dockerfile',
    tags: ['nextjs', 'next', 'nodejs', 'dockerfile', 'multi-stage'],
    content: `Next.js Production Dockerfile (Multi-Stage):
FROM node:<lts-version>-alpine AS base
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
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER appuser
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \\
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]

Requires output: 'standalone' in next.config.js. Default port: 3000.`,
  },

  // ── Django Dockerfile ─────────────────────────────────────────────────────
  {
    id: 'django-dockerfile',
    title: 'Django Production Dockerfile',
    tags: ['django', 'python', 'dockerfile', 'gunicorn'],
    content: `Django Production Dockerfile Pattern:
FROM python:<version>-slim AS base
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential libpq-dev && \\
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput

RUN groupadd -r appgroup && useradd -r -g appgroup appuser
USER appuser

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "<project>.wsgi:application"]

Default port: 8000. Always use gunicorn for production (not manage.py runserver).
Common WSGI entry: <project_name>.wsgi:application.`,
  },

  // ── Flask Dockerfile ──────────────────────────────────────────────────────
  {
    id: 'flask-dockerfile',
    title: 'Flask Production Dockerfile',
    tags: ['flask', 'python', 'dockerfile', 'gunicorn'],
    content: `Flask Production Dockerfile Pattern:
FROM python:<version>-slim
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN groupadd -r appgroup && useradd -r -g appgroup appuser
USER appuser

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]

Default port: 5000. Use gunicorn for production.
Common WSGI entry: app:app (from app.py) or wsgi:app.
Add gunicorn to requirements.txt if missing.`,
  },

  // ── FastAPI Dockerfile ────────────────────────────────────────────────────
  {
    id: 'fastapi-dockerfile',
    title: 'FastAPI Production Dockerfile',
    tags: ['fastapi', 'python', 'dockerfile', 'uvicorn'],
    content: `FastAPI Production Dockerfile Pattern:
FROM python:<version>-slim
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN groupadd -r appgroup && useradd -r -g appgroup appuser
USER appuser

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

Default port: 8000. Use uvicorn for production.
Common ASGI entry: main:app (from main.py) or app.main:app.
Add uvicorn to requirements.txt if missing.`,
  },

  // ── Go Gin/Fiber Dockerfile ───────────────────────────────────────────────
  {
    id: 'go-dockerfile',
    title: 'Go Multi-Stage Production Dockerfile',
    tags: ['go', 'golang', 'dockerfile', 'gin', 'fiber', 'multi-stage'],
    content: `Go Production Dockerfile (Multi-Stage):
FROM golang:<version>-alpine AS builder
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/server .

FROM alpine:3.20 AS runner
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/server .

USER appuser
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \\
  CMD wget -qO- http://localhost:8080/health || exit 1

CMD ["./server"]

Default port: 8080. CGO_ENABLED=0 produces a static binary.
-ldflags="-s -w" strips debug info for smaller binary.`,
  },

  // ── Rails Dockerfile ──────────────────────────────────────────────────────
  {
    id: 'rails-dockerfile',
    title: 'Ruby on Rails Production Dockerfile',
    tags: ['rails', 'ruby', 'dockerfile', 'puma'],
    content: `Ruby on Rails Production Dockerfile Pattern:
FROM ruby:<version>-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential libpq-dev nodejs && \\
    rm -rf /var/lib/apt/lists/*

COPY Gemfile Gemfile.lock ./
RUN bundle install --deployment --without development test

COPY . .
RUN bundle exec rails assets:precompile

RUN groupadd -r appgroup && useradd -r -g appgroup appuser
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000

CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]

Default port: 3000. Use puma for production (default Rails server).`,
  },

  // ── Rust Actix/Axum Dockerfile ────────────────────────────────────────────
  {
    id: 'rust-dockerfile',
    title: 'Rust Multi-Stage Production Dockerfile',
    tags: ['rust', 'dockerfile', 'actix', 'axum', 'multi-stage'],
    content: `Rust Production Dockerfile (Multi-Stage):
FROM rust:<version> AS builder
WORKDIR /app

COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
RUN rm -rf src

COPY . .
RUN touch src/main.rs
RUN cargo build --release

FROM debian:bookworm-slim AS runner
WORKDIR /app

RUN groupadd -r appgroup && useradd -r -g appgroup appuser

COPY --from=builder /app/target/release/<binary-name> ./server

USER appuser
EXPOSE 8080

CMD ["./server"]

Default port: 8080. Two-step cargo build leverages dependency caching.
Binary name comes from Cargo.toml [[bin]] or package name.`,
  },

  // ── Docker Compose Networks ───────────────────────────────────────────────
  {
    id: 'compose-networks',
    title: 'Docker Compose Internal Network Configuration',
    tags: ['docker-compose', 'networks', 'internal', 'best-practice'],
    content: `Docker Compose Network Best Practice:
By default, docker-compose creates a bridge network for all services.
Services communicate using their service names as hostnames:
  - app connects to db at: postgresql://appuser:changeme@db:5432/appdb
  - app connects to cache at: redis://cache:6379

For explicit network configuration:
networks:
  app-network:
    driver: bridge

services:
  app:
    networks: [app-network]
  db:
    networks: [app-network]

Use depends_on with condition: service_healthy for startup ordering.`,
  },

  // ── .dockerignore Pattern ─────────────────────────────────────────────────
  {
    id: 'dockerignore-pattern',
    title: 'Standard .dockerignore Configuration',
    tags: ['dockerignore', 'best-practice', 'optimization'],
    content: `Standard .dockerignore for production builds:
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
target/debug
.next
.nuxt

Always include .dockerignore to prevent unnecessary files from entering the build context.
Reduces build time and final image size significantly.`,
  },

  // ── Environment Variable Patterns ─────────────────────────────────────────
  {
    id: 'env-patterns',
    title: 'Docker Environment Variable Patterns',
    tags: ['environment', 'env', 'docker-compose', 'best-practice'],
    content: `Docker Environment Variable Best Practices:
1. Use env_file for secrets (never hardcode in docker-compose.yml):
   services:
     app:
       env_file: .env

2. Common environment variables by ecosystem:
   Node.js: NODE_ENV=production, PORT=3000
   Python: PYTHONDONTWRITEBYTECODE=1, PYTHONUNBUFFERED=1
   Go: GIN_MODE=release
   Ruby: RAILS_ENV=production, RAILS_SERVE_STATIC_FILES=true
   Java: JAVA_OPTS=-Xmx512m

3. Database connection environment variables:
   DATABASE_URL=postgresql://user:pass@db:5432/appdb
   REDIS_URL=redis://cache:6379`,
  },

  // ── NestJS Dockerfile ─────────────────────────────────────────────────────
  {
    id: 'nestjs-dockerfile',
    title: 'NestJS Production Dockerfile',
    tags: ['nestjs', 'nodejs', 'dockerfile', 'typescript'],
    content: `NestJS Production Dockerfile Pattern:
FROM node:<lts-version>-alpine AS base
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
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \\
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]

Default port: 3000. Always build before running (TypeScript → JavaScript).`,
  },
];

module.exports = { KNOWLEDGE_DOCUMENTS };
