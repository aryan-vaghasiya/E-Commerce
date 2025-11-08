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

    getProductPageData: async(productId) => {
        const response = await authApi.get(`/products/${productId}`);
        return response.data;
    },
}