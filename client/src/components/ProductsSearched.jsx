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
    const dispatch = useDispatch();
    const snackbarState = useSelector((state) => state.snackbarReducer);
    const navigate = useNavigate()

    const [searchParams, setSearchParams] = useSearchParams()

    const { products, pages, isLoading, total } = useSelector((state) => state.searchReducer);

    const query = searchParams.get('query') || '';
    const currentPage = Math.max(1, Math.min(Number(searchParams.get('page')) || 1, pages));

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))
    
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({
        priceRange: "0,",
        sort: "_score,desc"
    })

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handlePage = (event, value) => {
        // console.log(...searchParams);
        
        // const filters = Object.fromEntries(searchParams)
        // dispatch(searchProducts(filters, value))
        // window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', value);
        setSearchParams(newParams);
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        const filters = Object.fromEntries(searchParams)

        if (!searchParams.toString() || !searchParams.get("query")) {
            navigate("/")
            // setSearchParams({ query: '', sort: '_score,desc' })
            return
        }
        if(!filters.page || filters.page > currentPage){
            console.log(currentPage);
            return setSearchParams({...filters, page: currentPage})
        }

        dispatch(searchProducts(filters))
        // dispatch(searchProducts({...filters, page: currentPage}))
    }, [searchParams])

    const handleApplyFilters = useCallback((filters, sort = "_score,desc") => {
        // const handleApplyFilters = (filters, sort = "_score,desc") => {
        
        setActiveFilters({query, ...filters})

        const params = new URLSearchParams();
        params.set("query", query)
        for (const [key, value] of Object.entries(filters)) {
            params.set(key, value)
        }
        params.set("sort", sort)
        params.set("page", 1)

        setSearchParams(params)
    // }
    }, [query, setSearchParams]);

    return (
        <Box sx={{ bgcolor: "#EEEEEE", minHeight: "91vh" }}>
            <Box sx={{}}>
                <Paper sx={{borderRadius: 0, display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5, px: {xs: 1, md: 2}}}>
                    <Box>
                        {
                            !isMobile?
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
                                // handleApplyFilters(activeFilters, e.target.value)

                                const currentFilters = Object.fromEntries(searchParams);
                                delete currentFilters.page;  // Reset page on sort change
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

                {!isLoading && (products?.length < 1 || !products) ?
                    // <Box sx={{ textAlign: 'center', mt: 5 }}>
                    //     <Typography>
                    //         Oops! There are no products named - {query}
                    //     </Typography>
                    // </Box>
                    (
                        <Box sx={{ textAlign: 'center', mt: 5 }}>
                            <Typography variant="h6" gutterBottom>
                                No results for "{query}"
                            </Typography>
                            {/* <Typography color="text.secondary">
                                Try different keywords or remove some filters
                            </Typography>
                            <Button 
                                variant="contained" 
                                sx={{ mt: 2 }}
                                onClick={() => setSearchParams({ query })}
                            >
                                Clear All Filters
                            </Button> */}
                        </Box>
                    )
                    :
                    <Grid container spacing={1}>

                        <Grid size={{md: 3}}
                            sx={{
                                width: "auto",
                                display: { xs: 'none', md: 'block' }
                            }}
                        >
                            <FilterSidebar applyFilters={handleApplyFilters} activeFilters={activeFilters}/>
                        </Grid>

                        <Grid size={{xs: 12, md: 9}} sx={{p: 2}}>
                            {isLoading ?
                                <Box sx={{ textAlign: 'center', mt: 5 }}>
                                    <CircularProgress />
                                </Box>
                            :
                            !isLoading && products?.length > 0 ?
                                <Box sx={{display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%"}}>
                                    {/* <Grid container spacing={{ xs: 2, md: 3 }} >
                                        {products.map((product) => (
                                            <Grid key={product.id} size={{xs: 12, sm: 6, lg: 4, xl: 3}}>
                                                <ProductItem product={product} loading={false} />
                                            </Grid>
                                        ))}
                                    </Grid> */}

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
                }
            </Box>

            {/* Mobile Drawer */}
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
                <FilterSidebar applyFilters={handleApplyFilters} activeFilters={activeFilters}/>
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