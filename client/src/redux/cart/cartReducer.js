import { ADD_TO_CART, EMPTY_CART, REMOVE_FROM_CART, CART_FROM_DB, REMOVE_CART_ITEM, SAVE_FOR_LATER} from "./cartTypes";

const initCart = {
    noOfItems: 0,
    items: [],
    saved: [],
    cartValue: 0
}

const cartReducer = (state=initCart, action) => {
    switch(action.type){

        case ADD_TO_CART:
            if(!state.items?.find(prod=> prod.id === action.payload.id)){
                return{
                    noOfItems: state.noOfItems + 1,
                    items: [...state.items, {...action.payload, quantity: 1, priceValue: action.payload.price}],
                    saved: [...state.saved],
                    cartValue: parseFloat((state.cartValue + action.payload.price).toFixed(2))
                }
            }
            else{
                return{
                    noOfItems: state.noOfItems + 1,
                    items: state.items.map(item => {
                                if(item.id === action.payload.id){
                                    return{
                                        ...action.payload,
                                        quantity: item.quantity + 1,
                                        priceValue: parseFloat(((item.quantity+1)*item.price).toFixed(2))
                                    }
                                }
                                return item
                                }),
                    saved: [...state.saved],
                    cartValue: parseFloat((state.cartValue + action.payload.price).toFixed(2))
                }
            }

        case REMOVE_FROM_CART:
            if(action.payload.quantity === 1){
                return {
                    noOfItems: state.noOfItems - 1,
                    items: state.items.filter(item => item.id !== action.payload.id),
                    saved: [...state.saved],
                    cartValue: parseFloat((state.cartValue - action.payload.price).toFixed(2))
                }
            }
            else{
                return{
                    noOfItems: state.noOfItems - 1,
                    items: state.items.map(item => {
                                    if(item.id === action.payload.id){
                                        return{
                                            ...action.payload,
                                            quantity: item.quantity - 1,
                                            priceValue: parseFloat(((item.quantity-1)*item.price).toFixed(2))
                                        }
                                    }
                                    return item
                                    }),
                    saved: [...state.saved],
                    cartValue: parseFloat((state.cartValue - action.payload.price).toFixed(2))
                }
            }
        
        case REMOVE_CART_ITEM:
            return {
                    noOfItems: state.noOfItems - (action.payload.quantity),
                    items: state.items.filter(item => item.id !== action.payload.id),
                    saved: [...state.saved],
                    cartValue: parseFloat((state.cartValue - (action.payload.price * action.payload.quantity)).toFixed(2))
                }

        case EMPTY_CART:
            return initCart

        case CART_FROM_DB:
            let totalItems = 0;
            const items = action.payload.items
            const saved = action.payload.saved
            items.map(item => {
                    totalItems += item.quantity
                })
            let cartTotal = 0;
            items.map(item => {
                cartTotal += item.quantity * item.price
            })

            return{
                noOfItems: totalItems,
                items: items.map(item => {
                    return{
                        ...item,
                        quantity: item.quantity,
                        priceValue: parseFloat(((item.quantity) * item.price).toFixed(2))
                    }
                }),
                saved: saved.map(item => {
                    return{
                        ...item,
                        quantity: 1,
                        priceValue: parseFloat((item.price).toFixed(2))
                    }
                }),
                cartValue: Math.round(cartTotal * 100) / 100
            }

        case SAVE_FOR_LATER: 
            return{
                noOfItems: state.noOfItems,
                items: [...state.items],
                saved: state.saved.some((p) => p.id === action.payload.id) ? [...state.saved] : [{...action.payload, quantity: 1, priceValue: action.payload.price}, ...state.saved],
                cartValue: state.cartValue
            }

        default:
            return state
    }
}

export default cartReducer