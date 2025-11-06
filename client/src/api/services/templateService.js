import { authApi } from "../axiosInstance";

export const templateService = {
    getTemplatesList: async(active) => {
        const response = await authApi.get(`/admin/templates/get-files`, {
            params: { active }
        });
        return response.data
    },

    getTemplateContent: async (template) => {
        const response = await authApi.get(`/admin/templates/get`, {
            params: { template },
        });
        return response.data;
    },

    createNewTemplate: async(fileName) => {
        const response = await authApi.post(`/admin/templates/add`, { fileName });
        return response.data;
    },

    saveTemplateChanges: async(fileName, content) => {
        const response = await authApi.post(`/admin/templates/save`, { fileName, content });
        return response.data;
    },

    renameTemplate: async(oldFileName, newFileName) => {
        const response = await authApi.post(`/admin/templates/rename`, { oldFileName, newFileName });
        return response.data;
    },

    deleteTemplate: async(fileName) => {
        const response = await authApi.post(`/admin/templates/delete`, { fileName });
        console.log(response);
        return response.data;
    }
};