import { FETCH_ADMIN_PRODUCTS_REQUEST, FETCH_ADMIN_PRODUCTS_SUCCESS, FETCH_ADMIN_PRODUCTS_FAILED } from "./adminProductsTypes";
const API_URL = import.meta.env.VITE_API_SERVER;

export const adminProductsRequest = () => {
    return{
        type: FETCH_ADMIN_PRODUCTS_REQUEST 
    }
}

export const adminProductsSuccess = (products) => {
    return{
        type: FETCH_ADMIN_PRODUCTS_SUCCESS,
        payload : products
    }
}

export const adminProductsFailed = (error) => {
    return{
        type: FETCH_ADMIN_PRODUCTS_FAILED,
        payload: error
    }
}

// export const fetchAdminProducts = (page, limit) => {
//     return async(dispatch, getState) => {
//         dispatch(adminProductsRequest())
//         // console.log(page, limit);
        
//         const token = getState().userReducer.token
//         try{
//             const adminOrders = await fetch(`${API_URL}/admin/get-products?page=${page}&limit=${limit}`, {
//                 headers: {
//                 Authorization: `Bearer ${token}`,
//                 },
//             });

//             if(!adminOrders.ok){
//                 const error = await adminOrders.json()
//                 console.error("Could not fetch Products Data:", error.error);
//                 return false
//             }
//             const data = await adminOrders.json();
//             console.log(data);
//             dispatch(adminProductsSuccess(data))
//         }
//         catch (err) {
//             dispatch(adminProductsFailed(err.message))
//             console.error("Products fetch failed:", err.message);
//         }
//     }
// }