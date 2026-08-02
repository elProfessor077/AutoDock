/**
 * Embeddings Service — uses OpenAI text-embedding-3-small to generate vector embeddings.
 * Caches embeddings in memory via singleton pattern for performance.
 */

const OpenAI = require('openai');

let openaiClient = null;

function getClient() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required for embeddings.');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

/**
 * Generate an embedding vector for a single text string.
 *
 * @param {string} text  The text to embed
 * @returns {Promise<number[]>}  The embedding vector
 */
async function embedText(text) {
  const client = getClient();
  const result = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return result.data[0].embedding;
}

/**
 * Generate embeddings for a batch of texts.
 * OpenAI supports batching natively in a single API call.
 *
 * @param {string[]} texts  Array of texts to embed
 * @returns {Promise<number[][]>}  Array of embedding vectors
 */
async function embedBatch(texts) {
  const client = getClient();
  const result = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
  });
  // Sort by index to maintain order
  return result.data
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);
}

module.exports = { embedText, embedBatch };
