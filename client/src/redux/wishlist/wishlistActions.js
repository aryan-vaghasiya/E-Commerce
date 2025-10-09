import { addProductToWishlist, removeProductFromWishlist } from "../products/productActions";
import { addToWishlistSearch, removeFromWishlistSearch } from "../search/searchActions";
import { showSnack } from "../snackbar/snackbarActions";
import { ADD_TO_WISHLIST, REMOVE_FROM_WISHLIST, GET_FULL_WISHLIST, SET_FULL_WISHLIST } from "./wishlistTypes"; 

// export const addToWishlist = (id) => {
//     return{
//         type: ADD_TO_WISHLIST,
//         payload: id
//     }
// }

export const addToWishlist = (product) => {
    return{
        type: ADD_TO_WISHLIST,
        payload: product
    }
}

export const removeFromWishlist = (product) => {
    return{
        type: REMOVE_FROM_WISHLIST,
        payload: product
    }
}

export const addWishlistDb = (product) => {
    return async (dispatch, getState) => {
        const token = getState().userReducer.token
        if(!token){
            dispatch(showSnack({message: "Please Login to Add to Wishlist", severity: "warning"}))
            console.log("Please Login");
            return 
        }
        const productId = product.id
        const response = await fetch("http://localhost:3000/wishlist/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({productId})
        })
        if(!response.ok){
            const error = await response.json()
            console.error("Could not add to Wishlist:", error.error);
            return false
        }
        dispatch(addProductToWishlist(product))
        dispatch(addToWishlistSearch(product))
        // dispatch(addToWishlist(product))
        dispatch(showSnack({message: "Item added to Wishlist", severity: "success"}))
        return true
    }
}

export const removeWishlistDb = (product) => {
    return async (dispatch, getState) => {
        const token = getState().userReducer.token
        if(!token){
            dispatch(showSnack({message: "Please Login to Remove from Wishlist", severity: "warning"}))
            console.log("Please Login");
            return 
        }
        const productId = product.id
        const response = await fetch("http://localhost:3000/wishlist/remove", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({productId})
        })
        if(!response.ok){
            const error = await response.json()
            console.error("Could not remove from Wishlist:", error.error);
            return false
        }
        dispatch(removeProductFromWishlist(product))
        dispatch(removeFromWishlistSearch(product))
        // dispatch(removeFromWishlist(product))
        dispatch(showSnack({message: "Item removed from Wishlist", severity: "success"}))
        return true
    }
}

export const getFullWishlist = (token) => {
    return async (dispatch) => {
        // const token = getState().userReducer.token
        try {
            const res = await fetch("http://localhost:3000/wishlist/get-wishlist", {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            });
            if(!res.ok){
                const error = await res.json()
                console.error("Could not fetch Wishlist:", error.error);
                return false
            }
            const data = await res.json();
            dispatch({type: GET_FULL_WISHLIST, payload: data});
        }
        catch (err) {
            console.error("Wishlist fetch failed:", err.message);
        }
    };
};