import { authApi } from "../axiosInstance";

export const couponService = {

    getCouponUsages: async(couponId, page, limit) => {
        const response = await authApi.get(`/admin/coupons/usages/${couponId}`, {
            params: {page, limit}
        })
        return response.data
    },

    getCouponProducts: async(couponId, page, limit) => {
        const response = await authApi.get(`/admin/coupons/products/${couponId}`, {
            params: {page, limit}
        })
        return response.data
    },

    getCouponInfo: async(couponId) => {
        const response = await authApi.get(`/admin/coupons/${couponId}`);
        return response.data
    },

    getCouponCategories: async(couponId) => {
        const response = await authApi.get(`/admin/coupons/get-categories?couponId=${couponId}`);
        return response.data;
    },

    searchProductsForCoupon: async(query, price) => {
        const response = await authApi.get(`/admin/coupons/search-product`, {
            params: {query, price}
        });
        return response.data
    },

    editCoupon: async(couponData) => {
        const response = await authApi.post(`/admin/coupons/edit`, couponData);
        return response.data
    },

    deactivateCoupon: async(couponId) => {
        const response = await authApi.post(`/admin/coupons/deactivate`, { couponId });
        return response.data
    },

    getCouponReportSummary: async(couponId, from, to) => {
        const response = await authApi.get(`/admin/coupons/${couponId}/report/summary`, {
            params: {from, to}
        });
        return response.data
    },

    getCouponReportProducts: async(couponId, from, to) => {
        const response = await authApi.get(`/admin/coupons/${couponId}/report/summary`, {
            params: {from, to}
        });
        return response.data
    }
}