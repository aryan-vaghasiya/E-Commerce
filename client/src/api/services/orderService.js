import { authApi } from "../axiosInstance";

export const orderService = {
    getAdminOrders: async(page, limit) => {
        const response = await authApi.get(`/admin/get-orders`, {
            params: {page, limit}
        })
        return response.data
    },

    getAdminOrderPage: async(orderId) => {
        const response =  await authApi.get(`/admin/order`, {
            params: {orderId}
        })
        return response.data
    },

    cancelOrderAdmin: async(orderId, userId, reason) => {
        const response = await authApi.post(`/admin/order-cancel-admin`, {orderId, userId, reason});
        return response.data;
    },


}