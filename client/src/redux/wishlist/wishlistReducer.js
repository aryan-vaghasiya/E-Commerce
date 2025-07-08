import { ADD_TO_WISHLIST, REMOVE_FROM_WISHLIST, SET_FULL_WISHLIST, GET_FULL_WISHLIST } from "./wishlistTypes"; 

// const initWishlistState = []
const initWishlistState = {
    noOfItems: 0,
    products: []
}

export const wishlistReducer = (state = initWishlistState, action) => {
    switch(action.type){
        case ADD_TO_WISHLIST:
            // return [...state, action.payload]
            return {
                noOfItems: state.noOfItems + 1,
                products: [action.payload, ...state.products]
            }
        case REMOVE_FROM_WISHLIST:
            // const newArr = state
            // const index = newArr.indexOf(action.payload)
            // if(index > -1){
            //     newArr.splice(newArr.indexOf(action.payload), 1)
            // }
            // return newArr
            return{
                noOfItems: state.noOfItems - 1,
                products: state.products.filter(item => item.id !== action.payload.id)
            }
        case GET_FULL_WISHLIST:
            console.log(action.payload.length);
            console.log(action.payload);
            
            return{
                noOfItems: action.payload.length,
                products: action.payload.reverse()
            }
        default:
            return state
    }
}