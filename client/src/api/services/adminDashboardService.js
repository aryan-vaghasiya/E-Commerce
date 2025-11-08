import { authApi } from "../axiosInstance";

export const adminDashboardService = {
    getDashboard: async() => {
        const response = await authApi.get(`/admin/get-dashboard`);
        return response.data
    },
}