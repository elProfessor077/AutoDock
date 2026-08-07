<div align="center">

  # 🐳 Dockeryze
  ### *AI-Powered Instant Docker & Compose Blueprint Generator*

  [![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
  [![Docker](https://img.shields.io/badge/Docker-Engine-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
  [![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

  <p align="center">
    Transform any source code repository into production-ready, multi-stage <code>Dockerfile</code> and <code>docker-compose.yml</code> configurations in seconds using AI and RAG knowledge retrieval.
  </p>

</div>

---

## 🌟 Key Features

- ⚡ **Instant Containerization**: Drag & drop project archives (`.zip`) to automatically generate optimized container blueprints.
- 🤖 **Hybrid AI Engine**: Combines LLM structured JSON analysis with an in-memory **RAG Vector Knowledge Store** for pin-point LTS version selection.
- 🛡️ **Zero-Dependency Local Fallback**: Deterministic rule-based analyzer when working offline or without an API key.
- 📦 **In-Browser Folder-to-ZIP**: Client-side project folder compression utility with intelligent filtering (`node_modules`, `.git`, `.next` exclusion).
- 🔐 **Hardened Security Shield**: Protected by **Zip-Slip Attack Guard** (path sanitizer) and **Digital Shredder** (ephemeral temp file auto-cleanup).
- 🌐 **Multi-Ecosystem Detection**: Auto-detects frameworks & databases for **Node.js**, **Python**, **Go**, **Rust**, **Java**, **Ruby**, and **PHP**.
- 🔑 **Multi-Provider Auth**: Integrated NextAuth v5 supporting GitHub OAuth, Google OAuth, and Developer Bypass authentication.

---

## 🏗️ Architecture Pipeline

```
┌─────────────────┐       ┌────────────────────┐       ┌────────────────────────┐
│ Source Repo Zip │ ───>  │ Upload Validation  │ ───>  │ Zip-Slip Guard &       │
│ / Local Folder  │       │ & Security Check   │       │ Temp Sandbox          │
└─────────────────┘       └────────────────────┘       └────────────────────────┘
                                                                   │
                                                                   ▼
┌─────────────────┐       ┌────────────────────┐       ┌────────────────────────┐
│ Downloadable    │ <───  │ Blueprint          │ <───  │ Hybrid AI / Local      │
│ Blueprint ZIP   │       │ Multi-Template     │       │ Ecosystem Scanner      │
└─────────────────┘       └────────────────────┘       └────────────────────────┘
                                                                   │
                                                                   ▼
                                                       ┌────────────────────────┐
                                                       │ Digital Shredder       │
                                                       │ Auto-Purge Task        │
                                                       └────────────────────────┘
```

---

## 📂 Project Structure

```
.
├── app/                         # Next.js App Router
│   ├── api/analyze/route.js     # Archive analysis & blueprint generation endpoint
│   ├── workspace/page.js        # Main Blueprint Workspace UI
│   ├── folder-to-zip/page.js    # Client-side Folder-to-ZIP converter
│   ├── how-it-works/page.js    # Architecture visualizer
│   ├── security/page.js         # Security shield dashboard
│   ├── history/page.js          # Generation log viewer
│   ├── docs/page.js             # Capability matrix & docs
│   └── signin/page.js           # Multi-provider login screen
│
├── components/                  # React UI Components
│   ├── DockeryzeApp.jsx         # Primary blueprint workspace state manager
│   ├── BlueprintViewer.jsx      # Code viewer with tabbed navigation & copy controls
│   ├── FolderToZipConverter.jsx # JSZip folder archiving utility
│   ├── PipelineVisualizer.jsx   # Interactive architecture flow
│   ├── SecurityShield.jsx       # Security metrics display
│   ├── Sidebar.jsx              # App navigation sidebar
│   └── ComparisonTable.jsx      # Feature comparison matrix
│
├── lib/                         # Core Backend Systems
│   ├── ai/                      # AI Analysis (geminiPipeline.js & localAnalyzer.js)
│   ├── rag/                     # RAG Vector Store & Knowledge Base
│   ├── scanner/                 # Manifest scanner (Node, Python, Go, etc.)
│   ├── security/                # Zip-Slip Guard & Upload Validator
│   ├── templates/               # Dockerfile & Docker Compose Template Compiler
│   ├── archiver.js              # Streaming ZIP packaging
│   └── cleanup.js               # Ephemeral Shredder cleanup worker
│
├── auth.js                      # NextAuth v5 configuration
├── proxy.js                     # Edge session protection middleware
└── docker-compose.yml           # Container deployment configuration
```

---

## 🚀 Quick Start Guide

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- `npm` or `pnpm`
- (Optional) [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/elProfessor077/Docker.git
cd Docker
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# NextAuth Configuration
AUTH_SECRET=your-random-32-byte-secret
AUTH_TRUST_HOST=true
NEXTAUTH_URL=http://localhost:3000

# (Optional) AI Key for RAG-enhanced GPT analysis
OPENAI_API_KEY=your-openai-api-key

# (Optional) OAuth Provider Keys
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Developer Bypass**: You can log in using Username: `developer` and Password: `dockeryze`.

---

## 🐳 Docker Deployment

You can run the entire Dockeryze stack using Docker Compose:

```bash
docker-compose up -d --build
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

---

## 🔒 Security Specifications

- **Zip-Slip Shield**: Enforces strict path normalization on all archive extractions to eliminate directory traversal attack vectors.
- **Ephemeral Shredder**: Auto-purges uploaded `.zip` archives and extracted temp files immediately after blueprint generation.
- **Memory Streaming**: Blueprint ZIP packages are compiled and streamed directly to HTTP responses without persistent disk retention.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
