import { act } from "react";
import { ADD_ORDERS, ORDERS_FROM_DB } from "./orderTypes";

const orderInitState = []

const orderReducer = (state=orderInitState, action) => {
    switch(action.type){
        case ADD_ORDERS:
            return[
                {
                    noOfItems: action.payload.noOfItems,
                    products: action.payload.products || action.payload.items,
                    cartValue: action.payload.cartValue
                },
                ...state
            ]

        case ORDERS_FROM_DB:
            const OrderData = action.payload.map(order => (
                {
                    noOfItems: order.noOfItems,
                    products: order.products,
                    cartValue: order.cartValue,
                    status: order.status,
                    final_total : order.final_total,
                    discount : order.discount
                }
            ))
            // console.log("State:", OrderData);
            
            return OrderData.reverse();

        default:
            return state
    }
}

export default orderReducer