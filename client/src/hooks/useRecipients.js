import { useState, useEffect } from 'react';
import { campaignService } from '../api/services/campaignService';

export const useRecipients = (campaignId, page, pageSize) => {
    const [recipients, setRecipients] = useState(null);
    const [totalRecipients, setTotalRecipients] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!campaignId) return;

        const fetchRecipients = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await campaignService.getRecipients(campaignId, page, pageSize);
                setRecipients(data.recipients);
                setTotalRecipients(data.total);
            } catch (err) {
                setError(err.message);
                console.error('Recipients fetch failed:', err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipients();
    }, [campaignId, page, pageSize]);

    return { recipients, totalRecipients, loading, error };
};
