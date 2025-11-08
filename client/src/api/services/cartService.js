import { authApi } from "../axiosInstance";

export const cartService = {
    repeatOrder: async(items) => {
        const response = await authApi.post(`/cart/bulk-add`, { items });
        console.log(response);
        return response.data
    }
}