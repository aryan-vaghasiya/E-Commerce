import { ADD_TO_WISHLIST, REMOVE_FROM_WISHLIST } from "./wishlistTypes"; 

export const addToWishlist = (id) => {
    return{
        type: ADD_TO_WISHLIST,
        payload: id
    }
}

export const removeFromWishlist = (id) => {
    return{
        type: REMOVE_FROM_WISHLIST,
        payload: id
    }
}

export const addWishlistDb = (id) => {
    return async (dispatch, getState) => {
        const token = getState().userReducer.token
        if(!token){
            dispatch(showSnack({message: "Please Login to Add to Wishlist", severity: "warning"}))
            console.log("Please Login");
            return 
        }
        // console.log(token);
        const productId = id
        // console.log("sending to backend", productId);
        const response = await fetch("http://localhost:3000/wishlist/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({id})
        })
        if(!response.ok){
            const error = await response.json()
            console.error("Could not add to Wishlist:", error.error);
            return false
        }
        dispatch(addToWishlist(id))
        dispatch(showSnack({message: "Item added to Wishlist", severity: "success"}))
        return true
    }
}