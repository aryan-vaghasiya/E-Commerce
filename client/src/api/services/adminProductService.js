import { authApi, fileUploadApi } from "../axiosInstance";

export const adminProductService = {

    getAllProducts: async(page, limit) => {
        const response = await authApi.get(`/admin/get-products`, {
            params: {page, limit}
        });
        return response.data
    },

    getProductData: async(productId) => {
        const response = await authApi.get(`/admin/product`, {
            params: { productId }
        });
        return response.data
    },

    getAllCategories: async() => {
        const response = await authApi.get(`/admin/product/categories`)
        return response.data
    },

    addProduct: async(productData) => {
        const response = await authApi.post(`/admin/product/add`, productData)
        return response.data
    },

    uploadProductThumbnail: async(thumbnail, productId) => {
        const response = await fileUploadApi.post(`/admin/upload/product-thumbnail/${productId}`, thumbnail);
        return response.data
    },

    uploadProductImages: async(images, productId) => {
        const response = await fileUploadApi.post(`/admin/upload/product/${productId}`, images);
        return response.data;
    },

    deleteProductImages: async(toDeleteIds) => {
        const response = await authApi.post(`/admin/product/remove-images`, toDeleteIds);
        return response.data;
    },

    editProduct: async(newData) => {
        const response = await authApi.post(`/admin/edit-product`, newData);
        return response.data;
    },

    updateProductStatus: async(newStatus, productId) => {
        const response = await authApi.post(`/admin/product/update-status`, { newStatus, productId });
        return response.data
    },

    getProductOffers: async(productId) => {
        const response = await authApi.get(`/admin/product/get-offers`, {
            params: { productId }
        });
        return response.data;
    },

    endProductOffer: async(offer_id)=> {
        const response = await authApi.post(`/admin/product/offer/end`, { offer_id });
        return response.data;
    },

    deleteProductOffer: async(offer_id)=> {
        const response = await authApi.post(`/admin/product/offer/delete`, { offer_id });
        return response.data;
    },

    extendProductOffer: async(offer_id, start_time, end_time) => {
        const response = await authApi.post(`/admin/product/offer/extend`, { offer_id, start_time, end_time });
        return response.data;
    },

    addProductOffer: async(offerData) => {
        const response = await authApi.post(`/admin/product/offer/add`, offerData);
        return response.data;
    }
}