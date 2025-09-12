// Utility functions for consistent error handling across the application

export const getErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.error) {
    return error.error;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

export const isNetworkError = (error) => {
  return (
    error?.code === 'NETWORK_ERROR' ||
    error?.message?.includes('fetch') ||
    error?.message?.includes('network') ||
    error?.name === 'NetworkError'
  );
};

export const getRetryableError = (error) => {
  const message = getErrorMessage(error);
  const isRetryable = isNetworkError(error) || 
                     message.includes('timeout') ||
                     message.includes('server') ||
                     message.includes('503') ||
                     message.includes('502') ||
                     message.includes('500');
  
  return {
    message,
    isRetryable,
    userMessage: isRetryable 
      ? 'Connection issue detected. Please check your internet and try again.'
      : message
  };
};

export const createErrorHandler = (setError, setLoading) => {
  return (error, context = '') => {
    console.error(`Error in ${context}:`, error);
    
    const errorInfo = getRetryableError(error);
    setError(errorInfo.userMessage);
    
    if (setLoading) {
      setLoading(false);
    }
  };
};

export const withRetry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error?.status >= 400 && error?.status < 500) {
        throw error;
      }
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
};

export default {
  getErrorMessage,
  isNetworkError,
  getRetryableError,
  createErrorHandler,
  withRetry,
};