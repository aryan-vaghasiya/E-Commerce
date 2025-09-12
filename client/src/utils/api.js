/**
 * API utility functions for product data fetching
 * Provides centralized API calls with error handling, retry logic, and caching
 */

// Base API configuration
const API_BASE_URL = 'http://localhost:3000';
const DEFAULT_TIMEOUT = 10000; // 10 seconds
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Generic API request wrapper with error handling and retry logic
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Fetch options
 * @param {number} retryCount - Current retry attempt
 * @returns {Promise<Object>} API response data
 */
const apiRequest = async (url, options = {}, retryCount = 0) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle network errors and timeouts with retry logic
    if (retryCount < MAX_RETRY_ATTEMPTS && 
        (error.name === 'AbortError' || error.name === 'TypeError' || error.message.includes('fetch'))) {
      console.warn(`API request failed, retrying... (${retryCount + 1}/${MAX_RETRY_ATTEMPTS})`, error.message);
      
      // Exponential backoff delay
      const delay = RETRY_DELAY * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return apiRequest(url, options, retryCount + 1);
    }

    // Log error for debugging
    console.error('API request failed:', {
      url,
      error: error.message,
      retryCount,
    });

    throw error;
  }
};

/**
 * Get authorization headers for authenticated requests
 * @param {string} token - User authentication token
 * @returns {Object} Headers object with authorization
 */
const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token && { Authorization: `Bearer ${token}` }),
});

/**
 * Fetch trending products with error handling and retry logic
 * @param {Object} options - Request options
 * @param {number} options.limit - Number of products to fetch (default: 10)
 * @param {string} options.token - User authentication token
 * @returns {Promise<Array>} Array of trending products
 */
export const fetchTrendingProducts = async ({ limit = 10, token } = {}) => {
  try {
    const url = `${API_BASE_URL}/products/trending?limit=${limit}`;
    const options = {
      method: 'GET',
      headers: getAuthHeaders(token),
    };

    const data = await apiRequest(url, options);
    
    // Validate response structure
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format: expected array of products');
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch trending products:', error.message);
    throw new Error(`Unable to load trending products: ${error.message}`);
  }
};

/**
 * Fetch recently ordered products with error handling and retry logic
 * @param {Object} options - Request options
 * @param {number} options.limit - Number of products to fetch (default: 10)
 * @param {string} options.token - User authentication token
 * @returns {Promise<Array>} Array of recently ordered products
 */
export const fetchRecentlyOrderedProducts = async ({ limit = 10, token } = {}) => {
  try {
    const url = `${API_BASE_URL}/products/recently-ordered?limit=${limit}`;
    const options = {
      method: 'GET',
      headers: getAuthHeaders(token),
    };

    const data = await apiRequest(url, options);
    
    // Validate response structure
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format: expected array of products');
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch recently ordered products:', error.message);
    throw new Error(`Unable to load recently ordered products: ${error.message}`);
  }
};

/**
 * Fetch products with pagination support
 * @param {Object} options - Request options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Number of products per page (default: 24)
 * @param {string} options.token - User authentication token
 * @returns {Promise<Object>} Paginated products response
 */
export const fetchProducts = async ({ page = 1, limit = 24, token } = {}) => {
  try {
    const url = `${API_BASE_URL}/products?page=${page}&limit=${limit}`;
    const options = {
      method: 'GET',
      headers: getAuthHeaders(token),
    };

    const data = await apiRequest(url, options);
    
    // Validate response structure
    if (!data.products || !Array.isArray(data.products)) {
      throw new Error('Invalid response format: expected products array');
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch products:', error.message);
    throw new Error(`Unable to load products: ${error.message}`);
  }
};

/**
 * Search products with query and pagination
 * @param {Object} options - Request options
 * @param {string} options.query - Search query string
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Number of products per page (default: 24)
 * @param {string} options.token - User authentication token
 * @returns {Promise<Object>} Search results with pagination
 */
export const searchProducts = async ({ query, page = 1, limit = 24, token } = {}) => {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    throw new Error('Search query is required and must be a non-empty string');
  }

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const url = `${API_BASE_URL}/products/search?query=${encodedQuery}&page=${page}&limit=${limit}`;
    const options = {
      method: 'GET',
      headers: getAuthHeaders(token),
    };

    const data = await apiRequest(url, options);
    
    // Validate response structure
    if (!data.products || !Array.isArray(data.products)) {
      throw new Error('Invalid response format: expected products array');
    }

    return data;
  } catch (error) {
    console.error('Failed to search products:', error.message);
    throw new Error(`Unable to search products: ${error.message}`);
  }
};

/**
 * Fetch products by category with filtering
 * @param {Object} options - Request options
 * @param {string} options.category - Category name to filter by
 * @param {number} options.limit - Number of products to fetch (default: 10)
 * @param {string} options.token - User authentication token
 * @returns {Promise<Array>} Array of products in the specified category
 */
export const fetchProductsByCategory = async ({ category, limit = 10, token } = {}) => {
  if (!category || typeof category !== 'string') {
    throw new Error('Category is required and must be a string');
  }

  try {
    // For now, we'll use the search endpoint to filter by category
    // This can be optimized with a dedicated category endpoint later
    const data = await searchProducts({ 
      query: category, 
      page: 1, 
      limit, 
      token 
    });

    // Filter results to only include products that actually match the category
    const categoryProducts = data.products.filter(product => 
      product.category && 
      product.category.toLowerCase().includes(category.toLowerCase())
    );

    return categoryProducts.slice(0, limit);
  } catch (error) {
    console.error(`Failed to fetch products for category "${category}":`, error.message);
    throw new Error(`Unable to load ${category} products: ${error.message}`);
  }
};

// Export API configuration for use in other modules
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: DEFAULT_TIMEOUT,
  MAX_RETRIES: MAX_RETRY_ATTEMPTS,
  RETRY_DELAY,
};