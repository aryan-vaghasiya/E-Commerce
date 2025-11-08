import { authApi } from "../axiosInstance";

export const userService = {
    getUserDetails: async() => {
        const response = await authApi.get(`/profile/user-details`);
        return response.data;
    },

    getRecentOrdersProfile: async() => {
        const response = await authApi.get(`/profile/recent-orders`);
        return response.data;
    },

    getWalletData: async() => {
        const response = await authApi.get(`/wallet/get-wallet`);
        return response.data;
    },

    getWalletTransactions: async() => {
        const response = await authApi.get(`/wallet/get-transactions`);
        return response.data;
    },

    addFundsToWallet: async(amount) => {
        const response = await authApi.post(`/wallet/add-funds`, { amount });
        return response.data;
    },

    withdrawFundsFromWallet: async(amount) => {
        const response = await authApi.post(`/wallet/withdraw-funds`, { amount });
        return response.data;
    },

    getWishlist: async() => {
        const response = await authApi.get(`/wishlist/get-wishlist`);
        return response.data;
    },

    removeFromSaveForLater: async(item) => {
        const response = await authApi.post(`/wishlist/remove`, item);
        return response.data;
    },

    getReferralSummary: async() => {
        const response = await authApi.get(`/referral/get-summary`);
        return response.data;
    },

    getAcceptedReferrals: async() => {
        const response = await authApi.get(`/referral/get-referrals`);
        return response.data;
    },

    getSentReferrals: async() => {
        const response = await authApi.get(`/referral/get-invites`);
        return response.data;
    },

    sendReferralInvite: async(email) => {
        const response = await authApi.post(`/referral/send-invite`, { email });
        return response.data;
    },
}