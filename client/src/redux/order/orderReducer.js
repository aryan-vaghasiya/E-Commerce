import { ADD_ORDERS, ORDERS_FROM_DB } from "./orderTypes";

const orderInitState = []

const orderReducer = (state=orderInitState, action) => {
    switch(action.type){
        case ADD_ORDERS:
            return{
                orders: {
                    noOfItems: action.payload.noOfItems,
                    items: action.payload.products || action.payload.items,
                    cartValue: action.payload.cartValue
                },
                ...state
            }

        case ORDERS_FROM_DB:
            // const OrderData = action.payload.orders.map(order => (
            //     {
            //         order_id: order.order_id,
            //         noOfItems: order.noOfItems,
            //         items: order.products,
            //         cartValue: order.cartValue,
            //         status: order.status,
            //         final_total : order.final_total,
            //         discount : order.discount
            //     }
            // ))
            
            // return OrderData.reverse();

            return{
                currentPage: action.payload.currentPage,
                pages : action.payload.pages,
                total:action.payload.total,
                orders: action.payload.orders.reverse()
            }

        default:
            return state
    }
}

export default orderReducer