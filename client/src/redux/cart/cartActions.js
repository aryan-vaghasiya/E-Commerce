import { ADD_TO_CART, REMOVE_FROM_CART, EMPTY_CART, CART_FROM_DB } from "./cartTypes";
import { showSnack } from "../snackbar/snackbarActions";

// export const addToCartLocal = (product) => {
//     return {
//         type: ADD_TO_CART,
//         payload: product
//     }
// }

// export const removeFromCartLocal = (product) => {
//     return {
//         type: REMOVE_FROM_CART,
//         payload: product
//     }
// }

export const emptyCart = () => {
    return {
        type: EMPTY_CART
    }
}

export const cartFromDb = (cartItems) => {
    return{
        type: CART_FROM_DB,
        payload: cartItems
    }
}

export const addToCart = (product) => {
    return async (dispatch, getState) => {
        const token = getState().userReducer.token
        if(!token){
            dispatch(showSnack({message: "Please Login to Add to Cart", severity: "warning"}))
            // console.log("Please Login");
            return 
        }
        // console.log(token);
        const productId = product.id || product.product_id
        // console.log("sending to backend", productId);
        const response = await fetch("http://localhost:3000/cart/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({productId})
        })
        if(!response.ok){
            const error = await response.json()
            console.error("Could not add to Cart:", error.error);
            return false
        }
        dispatch({type: ADD_TO_CART, payload: product})
        dispatch(showSnack({message: "Item added to Cart", severity: "success"}))
        return true
    }
}

export const removeFromCart = (product) => {
    return async (dispatch, getState) => {
        const token = getState().userReducer.token
        // console.log(token);
        const productId = product.id
        const response = await fetch("http://localhost:3000/cart/remove", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({productId})
        })
        if(!response.ok){
            const error = await response.json()
            console.error("Could not remove from Cart:", error.error);
            return false
        }
        dispatch({type: REMOVE_FROM_CART, payload: product})
        return true
    }
}

export const fetchCart = (token) => {
    return async (dispatch) => {
        // const token = getState().userReducer.token
        try {
            const res = await fetch("http://localhost:3000/cart/get-cart", {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            });
            if(!res.ok){
                const error = await res.json()
                console.error("Could not fetch Cart Data:", error.error);
                return false
            }
            const data = await res.json();
            dispatch(cartFromDb(data));
        } 
        catch (err) {
            console.error("Cart fetch failed:", err.message);
        }
    };
};