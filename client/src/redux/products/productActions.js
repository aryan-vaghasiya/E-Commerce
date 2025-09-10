import { FETCH_PRODUCTS_REQUEST, FETCH_PRODUCTS_SUCCESS, FETCH_PRODUCTS_FAILED, SET_CURRENT_PAGE_ALL } from "./productTypes";

export const productsRequest = () => {
    return{
        type: FETCH_PRODUCTS_REQUEST
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

export const fetchProducts = () => {

    return(dispatch, getState) => {
        const currentPage = getState().productReducer.currentPage
        const token = getState().userReducer.token
        dispatch(productsRequest())
        setTimeout(async () => {
            try {
                const res = await fetch(`http://localhost:3000/products?page=${currentPage}&limit=24`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if(!res.ok){
                    const error = await res.json()
                    console.error("Could not fetch products:", error.error);
                    return
                }
                const data = await res.json();
                // console.log(data);
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