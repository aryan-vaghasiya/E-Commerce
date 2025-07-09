import { FETCH_PRODUCTS_REQUEST, FETCH_PRODUCTS_SUCCESS, FETCH_PRODUCTS_FAILED, SET_CURRENT_PAGE_ALL } from "./productTypes";

const productInitState = {
    products : [],
    isLoading : false,
    error : "",
    total: 0,
    pages: 1,
    currentPage: 1 
}

const productReducer = (state = productInitState, action) => {
    switch(action.type){
        case FETCH_PRODUCTS_REQUEST:
            return { 
                ...state,
                isLoading: true
            }
        case FETCH_PRODUCTS_SUCCESS:
            return {
                isLoading: false,
                products: action.payload.products,
                error: "",
                total: action.payload.total,
                pages: action.payload.pages,
                currentPage: action.payload.currentPage,
            }
        case FETCH_PRODUCTS_FAILED:
            return{
                isLoading: false,
                products: [],
                error: action.payload,
                ...state
            }

        case SET_CURRENT_PAGE_ALL:
            return{
                ...state,
                currentPage: action.payload
            }
        default:
            return state
    }
}

export default productReducer