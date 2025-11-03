import { publicApi } from "../axiosInstance";

export const authService = {
    signup: async (userData) => {
        const response = await publicApi.post('/signup', userData);
        return response.data;
    },
    
}