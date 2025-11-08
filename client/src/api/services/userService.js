import { authApi } from "../axiosInstance";

export const userService = {
    getUserProfileDetails: async() => {
        const response = await authApi.get(`/profile/user-details`);
        return response.data;
    },

    getUserShippingDetails: async() => {
        const response = await authApi.get(`/checkout/get-form`);
        console.log(response);
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

    addToCart: async(productId) => {
        const response = await authApi.post(`/cart/add`, { productId });
        return response.data;
    },

    removeFromCart: async(productId) => {
        const response = await authApi.post(`/cart/remove`, { productId });
        return response.data;
    },

    deleteCartItem: async(productId) => {
        const response = await authApi.post(`/cart/remove-item`, { productId });
        return response.data;
    },

    getCartFromDb: async() => {
        const response = await authApi.get(`/cart/get-cart`);
        return response.data;
    },

    saveItemForLater: async(productId) => {
        const response = await authApi.post(`/wishlist/add/save-for-later`, { productId });
        return response.data;
    },

    removeFromSaveForLater: async(item) => {
        const response = await authApi.post(`/wishlist/remove`, item);
        return response.data;
    },

    addToWishlist: async(productId) => {
        const response = await authApi.post(`/wishlist/add`, { productId });
        return response.data;
    },

    removeFromWishlist: async(productId) => {
        const response = await authApi.post(`/wishlist/remove`, { productId });
        return response.data;
    },
}