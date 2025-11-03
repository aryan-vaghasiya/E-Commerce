import { authApi } from "../axiosInstance";

export const templateService = {
    getTemplateContent: async (templateName) => {
        const response = await authApi.get(`/admin/templates/get`, {
            params: { template: templateName },
        });
        return response.data;
    },
};