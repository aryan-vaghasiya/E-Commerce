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

export const searchProducts = (query) => {
    return (dispatch, getState) => {
        const currentPage = getState().searchReducer.currentPage
        dispatch(searchRequest())
        setTimeout(async () => {
            try {
                const res = await fetch(`http://localhost:3000/products/search?query=${query}&page=${currentPage}&limit=24`);
                if(!res.ok){
                    const error = await res.json()
                    console.error("Could not fetch Search Results:", error.error);
                    return
                }
                const data = await res.json();
                // console.log(data);
                dispatch(setSearchedProducts(data));
            } 
            catch (err) {
                console.error("Search fetch failed:", err.message);
            }
        }, 1000)
    };
};