/**
 * Centralized exports for all utility functions
 * Provides a clean API interface for data fetching utilities
 */

// API utilities
export {
  fetchTrendingProducts,
  fetchRecentlyOrderedProducts,
  fetchProducts,
  searchProducts,
  fetchProductsByCategory,
  API_CONFIG,
} from './api.js';

// Category data management
export {
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  searchCategories,
  getCategoryProducts,
  getCategoryLoadingState,
  clearCategoryError,
  filterProductsByCategory,
  getCategoryUrl,
  getCategoryStats,
  batchFetchCategoryProducts,
  getCategoryBreadcrumbs,
  CATEGORIES,
} from './categoryData.js';

// Caching utilities
export {
  withCache,
  cachedApi,
  invalidateCache,
  preloadCache,
  getCacheStats,
  clearCache,
  getCacheEntries,
  cache,
  CACHE_CONFIG,
} from './cache.js';

// Type definitions and validation
export {
  isValidProduct,
  isValidCategory,
  isValidPaginatedResponse,
  DEFAULT_LOADING_STATE,
  DEFAULT_PAGINATION,
  DEFAULT_FETCH_OPTIONS,
} from './types.js';

// Image utilities (existing)
export {
  getImageUrl,
  getOptimizedProductImage,
  preloadImage,
  supportsWebP,
} from './imageUrl.js';

/**
 * Enhanced API functions with caching enabled
 * These are the recommended functions to use in components
 */

// Cache TTL values
const CACHE_TTL = {
  TRENDING: 3 * 60 * 1000, // 3 minutes
  RECENT: 2 * 60 * 1000, // 2 minutes
  PRODUCTS: 5 * 60 * 1000, // 5 minutes
  SEARCH: 1 * 60 * 1000, // 1 minute
  CATEGORIES: 10 * 60 * 1000, // 10 minutes
};

// Import the base API functions
import { 
  fetchTrendingProducts as baseFetchTrending,
  fetchRecentlyOrderedProducts as baseFetchRecent,
  fetchProducts as baseFetchProducts,
  searchProducts as baseSearchProducts,
} from './api.js';

import { withCache } from './cache.js';

/**
 * Cached version of fetchTrendingProducts
 */
export const fetchTrendingProductsCached = withCache(
  baseFetchTrending,
  'trending',
  CACHE_TTL.TRENDING
);

/**
 * Cached version of fetchRecentlyOrderedProducts
 */
export const fetchRecentlyOrderedProductsCached = withCache(
  baseFetchRecent,
  'recent',
  CACHE_TTL.RECENT
);

/**
 * Cached version of fetchProducts
 */
export const fetchProductsCached = withCache(
  baseFetchProducts,
  'products',
  CACHE_TTL.PRODUCTS
);

/**
 * Cached version of searchProducts
 */
export const searchProductsCached = withCache(
  baseSearchProducts,
  'search',
  CACHE_TTL.SEARCH
);

/**
 * Utility to create loading state hooks for components
 * @param {string} initialState - Initial loading state
 * @returns {Object} Loading state management object
 */
export const createLoadingState = (initialState = 'idle') => {
  return {
    idle: initialState === 'idle',
    loading: initialState === 'loading',
    success: initialState === 'success',
    error: initialState === 'error',
    data: null,
    errorMessage: null,
  };
};

/**
 * Utility to handle async operations with loading states
 * @param {Function} asyncFunction - Async function to execute
 * @param {Function} setLoadingState - State setter function
 * @returns {Function} Wrapped async function
 */
export const withLoadingState = (asyncFunction, setLoadingState) => {
  return async (...args) => {
    try {
      setLoadingState(prev => ({ ...prev, loading: true, error: false, errorMessage: null }));
      
      const result = await asyncFunction(...args);
      
      setLoadingState(prev => ({ 
        ...prev, 
        loading: false, 
        success: true, 
        data: result,
        error: false 
      }));
      
      return result;
    } catch (error) {
      setLoadingState(prev => ({ 
        ...prev, 
        loading: false, 
        error: true, 
        errorMessage: error.message,
        success: false 
      }));
      
      throw error;
    }
  };
};

/**
 * Batch data fetcher for homepage sections
 * Fetches multiple data sources in parallel with caching
 * @param {Object} options - Fetch options
 * @param {string} options.token - User authentication token
 * @param {number} options.limit - Items per section
 * @returns {Promise<Object>} Object containing all homepage data
 */
export const fetchHomepageData = async ({ token, limit = 10 } = {}) => {
  try {
    // Fetch all data in parallel
    const [trending, recent, categories] = await Promise.allSettled([
      fetchTrendingProductsCached({ token, limit }),
      fetchRecentlyOrderedProductsCached({ token, limit }),
      Promise.resolve(getAllCategories({ featuredOnly: true })),
    ]);

    return {
      trending: {
        data: trending.status === 'fulfilled' ? trending.value : [],
        error: trending.status === 'rejected' ? trending.reason.message : null,
      },
      recent: {
        data: recent.status === 'fulfilled' ? recent.value : [],
        error: recent.status === 'rejected' ? recent.reason.message : null,
      },
      categories: {
        data: categories.status === 'fulfilled' ? categories.value : [],
        error: categories.status === 'rejected' ? categories.reason.message : null,
      },
    };
  } catch (error) {
    console.error('Failed to fetch homepage data:', error);
    throw new Error(`Unable to load homepage data: ${error.message}`);
  }
};

/**
 * Utility to refresh specific cache entries
 * @param {Array} cacheKeys - Array of cache key patterns to refresh
 */
export const refreshCache = (cacheKeys = []) => {
  cacheKeys.forEach(pattern => {
    invalidateCache(pattern);
  });
};

/**
 * Debug utility to log cache performance
 */
export const logCachePerformance = () => {
  const stats = getCacheStats();
  console.group('Cache Performance');
  console.log('Hit Rate:', stats.hitRate);
  console.log('Total Entries:', stats.size);
  console.log('Memory Usage:', stats.memoryUsage);
  console.log('Operations:', {
    hits: stats.hits,
    misses: stats.misses,
    sets: stats.sets,
    deletes: stats.deletes,
  });
  console.groupEnd();
};