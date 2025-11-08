import { authApi } from "../axiosInstance";

export const orderService = {

    checkToken: async() => {
        const response = await authApi.get(`/auth/check`);
        return response.data;
    },

    checkWalletBalance: async(amount) => {
        const response = await authApi.get(`/wallet/compare-balance`, {
            params: { amount }
        });
        return response.data;
    },

    getAdminOrders: async(page, limit) => {
        const response = await authApi.get(`/admin/get-orders`, {
            params: {page, limit}
        });
        return response.data
    },

    getAdminOrderPage: async(orderId) => {
        const response =  await authApi.get(`/admin/order`, {
            params: {orderId}
        });
        return response.data
    },

    updateOrderStatusAdmin: async(id, status) => {
        const response = await authApi.post(`/admin/order-status`, {id, status});
        return response.data;
    },

    cancelOrderAdmin: async(orderId, userId, reason) => {
        const response = await authApi.post(`/admin/order-cancel-admin`, {orderId, userId, reason});
        return response.data;
    },

    checkCoupon: async(code) => {
        const response = await authApi.post(`/orders/check-coupon`, {code});
        return response.data;
    },

    checkoutForm: async(formData) => {
        const response = await authApi.post(`/checkout`, formData);
        return response.data
    },

    placeOrder: async(orderData) => {
        const response = await authApi.post(`/orders/add-order`, orderData);
        return response.data
    },

    getUserOrders: async(params) => {
        const response = await authApi.get(`/orders/get-orders?${params.toString()}`);
        return response.data;
    },

    getUserOrderPage: async(orderId) => {
        const response = await authApi.get(`/orders/${orderId}`);
        return response.data;
    },

    cancelOrderUser: async(orderId) => {
        const response = await authApi.post(`/orders/cancel-user`, { orderId });
        return response.data;
    },
}