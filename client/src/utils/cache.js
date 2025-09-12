/**
 * Caching utilities for API responses and data management
 * Provides in-memory caching with TTL support for better performance
 */

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
  // Default TTL values in milliseconds
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  PRODUCTS_TTL: 3 * 60 * 1000, // 3 minutes
  CATEGORIES_TTL: 10 * 60 * 1000, // 10 minutes
  SEARCH_TTL: 2 * 60 * 1000, // 2 minutes
  
  // Maximum cache size (number of entries)
  MAX_CACHE_SIZE: 100,
  
  // Cleanup interval
  CLEANUP_INTERVAL: 60 * 1000, // 1 minute
};

/**
 * Cache entry structure
 */
class CacheEntry {
  constructor(data, ttl = CACHE_CONFIG.DEFAULT_TTL) {
    this.data = data;
    this.timestamp = Date.now();
    this.ttl = ttl;
    this.accessCount = 0;
    this.lastAccessed = this.timestamp;
  }

  /**
   * Check if cache entry is expired
   * @returns {boolean} Whether entry is expired
   */
  isExpired() {
    return Date.now() - this.timestamp > this.ttl;
  }

  /**
   * Get cached data if not expired
   * @returns {*|null} Cached data or null if expired
   */
  getData() {
    if (this.isExpired()) {
      return null;
    }
    
    this.accessCount++;
    this.lastAccessed = Date.now();
    return this.data;
  }

  /**
   * Get cache entry metadata
   * @returns {Object} Entry metadata
   */
  getMetadata() {
    return {
      timestamp: this.timestamp,
      ttl: this.ttl,
      accessCount: this.accessCount,
      lastAccessed: this.lastAccessed,
      isExpired: this.isExpired(),
      age: Date.now() - this.timestamp,
    };
  }
}

/**
 * In-memory cache implementation
 */
class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      cleanups: 0,
    };
    
    // Start periodic cleanup
    this.startCleanup();
  }

  /**
   * Generate cache key from parameters
   * @param {string} prefix - Key prefix
   * @param {Object} params - Parameters to include in key
   * @returns {string} Generated cache key
   */
  generateKey(prefix, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return `${prefix}${sortedParams ? `|${sortedParams}` : ''}`;
  }

  /**
   * Set cache entry
   * @param {string} key - Cache key
   * @param {*} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  set(key, data, ttl = CACHE_CONFIG.DEFAULT_TTL) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= CACHE_CONFIG.MAX_CACHE_SIZE) {
      this.evictOldest();
    }

    this.cache.set(key, new CacheEntry(data, ttl));
    this.stats.sets++;
  }

  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {*|null} Cached data or null if not found/expired
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    const data = entry.getData();
    
    if (data === null) {
      // Entry expired, remove it
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return data;
  }

  /**
   * Check if key exists and is not expired
   * @param {string} key - Cache key
   * @returns {boolean} Whether key exists and is valid
   */
  has(key) {
    const entry = this.cache.get(key);
    return entry && !entry.isExpired();
  }

  /**
   * Delete cache entry
   * @param {string} key - Cache key
   * @returns {boolean} Whether entry was deleted
   */
  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.deletes += size;
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;

    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: `${hitRate}%`,
      memoryUsage: this.getMemoryUsage(),
    };
  }

  /**
   * Get memory usage estimation
   * @returns {Object} Memory usage info
   */
  getMemoryUsage() {
    let totalSize = 0;
    let entryCount = 0;

    for (const [key, entry] of this.cache) {
      totalSize += key.length * 2; // Approximate string size
      totalSize += JSON.stringify(entry.data).length * 2; // Approximate data size
      entryCount++;
    }

    return {
      entries: entryCount,
      estimatedBytes: totalSize,
      estimatedKB: (totalSize / 1024).toFixed(2),
    };
  }

  /**
   * Evict oldest cache entries
   * @param {number} count - Number of entries to evict
   */
  evictOldest(count = 10) {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)
      .slice(0, count);

    entries.forEach(([key]) => {
      this.cache.delete(key);
      this.stats.deletes++;
    });
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const expiredKeys = [];
    
    for (const [key, entry] of this.cache) {
      if (entry.isExpired()) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => {
      this.cache.delete(key);
      this.stats.deletes++;
    });

    this.stats.cleanups++;
    return expiredKeys.length;
  }

  /**
   * Start periodic cleanup
   */
  startCleanup() {
    setInterval(() => {
      this.cleanup();
    }, CACHE_CONFIG.CLEANUP_INTERVAL);
  }

  /**
   * Get all cache keys with metadata
   * @returns {Array} Array of cache entries with metadata
   */
  getAllEntries() {
    const entries = [];
    
    for (const [key, entry] of this.cache) {
      entries.push({
        key,
        ...entry.getMetadata(),
      });
    }

    return entries.sort((a, b) => b.lastAccessed - a.lastAccessed);
  }
}

// Global cache instance
const cache = new MemoryCache();

/**
 * Cache wrapper for API functions
 * @param {Function} apiFunction - API function to wrap
 * @param {string} keyPrefix - Cache key prefix
 * @param {number} ttl - Time to live in milliseconds
 * @returns {Function} Wrapped function with caching
 */
export const withCache = (apiFunction, keyPrefix, ttl = CACHE_CONFIG.DEFAULT_TTL) => {
  return async (...args) => {
    // Generate cache key from function arguments
    const cacheKey = cache.generateKey(keyPrefix, args[0] || {});
    
    // Try to get from cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData !== null) {
      return cachedData;
    }

    // Call API function and cache result
    try {
      const result = await apiFunction(...args);
      cache.set(cacheKey, result, ttl);
      return result;
    } catch (error) {
      // Don't cache errors, just throw them
      throw error;
    }
  };
};

/**
 * Cached API functions with appropriate TTL values
 */
export const cachedApi = {
  /**
   * Cache key for trending products
   */
  trendingProducts: (options = {}) => 
    cache.generateKey('trending', options),

  /**
   * Cache key for recent products
   */
  recentProducts: (options = {}) => 
    cache.generateKey('recent', options),

  /**
   * Cache key for product search
   */
  searchProducts: (options = {}) => 
    cache.generateKey('search', options),

  /**
   * Cache key for category products
   */
  categoryProducts: (options = {}) => 
    cache.generateKey('category', options),

  /**
   * Cache key for all products
   */
  allProducts: (options = {}) => 
    cache.generateKey('products', options),
};

/**
 * Invalidate cache entries by pattern
 * @param {string} pattern - Pattern to match keys
 */
export const invalidateCache = (pattern) => {
  const keysToDelete = [];
  
  for (const key of cache.cache.keys()) {
    if (key.includes(pattern)) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => cache.delete(key));
  return keysToDelete.length;
};

/**
 * Preload data into cache
 * @param {string} key - Cache key
 * @param {*} data - Data to preload
 * @param {number} ttl - Time to live
 */
export const preloadCache = (key, data, ttl = CACHE_CONFIG.DEFAULT_TTL) => {
  cache.set(key, data, ttl);
};

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export const getCacheStats = () => {
  return cache.getStats();
};

/**
 * Clear all cache
 */
export const clearCache = () => {
  cache.clear();
};

/**
 * Get all cache entries for debugging
 * @returns {Array} Cache entries with metadata
 */
export const getCacheEntries = () => {
  return cache.getAllEntries();
};

// Export cache instance and configuration
export { cache, CACHE_CONFIG };