import { productService } from "../../api/services/productService";
import { FETCH_PRODUCTS_REQUEST, FETCH_PRODUCTS_SUCCESS, FETCH_PRODUCTS_FAILED, SET_CURRENT_PAGE_ALL, ADD_PRODUCT_TO_WISHLIST, REMOVE_PRODUCT_FROM_WISHLIST } from "./productTypes";
const API_URL = import.meta.env.VITE_API_SERVER;

export const productsRequest = () => {
    return{
        type: FETCH_PRODUCTS_REQUEST
    }
}

export const addProductToWishlist = (item) => {
    return{
        type: ADD_PRODUCT_TO_WISHLIST,
        payload: item
    }
}

export const removeProductFromWishlist = (item) => {
    return{
        type: REMOVE_PRODUCT_FROM_WISHLIST,
        payload: item
    }
}

export const productsSuccess = (products) => {
    return{
        type: FETCH_PRODUCTS_SUCCESS,
        payload : products
    }
}

export const productsFailed = (error) => {
    return{
        type: FETCH_PRODUCTS_FAILED,
        payload: error
    }
}

export const setPageAll = (page) => {
    return{
        type: SET_CURRENT_PAGE_ALL,
        payload: page
    }
}

export const fetchProducts = (limit = 24) => {

    return(dispatch, getState) => {
        const currentPage = getState().productReducer.currentPage
        const token = getState().userReducer.token
        dispatch(productsRequest())
        setTimeout(async () => {
            try {
                // const res = await fetch(`${API_URL}/products?page=${currentPage}&limit=${limit}`, {
                //     headers: {
                //         Authorization: `Bearer ${token}`,
                //     },
                // });
                // if(!res.ok){
                //     const error = await res.json()
                //     console.error("Could not fetch products:", error.error);
                //     return
                // }
                // const data = await res.json();

                const data = await productService.getAllProducts(currentPage, limit);
                dispatch(productsSuccess(data))
            } 
            catch (err) {
                console.error("Products fetch failed:", err.message);
            }
        }, 1000)
    };

    // return(dispatch, getState) => {
    //     const currentPage = getState().productReducer.currentPage
    //     // console.log(getState().productReducer);
        
    //     dispatch(productsRequest())
    //     setTimeout(() => {
    //         // fetch('https://dummyjson.com/products')
    //         fetch(`http://localhost:3000/products?page=${currentPage}&limit=24`)
    //         .then(res => res.json())
    //         .then(res => {
    //             // console.log(res);
    //             dispatch(productsSuccess(res))
    //             // const productsData = res.products
    //             // dispatch(productsSuccess(productsData))
    //         })
    //         .catch(err => dispatch(productsFailed(err.message)))
    //     },1000)
    // }
}