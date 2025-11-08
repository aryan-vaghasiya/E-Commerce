import { authApi } from "../axiosInstance";

export const productService = {
    getTrending: async(limit) => {
        const response = await authApi.get(`/products/trending`, {
            params: { limit }
        });
        return response.data;
    },

    getRecentlyOrdered: async(limit) => {
        const response = await authApi.get(`/products/recently-ordered`, {
            params: { limit }
        });
        return response.data;
    },

    getAllProducts: async(page, limit) => {
        const response = await authApi.get(`/products`, {
            params: { page, limit}
        });
        return response.data;
    },

    getProductPageData: async(productId) => {
        const response = await authApi.get(`/products/${productId}`);
        return response.data;
    },

    getSearchedProducts: async(params) => {
        const response = await authApi.get(`/products/search?${params.toString()}`);
        return response.data;
    },

    
}