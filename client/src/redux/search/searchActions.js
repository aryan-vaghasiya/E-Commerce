import { SET_SEARCH_QUERY, SET_SEARCH_PRODUCTS, SET_CURRENT_PAGE_SEARCH, SEARCH_PRODUCTS_REQUEST } from "./searchTypes";

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

// export const searchProducts = (query, page = 1, limit = 15, filters = {}) => {
export const searchProducts = (paramsObj = {}, query, page = 1, limit = 15) => {
    return (dispatch, getState) => {
        // const page = getState().searchReducer.currentPage
        console.log(paramsObj);

        const newQuery = getState().searchReducer.query
        const params = new URLSearchParams({...paramsObj, query: newQuery, page, limit})

        const token = getState().userReducer.token
        dispatch(searchRequest())
        setTimeout(async () => {
            try {
                // const res = await fetch(`http://localhost:3000/products/search?query=${query}&page=${page}&limit=24`, {
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
        }, 1000)
    };
};