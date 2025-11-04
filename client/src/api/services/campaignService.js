import { authApi } from "../axiosInstance";

export const campaignService = {

    getCampaignsList: async(page, limit) => {
        const response = await authApi.get(`/admin/campaigns/get`, {
            params: { page, limit }
        });
        return response.data;
    },

    postCampaign: async(campaignData) => {
        const response = await authApi.post(`/admin/campaigns/add`, campaignData)
        return response.data
    },

    getCampaignData: async (campaignId) => {
        const response = await authApi.get(`/admin/campaigns/get-data`, {
            params: { campaignId },
        });
        return response.data;
    },

    getRecipients: async (campaignId, page, limit) => {
        const response = await authApi.get(`/admin/campaigns/get-recipients`, {
            params: { campaignId, page, limit },
        });
        return response.data;
    },

    sendTestCampaign: async(fileName) => {
        const response = await authApi.post(`/admin/campaigns/send-test`, fileName)
        return response.data
    }
};