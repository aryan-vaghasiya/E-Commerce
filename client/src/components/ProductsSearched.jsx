import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductItem from "./ProductItem";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Snackbar from "@mui/material/Snackbar";
import { hideSnack } from "../redux/snackbar/snackbarActions";
import Alert from "@mui/material/Alert";
import Pagination from "@mui/material/Pagination";
import { searchProducts, setPageSearch } from "../redux/search/searchActions";


function ProductsSearched() {
    const snackbarState = useSelector((state) => state.snackbarReducer)
    const searchReducer = useSelector((state) => state.searchReducer)
    const dispatch = useDispatch();

    const filtered = searchReducer.products || []

    const handlePage = (event, value) => {
        dispatch(setPageSearch(value))
    }

    useEffect(() => {
        dispatch(searchProducts(searchReducer.query));
        window.scrollTo({top: 0, left: 0, behavior: 'smooth'})
    }, [searchReducer.currentPage]);

    if(!searchReducer.query){
        return(
            <Box sx={{ pt: 6, px: 8, bgcolor: "#EEEEEE", minHeight: "91vh" }}>
                <Box textAlign={"center"}>
                    <Typography>Nothing to show here</Typography>
                </Box>
            </Box>
        )
    }

    return (
        <Box sx={{ pt: 6, px: 8, bgcolor: "#EEEEEE", minHeight: "91vh" }}>
            {/* <Box textAlign={"center"}>
                <Typography>Nothing to show here</Typography>
            </Box> */}
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
                    // searchReducer.query && filtered?.length > 0 ?
                    filtered?.length > 0 ?
                    (
                        filtered.map((product) => (
                            <Grid key={product.id} size={{ sm: 4, md: 4, lg: 3 }}>
                                <ProductItem product={product} loading={false} />
                            </Grid>
                        ))
                    )
                    :
                    // searchReducer.query && filtered?.length === 0 ?
                    filtered?.length === 0 ?
                    (
                        <Box sx={{mx: "auto", mb: 5}}>
                            <Typography>
                                Oops! There are no products named - {searchReducer.query}
                            </Typography>
                        </Box>
                    )
                    :
                    <Box sx={{mx: "auto", mb: 5}}>
                        <Typography>Nothing to show here</Typography>
                    </Box>
                }
            </Grid>
            {filtered?.length > 0?
                <Box sx={{display: "flex", justifyContent: "center", py: 2}}>
                    <Pagination count={searchReducer.pages} page={searchReducer.currentPage} onChange={handlePage} color="primary"/>
                </Box>
                :
                null
            }
        </Box>
    )
}

export default ProductsSearched
