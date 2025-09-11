import { ADD_TO_CART, REMOVE_FROM_CART, EMPTY_CART, CART_FROM_DB, REMOVE_CART_ITEM, SAVE_FOR_LATER } from "./cartTypes";
import { showSnack } from "../snackbar/snackbarActions";

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
        if(getState().cartReducer.items.some(item => item.id === product.id)){
            const [quantity] = getState().cartReducer.items.filter(item => item.id === product.id)
            if(product.stock<=quantity.quantity){
                dispatch(showSnack({message: "No more products in inventory", severity: "warning"}))
                return
            }
        }
        const token = getState().userReducer.token
        if(!token){
            dispatch(showSnack({message: "Please Login to Add to Cart", severity: "warning"}))
            return
        }
        const productId = product.id || product.product_id
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
            return 
        }
        dispatch({type: REMOVE_FROM_CART, payload: product})
        return 
    }
}

export const removeCartItem = (product) => {
    return async (dispatch, getState) => {
        const token = getState().userReducer.token
        const productId = product.id
        const response = await fetch("http://localhost:3000/cart/remove-item", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({productId})
        })
        if(!response.ok){
            const error = await response.json()
            console.error("Could not remove Item from Cart:", error.error);
            return
        }
        dispatch({type: REMOVE_CART_ITEM, payload: product})
        return 
    }
}

export const fetchCart = (token) => {
    return async (dispatch) => {
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
            console.log(data);
            
            dispatch(cartFromDb(data));
        } 
        catch (err) {
            console.error("Cart fetch failed:", err.message);
        }
    };
};

export const saveForLater = (product) => {
    return async (dispatch, getState) => {

        const token = getState().userReducer.token
        if(!token){
            dispatch(showSnack({message: "Please Login to Add to Cart", severity: "warning"}))
            return
        }

        const productId = product.id
        const response = await fetch("http://localhost:3000/wishlist/add/save-for-later", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({productId})
        })
        if(!response.ok){
            const error = await response.json()
            console.error("Could not add to Save for later:", error.error);
            return false
        }
        dispatch({type: SAVE_FOR_LATER, payload: product})
        dispatch({type: REMOVE_CART_ITEM, payload: product})
        dispatch(showSnack({message: "Item Saved for Later", severity: "success"}))
        return true
    }
}