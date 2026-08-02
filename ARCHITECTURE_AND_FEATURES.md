# Dockeryze v2.0 — Architecture & Features Documentation

This document provides a comprehensive overview of **Dockeryze v2.0**, detailing all working files, application features, component breakdowns, and system architecture workflows.

---

## 🏗️ System Architecture & Workflow

Dockeryze is an AI-powered containerization engine that analyzes software project repositories and automatically generates production-ready Docker and Compose blueprints.

```
┌─────────────────┐       ┌────────────────────┐       ┌────────────────────────┐
│  User Workspace │ ───>  │ File Upload &      │ ───>  │ Zip-Slip Guard &       │
│  (Zip / Folder) │       │ Security Validation│       │ Temporary Sandbox      │
└─────────────────┘       └────────────────────┘       └────────────────────────┘
                                                                   │
                                                                   ▼
┌─────────────────┐       ┌────────────────────┐       ┌────────────────────────┐
│ Streaming Zip   │ <───  │ Blueprint          │ <───  │ AI / Local Rule-Based  │
│ Response Output │       │ Template Compiler  │       │ Manifest Analyzer      │
└─────────────────┘       └────────────────────┘       └────────────────────────┘
                                                                   │
                                                                   ▼
                                                       ┌────────────────────────┐
                                                       │ Digital Shredder       │
                                                       │ Auto-Cleanup           │
                                                       └────────────────────────┘
```

### End-to-End Pipeline Stages

1. **Security & Sandboxing**: Uploaded archives (`.zip`) are validated for size and MIME-type limits. The archive is safely extracted using `zipSlipGuard.js` to prevent path traversal attacks.
2. **Ecosystem & Manifest Scanning**: `manifestScanner.js` inspects project files to detect primary runtimes (Node.js, Python, Go, Rust, Java, Ruby, PHP) and dependency manifests (`package.json`, `requirements.txt`, `go.mod`, etc.).
3. **Dual Analysis Engine (AI + Local Fallback)**:
   - **AI Pipeline (`geminiPipeline.js`)**: Queries the vector store (`vectorStore.js` / `knowledge.js`) for framework best practices and passes context to GPT with strict JSON schema constraints.
   - **Local Analyzer (`localAnalyzer.js`)**: Runs zero-latency rule matching if no API key is provided or during API quota limits.
4. **Template Compilation**: `blueprintCompiler.js` synthesizes multi-stage `Dockerfile`, `docker-compose.yml`, `.dockerignore`, and `README.md`.
5. **Streaming Archiving**: `archiver.js` streams the generated blueprint files directly back to the client as a downloadable ZIP package.
6. **Digital Shredder**: `cleanup.js` immediately purges raw uploads and temp files post-compilation.

---

## 📂 Codebase & Working Files Map

