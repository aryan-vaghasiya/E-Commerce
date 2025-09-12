/**
 * Category data management utilities
 * Provides category data structure, filtering, and navigation logic
 */

import { fetchProductsByCategory } from './api.js';

/**
 * Static category data with dummy information
 * This can be replaced with API calls when category endpoint is available
 */
export const CATEGORIES = [
  {
    id: 'electronics',
    name: 'Electronics',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
    icon: '💻',
    productCount: 156,
    slug: 'electronics',
    description: 'Latest gadgets, computers, and electronic devices',
    featured: true,
  },
  {
    id: 'fashion',
    name: 'Fashion',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop',
    icon: '👗',
    productCount: 243,
    slug: 'fashion',
    description: 'Trendy clothing, shoes, and accessories',
    featured: true,
  },
  {
    id: 'home',
    name: 'Home & Garden',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
    icon: '🏠',
    productCount: 189,
    slug: 'home',
    description: 'Furniture, decor, and home improvement items',
    featured: true,
  },
  {
    id: 'sports',
    name: 'Sports & Fitness',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    icon: '⚽',
    productCount: 98,
    slug: 'sports',
    description: 'Sports equipment, fitness gear, and outdoor activities',
    featured: true,
  },
  {
    id: 'beauty',
    name: 'Beauty & Health',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop',
    icon: '💄',
    productCount: 134,
    slug: 'beauty',
    description: 'Cosmetics, skincare, and health products',
    featured: false,
  },
  {
    id: 'books',
    name: 'Books & Media',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
    icon: '📚',
    productCount: 76,
    slug: 'books',
    description: 'Books, movies, music, and educational content',
    featured: false,
  },
  {
    id: 'automotive',
    name: 'Automotive',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop',
    icon: '🚗',
    productCount: 67,
    slug: 'automotive',
    description: 'Car accessories, parts, and automotive tools',
    featured: false,
  },
  {
    id: 'toys',
    name: 'Toys & Games',
    image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=300&fit=crop',
    icon: '🧸',
    productCount: 112,
    slug: 'toys',
    description: 'Toys, games, and entertainment for all ages',
    featured: false,
  },
];

/**
 * Loading state management for category operations
 */
class CategoryLoadingState {
  constructor() {
    this.states = new Map();
  }

  setLoading(categoryId, isLoading) {
    const current = this.states.get(categoryId) || { isLoading: false, error: null };
    this.states.set(categoryId, { ...current, isLoading });
  }

  setError(categoryId, error) {
    const current = this.states.get(categoryId) || { isLoading: false, error: null };
    this.states.set(categoryId, { ...current, error, isLoading: false });
  }

  getState(categoryId) {
    return this.states.get(categoryId) || { isLoading: false, error: null };
  }

  clearError(categoryId) {
    const current = this.states.get(categoryId);
    if (current) {
      this.states.set(categoryId, { ...current, error: null });
    }
  }
}

// Global loading state instance
const categoryLoadingState = new CategoryLoadingState();

/**
 * Get all available categories
 * @param {Object} options - Filter options
 * @param {boolean} options.featuredOnly - Return only featured categories
 * @returns {Array} Array of category objects
 */
export const getAllCategories = ({ featuredOnly = false } = {}) => {
  if (featuredOnly) {
    return CATEGORIES.filter(category => category.featured);
  }
  return [...CATEGORIES];
};

/**
 * Get category by ID
 * @param {string} categoryId - Category identifier
 * @returns {Object|null} Category object or null if not found
 */
export const getCategoryById = (categoryId) => {
  return CATEGORIES.find(category => category.id === categoryId) || null;
};

/**
 * Get category by slug
 * @param {string} slug - Category slug
 * @returns {Object|null} Category object or null if not found
 */
export const getCategoryBySlug = (slug) => {
  return CATEGORIES.find(category => category.slug === slug) || null;
};

/**
 * Search categories by name
 * @param {string} query - Search query
 * @returns {Array} Array of matching categories
 */
export const searchCategories = (query) => {
  if (!query || typeof query !== 'string') {
    return [];
  }

  const searchTerm = query.toLowerCase().trim();
  return CATEGORIES.filter(category =>
    category.name.toLowerCase().includes(searchTerm) ||
    category.description.toLowerCase().includes(searchTerm)
  );
};

