import { authApi } from "../axiosInstance";

export const campaignService = {
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
};