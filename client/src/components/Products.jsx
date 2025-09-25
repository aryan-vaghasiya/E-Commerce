import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, setPageAll } from "../redux/products/productActions";
import ProductItem from "./ProductItem";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Snackbar from "@mui/material/Snackbar";
import { hideSnack } from "../redux/snackbar/snackbarActions";
import Alert from "@mui/material/Alert";
import Pagination from "@mui/material/Pagination";
import Typography from "@mui/material/Typography";
import { searchProducts, setPageSearch } from "../redux/search/searchActions";

const Products = () => {
    const productsState = useSelector((state) => state.productReducer)
    // const searchState = useSelector((state) => state.searchReducer)
    const snackbarState = useSelector((state) => state.snackbarReducer)
    const dispatch = useDispatch();

    // window.scrollTo({top: 0, behavior: 'smooth'})

    const handlePage = (event, value) => {
        // if(searchState.query.trim() !== ""){
        //     dispatch(setPageSearch(value))
        // }
        // else{
        //     dispatch(setPageAll(value))
        // }
        dispatch(setPageAll(value))
        // dispatch(setPageSearch(value))
    }

    // const totalPages = searchState.query ? searchState.pages : productsState.pages;
    const totalPages = productsState.pages
    // const currentPage = searchState.query ? searchState.currentPage : productsState.currentPage;
    const currentPage = productsState.currentPage
    // const productsToShow = searchState.query? searchState.products : productsState.products
    const productsToShow = productsState.products
    // const productsToShow = searchState.query && searchState.products? searchState.products : productsState.products

    useEffect(() => {
        // if(searchState.query.trim() !== ""){
        //     dispatch(searchProducts(searchState.query));
        // }
        // else{
        //     dispatch(fetchProducts());
        // }
        dispatch(fetchProducts());
        window.scrollTo({top: 0, left: 0, behavior: 'smooth'})
    }, [currentPage]);

    return (
        <Box sx={{ pt: 6, px: 8, bgcolor: "#EEEEEE", minHeight: "91vh" }}>
                <Grid 
                    container
                    spacing={{ xs: 2, md: 3 }}
                    columns={{ xs: 4, sm: 8, md: 12 }}
                >
                    <Snackbar
                        open={snackbarState.show}
                        anchorOrigin={{ vertical: "top", horizontal: "center" }}
                        autoHideDuration={1000}
                        onClose={() => dispatch(hideSnack())}
                        sx={{
                            '&.MuiSnackbar-root': { top: '70px' },
                        }}
                    >
                        <Alert onClose={() => dispatch(hideSnack())} severity={snackbarState.severity} variant="filled">
                            {snackbarState.message}
                        </Alert>
                    </Snackbar>
                    {
                        // productsState.isLoading || searchState?.isLoading ? (
                        productsState.isLoading ? (
                            Array.from(Array(24)).map((_, index) => (
                                <Grid key={index} size={{ sm: 4, md: 4, lg: 3 }}>
                                    <ProductItem loading={true} />
                                </Grid>
                            ))
                        )
                        :
                        productsToShow?
                        (
                            productsToShow.map((product) => (
                                <Grid key={product.id} size={{ sm: 4, md: 4, lg: 3 }}>
                                    <ProductItem product={product} loading={false} />
                                </Grid>
                            ))
                        )
                        :
                        (
                            <Box sx={{mx: "auto", mb: 5}}>
                                <Typography>
                                    Oops! no search results for - {searchState.query}
                                </Typography>
                            </Box>
                        )
                    }
                </Grid>
                {
                productsToShow?.length > 0?
                
                <Box sx={{display: "flex", justifyContent: "center", py: 2}}>
                    <Pagination count={totalPages} page={currentPage} onChange={handlePage} color="primary" showFirstButton showLastButton/>
                </Box>
                :
                null
                }
        </Box>
    );
};

export default Products;