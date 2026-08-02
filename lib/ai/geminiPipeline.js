/**
 * OpenAI AI Pipeline — feeds extracted manifests + RAG-retrieved context
 * into OpenAI GPT-4o-mini with strict JSON mode enforcement.
 *
 * Returns structured deployment configuration for the blueprint compiler.
 */

const OpenAI = require('openai');
const { search } = require('../rag/vectorStore');

let openaiClient = null;

function getClient() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required.');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a senior DevOps engineer and deployment expert across all major software ecosystems.
Your sole job is to analyse project manifest files and extract Docker deployment configuration.

CRITICAL RULES:
1. Use ONLY information from the provided manifests and the verified deployment knowledge below.
2. For base images: ALWAYS use the specific LTS/stable image tags from the RAG knowledge. Never use "latest".
3. For databases: detect from dependency/driver packages in manifests.
4. For ports: check scripts, config patterns, or use framework defaults.
5. For start commands: use the exact production start command for the framework.
6. For build commands: include if the project needs a build step (TypeScript, Next.js, Go, Rust, Java).
7. Return ONLY valid JSON conforming to the schema below. No markdown, no explanations, no code fences.

RESPONSE JSON SCHEMA (all fields required):
{
  "runtime": "Primary runtime: nodejs, python, go, ruby, rust, java, php",
  "runtimeVersion": "Major version string (e.g. '20', '3.12', '1.22')",
  "baseImage": "Full Docker base image tag (e.g. 'node:20-alpine', 'python:3.12-slim')",
  "database": "Primary database: postgres, mysql, mongodb, redis, sqlite, none",
  "applicationPort": 3000,
  "framework": "Detected framework: express, nextjs, nestjs, django, flask, fastapi, gin, fiber, rails, actix, axum, spring, laravel, none",
  "buildCommand": "Build command or empty string if no build step needed",
  "startCommand": "Production start command (e.g. 'node server.js', 'gunicorn app:app')"
}

ECOSYSTEM DETECTION RULES:
- package.json → nodejs
- requirements.txt / Pipfile / pyproject.toml → python
- go.mod → go
- Cargo.toml → rust
- Gemfile → ruby
- pom.xml / build.gradle → java
- composer.json → php

DATABASE DETECTION:
- pg / knex / prisma (with postgresql) / sequelize (with pg) / typeorm (with pg) → postgres
- mysql / mysql2 / sequelize (with mysql2) → mysql
- mongoose / mongodb → mongodb
- redis / ioredis / bullmq → redis
- better-sqlite3 / sqlite3 → sqlite
- psycopg2 / asyncpg / sqlalchemy (with postgresql) → postgres
- pymongo → mongodb
- django.db.backends.postgresql → postgres
- gorm.io/driver/postgres → postgres

Prefer conservative, widely-supported defaults when uncertain.`;

/**
 * Analyses project manifests with RAG context and returns deployment configuration.
 *
 * @param {string} ecosystem     Detected primary ecosystem
 * @param {string} manifestText  Concatenated manifest file contents
 * @returns {Promise<Object>}    Structured deployment config
 */
async function analyzeProject(ecosystem, manifestText) {
  // ── Step 1: RAG retrieval ──────────────────────────────────────────────────
  const ragQuery = `${ecosystem} docker deployment configuration dockerfile best practices`;
  let ragDocuments;

  try {
    ragDocuments = await search(ragQuery, 6);
  } catch (err) {
    console.warn('[RAG] Vector search failed, proceeding without RAG context:', err.message);
    ragDocuments = [];
  }

  const ragContext = ragDocuments.length > 0
    ? ragDocuments
        .map((doc, i) => `[${i + 1}] ${doc.title} (relevance: ${(doc.score * 100).toFixed(0)}%)\n${doc.content}`)
        .join('\n\n')
    : 'No RAG context available. Use your expert knowledge with conservative defaults.';

  // ── Step 2: Build prompt ───────────────────────────────────────────────────
  const userContent = `## Verified Deployment Knowledge (RAG Retrieved)
${ragContext}

## Project Manifests (Ecosystem: ${ecosystem})
${manifestText}

Analyse these manifests using the verified knowledge above and return the deployment configuration as a JSON object.`;

  // ── Step 3: Call OpenAI ────────────────────────────────────────────────────
  const client = getClient();

  const result = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userContent },
    ],
  });

  const text = result.choices[0]?.message?.content;

  try {
    const config = JSON.parse(text);

    // Validate required fields exist
    const required = ['runtime', 'runtimeVersion', 'baseImage', 'database', 'applicationPort', 'framework', 'startCommand'];
    for (const field of required) {
      if (config[field] === undefined || config[field] === null) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return config;
  } catch (parseErr) {
    if (parseErr.message.startsWith('Missing required field')) {
      throw Object.assign(parseErr, { status: 502 });
    }
    throw Object.assign(
      new Error('AI response could not be parsed as JSON. Raw: ' + text?.slice(0, 200)),
      { status: 502 }
    );
  }
}

module.exports = { analyzeProject };
