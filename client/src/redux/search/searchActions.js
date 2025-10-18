import { SET_SEARCH_QUERY, SET_SEARCH_PRODUCTS, SET_CURRENT_PAGE_SEARCH, SEARCH_PRODUCTS_REQUEST, ADD_TO_WISHLIST_SEARCH, REMOVE_FROM_WISHLIST_SEARCH } from "./searchTypes";

export const searchRequest = () => {
    return{
        type: SEARCH_PRODUCTS_REQUEST
    }
}

export const setSearchQuery = (query) => ({
    type: SET_SEARCH_QUERY,
    payload: query,
});

export const setSearchedProducts = (products) => ({
    type: SET_SEARCH_PRODUCTS,
    payload: products
})

export const setPageSearch = (page) => {
    return{
        type: SET_CURRENT_PAGE_SEARCH,
        payload: page
    }
}

export const addToWishlistSearch = (item) => {
    return{
        type: ADD_TO_WISHLIST_SEARCH,
        payload: item
    }
}

export const removeFromWishlistSearch = (item) => {
    return{
        type: REMOVE_FROM_WISHLIST_SEARCH,
        payload: item
    }
}


// export const searchProducts = (filters, page = 1, limit = 15) => {
export const searchProducts = (filters) => {
    return async (dispatch, getState) => {

        console.log("Search API");
        const limit = 15
        const params = new URLSearchParams({...filters, limit})

        const token = getState().userReducer.token
        dispatch(searchRequest())
        setTimeout(async () => {
            try {
                const res = await fetch(`http://localhost:3000/products/search?${params.toString()}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if(!res.ok){
                    const error = await res.json()
                    console.error("Could not fetch Search Results:", error.error);
                    return
                }
                const data = await res.json();
                console.log(data);
                dispatch(setSearchedProducts(data));
            } 
            catch (err) {
                console.error("Search fetch failed:", err.message);
            }
        }, 300)
    };
};