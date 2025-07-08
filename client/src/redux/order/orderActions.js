import { ADD_ORDERS, ORDERS_FROM_DB } from "./orderTypes";

// export const addOrders = (orders) => {
//     return {
//         type: ADD_ORDERS,
//         payload: orders
//     }
// }

export const ordersFromDb = (orderItems) => {
    return{
        type: ORDERS_FROM_DB,
        payload: orderItems
    }
}

export const addOrders = (orders) => {
    return async (dispatch, getState) => {
        const token = getState().userReducer.token
        // console.log(token);
        // const productId = product.id
        try{
            const response = await fetch("http://localhost:3000/orders/add-order", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            if(!response.ok){
                const error = await response.json();
                console.error("Order can't be placed:", error.error)
                return false
            }
            dispatch({type: ADD_ORDERS, payload: orders})
            return true
        }
        catch(err){
            console.error("Error placing order:", err.message);
            return false
        }
    }
}

export const fetchOrders = (token) => {
    return async (dispatch) => {
        // console.log("Token : ", token);
        // const token = getState().userReducer.token
        try {
            const res = await fetch("http://localhost:3000/orders/get-orders", {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            });
            if(!res.ok){
                const error = await res.json();
                console.error("Could not fetch Orders:", error.error)
                return false
            }
            const orderData = await res.json();
            // console.log(orderData);
            dispatch(ordersFromDb(orderData));
        }
        catch (err) {
            console.error("Orders fetch failed:", err.message);
        }
    }
}