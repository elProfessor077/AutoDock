/**
 * AI Blueprint Refinement Chat API
 * 
 * Accepts a user message + current blueprint config, asks AI to return
 * a JSON config patch, merges it, re-compiles blueprints, and returns
 * the result. Supports both OpenAI and Google Gemini with automatic fallback.
 */

const { NextResponse } = require('next/server');
const { compileBlueprint } = require('@/lib/templates/blueprintCompiler');

export const dynamic = 'force-dynamic';

// ── AI Provider Abstraction ─────────────────────────────────────────────────

let openaiClient = null;
let geminiClient = null;

function getOpenAIClient() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;
    const OpenAI = require('openai');
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

function getGeminiClient() {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) return null;
    const { GoogleGenAI } = require('@google/genai');
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

/**
 * Call OpenAI GPT-4o-mini
 */
async function callOpenAI(messages) {
  const client = getOpenAIClient();
  if (!client) return null;

  const result = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages,
  });

  return result.choices[0]?.message?.content;
}

/**
 * Call Google Gemini
 */
async function callGemini(systemPrompt, userContent) {
  const client = getGeminiClient();
  if (!client) return null;

  const fullPrompt = `${systemPrompt}\n\n---\n\n${userContent}\n\nRespond with ONLY a valid JSON object. No markdown fences, no extra text.`;

  const response = await client.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: fullPrompt,
    config: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });

  return response.text;
}

// ── System prompt for refinement mode ─────────────────────────────────────────
const REFINEMENT_SYSTEM_PROMPT = `You are AutoDock's AI Blueprint Refinement Assistant. You help users modify their Docker deployment configurations through natural language instructions.

You are given the user's CURRENT blueprint configuration as a JSON object. The user will ask you to modify specific aspects of it.

YOUR RESPONSE MUST BE A VALID JSON OBJECT with exactly two fields:
1. "configPatch": An object containing ONLY the configuration fields that need to change. Valid fields are:
   - "runtime": Primary runtime (nodejs, python, go, ruby, rust, java, php)
   - "runtimeVersion": Version string (e.g. "20", "3.12", "1.22")
   - "baseImage": Full Docker base image tag (e.g. "node:20-alpine", "python:3.12-slim")
   - "database": Database (postgres, mysql, mongodb, redis, sqlite, none)
   - "applicationPort": Port number (integer)
   - "framework": Framework name (express, nextjs, nestjs, django, flask, fastapi, gin, fiber, rails, actix, axum, spring, laravel, none)
   - "buildCommand": Build command string or empty string
   - "startCommand": Production start command string

2. "explanation": A concise, friendly explanation (2-4 sentences) of what you changed and why. Use markdown formatting for clarity. Mention specific values you changed.

RULES:
- Only include fields in configPatch that actually need to change.
- If the user's request doesn't map to any valid field changes, return an empty configPatch {} and explain why.
- Always ensure baseImage matches the runtime and runtimeVersion.
- When switching runtimes, update all related fields (runtimeVersion, baseImage, startCommand, buildCommand, framework).
- When adding a database, only change the "database" field — the blueprint compiler handles docker-compose wiring automatically.
- Be helpful and specific in your explanation.
- Return ONLY valid JSON. No markdown code fences, no extra text outside the JSON.`;

