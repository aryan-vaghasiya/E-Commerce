import { ADD_TO_CART, EMPTY_CART, REMOVE_FROM_CART, CART_FROM_DB} from "./cartTypes";

const initCart = {
    noOfItems: 0,
    products: [],
    cartValue: 0
}

const cartReducer = (state=initCart, action) => {
    switch(action.type){

        case ADD_TO_CART:
            if(!state.products?.find(prod=> prod.id === action.payload.id)){
                return{
                    noOfItems: state.noOfItems + 1,
                    products: [...state.products, {...action.payload, quantity: 1, priceValue: action.payload.price}],
                    cartValue: parseFloat((state.cartValue + action.payload.price).toFixed(2))
                }
            }
            else{
                return{
                    noOfItems: state.noOfItems + 1,
                    products: state.products.map(item => {
                                if(item.id === action.payload.id){
                                    return{
                                        ...action.payload,
                                        quantity: item.quantity + 1,
                                        priceValue: parseFloat(((item.quantity+1)*item.price).toFixed(2))
                                    }
                                }
                                return item
                                }),
                    cartValue: parseFloat((state.cartValue + action.payload.price).toFixed(2))
                }
            }

        case REMOVE_FROM_CART:
            if(action.payload.quantity === 1){
                return {
                    noOfItems: state.noOfItems - 1,
                    products: state.products.filter(item => item.id !== action.payload.id),
                    cartValue: parseFloat((state.cartValue - action.payload.price).toFixed(2))
                }
            }
            else{
                return{
                    noOfItems: state.noOfItems - 1,
                    products: state.products.map(item => {
                                    if(item.id === action.payload.id){
                                        return{
                                            ...action.payload,
                                            quantity: item.quantity - 1,
                                            priceValue: parseFloat(((item.quantity-1)*item.price).toFixed(2))
                                        }
                                    }
                                    return item
                                    }),
                    cartValue: parseFloat((state.cartValue - action.payload.price).toFixed(2))
                }
            }

        case EMPTY_CART:
            return initCart

        case CART_FROM_DB:
            let totalItems = 0;
            action.payload.map(item => {
                    totalItems += item.quantity
                })
            let cartTotal = 0;
            action.payload.map(item => {
                cartTotal += item.quantity * item.price
            })

            return{
                noOfItems: totalItems,
                // products: action.payload,
                products: action.payload.map(item => {
                    return{
                    ...item,
                    quantity: item.quantity,
                    priceValue: parseFloat(((item.quantity) * item.price).toFixed(2))
                    }
                }),
                cartValue: Math.round(cartTotal * 100) / 100
            }

        default:
            return state
    }
}

export default cartReducer