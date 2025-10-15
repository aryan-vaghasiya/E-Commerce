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
            return{
                ...state,
                products: [],
                // brands: [],
                total: 0,
                pages: 1,
                isLoading: true
            }
        case SET_SEARCH_QUERY:
            return { ...state, 
                query: action.payload,
                currentPage: 1
            };
        case SET_SEARCH_PRODUCTS:
            return {
                ...state,
                products : action.payload.products,
                brands : action.payload.brands,
                total: action.payload.total,
                pages: action.payload.pages,
                currentPage: action.payload.currentPage,
                priceRange: action.payload.priceRange || { min: 0, max: 1000 },
                isLoading: false
            }
        case SET_CURRENT_PAGE_SEARCH:
            return {
                ...state,
                currentPage: action.payload
            }
        case ADD_TO_WISHLIST_SEARCH: 
                return{
                    ...state,
                    products: state.products.map(product => 
                        product.id === action.payload.id 
                            ? {...product, wishlisted: 1} 
                            : product
                    )
                }
        case REMOVE_FROM_WISHLIST_SEARCH: 
                return{
                    ...state,
                    products: state.products.map(product =>
                        product.id === action.payload.id 
                            ? {...product, wishlisted: 0} 
                            : product
                    )
                }
        default:
            return state;
    }
};