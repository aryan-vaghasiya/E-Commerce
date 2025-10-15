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
        const [min, max] = priceRangeParam.split(',');
        priceRange = [
            min ? parseFloat(min) : null,
            max ? parseFloat(max) : null
        ];
    }
    
    return {
        query: searchParams.get('query') || '',
        // priceRange: priceRangeParam 
        //     ? priceRangeParam.split(',').map(val => {
        //         if (val === '' || val === undefined) return null;
        //         const parsed = parseFloat(val);
        //         return isNaN(parsed) ? null : parsed;
        //     })
        //     : null,
        priceRange,
        brands: searchParams.get('brands')?.split(',') || [],
        rating: searchParams.get('rating') || null,
        inStock: searchParams.get('inStock') === 'true',
    };
};

export const mergeFiltersWithDefaults = (urlFilters, apiDefaults) => {
    return {
        query: urlFilters.query,
        priceRange: urlFilters.priceRange || [
            apiDefaults.priceRange.min,
            apiDefaults.priceRange.max
        ],
        brands: urlFilters.brands,
        rating: urlFilters.rating,
        inStock: urlFilters.inStock,
    };
};