```
c:\prototype\
├── app\                         # Next.js App Router Pages & API Endpoints
│   ├── layout.js                # Root layout with navigation sidebar & global context
│   ├── page.js                  # Main dashboard entry point
│   ├── page.module.css          # Core page layout styling
│   ├── globals.css              # Global CSS tokens, custom properties & animations
│   ├── workspace/page.js        # Blueprint Generator Workspace page
│   ├── folder-to-zip/page.js    # Browser-side Folder to ZIP conversion page
│   ├── how-it-works/page.js    # Interactive Architecture & Pipeline Visualizer
│   ├── security/page.js         # Security architecture breakdown page
│   ├── history/page.js          # Blueprint generation history log page
│   ├── docs/page.js             # Ecosystem comparison matrix & features documentation
│   ├── signin/page.js           # Multi-provider login page (Google, GitHub, Bypass)
│   └── api/
│       ├── analyze/route.js     # POST route for zip analysis & blueprint generation
│       └── auth/[...nextauth]/  # NextAuth API routing handler
│
├── components/                  # React UI Components
│   ├── Sidebar.jsx              # Responsive navigation sidebar with active route state
│   ├── AuthButton.jsx           # User authentication & session state button
│   ├── HomePage.jsx             # Main dashboard UI with stats & quick action launchers
│   ├── DockeryzeApp.jsx         # Primary blueprint generator workspace UI
│   ├── FolderToZipConverter.jsx # Browser-side folder zipping utility (JSZip)
│   ├── Dropzone.jsx             # Drag-and-drop zip file uploader component
│   ├── BlueprintViewer.jsx      # Code viewer with tabbed file navigation & download controls
│   ├── PipelineVisualizer.jsx   # Interactive 6-stage architecture visualizer
│   ├── SecurityShield.jsx       # Interactive security controls showcase
│   ├── HistoryList.jsx          # Local storage generation history viewer
│   ├── ComparisonTable.jsx      # Multi-ecosystem capability matrix
│   ├── FeatureGrid.jsx          # Highlighted system feature cards
│   ├── StatusBadge.jsx          # Reusable status pill component
│   └── HeroSection.jsx          # Shared page header banner component
│
├── lib/                         # Core Backend Logic & AI Engine
│   ├── ai/
│   │   ├── geminiPipeline.js    # OpenAI GPT analyzer with RAG context & JSON schema
│   │   └── localAnalyzer.js     # Deterministic offline rule-based manifest analyzer
│   ├── rag/
│   │   ├── knowledge.js         # Pre-indexed ecosystem deployment documentation
│   │   ├── vectorStore.js       # In-memory vector store & keyword search
│   │   └── embeddings.js        # Vector embedding generation utilities
│   ├── scanner/
│   │   └── manifestScanner.js   # Multi-language dependency manifest parser
│   ├── security/
│   │   ├── validateUpload.js    # File size, extension, and header validator
│   │   └── zipSlipGuard.js      # Extraction path sanitizer to prevent path traversal
│   ├── templates/
│   │   └── blueprintCompiler.js # Multi-stage Dockerfile & compose template generator
│   ├── archiver.js              # Streaming ZIP builder using Archiver
│   └── cleanup.js               # Asynchronous digital shredder for temp file deletion
│
├── auth.js                      # NextAuth v5 configuration (OAuth + Dev Bypass)
├── proxy.js                     # Edge middleware for session route protection
├── package.json                 # Dependencies and npm scripts
└── next.config.mjs              # Next.js configuration
```

---

## ⚡ Feature Summary

| Feature | Description | File / Component Reference |
| :--- | :--- | :--- |
| **Instant Blueprint Generation** | Drag & drop zip upload to auto-generate Dockerfile, docker-compose, and README | [`DockeryzeApp.jsx`](file:///c:/prototype/components/DockeryzeApp.jsx), [`route.js`](file:///c:/prototype/app/api/analyze/route.js) |
| **Client-Side Folder-to-ZIP** | Convert local project folders into clean ZIP archives in browser memory | [`FolderToZipConverter.jsx`](file:///c:/prototype/components/FolderToZipConverter.jsx) |
| **Hybrid Analysis (AI + Offline)** | Dual-engine analyzer combining GPT/RAG with zero-dependency local rule matching | [`geminiPipeline.js`](file:///c:/prototype/lib/ai/geminiPipeline.js), [`localAnalyzer.js`](file:///c:/prototype/lib/ai/localAnalyzer.js) |
| **Multi-Ecosystem Detection** | Support for Node.js, Python, Go, Rust, Java, Ruby, PHP, and major databases | [`manifestScanner.js`](file:///c:/prototype/lib/scanner/manifestScanner.js) |
| **Zip-Slip Security Guard** | Automatic defense against malicious archive path traversal attacks | [`zipSlipGuard.js`](file:///c:/prototype/lib/security/zipSlipGuard.js) |
| **Digital Shredder** | Auto-purging of uploaded zip files and temporary sandbox directories post-compilation | [`cleanup.js`](file:///c:/prototype/lib/cleanup.js) |
| **Live Blueprint Code Viewer** | Tabbed syntax viewer with copy-to-clipboard and single-click ZIP export | [`BlueprintViewer.jsx`](file:///c:/prototype/components/BlueprintViewer.jsx) |
| **Generation History Log** | Stores recent blueprint generations locally for easy retrieval and re-downloading | [`HistoryList.jsx`](file:///c:/prototype/components/HistoryList.jsx) |
| **Interactive Pipeline View** | Visual step-by-step breakdown of how Dockeryze processes code archives | [`PipelineVisualizer.jsx`](file:///c:/prototype/components/PipelineVisualizer.jsx) |
| **Multi-Provider Authentication** | GitHub, Google OAuth, and developer bypass credentials authentication | [`auth.js`](file:///c:/prototype/auth.js), [`signin/page.js`](file:///c:/prototype/app/signin/page.js) |

---
*Generated for Dockeryze v2.0*
