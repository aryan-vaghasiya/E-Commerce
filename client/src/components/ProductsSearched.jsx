import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Container, Box, Grid, Typography, Button, Drawer, Toolbar, Pagination, Alert, Snackbar,
    CircularProgress,
    Card,
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
import { searchProducts, setPageSearch } from "../redux/search/searchActions";
import { hideSnack } from "../redux/snackbar/snackbarActions";
import { Controller } from "react-hook-form";
import { Stack, useMediaQuery } from "@mui/system";
import HorizontalProductCard from "./HorizontalProductCard";
import { useSearchParams } from "react-router";

const drawerWidth = "auto";

function ProductsSearched() {
    const dispatch = useDispatch();
    const snackbarState = useSelector((state) => state.snackbarReducer);

    const [searchParams, setSearchParams] = useSearchParams()

    const { products, currentPage, pages, isLoading, total } = useSelector((state) => state.searchReducer);

    const query = searchParams.get('query') || ''

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))
    
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({
        // query,
        priceRange: "0,",
        sort: "_score,desc"
    })
    const [brands, setBrands] = useState([])
    // const [sortBy, setSortBy] = useState("_score,desc")
    const [sortBy, setSortBy] = useState(searchParams.get("sort") || "_score,desc")

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    // Parse URL → Form values
    function parseURLToFilters(searchParams) {
        return {
            query: searchParams.get('query') || '',
            page: Number(searchParams.get('page')) || 1,
            priceRange: searchParams.get('priceRange')?.split(',').map(Number) || [0, 1010],
            brands: searchParams.get('brands')?.split(',') || [],
            rating: searchParams.get('rating') || null,
            inStock: searchParams.get('inStock') === 'true',
            sort: searchParams.get('sort') || '_score,desc'
        }

        // console.log(Object.fromEntries(searchParams));
        
        // let filtersToSend = {}
        // Object.fromEntries(searchParams).forEach(([key, value]) => {
        //     if (Array.isArray(value)) {
        //         if (value.length > 0 && key !== "priceRange") filtersToSend[key] = value;
        //         if(key === "priceRange"){
        //             filtersToSend[key] = [value[0], value[1] > displayMax ? null : value[1]]
        //         }
        //     } 
        //     else if (value) {
        //         filtersToSend[key] = value;
        //     }
        // })

        // return filtersToSend

    }

    // Serialize Form values → URL
    function serializeFiltersToURL(filters) {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value.length > 0) {
            params.set(key, Array.isArray(value) ? value.join(',') : value)
            }
        })
        return params
    }


    const handlePage = (event, value) => {
        // if(currentPage === value) return
        // console.log(value);
        // dispatch(setPageSearch(value));
        // // dispatch(searchProducts(query, value, 15, {...activeFilters, sort: sortBy}));
        // dispatch(searchProducts({...activeFilters, sort: sortBy}, query, value));
        
        const filters = Object.fromEntries(searchParams)
        
        dispatch(searchProducts(filters, value))
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    };

    // useEffect(() => {
    //     const params = new URLSearchParams(activeFilters);
    //     setSearchParams(params)
    //     dispatch(searchProducts(activeFilters, query, currentPage));
    //     // dispatch(searchProducts(query, currentPage));
    // }, []);

    useEffect(() => {
        // const filters = parseURLToFilters(searchParams)
        const filters = Object.fromEntries(searchParams)

        console.log(searchParams.toString());
        console.log(filters);
        // If URL is empty, set defaults
        if (!searchParams.toString()) {
            setSearchParams({ query: '', sort: '_score,desc' })
            return
        }
        
        // Fetch based on URL
        dispatch(searchProducts(filters))
    }, [searchParams]) // Only dependency

    const handleApplyFilters = (filters, sort = sortBy) => {
        // console.log(sortBy);
        
        setActiveFilters({query, ...filters, sort})
        
        const params = new URLSearchParams();
        params.set("query", query)
        for (const [key, value] of Object.entries({...filters, sort})) {
            params.set(key, value)
        }
        params.set("sort", sort)
        // console.log(params);
        setSearchParams(params)
        console.log(Object.fromEntries(params));
        // dispatch(searchProducts({...filters, sort}, query))
        // dispatch(searchProducts(query, 1, 15, Object.fromEntries(params)))
    }

    return (
        <Box sx={{ bgcolor: "#EEEEEE", minHeight: "91vh" }}>
            <Box sx={{}}>
                <Paper sx={{borderRadius: 0, display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5, px: {xs: 1, md: 2}}}>
                    <Box>
                        {
                            !isMobile?
                            <Typography>Showing {((currentPage - 1)*15) +1} - {Math.min(currentPage*15, total)} of {total} results for "{query}"</Typography>
                            :
                            null
                        }
                    </Box>
                    <Box sx={{display: "flex", gap: 1, alignItems: "center", justifyContent: "space-between"}}>
                    <FormControl>
                        <InputLabel id="sort_by">Sort by</InputLabel>
                        <Select
                            size="small"
                            value={sortBy}
                            labelId="sort_by"
                            label="Sort by"
                            onChange={(e) => {                                    
                                setSortBy(e.target.value)
                                handleApplyFilters(activeFilters, e.target.value)
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
                    {/* Desktop Sidebar */}
                    <Grid size={{md: 3}}
                        sx={{
                            width: drawerWidth,
                            display: { xs: 'none', md: 'block' }
                        }}
                    >
                        <FilterSidebar applyFilters={handleApplyFilters} activeFilters={activeFilters} sort={sortBy}/>
                    </Grid>

                    {/* Product Grid */}
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
                            <Box sx={{ textAlign: 'center', mt: 5 }}>
                                <Typography>
                                    Oops! There are no products named - {query}
                                </Typography>
                            </Box>
                        }
                    </Grid>
                </Grid>
            </Box>

            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                <FilterSidebar />
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