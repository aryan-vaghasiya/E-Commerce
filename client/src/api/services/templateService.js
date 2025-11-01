import axiosInstance from "../axiosInstance";

export const templateService = {
    getTemplateContent: async (templateName) => {
        const response = await axiosInstance.get(`/admin/templates/get`, {
            params: { template: templateName },
        });
        return response.data;
    },
};