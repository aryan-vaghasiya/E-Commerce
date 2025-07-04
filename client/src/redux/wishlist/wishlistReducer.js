import { act } from "react";
import { ADD_TO_WISHLIST, REMOVE_FROM_WISHLIST } from "./wishlistTypes"; 

const initWishlistState = []

export const wishlistReducer = (state = initWishlistState, action) => {
    switch(action.type){
        case ADD_TO_WISHLIST:
            return [...state, action.payload]
        case REMOVE_FROM_WISHLIST:
            const newArr = state
            const index = newArr.indexOf(action.payload)
            if(index > -1){
                newArr.splice(newArr.indexOf(action.payload), 1)
            }
            return newArr
        default:
            return state
    }
}