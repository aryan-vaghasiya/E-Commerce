import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Box, Grid, Typography, Button, Drawer, Toolbar, Pagination, Alert, Snackbar,
    CircularProgress,
    Paper,
    Select,
    FormControl,
    InputLabel,
    MenuItem,
    useTheme
} from "@mui/material";
import FilterListIcon from '@mui/icons-material/FilterList';
import ProductItem from "./ProductItem";
import FilterSidebar from "./FilterSidebar";
import { searchProducts } from "../redux/search/searchActions";
import { hideSnack } from "../redux/snackbar/snackbarActions";
import { Stack, useMediaQuery } from "@mui/system";
import HorizontalProductCard from "./HorizontalProductCard";
import { useNavigate, useSearchParams } from "react-router";

function ProductsSearched() {
    const [searchParams, setSearchParams] = useSearchParams()
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const snackbarState = useSelector((state) => state.snackbarReducer);
    const { products, pages, isLoading, total } = useSelector((state) => state.searchReducer);

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))



    const query = searchParams.get('query') || '';
    const currentPage = Math.max(1, Math.min(Number(searchParams.get('page')) || 1, pages));
    
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handlePage = (event, value) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', value);
        setSearchParams(newParams);
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        const filters = Object.fromEntries(searchParams)
        // console.log("Use Effect");

        if (!searchParams.toString() || !searchParams.get("query")) {
            // setSearchParams({ query: '', sort: '_score,desc' })
            return navigate("/")
        }
        if(!filters.page || filters.page > currentPage){
            console.log(currentPage);
            return setSearchParams({...filters, page: currentPage})
        }

        dispatch(searchProducts(filters))
    }, [searchParams])

    const handleApplyFilters = useCallback((filters, sort = "_score,desc") => {
        const params = new URLSearchParams();
        params.set("query", query)
        for (const [key, value] of Object.entries(filters)) {
            params.set(key, value)
        }
        params.set("sort", sort)
        params.set("page", 1)

        setSearchParams(params)
    }, [query, setSearchParams]);

    return (
        <Box sx={{ bgcolor: "#EEEEEE", minHeight: "91vh", position: "relative" }}>
            {
            isLoading?
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "#EEEEEE"
                    }}
                >
                    <CircularProgress />
                </Box>
            : 
            !isLoading && (products?.length < 1 || !products) ?
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        top: "10%",
                        display: "flex",
                        justifyContent: "center",
                        bgcolor: "#EEEEEE"
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        Sorry, No results found
                    </Typography>
                </Box>
            :
                <Box sx={{height: "100%", width: "100%"}}>
                    <Paper sx={{borderRadius: 0, display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5, px: {xs: 1, md: 2}}}>
                        <Box>
                            {!isMobile?
                                <Typography>Showing {((currentPage - 1)*15) + 1 || 0} - {Math.min(currentPage*15, total) || 0} of {total} results for "{query}"</Typography>
                            :
                                null
                            }
                        </Box>
                        <Box sx={{display: "flex", gap: 1, alignItems: "center", justifyContent: "space-between"}}>
                            <FormControl>
                                <InputLabel id="sort_by">Sort by</InputLabel>
                                <Select
                                    sx={{minWidth: 183}}
                                    size="small"
                                    value={searchParams.get("sort") || "_score,desc"}
                                    labelId="sort_by"
                                    label="Sort by"
                                    onChange={(e) => {                                    
                                        const currentFilters = Object.fromEntries(searchParams);
                                        delete currentFilters.page;
                                        const newParams = new URLSearchParams({
                                            ...currentFilters,
                                            sort: e.target.value,
                                            page: 1
                                        });
                                        setSearchParams(newParams);
                                    }}
                                >
                                    <MenuItem value="_score,desc">Relevance</MenuItem>
                                    <MenuItem value="price,asc">Price - Low to High</MenuItem>
                                    <MenuItem value="price,desc">Price - High to Low</MenuItem>
                                    <MenuItem value="rating,desc">Highest Rated</MenuItem>
                                </Select>
                            </FormControl>
                            {isMobile?
                                <Button
                                    variant="contained"
                                    startIcon={<FilterListIcon />}
                                    onClick={handleDrawerToggle}
                                >
                                    Filters
                                </Button>
                                :
                                null
                            }
                        </Box>
                    </Paper>

                    <Grid container spacing={1}>
                        <Grid size={{md: 3}}
                            sx={{
                                width: "auto",
                                display: { xs: 'none', md: 'block' }
                            }}
                        >
                            <FilterSidebar applyFilters={handleApplyFilters} />
                        </Grid>

                        <Grid size={{xs: 12, md: 9}} sx={{p: 2}}>
                            {
                            // isLoading?
                            //     <Box sx={{textAlign: "center", mt: 5}}>
                            //         <CircularProgress />
                            //     </Box>
                            // : 
                            !isLoading && products?.length > 0 ?
                                <Box sx={{display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%"}}>
                                    <Stack spacing={{ xs: 2, md: 2.5 }}>
                                        {products.map((product) => (
                                            <HorizontalProductCard key={product.id} product={product} loading={false} />
                                        ))}
                                    </Stack>

                                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                                        <Pagination 
                                            count={pages} 
                                            page={currentPage} 
                                            onChange={handlePage} 
                                            color="primary" 
                                            showFirstButton
                                            showLastButton
                                        />
                                    </Box>
                                </Box>
                            :
                                null
                            }
                        </Grid>
                    </Grid>
                </Box>
            }

            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: "auto" },
                }}
            >
                <FilterSidebar applyFilters={handleApplyFilters} />
            </Drawer>

            <Snackbar
                open={snackbarState.show}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                autoHideDuration={1000}
                onClose={() => dispatch(hideSnack())}
                sx={{ "&.MuiSnackbar-root": { top: "70px" } }}
            >
                <Alert onClose={() => dispatch(hideSnack())} severity={snackbarState.severity} variant="filled">
                    {snackbarState.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default ProductsSearched;