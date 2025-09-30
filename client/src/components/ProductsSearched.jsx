// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import ProductItem from "./ProductItem";

// import Typography from "@mui/material/Typography";
// import Box from "@mui/material/Box";
// import Grid from "@mui/material/Grid";
// import Snackbar from "@mui/material/Snackbar";
// import { hideSnack } from "../redux/snackbar/snackbarActions";
// import Alert from "@mui/material/Alert";
// import Pagination from "@mui/material/Pagination";
// import { searchProducts, setPageSearch } from "../redux/search/searchActions";
// import { AppBar, Button, Container, CssBaseline, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from "@mui/material";
// import InboxIcon from '@mui/icons-material/MoveToInbox';
// import MailIcon from '@mui/icons-material/Mail';


// function ProductsSearched() {
//     const snackbarState = useSelector((state) => state.snackbarReducer)
//     const searchReducer = useSelector((state) => state.searchReducer)
//     const dispatch = useDispatch();

//     const filtered = searchReducer.products || []

//     const handlePage = (event, value) => {
//         dispatch(setPageSearch(value))
//     }

//     useEffect(() => {
//         dispatch(searchProducts(searchReducer.query));
//         window.scrollTo({top: 0, left: 0, behavior: 'smooth'})
//     }, [searchReducer.currentPage]);

//     // if(!searchReducer.query){
//     //     return(
//     //         <Box sx={{ pt: 6, px: 8, bgcolor: "#EEEEEE", minHeight: "91vh" }}>
//     //             <Box textAlign={"center"}>
//     //                 <Typography>Nothing to show here</Typography>
//     //             </Box>
//     //         </Box>
//     //     )
//     // }

//     return (
//         // <Box sx={{ pt: 6, px: 8, bgcolor: "#EEEEEE", minHeight: "91vh" }}>
//         <Box sx={{ bgcolor: "#EEEEEE", minHeight: "91vh" }}>
//             <Container>
//                 {/* <Box sx={{display: "flex", justifyContent: "space-between", py: 3}}>
//                     <Box sx={{}}>
                        
//                     </Box>
//                     <Box sx={{}}>
//                         <Button variant="contained">
//                             Filter
//                         </Button>
//                     </Box>
//                 </Box> */}
//                 <Box sx={{ display: 'flex' }}>
//                     <CssBaseline />
//                     <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
//                         <Toolbar>
//                             <Typography variant="h6" noWrap component="div">
//                                 Clipped drawer
//                             </Typography>
//                         </Toolbar>
//                     </AppBar>
//                     <Drawer
//                         variant="permanent"
//                         sx={{
//                             width: 240,
//                             flexShrink: 0,
//                             [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
//                         }}
//                     >
//                         <Toolbar />
//                         <Box sx={{ overflow: 'auto' }}>
//                             <List>
//                                 {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
//                                     <ListItem key={text} disablePadding>
//                                         <ListItemButton>
//                                             <ListItemIcon>
//                                                 {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
//                                             </ListItemIcon>
//                                             <ListItemText primary={text} />
//                                         </ListItemButton>
//                                     </ListItem>
//                                 ))}
//                             </List>
//                             <Divider />
//                             <List>
//                                 {['All mail', 'Trash', 'Spam'].map((text, index) => (
//                                     <ListItem key={text} disablePadding>
//                                         <ListItemButton>
//                                             <ListItemIcon>
//                                                 {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
//                                             </ListItemIcon>
//                                             <ListItemText primary={text} />
//                                         </ListItemButton>
//                                     </ListItem>
//                                 ))}
//                             </List>
//                         </Box>
//                     </Drawer>
//                 </Box>
//                 <Box>
//                     <Grid
//                         container
//                         spacing={{ xs: 2, md: 3 }}
//                         columns={{ xs: 4, sm: 8, md: 12 }}
//                     >
//                         <Snackbar
//                             open={snackbarState.show}
//                             anchorOrigin={{ vertical: "top", horizontal: "center" }}
//                             autoHideDuration={1000}
//                             onClose={() => dispatch(hideSnack())}
//                             sx={{
//                                 '&.MuiSnackbar-root': { top: '70px' },
//                             }}
//                         >
//                             <Alert onClose={() => dispatch(hideSnack())} severity={snackbarState.severity} variant="filled">
//                                 {snackbarState.message}
//                             </Alert>
//                         </Snackbar>
//                         {
//                             filtered?.length > 0 ?
//                             (
//                                 filtered.map((product) => (
//                                     <Grid key={product.id} size={{ sm: 4, md: 4, lg: 3 }}>
//                                         <ProductItem product={product} loading={false} />
//                                     </Grid>
//                                 ))
//                             )
//                             :
//                             filtered?.length === 0 ?
//                             (
//                                 <Box sx={{mx: "auto", mb: 5}}>
//                                     <Typography>
//                                         Oops! There are no products named - {searchReducer.query}
//                                     </Typography>
//                                 </Box>
//                             )
//                             :
//                             <Box sx={{mx: "auto", mb: 5}}>
//                                 <Typography>Nothing to show here</Typography>
//                             </Box>
//                         }
//                     </Grid>
                    
