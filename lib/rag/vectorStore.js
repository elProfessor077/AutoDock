/**
 * In-Memory Vector Store — stores document embeddings and performs
 * cosine similarity search for RAG retrieval.
 *
 * Architecture: Singleton pattern. Initializes lazily on first search.
 * Can be swapped for Qdrant/Pinecone by replacing this single file.
 */

const { embedText, embedBatch } = require('./embeddings');
const { KNOWLEDGE_DOCUMENTS } = require('./knowledge');

// ── Singleton state ───────────────────────────────────────────────────────────
let initialized = false;
let documents = [];    // { id, title, content, tags, embedding }
let initializing = null; // Promise to prevent concurrent init

/**
 * Cosine similarity between two vectors.
 *
 * @param {number[]} a  First vector
 * @param {number[]} b  Second vector
 * @returns {number}    Similarity score between -1 and 1
 */
function cosineSimilarity(a, b) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return dotProduct / denominator;
}

/**
 * Initialize the vector store by embedding all knowledge documents.
 * Only runs once (singleton). Subsequent calls are no-ops.
 */
async function initialize() {
  if (initialized) return;

  // Prevent concurrent initialization
  if (initializing) {
    await initializing;
    return;
  }

  initializing = (async () => {
    console.log('[RAG] Initializing vector store with', KNOWLEDGE_DOCUMENTS.length, 'documents...');

    const texts = KNOWLEDGE_DOCUMENTS.map(
      (doc) => `${doc.title}\n${doc.tags.join(', ')}\n${doc.content}`
    );

    const embeddings = await embedBatch(texts);

    documents = KNOWLEDGE_DOCUMENTS.map((doc, i) => ({
      ...doc,
      embedding: embeddings[i],
    }));

    initialized = true;
    console.log('[RAG] Vector store initialized successfully.');
  })();

  await initializing;
}

/**
 * Search the vector store for documents most relevant to the query.
 *
 * @param {string} queryText  The search query (manifest content, ecosystem info)
 * @param {number} topK       Number of top results to return (default: 5)
 * @returns {Promise<Array<{ id: string, title: string, content: string, score: number }>>}
 */
async function search(queryText, topK = 5) {
  await initialize();

  const queryEmbedding = await embedText(queryText);

  const scored = documents.map((doc) => ({
    id: doc.id,
    title: doc.title,
    content: doc.content,
    tags: doc.tags,
    score: cosineSimilarity(queryEmbedding, doc.embedding),
  }));

  // Sort by score descending, return top K
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

/**
 * Check if the vector store has been initialized.
 * @returns {boolean}
 */
function isInitialized() {
  return initialized;
}

module.exports = { initialize, search, isInitialized };
