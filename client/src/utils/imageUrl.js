export const getImageUrl = (path, options = {}) => {
  if (!path) return null;
  
  const { 
    width, 
    height, 
    quality = 80, 
    format = 'webp' 
  } = options;
  
  const baseUrl = `http://localhost:3000${path}`;
  
  // If no optimization options provided, return original URL
  if (!width && !height && quality === 80 && format === 'webp') {
    return baseUrl;
  }
  
  // Build query parameters for image optimization
  const params = new URLSearchParams();
  if (width) params.append('w', width);
  if (height) params.append('h', height);
  if (quality !== 80) params.append('q', quality);
  if (format !== 'webp') params.append('f', format);
  
  return `${baseUrl}?${params.toString()}`;
};

// Utility to get optimized image URL for product cards
export const getOptimizedProductImage = (path) => {
  return getImageUrl(path, {
    width: 300,
    height: 300,
    quality: 85,
    format: 'webp'
  });
};

// Utility to preload critical images
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error('No image source provided'));
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};

// Utility to check if WebP is supported
export const supportsWebP = () => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};