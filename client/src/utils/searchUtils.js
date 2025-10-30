export const parseURLToFilters = (searchParams) => {
    const priceRangeParam = searchParams.get('priceRange');
    let priceRange = null;
    
    if (priceRangeParam) {
        const parts = priceRangeParam.split(',');
        const minStr = parts[0];
        const maxStr = parts[1];
        
        const min = minStr && minStr !== '' ? parseFloat(minStr) : null;
        const max = maxStr === '' || maxStr === undefined
            ? null
            : parseFloat(maxStr);
        
        priceRange = [
            isNaN(min) || min === null ? null : min,
            isNaN(max) || max === null ? null : max
        ];
    }
    
    return {
        query: searchParams.get('query') || '',
        priceRange,
        brands: searchParams.get('brands')?.split(',') || [],
        rating: searchParams.get('rating') ? parseFloat(searchParams.get('rating')) : null,
        inStock: searchParams.get('inStock') === 'true',
    };
};

export const mergeFiltersWithDefaults = (urlFilters, apiDefaults) => {
    const getPriceMin = () => {
        if (!urlFilters.priceRange) return apiDefaults.priceRange.min;
        return urlFilters.priceRange[0] ?? apiDefaults.priceRange.min;
    };

    const getPriceMax = () => {
        if (!urlFilters.priceRange) return apiDefaults.priceRange.max + 1;
        return urlFilters.priceRange[1] ?? (apiDefaults.priceRange.max + 1);
    };

    return {
        query: urlFilters.query,
        priceRange: [getPriceMin(), getPriceMax()],
        brands: urlFilters.brands,
        rating: urlFilters.rating,
        inStock: urlFilters.inStock,
    };
};