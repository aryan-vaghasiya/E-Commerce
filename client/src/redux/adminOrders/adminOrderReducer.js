import { FETCH_ADMIN_ORDERS_REQUEST, FETCH_ADMIN_ORDERS_SUCCESS, FETCH_ADMIN_ORDERS_FAILED } from "./adminOrderTypes"

const initAdminOrders = {
    isLoading : false,
    orders: [],
    error: "",
    pages: 1,
    total: 0
}

export const adminOrdersReducer = (state = initAdminOrders, action) => {
    switch(action.type){
        case FETCH_ADMIN_ORDERS_REQUEST:
            return {
                ...state,
                isLoading : true
            }
        case FETCH_ADMIN_ORDERS_SUCCESS:
            return {
                isLoading: false,
                orders: action.payload.orders,
                error: "",
                total: action.payload.total,
                pages: action.payload.pages,
                // currentPage: action.payload.currentPage,
            }
        case FETCH_ADMIN_ORDERS_FAILED:
            return{
                isLoading: false,
                orders: [],
                error: action.payload,
                ...state
            }
        default:
            return state
    }
}