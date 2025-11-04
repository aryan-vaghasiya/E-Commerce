const API_URL = import.meta.env.VITE_API_SERVER;

export const getImageUrl = (path) => `${API_URL}${path}`;