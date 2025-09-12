import { 
  getImageUrl, 
  getOptimizedProductImage, 
  preloadImage, 
  supportsWebP 
} from '../imageUrl'

describe('Image URL Utilities', () => {
  describe('getImageUrl', () => {
    test('returns basic URL without options', () => {
      const result = getImageUrl('/test-image.jpg')
      expect(result).toBe('http://localhost:3000/test-image.jpg')
    })

    test('returns null for empty path', () => {
      const result = getImageUrl('')
      expect(result).toBeNull()
    })

    test('returns null for null path', () => {
      const result = getImageUrl(null)
      expect(result).toBeNull()
    })

    test('adds optimization parameters', () => {
      const result = getImageUrl('/test-image.jpg', {
        width: 300,
        height: 300,
        quality: 90,
        format: 'webp'
      })
      expect(result).toBe('http://localhost:3000/test-image.jpg?w=300&h=300&q=90&f=webp')
    })

    test('handles partial options', () => {
      const result = getImageUrl('/test-image.jpg', {
        width: 200
      })
      expect(result).toBe('http://localhost:3000/test-image.jpg?w=200')
    })
  })

  describe('getOptimizedProductImage', () => {
    test('returns optimized URL for product images', () => {
      const result = getOptimizedProductImage('/product.jpg')
      expect(result).toBe('http://localhost:3000/product.jpg?w=300&h=300&q=85&f=webp')
    })

    test('handles null path', () => {
      const result = getOptimizedProductImage(null)
      expect(result).toBeNull()
    })
  })

  describe('preloadImage', () => {
    test('resolves when image loads successfully', async () => {
      // Mock successful image load
      const mockImage = {
        onload: null,
        onerror: null,
        src: ''
      }
      
      global.Image = jest.fn(() => mockImage)
      
      const promise = preloadImage('http://example.com/image.jpg')
      
      // Simulate successful load
      setTimeout(() => {
        mockImage.onload()
      }, 0)
      
      await expect(promise).resolves.toBe(mockImage)
    })

    test('rejects when image fails to load', async () => {
      const mockImage = {
        onload: null,
        onerror: null,
        src: ''
      }
      
      global.Image = jest.fn(() => mockImage)
      
      const promise = preloadImage('http://example.com/invalid.jpg')
      
      // Simulate error
      setTimeout(() => {
        mockImage.onerror()
      }, 0)
      
      await expect(promise).rejects.toThrow('Failed to load image')
    })

    test('rejects when no source provided', async () => {
      await expect(preloadImage('')).rejects.toThrow('No image source provided')
      await expect(preloadImage(null)).rejects.toThrow('No image source provided')
    })
  })

  describe('supportsWebP', () => {
    test('returns boolean for WebP support', () => {
      // Mock canvas and toDataURL
      const mockCanvas = {
        width: 1,
        height: 1,
        toDataURL: jest.fn(() => 'data:image/webp;base64,test')
      }
      
      global.document = {
        createElement: jest.fn(() => mockCanvas)
      }
      
      const result = supportsWebP()
      expect(typeof result).toBe('boolean')
    })

    test('returns false in server environment', () => {
      const originalWindow = global.window
      delete global.window
      
      const result = supportsWebP()
      expect(result).toBe(false)
      
      global.window = originalWindow
    })
  })
})