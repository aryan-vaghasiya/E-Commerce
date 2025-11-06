import { authApi, fileUploadApi } from "../axiosInstance";

export const adminProductService = {
    getAllCategories: async() => {
        const response = await authApi.get(`/admin/product/categories`)
        return response.data
    },

    addProduct: async(productData) => {
        const response = await authApi.post(`/admin/product/add`, productData)
        console.log("product details", response);
        return response.data
    },

    uploadProductThumbnail: async(thumbnail, productId) => {
        const response = await fileUploadApi.post(`/admin/upload/product-thumbnail/${productId}`, thumbnail);
        console.log("thumbnail", response);
        return response.data
    },

    uploadProductImages: async(images, productId) => {
        const response = await fileUploadApi.post(`/admin/upload/product/${productId}`, images);
        console.log("images", response);
        return response.data
    },

    
}