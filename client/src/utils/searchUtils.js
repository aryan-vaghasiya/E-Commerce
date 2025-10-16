// export const parseURLToFilters = (searchParams) => {
//     return {
//         query: searchParams.get('query') || '',
//         priceRange: searchParams.get('priceRange')?.split(',').map(num => num === "" ? 1010 : parseInt(num)) || [0, 1010],
//         // priceRange: searchParams.get('priceRange')?.split(',').map(num => parseInt(num)) || null,
//         brands: searchParams.get('brands')?.split(',') || [],
//         rating: searchParams.get('rating') || null,
//         inStock: searchParams.get('inStock') === 'true',
//     }
// }


export const parseURLToFilters = (searchParams) => {
    const priceRangeParam = searchParams.get('priceRange');
    let priceRange = null;
    
    if (priceRangeParam) {
        const [minStr, maxStr] = priceRangeParam.split(',');
        const min = minStr ? parseFloat(minStr) : null;
        const max = maxStr ? parseFloat(maxStr) : null;
        
        if (!isNaN(min) || !isNaN(max)) {
            priceRange = [
                isNaN(min) ? null : min,
                isNaN(max) ? null : max
            ];
        }
    }
    
    return {
        query: searchParams.get('query') || '',
        priceRange,
        brands: searchParams.get('brands')?.split(',') || [],
        rating: searchParams.get('rating') || null,
        inStock: searchParams.get('inStock') === 'true',
    };
};

export const mergeFiltersWithDefaults = (urlFilters, apiDefaults) => {
    // return {
    //     query: urlFilters.query,
    //     priceRange: urlFilters.priceRange || [
    //         apiDefaults.priceRange.min,
    //         apiDefaults.priceRange.max
    //     ],
    //     brands: urlFilters.brands,
    //     rating: urlFilters.rating,
    //     inStock: urlFilters.inStock,
    // };
    const filters = {
        query: urlFilters.query,
        priceRange: urlFilters.priceRange || [
            apiDefaults.priceRange.min,
            apiDefaults.priceRange.max
        ],
        brands: urlFilters.brands,
        rating: urlFilters.rating,
        inStock: urlFilters.inStock,
    };

    if (filters.priceRange) {
        filters.priceRange = [
            Math.max(apiDefaults.priceRange.min, Math.min(filters.priceRange[0] || apiDefaults.priceRange.min, apiDefaults.priceRange.max)),
            Math.min(apiDefaults.priceRange.max, Math.max(filters.priceRange[1] || apiDefaults.priceRange.max, apiDefaults.priceRange.min))
        ];
    }

    // console.log(filters);

    return filters
};