export async function POST(request) {
  try {
    const body = await request.json();
    const { message, currentConfig, chatHistory = [] } = body;

    if (!message || !currentConfig) {
      return NextResponse.json(
        { error: 'Missing required fields: message, currentConfig' },
        { status: 400 }
      );
    }

    // ── Build conversation context ──────────────────────────────────────────
    const messages = [
      { role: 'system', content: REFINEMENT_SYSTEM_PROMPT },
    ];

    // Include recent chat history for multi-turn context (last 6 exchanges max)
    const recentHistory = chatHistory.slice(-12);
    for (const entry of recentHistory) {
      messages.push({
        role: entry.role === 'user' ? 'user' : 'assistant',
        content: entry.content,
      });
    }

    // Build user message with config context
    const userContent = `## Current Blueprint Configuration
\`\`\`json
${JSON.stringify(currentConfig, null, 2)}
\`\`\`

## User Request
${message}

Respond with a JSON object containing "configPatch" and "explanation".`;

    messages.push({ role: 'user', content: userContent });

    // ── Try AI providers with fallback chain ─────────────────────────────────
    let responseText = null;
    let aiProvider = 'none';

    // Try 1: OpenAI
    if (!responseText) {
      try {
        responseText = await callOpenAI(messages);
        if (responseText) aiProvider = 'openai';
      } catch (openaiErr) {
        console.warn('[Chat Refine] OpenAI failed:', openaiErr.message);
      }
    }

    // Try 2: Google Gemini
    if (!responseText) {
      try {
        responseText = await callGemini(REFINEMENT_SYSTEM_PROMPT, userContent);
        if (responseText) aiProvider = 'gemini';
      } catch (geminiErr) {
        console.warn('[Chat Refine] Gemini failed:', geminiErr.message);
      }
    }

    // No AI available
    if (!responseText) {
      return NextResponse.json({
        explanation: '⚠️ **AI Unavailable** — Could not connect to any AI provider. Please check:\n\n• `OPENAI_API_KEY` — your OpenAI key may have no credits\n• `GEMINI_API_KEY` — add a Google Gemini API key (free tier available at [ai.google.dev](https://ai.google.dev))\n\nSet either key in your `.env.local` file and restart the server.',
        configPatch: {},
        blueprints: null,
        updatedConfig: null,
      }, { status: 200 });
    }

    console.log(`[Chat Refine] Response received from: ${aiProvider}`);

    // ── Parse AI response ───────────────────────────────────────────────────
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseErr) {
      return NextResponse.json({
        explanation: '❌ The AI returned an invalid response. Please try rephrasing your request.',
        configPatch: {},
        blueprints: null,
        updatedConfig: null,
      }, { status: 200 });
    }

    const { configPatch = {}, explanation = 'Changes applied.' } = parsed;

    // ── Merge patch into current config ─────────────────────────────────────
    const updatedConfig = { ...currentConfig, ...configPatch };

    // Ensure required fields exist with defaults
    if (!updatedConfig.runtime) updatedConfig.runtime = 'nodejs';
    if (!updatedConfig.runtimeVersion) updatedConfig.runtimeVersion = '20';
    if (!updatedConfig.baseImage) updatedConfig.baseImage = 'node:20-alpine';
    if (!updatedConfig.database) updatedConfig.database = 'none';
    if (!updatedConfig.applicationPort) updatedConfig.applicationPort = 3000;
    if (!updatedConfig.framework) updatedConfig.framework = 'none';
    if (!updatedConfig.startCommand) updatedConfig.startCommand = 'node server.js';

    // ── Re-compile blueprints with updated config ───────────────────────────
    let blueprints = null;
    try {
      const compiled = compileBlueprint(updatedConfig);
      blueprints = {
        'Dockerfile': compiled.dockerfile,
        'docker-compose.yml': compiled.dockerCompose,
        '.dockerignore': compiled.dockerignore,
        'README.md': compiled.readme,
        '.env.example': compiled.envExample,
        'k8s-deployment.yaml': compiled.k8sDeployment,
        'k8s-service.yaml': compiled.k8sService,
        'fly.toml': compiled.flyToml,
        'render.yaml': compiled.renderYaml,
      };
    } catch (compileErr) {
      console.error('[Chat Refine] Blueprint compilation failed:', compileErr.message);
      return NextResponse.json({
        explanation: explanation + '\n\n⚠️ *Blueprint compilation failed after applying changes. The configuration may be invalid.*',
        configPatch,
        blueprints: null,
        updatedConfig,
      }, { status: 200 });
    }

    return NextResponse.json({
      explanation,
      configPatch,
      blueprints,
      updatedConfig,
    }, { status: 200 });

  } catch (err) {
    console.error('[Chat Refine API Error]', err);

    // Return user-friendly error instead of 500
    return NextResponse.json({
      explanation: `❌ **Error:** ${err.message || 'An unexpected error occurred'}. Please try again.`,
      configPatch: {},
      blueprints: null,
      updatedConfig: null,
    }, { status: 200 });
  }
}
