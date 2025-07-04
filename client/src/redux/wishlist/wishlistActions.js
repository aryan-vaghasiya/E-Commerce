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