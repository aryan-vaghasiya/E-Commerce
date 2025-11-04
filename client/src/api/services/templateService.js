import { authApi } from "../axiosInstance";

export const templateService = {
    getTemplatesList: async(active) => {
        const response = await authApi.get(`/admin/templates/get-files`, {
            params: { active }
        });
        return response.data
    },

    getTemplateContent: async (templateName) => {
        const response = await authApi.get(`/admin/templates/get`, {
            params: { template: templateName },
        });
        return response.data;
    },
};