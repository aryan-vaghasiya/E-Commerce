import { FETCH_ADMIN_ORDERS_REQUEST, FETCH_ADMIN_ORDERS_SUCCESS, FETCH_ADMIN_ORDERS_FAILED } from "./adminOrderTypes"

export const adminOrdersRequest = () => {
    return{
        type: FETCH_ADMIN_ORDERS_REQUEST
    }
}

export const adminOrdersSuccess = (orders) => {
    return{
        type: FETCH_ADMIN_ORDERS_SUCCESS,
        payload : orders
    }
}

export const adminOrdersFailed = (error) => {
    return{
        type: FETCH_ADMIN_ORDERS_FAILED,
        payload: error
    }
}

export const fetchAdminOrders = (page, limit) => {
    return async(dispatch, getState) => {
        dispatch(adminOrdersRequest())
        // console.log(page, limit);
        
        const token = getState().userReducer.token
        try{
            const adminOrders = await fetch(`http://localhost:3000/admin/get-orders?page=${page}&limit=${limit}`, {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            });

            if(!adminOrders.ok){
                const error = await adminOrders.json()
                console.error("Could not fetch Orders Data:", error.error);
                return false
            }
            const data = await adminOrders.json();
            // console.log(data);
            
            dispatch(adminOrdersSuccess(data))
        }
        catch (err) {
            dispatch(adminOrdersFailed(err.message))
            console.error("Orders fetch failed:", err.message);
        }
    }
}

export const acceptOrders = (id) => {
    return async(dispatch, getState) => {
        // console.log([...id]);
        
        const token = getState().userReducer.token
        try{
            const response = await fetch(`http://localhost:3000/admin/accept-orders`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: [...id],
                })
            })
            if(!response.ok){
                const error = await adminOrders.json()
                console.error("Could accept Orders:", error.error);
                return
            }
        }
        catch (err){
            // dispatch(adminOrdersFailed(err.message))
            console.error("Could not Accept Orders:", err.message);
        }
    }
}