import { SET_SEARCH_QUERY, SET_SEARCH_PRODUCTS, SET_CURRENT_PAGE_SEARCH, SEARCH_PRODUCTS_REQUEST, ADD_TO_WISHLIST_SEARCH, REMOVE_FROM_WISHLIST_SEARCH } from "./searchTypes";

const initialState = {
    query: "",
    products : [],
    brands: [],
    isLoading : true,
    // error : "",
    total: 0,
    pages: 1,
    currentPage: 1,
    priceRange: {
        min: 0,
        max: 1000
    }
};

export const searchReducer = (state = initialState, action) => {
    switch (action.type) {
        case SEARCH_PRODUCTS_REQUEST:
            return {
                ...state,
                products: [],
                // brands: [],
                total: 0,
                pages: 1,
                isLoading: true
            };
        case SET_SEARCH_QUERY:
            return { 
                // ...state,
                // query: action.payload,
                // currentPage: 1
                ...initialState,
                query: action.payload,
            };
        case SET_SEARCH_PRODUCTS:
            return {
                ...state,
                products : action.payload.products || [],
                // brands : action.payload.brands,
                brands : action.payload.brands?.length > 0 
                    ? action.payload.brands 
                    : state.brands,
                total: action.payload.total || 0,
                pages: action.payload.pages || 1,
                currentPage: action.payload.currentPage || 1,
                // priceRange: action.payload.priceRange || { min: 0, max: 1000 },
                priceRange: action.payload.priceRange 
                    ? {
                        min: action.payload.priceRange.min,
                        max: action.payload.priceRange.max
                    }
                    : state.priceRange,
                isLoading: false
            };
        case SET_CURRENT_PAGE_SEARCH:
            return {
                ...state,
                currentPage: action.payload
            };
        case ADD_TO_WISHLIST_SEARCH: 
                return {
                    ...state,
                    products: state.products.map(product => 
                        product.id === action.payload.id 
                            ? {...product, wishlisted: 1} 
                            : product
                    )
                };
        case REMOVE_FROM_WISHLIST_SEARCH: 
                return {
                    ...state,
                    products: state.products.map(product =>
                        product.id === action.payload.id 
                            ? {...product, wishlisted: 0} 
                            : product
                    )
                };
        default:
            return state;
    }
};