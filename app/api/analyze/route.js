const { NextResponse } = require('next/server');
const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { PassThrough } = require('stream');

const { validateUpload } = require('@/lib/security/validateUpload');
const { safeExtract } = require('@/lib/security/zipSlipGuard');
const { scanManifests } = require('@/lib/scanner/manifestScanner');
const { analyzeProject } = require('@/lib/ai/geminiPipeline');
const { analyzeLocally } = require('@/lib/ai/localAnalyzer');
const { compileBlueprint } = require('@/lib/templates/blueprintCompiler');
const { streamBlueprint } = require('@/lib/archiver');
const { triggerCleanup } = require('@/lib/cleanup');
const { blueprintCache } = require('@/lib/cache/blueprintCache');

// Disable bodyParser size limits or next configs if needed (handled by app router)
export const dynamic = 'force-dynamic';

export async function POST(request) {
  let zipPath = null;
  let runDir = null;

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    // ── Step 1: Validate file presence, size and type ─────────────────────────
    const validation = validateUpload(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    // ── Step 2: Establish file paths & sandbox directories ────────────────────
    const runId = uuidv4();
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const tempDir = path.join(process.cwd(), 'temp');
    zipPath = path.join(uploadsDir, `${runId}.zip`);
    runDir = path.join(tempDir, runId);

    // Auto-create directories on demand
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.mkdir(tempDir, { recursive: true });

    // ── Step 3: Write uploaded binary chunk to disk ───────────────────────────
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(zipPath, buffer);

    // ── Step 4: Extract safely using Zip-Slip Guard ───────────────────────────
    safeExtract(zipPath, runDir);

    // ── Step 5: Pre-Filter Scanner ───────────────────────────────────────────
    const { ecosystem, manifests, summary } = scanManifests(runDir);

    // ── Step 5b: LRU Cache Lookup ──────────────────────────────────────────────
    const manifestHash = blueprintCache.computeManifestHash(ecosystem, manifests, summary);
    let cacheStatus = 'MISS';
    let config = blueprintCache.get(manifestHash);

    if (config) {
      cacheStatus = 'HIT';
      console.log(`[Cache HIT] Serving cached blueprint for hash: ${manifestHash.slice(0, 12)}...`);
    } else {
      // ── Step 6: AI Analysis (with local fallback) ─────────────────────────────
      let analysisMode = 'ai';

      if (process.env.OPENAI_API_KEY) {
        try {
          config = await analyzeProject(ecosystem, summary);
          console.log('[Pipeline] AI analysis completed successfully.');
        } catch (aiErr) {
          console.warn('[Pipeline] AI analysis failed, falling back to local analyzer:', aiErr.message);
          config = analyzeLocally(ecosystem, manifests);
          analysisMode = 'local';
        }
      } else {
        console.log('[Pipeline] No OPENAI_API_KEY set — using local rule-based analyzer.');
        config = analyzeLocally(ecosystem, manifests);
        analysisMode = 'local';
      }

      // Store in LRU Cache for subsequent requests
      blueprintCache.set(manifestHash, config);
      console.log(`[Cache MISS] Stored new blueprint in cache for hash: ${manifestHash.slice(0, 12)}... (mode: ${analysisMode})`);
    }

    // ── Step 7: Synthesize Blueprint templates ───────────────────────────────
    const blueprints = compileBlueprint(config);

    // ── Step 8: Build In-Memory Stream and return Response ───────────────────
    const stream = new PassThrough();
    
    // Non-blocking compilation and streaming trigger
    streamBlueprint(stream, blueprints).catch((err) => {
      console.error('[Archiver] Error during streaming zip packaging:', err);
    });

    // Convert PassThrough Node stream into Web ReadableStream for next response
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => controller.enqueue(chunk));
        stream.on('end', () => controller.close());
        stream.on('error', (err) => controller.error(err));
      },
    });

    // Schedule Digital Shredder cleanup in background
    triggerCleanup([zipPath, runDir]);

    return new Response(webStream, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="AutoDock-blueprint.zip"',
        'X-Cache': cacheStatus,
        'X-Manifest-Hash': manifestHash.slice(0, 16),
      },
    });

  } catch (err) {
    console.error('[API Error] Analysis pipeline crashed:', err);

    // Cleanup resources immediately if they were created before crashing
    if (zipPath || runDir) {
      triggerCleanup([zipPath, runDir].filter(Boolean));
    }

    const statusCode = err.status || 500;
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: statusCode }
    );
  }
}
