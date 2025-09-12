/**
 * Tests for API utility functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchTrendingProducts,
  fetchRecentlyOrderedProducts,
  fetchProducts,
  searchProducts,
  fetchProductsByCategory,
} from '../api.js';

// Mock fetch globally
global.fetch = vi.fn();

describe('API Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchTrendingProducts', () => {
    it('should fetch trending products successfully', async () => {
      const mockProducts = [
        { id: '1', title: 'Product 1', price: 100, rating: 4.5 },
        { id: '2', title: 'Product 2', price: 200, rating: 4.0 },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      });

      const result = await fetchTrendingProducts({ limit: 2, token: 'test-token' });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/products/trending?limit=2',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );

      expect(result).toEqual(mockProducts);
    });

    it('should handle API errors gracefully', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Server error' }),
      });

      await expect(fetchTrendingProducts({ token: 'test-token' }))
        .rejects
        .toThrow('Unable to load trending products');
    });

    it('should validate response format', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'response' }),
      });

      await expect(fetchTrendingProducts({ token: 'test-token' }))
        .rejects
        .toThrow('Invalid response format');
    });
  });

  describe('searchProducts', () => {
    it('should search products with query', async () => {
      const mockResponse = {
        products: [{ id: '1', title: 'Search Result' }],
        currentPage: 1,
        totalPages: 1,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await searchProducts({ 
        query: 'test query', 
        page: 1, 
        limit: 10, 
        token: 'test-token' 
      });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/products/search?query=test%20query&page=1&limit=10',
        expect.any(Object)
      );

      expect(result).toEqual(mockResponse);
    });

    it('should throw error for empty query', async () => {
      await expect(searchProducts({ query: '', token: 'test-token' }))
        .rejects
        .toThrow('Search query is required');

      await expect(searchProducts({ query: '   ', token: 'test-token' }))
        .rejects
        .toThrow('Search query is required');
    });
  });

  describe('fetchProductsByCategory', () => {
    it('should fetch products by category', async () => {
      const mockResponse = {
        products: [
          { id: '1', title: 'Electronics Product', category: 'electronics' },
        ],
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetchProductsByCategory({ 
        category: 'electronics', 
        limit: 5, 
        token: 'test-token' 
      });

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('electronics');
    });

    it('should throw error for missing category', async () => {
      await expect(fetchProductsByCategory({ token: 'test-token' }))
        .rejects
        .toThrow('Category is required');
    });
  });
});