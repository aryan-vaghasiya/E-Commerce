/**
 * Tests for category data management utilities
 */

import { describe, it, expect, vi } from 'vitest';
import {
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  searchCategories,
  filterProductsByCategory,
  getCategoryUrl,
  getCategoryStats,
  getCategoryBreadcrumbs,
} from '../categoryData.js';

describe('Category Data Management', () => {
  describe('getAllCategories', () => {
    it('should return all categories', () => {
      const categories = getAllCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      expect(categories[0]).toHaveProperty('id');
      expect(categories[0]).toHaveProperty('name');
    });

    it('should return only featured categories when requested', () => {
      const featuredCategories = getAllCategories({ featuredOnly: true });
      const allCategories = getAllCategories();
      
      expect(featuredCategories.length).toBeLessThanOrEqual(allCategories.length);
      expect(featuredCategories.every(cat => cat.featured)).toBe(true);
    });
  });

  describe('getCategoryById', () => {
    it('should return category by ID', () => {
      const category = getCategoryById('electronics');
      expect(category).toBeTruthy();
      expect(category.id).toBe('electronics');
      expect(category.name).toBe('Electronics');
    });

    it('should return null for non-existent ID', () => {
      const category = getCategoryById('non-existent');
      expect(category).toBeNull();
    });
  });

  describe('getCategoryBySlug', () => {
    it('should return category by slug', () => {
      const category = getCategoryBySlug('electronics');
      expect(category).toBeTruthy();
      expect(category.slug).toBe('electronics');
    });

    it('should return null for non-existent slug', () => {
      const category = getCategoryBySlug('non-existent');
      expect(category).toBeNull();
    });
  });

  describe('searchCategories', () => {
    it('should find categories by name', () => {
      const results = searchCategories('Electronics');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name.toLowerCase()).toContain('electronics');
    });

    it('should find categories by description', () => {
      const results = searchCategories('gadgets');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for empty query', () => {
      expect(searchCategories('')).toEqual([]);
      expect(searchCategories(null)).toEqual([]);
      expect(searchCategories(undefined)).toEqual([]);
    });

    it('should be case insensitive', () => {
      const upperCase = searchCategories('ELECTRONICS');
      const lowerCase = searchCategories('electronics');
      expect(upperCase).toEqual(lowerCase);
    });
  });

  describe('filterProductsByCategory', () => {
    const mockProducts = [
      { id: '1', category: 'electronics', title: 'Laptop' },
      { id: '2', category: 'fashion', title: 'Shirt' },
      { id: '3', category: 'electronics', title: 'Phone' },
    ];

    it('should filter products by category', () => {
      const filtered = filterProductsByCategory(mockProducts, 'electronics');
      expect(filtered).toHaveLength(2);
      expect(filtered.every(p => p.category === 'electronics')).toBe(true);
    });

    it('should handle case insensitive filtering', () => {
      const filtered = filterProductsByCategory(mockProducts, 'ELECTRONICS');
      expect(filtered).toHaveLength(2);
    });

    it('should return empty array for invalid inputs', () => {
      expect(filterProductsByCategory(null, 'electronics')).toEqual([]);
      expect(filterProductsByCategory(mockProducts, null)).toEqual([]);
      expect(filterProductsByCategory([], 'electronics')).toEqual([]);
    });
  });

  describe('getCategoryUrl', () => {
    it('should generate basic category URL', () => {
      const url = getCategoryUrl('electronics');
      expect(url).toBe('/category/electronics');
    });

    it('should include page parameter', () => {
      const url = getCategoryUrl('electronics', { page: 2 });
      expect(url).toBe('/category/electronics?page=2');
    });

    it('should include sort parameter', () => {
      const url = getCategoryUrl('electronics', { sort: 'price' });
      expect(url).toBe('/category/electronics?sort=price');
    });

    it('should include multiple parameters', () => {
      const url = getCategoryUrl('electronics', { page: 2, sort: 'price' });
      expect(url).toContain('page=2');
      expect(url).toContain('sort=price');
    });
  });

  describe('getCategoryStats', () => {
    it('should return category statistics', () => {
      const stats = getCategoryStats();
      expect(stats).toHaveProperty('totalCategories');
      expect(stats).toHaveProperty('featuredCategories');
      expect(stats).toHaveProperty('totalProducts');
      expect(stats).toHaveProperty('averageProductsPerCategory');
      
      expect(typeof stats.totalCategories).toBe('number');
      expect(typeof stats.featuredCategories).toBe('number');
      expect(typeof stats.totalProducts).toBe('number');
      expect(typeof stats.averageProductsPerCategory).toBe('number');
    });
  });

  describe('getCategoryBreadcrumbs', () => {
    it('should generate breadcrumbs for valid category', () => {
      const breadcrumbs = getCategoryBreadcrumbs('electronics');
      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[0].name).toBe('Home');
      expect(breadcrumbs[1].name).toBe('Categories');
      expect(breadcrumbs[2].name).toBe('Electronics');
    });

    it('should generate basic breadcrumbs for invalid category', () => {
      const breadcrumbs = getCategoryBreadcrumbs('non-existent');
      expect(breadcrumbs).toHaveLength(2);
      expect(breadcrumbs[0].name).toBe('Home');
      expect(breadcrumbs[1].name).toBe('Categories');
    });
  });
});