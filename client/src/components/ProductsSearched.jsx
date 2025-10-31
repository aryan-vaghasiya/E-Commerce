import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Box, Grid, Typography, Drawer, Pagination, Alert, Snackbar,
    Paper,
    Select,
    FormControl,
    InputLabel,
    MenuItem,
    useTheme,
    IconButton,
} from "@mui/material";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterSidebar from "./FilterSidebar";
import { searchProducts } from "../redux/search/searchActions";
import { hideSnack } from "../redux/snackbar/snackbarActions";
import { Stack, useMediaQuery } from "@mui/system";
import HorizontalProductCard from "./HorizontalProductCard";
import { useNavigate, useSearchParams } from "react-router";
import AppliedFilters from "./AppliedFilters";
import HorizontalProductCardSkeleton from "./HorizontalProductCardSkeleton";
import NoResults from "./NoResults";

const selectSnackbar = (state) => state.snackbarReducer;
const selectProducts = (state) => state.searchReducer.products;
const selectPages = (state) => state.searchReducer.pages;
const selectIsLoading = (state) => state.searchReducer.isLoading;
const selectTotal = (state) => state.searchReducer.total;

function ProductsSearched() {
    const [searchParams, setSearchParams] = useSearchParams()
    const dispatch = useDispatch();
    const navigate = useNavigate()

    const snackbarState = useSelector(selectSnackbar);
    const products = useSelector(selectProducts);
    const pages = useSelector(selectPages);
    const isLoading = useSelector(selectIsLoading);
    const total = useSelector(selectTotal);

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))

    const query = searchParams.get('query') || '';
    const currentPage = Math.max(1, Math.min(Number(searchParams.get('page')) || 1, pages || 1));
    const sortValue = searchParams.get("sort") || "_score,desc";
    
    const [mobileOpen, setMobileOpen] = useState(false);
    const [hasAnyResults, setHasAnyResults] = useState(true);

    const handleDrawerToggle = () => {
        setMobileOpen(prev => !prev);
    };

    const handlePage = (event, value) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', value);
        setSearchParams(newParams);
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        if (!query) {
            navigate("/", { replace: true });
        }
    }, [query, navigate]);

    useEffect(() => {
        if (!query) return;

        const filters = Object.fromEntries(searchParams);
        const pageParam = Number(filters.page) || 1;

        if (pageParam < 1 || (pages > 0 && pageParam > pages)) {
            const validPage = Math.max(1, Math.min(pageParam, pages || 1));
            const newParams = new URLSearchParams(searchParams);
            newParams.set('page', validPage);
            setSearchParams(newParams, { replace: true });
            return;
        }

        dispatch(searchProducts(filters));
    }, [searchParams, query, dispatch, setSearchParams, navigate]);
    // }, [searchParams]);

    useEffect(() => {
        if (!isLoading && products !== undefined) {
            const filters = Object.fromEntries(searchParams);
            const hasFilters = Object.keys(filters).some(
                key => !['query', 'page', 'sort'].includes(key)
            );

            if (!hasFilters && products?.length === 0) {
                setHasAnyResults(false);
            }
            else if (products?.length > 0) {
                setHasAnyResults(true);
            }
        }
    }, [products, isLoading, searchParams]);

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

    const handleSortChange = (e) => {
        const currentFilters = Object.fromEntries(searchParams);
        delete currentFilters.page;
        
        const newParams = new URLSearchParams({
            ...currentFilters,
            sort: e.target.value,
            page: "1"
        });
        
        setSearchParams(newParams);
    };

    return (
        <Box sx={{ bgcolor: "#EEEEEE", minHeight: "91vh", position: "relative" }}>
            <Box sx={{height: "100%"}}>
                {(hasAnyResults || isLoading) && (
                    <Paper 
                        sx={{borderRadius: "0 0 7px 7px", display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5, px: {xs: 1, md: 2}}}
                    >
                        <Box>
                            {!isMobile && !isLoading &&
                                <Typography>
                                    {`Showing 
                                        ${((currentPage - 1)*15) + 1 || 0} - ${Math.min(currentPage*15, total) || 0} 
                                        of ${total || 0} results for "${query}"
                                    `}
                                </Typography>
                            }
                        </Box>
                        <Box sx={{display: "flex", gap: 1, alignItems: "center", justifyContent: "space-between"}}>
                            <FormControl>
                                <InputLabel id="sort_by">Sort by</InputLabel>
                                <Select
                                    sx={{minWidth: {xs: 165,md: 183}, fontSize: {xs: 14, md: 16}}}
                                    size="small"
                                    value={searchParams.get("sort") || "_score,desc"}
                                    labelId="sort_by"
                                    label="Sort by"
                                    onChange={handleSortChange}
                                >
                                    <MenuItem value="_score,desc">Relevance</MenuItem>
                                    <MenuItem value="price,asc">Price - Low to High</MenuItem>
                                    <MenuItem value="price,desc">Price - High to Low</MenuItem>
                                    <MenuItem value="rating,desc">Highest Rated</MenuItem>
                                </Select>
                            </FormControl>
                            {isMobile &&
                                <IconButton 
                                    size="small" 
                                    color="primary" 
                                    sx={{border: "1px solid, rgba(25, 118, 210, 0.5)", borderRadius: 1, m: 0}}
                                    onClick={handleDrawerToggle}
                                >
                                    <FilterAltIcon />
                                </IconButton>
                            }
                        </Box>
                    </Paper>
                )}

                <Grid container spacing={1} sx={{ minHeight: "100%" }}>
                    {(hasAnyResults || isLoading) && (
                        <Grid size={{md: 2.5}}
                            sx={{ display: { xs: 'none', md: 'block' }}}
                        >
                            <FilterSidebar applyFilters={handleApplyFilters} />
                        </Grid>
                    )}

                    <Grid size={{xs: 12, md: (hasAnyResults || isLoading) ? 9.5 : 12}} sx={{p: 2, pb: 0}} >
                        <Box sx={{display: "flex", flexDirection: "column"}}>
                            <Box sx={{overflowX: "auto"}}>
                                <AppliedFilters searchParams={searchParams} setSearchParams={setSearchParams} />
                            </Box>
                            <Box>
                                <Stack spacing={{ xs: 2, md: 2.5 }}>
                                    {
                                    isLoading ?
                                        Array.from({ length: 5 }).map((_, index) => (
                                            <HorizontalProductCardSkeleton key={index} />
                                        ))
                                    : products?.length > 0 ? 
                                        products.map((product) => (
                                            <HorizontalProductCard key={product.id} product={product} loading={false} />
                                        ))
                                    : !isLoading && (!products || products?.length < 1) &&
                                        <NoResults
                                            searchParams={searchParams}
                                            setSearchParams={setSearchParams}
                                            query={query}
                                            isLoading={isLoading}
                                        />
                                    }
                                </Stack>

                                {!isLoading && products?.length > 0 &&
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
                                }
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {(hasAnyResults || isLoading) && (
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
            )}

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