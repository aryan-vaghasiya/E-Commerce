import { FETCH_ADMIN_PRODUCTS_REQUEST, FETCH_ADMIN_PRODUCTS_SUCCESS, FETCH_ADMIN_PRODUCTS_FAILED } from "./adminProductsTypes";

const initAdminProducts = {
    isLoading : false,
    products: [],
    error: "",
    pages: 1,
    total: 0
}

export const adminProductsReducer = (state = initAdminProducts, action) => {
    switch(action.type){
        case FETCH_ADMIN_PRODUCTS_REQUEST:
            return {
                ...state,
                isLoading : true
            }
        case FETCH_ADMIN_PRODUCTS_SUCCESS:
            return {
                isLoading: false,
                products: action.payload.products,
                error: "",
                total: action.payload.total,
                pages: action.payload.pages,
                // currentPage: action.payload.currentPage,
            }
        case FETCH_ADMIN_PRODUCTS_REQUEST:
            return{
                isLoading: false,
                products: [],
                error: action.payload,
                ...state
            }
        default:
            return state
    }
}