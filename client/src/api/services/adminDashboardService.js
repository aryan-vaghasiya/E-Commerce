import { authApi } from "../axiosInstance";

export const adminDashboardService = {
    getDashboard: async() => {
        const response = await authApi.get(`/admin/get-dashboard`);
        console.log(response);
        return response.data
    }
}