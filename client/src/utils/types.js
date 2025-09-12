/**
 * Type definitions for API responses and data structures
 * These provide clear contracts for data shapes used throughout the application
 */

/**
 * Product interface matching the current data structure
 * @typedef {Object} Product
 * @property {string} id - Unique product identifier
 * @property {string} title - Product name/title
 * @property {number} price - Product price
 * @property {number} rating - Product rating (0-5)
 * @property {string} thumbnail - Product image URL
 * @property {string} [brand] - Product brand (optional)
 * @property {string} category - Product category
 * @property {number} stock - Available stock quantity
 * @property {boolean} wishlisted - Whether product is in user's wishlist
 * @property {boolean} [offer_discount] - Whether product has discount offer (optional)
 * @property {string} [description] - Product description (optional)
 * @property {Array<string>} [images] - Additional product images (optional)
 * @property {number} [discountPercentage] - Discount percentage if applicable (optional)
 */

/**
 * Category interface for product categorization
 * @typedef {Object} Category
 * @property {string} id - Unique category identifier
 * @property {string} name - Category display name
 * @property {string} image - Category image URL
 * @property {string} icon - Category icon identifier
 * @property {number} productCount - Number of products in category
 * @property {string} slug - URL-friendly category identifier
 * @property {string} [description] - Category description (optional)
 * @property {boolean} [featured] - Whether category is featured (optional)
 */

/**
 * Paginated API response structure
 * @typedef {Object} PaginatedResponse
 * @property {Array<Product>} products - Array of products
 * @property {number} currentPage - Current page number
 * @property {number} totalPages - Total number of pages
 * @property {number} totalProducts - Total number of products
 * @property {number} limit - Number of products per page
 * @property {boolean} hasNextPage - Whether there's a next page
 * @property {boolean} hasPrevPage - Whether there's a previous page
 */

/**
 * API error response structure
 * @typedef {Object} ApiError
 * @property {string} error - Error message
 * @property {number} [status] - HTTP status code (optional)
 * @property {string} [code] - Error code identifier (optional)
 * @property {Object} [details] - Additional error details (optional)
 */

/**
 * API request options for product fetching
 * @typedef {Object} ProductFetchOptions
 * @property {number} [limit] - Number of products to fetch
 * @property {string} [token] - User authentication token
 * @property {number} [page] - Page number for pagination
 * @property {string} [category] - Category filter
 * @property {string} [query] - Search query
 */

/**
 * Loading state interface for async operations
 * @typedef {Object} LoadingState
 * @property {boolean} isLoading - Whether operation is in progress
 * @property {string|null} error - Error message if operation failed
 * @property {boolean} isRetrying - Whether operation is being retried
 * @property {number} retryCount - Number of retry attempts made
 */

/**
 * Cache entry structure for API response caching
 * @typedef {Object} CacheEntry
 * @property {*} data - Cached data
 * @property {number} timestamp - When data was cached (milliseconds)
 * @property {number} ttl - Time to live in milliseconds
 * @property {string} key - Cache key identifier
 */

/**
 * Search suggestion structure
 * @typedef {Object} SearchSuggestion
 * @property {string} text - Suggestion text
 * @property {string} type - Suggestion type ('product', 'category', 'brand')
 * @property {number} [count] - Number of results for this suggestion (optional)
 */

/**
 * User authentication state
 * @typedef {Object} AuthState
 * @property {string|null} token - JWT authentication token
 * @property {boolean} isAuthenticated - Whether user is logged in
 * @property {Object|null} user - User profile data
 */

/**
 * Cart item structure
 * @typedef {Object} CartItem
 * @property {string} productId - Product identifier
 * @property {Product} product - Full product data
 * @property {number} quantity - Quantity in cart
 * @property {number} totalPrice - Total price for this item
 */

/**
 * Wishlist item structure
 * @typedef {Object} WishlistItem
 * @property {string} productId - Product identifier
 * @property {Product} product - Full product data
 * @property {number} addedAt - Timestamp when added to wishlist
 */

// Validation functions for type checking

/**
 * Validates if an object matches the Product interface
 * @param {*} obj - Object to validate
 * @returns {boolean} Whether object is a valid Product
 */
export const isValidProduct = (obj) => {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.price === 'number' &&
    typeof obj.rating === 'number' &&
    typeof obj.thumbnail === 'string' &&
    typeof obj.category === 'string' &&
    typeof obj.stock === 'number' &&
    typeof obj.wishlisted === 'boolean'
  );
};

/**
 * Validates if an object matches the Category interface
 * @param {*} obj - Object to validate
 * @returns {boolean} Whether object is a valid Category
 */
export const isValidCategory = (obj) => {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.image === 'string' &&
    typeof obj.icon === 'string' &&
    typeof obj.productCount === 'number' &&
    typeof obj.slug === 'string'
  );
};

/**
 * Validates if an object matches the PaginatedResponse interface
 * @param {*} obj - Object to validate
 * @returns {boolean} Whether object is a valid PaginatedResponse
 */
export const isValidPaginatedResponse = (obj) => {
  return (
    obj &&
    typeof obj === 'object' &&
    Array.isArray(obj.products) &&
    typeof obj.currentPage === 'number' &&
    typeof obj.totalPages === 'number' &&
    typeof obj.totalProducts === 'number' &&
    typeof obj.limit === 'number' &&
    typeof obj.hasNextPage === 'boolean' &&
    typeof obj.hasPrevPage === 'boolean'
  );
};

// Default values for common structures

/**
 * Default loading state
 */
export const DEFAULT_LOADING_STATE = {
  isLoading: false,
  error: null,
  isRetrying: false,
  retryCount: 0,
};

/**
 * Default pagination info
 */
export const DEFAULT_PAGINATION = {
  currentPage: 1,
  totalPages: 1,
  totalProducts: 0,
  limit: 24,
  hasNextPage: false,
  hasPrevPage: false,
};

/**
 * Default product fetch options
 */
export const DEFAULT_FETCH_OPTIONS = {
  limit: 10,
  page: 1,
  token: null,
};