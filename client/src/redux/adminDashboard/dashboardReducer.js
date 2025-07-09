import { GET_DASHBOARD_DATA } from "./dashboardTypes";

const initDashboard = {
    products: 0,
    orders: 0,
    customers: 0,
    sales: 0,
    recentOrders: []
}

export const dashboardReducer = (state = initDashboard, action) => {
    switch(action.type){
        case GET_DASHBOARD_DATA:
            // return{
            //     products: action.payload.products,
            //     orders: action.payload.orders,
            //     customers: action.payload.customers,
            //     sales: action.payload.sales,
            //     recentOrders: action.payload.recentOrders
            // }
            return {
                ...action.payload
            }
        default:
            return state
    }
}