//                     {filtered?.length > 0?
//                         <Box sx={{display: "flex", justifyContent: "center", py: 2}}>
//                             <Pagination count={searchReducer.pages} page={searchReducer.currentPage} onChange={handlePage} color="primary"/>
//                         </Box>
//                         :
//                         null
//                     }
//                 </Box>
//             </Container>
//         </Box>
//     )
// }

// export default ProductsSearched



import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Container, Box, Grid, Typography, Button, Drawer, Toolbar, Pagination, Alert, Snackbar,
    CircularProgress
} from "@mui/material";
import FilterListIcon from '@mui/icons-material/FilterList';
import ProductItem from "./ProductItem";
import FilterSidebar from "./FilterSidebar"; // Import the new component
import { searchProducts, setPageSearch } from "../redux/search/searchActions";
import { hideSnack } from "../redux/snackbar/snackbarActions";

const drawerWidth = "auto";

function ProductsSearched() {
    const dispatch = useDispatch();
    const snackbarState = useSelector((state) => state.snackbarReducer);
    const { products, currentPage, pages, query, isLoading } = useSelector((state) => state.searchReducer);
    
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({})

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handlePage = (event, value) => {
        if(currentPage === value) return
        console.log(value);
        dispatch(setPageSearch(value));
        dispatch(searchProducts(query, value, 15, activeFilters));
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        console.log("I ran");
        dispatch(searchProducts(query, currentPage));
        // window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        // }, [currentPage]);
    }, []);

    const handleApplyFilters = (filters) => {
        setActiveFilters(filters)
        console.log(filters);
        
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(filters)) {
            params.set(key, value)
        }
        console.log(params);
        console.log(Object.fromEntries(params));
        dispatch(searchProducts(query, 1, 15, Object.fromEntries(params)))
    }

    // if(isLoading){
    //     return(
    //         <Box sx={{mx: "auto", width: "100%", height: "100%"}}>
    //             <CircularProgress />
    //         </Box>
    //     )
    // }

    return (
        <Box sx={{ bgcolor: "#EEEEEE", minHeight: "91vh" }}>
            <Box sx={{}}>
                {/* Mobile Filter Button */}
                <Box sx={{pt: 2, px: 2, display: { xs: "flex", md: 'none', }, justifyContent: "flex-end" }}>
                    <Button
                        variant="contained"
                        startIcon={<FilterListIcon />}
                        onClick={handleDrawerToggle}
                        // fullWidth
                    >
                        Filters
                    </Button>
                </Box>

                <Grid container spacing={1}>
                    {/* Desktop Sidebar */}
                    <Grid size={{md: 3}}
                        sx={{
                            width: drawerWidth,
                            display: { xs: 'none', md: 'block' }
                        }}
                    >
                        <FilterSidebar applyFilters={handleApplyFilters} activeFilters={activeFilters}/>
                    </Grid>

                    {/* Product Grid */}
                    <Grid size={{xs: 12, md: 9}} sx={{p: 2}}>
                        {
                        isLoading ?
                        (
                            <Box sx={{ textAlign: 'center', mt: 5 }}>
                                <CircularProgress />
                            </Box>
                        )
                        :
                        !isLoading && products?.length > 0 ? (
                            <>
                                <Grid container spacing={{ xs: 2, md: 3 }} >
                                    {products.map((product) => (
                                        <Grid key={product.id} size={{xs: 12, sm: 6, lg: 4, xl: 3}}>
                                            <ProductItem product={product} loading={false} />
                                        </Grid>
                                    ))}
                                </Grid>
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
                            </>
                        ) 
                        :
                        (
                            <Box sx={{ textAlign: 'center', mt: 5 }}>
                                <Typography>
                                    Oops! There are no products named - {query}
                                </Typography>
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </Box>

            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }} // Better open performance on mobile.
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                <FilterSidebar />
            </Drawer>

            {/* Your Snackbar can remain here */}
            <Snackbar open={snackbarState.show} /* ...props... */ >
                <Alert /* ...props... */ >{snackbarState.message}</Alert>
            </Snackbar>
        </Box>
    );
}

export default ProductsSearched;