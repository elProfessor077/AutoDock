const crypto = require('crypto');

/**
 * In-Memory LRU Blueprint Cache
 * 
 * Stores compiled Docker blueprint configurations indexed by a SHA-256 hash
 * of project dependency manifests and ecosystem metadata.
 */
class LRUBlueprintCache {
  constructor(capacity = 100, ttlMs = 3600000) { // Default: 100 items, 1 hour TTL
    this.capacity = capacity;
    this.ttlMs = ttlMs;
    this.cache = new Map(); // key -> { value, expiresAt, hits }
    this.stats = {
      hits: 0,
      misses: 0,
    };
  }

  /**
   * Compute a deterministic SHA-256 hash for a project's ecosystem and manifest files
   */
  computeManifestHash(ecosystem, manifests, summary = '') {
    const hash = crypto.createHash('sha256');
    hash.update(ecosystem || 'unknown');
    hash.update(summary || '');
    
    if (manifests && Array.isArray(manifests)) {
      const sortedManifests = [...manifests].sort();
      for (const manifest of sortedManifests) {
        hash.update(manifest);
      }
    }

    return hash.digest('hex');
  }

  /**
   * Get an item from cache
   */
  get(key) {
    if (!this.cache.has(key)) {
      this.stats.misses++;
      return null;
    }

    const entry = this.cache.get(key);

    // Check TTL expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Move to end of Map to maintain LRU order (most recently used)
    this.cache.delete(key);
    entry.hits++;
    this.cache.set(key, entry);
    this.stats.hits++;

    return entry.value;
  }

  /**
   * Put an item in cache
   */
  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict oldest item (first key in Map)
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
      hits: 0,
      cachedAt: new Date().toISOString(),
    });
  }

  /**
   * Check if key exists and is unexpired
   */
  has(key) {
    if (!this.cache.has(key)) return false;
    const entry = this.cache.get(key);
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Clear cache
   */
  clear() {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  /**
   * Return cache metrics and telemetry
   */
  getTelemetry() {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRatio = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      totalRequests,
      hitRatioPercentage: parseFloat(hitRatio.toFixed(2)),
      itemCount: this.cache.size,
      maxCapacity: this.capacity,
      ttlMinutes: this.ttlMs / 60000,
    };
  }
}

// Global Singleton instance (persists across hot-reloads in dev)
global._blueprintCacheInstance = global._blueprintCacheInstance || new LRUBlueprintCache(100, 3600000);
const blueprintCache = global._blueprintCacheInstance;

module.exports = {
  blueprintCache,
  LRUBlueprintCache,
};
