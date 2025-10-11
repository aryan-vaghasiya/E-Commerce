export const parseURLToFilters = (searchParams) => {
    return {
        query: searchParams.get('query') || '',
        priceRange: searchParams.get('priceRange')?.split(',').map(num => num === "" ? 1010 : parseInt(num)) || [0, 1010],
        brands: searchParams.get('brands')?.split(',') || [],
        rating: searchParams.get('rating') || null,
        inStock: searchParams.get('inStock') === 'true',
    }
}