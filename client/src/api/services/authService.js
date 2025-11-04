import { publicApi } from "../axiosInstance";

export const authService = {
    signup: async (userData) => {
        const response = await publicApi.post('/signup', userData);
        return response.data;
    },
    login: async (userData) => {
        const response = await publicApi.post('/login', userData);
        return response.data;
    },
    adminLogin: async (userData) => {
        const response = await publicApi.post('/admin/login', userData);
        return response.data;
    },
}