/**
 * Get products for a specific category with loading state management
 * @param {Object} options - Request options
 * @param {string} options.categoryId - Category identifier
 * @param {number} options.limit - Number of products to fetch
 * @param {string} options.token - User authentication token
 * @returns {Promise<Object>} Object containing products and loading state
 */
export const getCategoryProducts = async ({ categoryId, limit = 10, token } = {}) => {
  const category = getCategoryById(categoryId);
  
  if (!category) {
    throw new Error(`Category with ID "${categoryId}" not found`);
  }

  try {
    // Set loading state
    categoryLoadingState.setLoading(categoryId, true);
    categoryLoadingState.clearError(categoryId);

    // Fetch products for this category
    const products = await fetchProductsByCategory({
      category: category.name,
      limit,
      token,
    });

    // Clear loading state
    categoryLoadingState.setLoading(categoryId, false);

    return {
      category,
      products,
      loadingState: categoryLoadingState.getState(categoryId),
    };
  } catch (error) {
    // Set error state
    categoryLoadingState.setError(categoryId, error.message);

    return {
      category,
      products: [],
      loadingState: categoryLoadingState.getState(categoryId),
    };
  }
};

/**
 * Get loading state for a specific category
 * @param {string} categoryId - Category identifier
 * @returns {Object} Loading state object
 */
export const getCategoryLoadingState = (categoryId) => {
  return categoryLoadingState.getState(categoryId);
};

/**
 * Clear error state for a specific category
 * @param {string} categoryId - Category identifier
 */
export const clearCategoryError = (categoryId) => {
  categoryLoadingState.clearError(categoryId);
};

/**
 * Filter products by category from a product list
 * @param {Array} products - Array of products
 * @param {string} categoryName - Category name to filter by
 * @returns {Array} Filtered products
 */
export const filterProductsByCategory = (products, categoryName) => {
  if (!Array.isArray(products) || !categoryName) {
    return [];
  }

  const categoryLower = categoryName.toLowerCase();
  return products.filter(product => 
    product.category && 
    product.category.toLowerCase().includes(categoryLower)
  );
};

/**
 * Generate category navigation URL
 * @param {string} categorySlug - Category slug
 * @param {Object} options - URL options
 * @param {number} options.page - Page number
 * @param {string} options.sort - Sort option
 * @returns {string} Category page URL
 */
export const getCategoryUrl = (categorySlug, { page = 1, sort = 'popular' } = {}) => {
  const params = new URLSearchParams();
  if (page > 1) params.append('page', page);
  if (sort !== 'popular') params.append('sort', sort);
  
  const queryString = params.toString();
  return `/category/${categorySlug}${queryString ? `?${queryString}` : ''}`;
};

/**
 * Get category statistics
 * @returns {Object} Category statistics
 */
export const getCategoryStats = () => {
  const totalCategories = CATEGORIES.length;
  const featuredCategories = CATEGORIES.filter(cat => cat.featured).length;
  const totalProducts = CATEGORIES.reduce((sum, cat) => sum + cat.productCount, 0);
  
  return {
    totalCategories,
    featuredCategories,
    totalProducts,
    averageProductsPerCategory: Math.round(totalProducts / totalCategories),
  };
};

/**
 * Batch fetch products for multiple categories
 * @param {Array} categoryIds - Array of category IDs
 * @param {Object} options - Request options
 * @param {number} options.limit - Products per category
 * @param {string} options.token - User authentication token
 * @returns {Promise<Object>} Object with category products
 */
export const batchFetchCategoryProducts = async (categoryIds, { limit = 10, token } = {}) => {
  const results = {};
  
  // Fetch products for each category in parallel
  const promises = categoryIds.map(async (categoryId) => {
    try {
      const result = await getCategoryProducts({ categoryId, limit, token });
      results[categoryId] = result;
    } catch (error) {
      results[categoryId] = {
        category: getCategoryById(categoryId),
        products: [],
        loadingState: { isLoading: false, error: error.message },
      };
    }
  });

  await Promise.all(promises);
  return results;
};

/**
 * Create category breadcrumb navigation
 * @param {string} categorySlug - Current category slug
 * @returns {Array} Breadcrumb items
 */
export const getCategoryBreadcrumbs = (categorySlug) => {
  const category = getCategoryBySlug(categorySlug);
  
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/categories' },
  ];

  if (category) {
    breadcrumbs.push({
      name: category.name,
      url: getCategoryUrl(category.slug),
    });
  }

  return breadcrumbs;
};