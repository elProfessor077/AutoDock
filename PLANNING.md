# AutoDock v2.0 — Implementation Plan & Feature Roadmap

This document outlines the architecture plan, current implementation milestones, and upcoming development roadmap for **AutoDock v2.0**.

---

## 🎯 Project Overview & Goal

AutoDock simplifies containerization by converting raw source code repositories into optimized, multi-stage Dockerfiles and `docker-compose.yml` blueprints using hybrid AI (OpenAI GPT + RAG) and offline rule-based analysis.

---

## 🚦 Implementation Status & Completed Milestones

### Phase 1: Core Foundation & Sandboxing (Completed ✅)
- [x] **Next.js 16 App Router Setup**: Clean project structure with dark mode theme and CSS variable design system.
- [x] **Authentication Engine (`auth.js`)**: NextAuth v5 integration with Google OAuth, GitHub OAuth, and Developer Bypass credentials.
- [x] **Zip-Slip Security Guard (`lib/security/zipSlipGuard.js`)**: Safe unzipping to prevent directory traversal vulnerabilities during archive extraction.
- [x] **Digital Shredder (`lib/cleanup.js`)**: Asynchronous background worker for auto-cleaning temporary uploads and working directories.

### Phase 2: Analysis Engine & RAG Retrieval (Completed ✅)
- [x] **Ecosystem Manifest Scanner (`lib/scanner/manifestScanner.js`)**: Detects Node.js, Python, Go, Rust, Java, Ruby, and PHP project structures and database drivers.
- [x] **Vector Store RAG Retrieval (`lib/rag/`)**: Knowledge retrieval system feeding ecosystem best practices to AI prompts.
- [x] **Hybrid AI & Local Analyzer (`lib/ai/`)**: Seamless fallback from OpenAI GPT-4o-mini structured analysis to zero-dependency local rule matching.
- [x] **Template Blueprint Compiler (`lib/templates/blueprintCompiler.js`)**: Synthesizes production multi-stage `Dockerfile`, `docker-compose.yml`, `.dockerignore`, and `README.md`.
- [x] **In-Memory Streaming Archiver (`lib/archiver.js`)**: Real-time ZIP archiving and stream delivery.

### Phase 3: Frontend Workspace & Utilities (Completed ✅)
- [x] **Interactive Workspace UI (`AutoDockApp.jsx`)**: Drag-and-drop archive upload, live parameter customization, code tab preview, and single-click ZIP downloading.
- [x] **In-Browser Folder-to-ZIP Tool (`FolderToZipConverter.jsx`)**: Client-side archiving with automatic `node_modules`, `.git`, and build artifact exclusion.
- [x] **Security Shield Dashboard (`SecurityShield.jsx`)**: Real-time display of security policies, upload constraints, and file isolation status.
- [x] **Architecture Pipeline Visualizer (`PipelineVisualizer.jsx`)**: Step-by-step visual workflow representation.
- [x] **History & Local Storage Manager (`HistoryList.jsx`)**: Local browser cache for past generations.

---

## 🚀 Future Roadmap & Planned Features

### Phase 4: Advanced Container Customization (Planned 📋)
- [ ] **Interactive Service Dependency Wiring**: UI toggles in workspace to dynamically add/remove sidecar containers (e.g., Redis Cache, Postgres DB, Adminer, Nginx reverse proxy).
- [ ] **Custom Port & Environment Variable Configurator**: Fine-grained UI controls for overriding detected internal/external ports and environment variables.

### Phase 5: Live Docker Validation & Testing (Planned 📋)
- [ ] **Docker Daemon Health Check Integration**: Connect with local/remote Docker socket to run `docker build` dry-runs and report container build status.
- [ ] **Linting & Best Practice Scorer**: Hadolint integration for scoring generated Dockerfiles against industry security standards.

### Phase 6: Cloud Native Manifest Expansion (Planned 📋)
- [ ] **Kubernetes & Helm Chart Generation**: Extend blueprint compiler to output K8s Deployments, Services, Ingresses, and Helm values files.
- [ ] **CI/CD Pipeline Generator**: Auto-create GitHub Actions workflow (`.github/workflows/docker-build.yml`) and GitLab CI manifests.

---

## 🧪 Verification & Testing Plan

### Automated Testing Strategy
- Unit tests for `zipSlipGuard.js` testing malicious relative path extraction prevention (`../..`).
- Integration tests for `manifestScanner.js` against sample repositories (Express, Next.js, Django, FastAPI, Go Gin).
- Blueprint compiler validation verifying valid Docker syntax for generated outputs.

### Security & Performance Targets
- **Max Archive File Size**: 50 MB limits with stream validation.
- **Cleanup SLA**: Temp files purged within 60 seconds of compilation.
- **Generation Speed**: Local mode < 500ms; AI RAG mode < 3s.

---
*AutoDock v2.0 Planning Document*
