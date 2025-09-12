import { FETCH_PRODUCTS_REQUEST, FETCH_PRODUCTS_SUCCESS, FETCH_PRODUCTS_FAILED, SET_CURRENT_PAGE_ALL, ADD_PRODUCT_TO_WISHLIST, REMOVE_PRODUCT_FROM_WISHLIST } from "./productTypes";

const productInitState = {
    products : [],
    isLoading : false,
    error : "",
    total: 0,
    pages: 1,
    currentPage: 1 
}

const productReducer = (state = productInitState, action) => {
    switch(action.type){

        case FETCH_PRODUCTS_REQUEST:
            return { 
                ...state,
                isLoading: true
            }

        case FETCH_PRODUCTS_SUCCESS:
            return {
                isLoading: false,
                products: action.payload.products,
                error: "",
                total: action.payload.total,
                pages: action.payload.pages,
                currentPage: action.payload.currentPage,
            }

        case FETCH_PRODUCTS_FAILED:
            return{
                isLoading: false,
                products: [],
                error: action.payload,
                ...state
            }

        case SET_CURRENT_PAGE_ALL:
            return{
                ...state,
                currentPage: action.payload
            }

        case ADD_PRODUCT_TO_WISHLIST: 
                return{
                    ...state,
                    products: state.products.map(product => 
                        product.id === action.payload.id 
                            ? {...product, wishlisted: 1} 
                            : product
                    )
                }

        case REMOVE_PRODUCT_FROM_WISHLIST: 
                return{
                    ...state,
                    products: state.products.map(product =>
                        product.id === action.payload.id 
                            ? {...product, wishlisted: 0} 
                            : product
                    )
                }

        default:
            return state
    }
}

export default productReducer