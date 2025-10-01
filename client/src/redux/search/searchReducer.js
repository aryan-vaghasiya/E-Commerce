import { SET_SEARCH_QUERY, SET_SEARCH_PRODUCTS, SET_CURRENT_PAGE_SEARCH, SEARCH_PRODUCTS_REQUEST } from "./searchTypes";

const initialState = {
    query: "",
    products : [],
    brands: [],
    isLoading : false,
    // error : "",
    total: 0,
    pages: 1,
    currentPage: 1
};

export const searchReducer = (state = initialState, action) => {
    switch (action.type) {
        case SEARCH_PRODUCTS_REQUEST:
            return{
                ...state,
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
                isLoading: false
            }
        case SET_CURRENT_PAGE_SEARCH:
            return {
                ...state,
                currentPage: action.payload
            }
        default:
            return state;
    }
};