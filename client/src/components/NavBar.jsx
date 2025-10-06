import cartifyLogo from "../assets/cartify-logo.png"
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, useNavigate, useSearchParams } from 'react-router'

import AppBar from "@mui/material/AppBar"
import Container from "@mui/material/Container"
import Toolbar from "@mui/material/Toolbar"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Badge from "@mui/material/Badge"
import { showSnack } from "../redux/snackbar/snackbarActions"
import SearchIcon from '@mui/icons-material/Search';
import TextField from "@mui/material/TextField"
import { useEffect, useState } from "react"
import { searchProducts, setSearchQuery } from "../redux/search/searchActions"
import Avatar from "@mui/material/Avatar"
import Tooltip from "@mui/material/Tooltip"
import IconButton from "@mui/material/IconButton"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import MenuIcon from '@mui/icons-material/Menu'
import Drawer from "@mui/material/Drawer"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"
import CloseIcon from '@mui/icons-material/Close'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import '@fontsource-variable/playfair-display';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { InputAdornment } from "@mui/material"
import { useForm } from "react-hook-form"

    const MobileDrawer = ({ mobileDrawerOpen, setMobileDrawerOpen, toggleMobileDrawer, navigationItems, navigate, input, handleChange }) => (
        <Drawer
            anchor="left"
            open={mobileDrawerOpen}
            onClose={toggleMobileDrawer(false)}
            sx={{
                display: { xs: 'block', md: 'none' },
                '& .MuiDrawer-paper': {
                    maxWidth: "60%",
                    bgcolor: 'background.paper',
                },
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <img src={cartifyLogo} alt="logo" style={{ height: '32px' }} />
                </Box>
                <IconButton onClick={toggleMobileDrawer(false)}>
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* <List sx={{ pt: 2 }}>
                {navigationItems.map((item) => (
                    <ListItem 
                        key={item.name} 
                        onClick={() => {
                            navigate(item.path);
                            setMobileDrawerOpen(false);
                        }}
                        sx={{ 
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: 'action.hover'
                            }
                        }}
                    >
                        <ListItemText 
                            primary={item.name} 
                            slotProps={{
                                primary: {
                                    sx: {fontSize: "1.1rem", fontWeight: 500}
                                }
                            }}
                        />
                    </ListItem>
                ))}
            </List> */}

            <Box sx={{ p: 2, mt: 'auto' }}>
                <Box sx={{ 
                    bgcolor: "grey.100", 
                    p: 1, 
                    borderRadius: 2, 
                    display: "flex", 
                    alignItems: "center" 
                }}>
                    <SearchIcon color="primary" sx={{ mr: 1 }} />
                    <TextField 
                        autoFocus
                        variant="standard" 
                        placeholder="Search products..." 
                        fullWidth
                        slotProps={{ input: { disableUnderline: true } }} 
                        onChange={handleChange}
                        value={input}
                    />
                </Box>
            </Box>
        </Drawer>
    );

function NavBar() {
    const noOfItems = useSelector(state=> state.cartReducer.noOfItems)
    const userState = useSelector(state => state.userReducer)
    const searchReducer = useSelector(state => state.searchReducer)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [input, setInput] = useState(searchReducer?.query || "")
    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const { register, handleSubmit, watch, setValue, setFocus } = useForm({
        defaultValues:{
            searchQuery: searchReducer.query || ""
        }
    })
    const searchQueryValue = watch("searchQuery");
    const [searchParams, setSearchParams] = useSearchParams()
    // console.log(searchParams);
    // console.log(searchParams.toString());

    const handleClearSearch = () => {
        setValue("searchQuery", "");
        setFocus("searchQuery");
    };

    const open = Boolean(anchorEl);
    
    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget)
    }
    
    const handleClose = () => {
        setAnchorEl(null)
    }

    const toggleMobileDrawer = (newOpen) => () => {
        setMobileDrawerOpen(newOpen);
    };

    const handleAuth = (e) => {
        const navTo = e.target.id === "orders" ? "/my-orders" :
                    e.target.id === "wishlist" ? "/my-wishlist" :
                    "/"

        if(!userState.userName){
            navigate("/login", {state: navTo})
            setAnchorEl(null)
        }
        else if(navTo === "/"){
            localStorage.clear() 
            window.location.href = '/';
        }
        else{
            navigate(navTo)
        }
    }

    const handleChange = (e) => {
        setInput(e.target.value)
    }

    const handleSearchSubmit = (data) => {
        // const query = data.searchQuery.trim()
        // if(query && query === searchReducer.query) {
        //     return navigate("/products/search")
        // }
        // if (!query){
        //     return console.log("falsy");
        // }
        // if (query.length > 0) {
        //     dispatch(setSearchQuery(query))
        //     dispatch(searchProducts({}, query))
        //     navigate("/products/search")
        // }

        const query = data.searchQuery.trim()
        if (!query) return
        
        // Update URL directly - this triggers ProductsSearched useEffect
        const params = new URLSearchParams({query, priceRange: "0,", sort: "_score,desc"})
        // setSearchParams({
        //     query, 
        //     page: 1,
        //     sort: '_score,desc' 
        // })
        
        navigate(`/products/search?${params.toString()}`)
    }

    // useEffect(() => {
    //     const timeOut = setTimeout(() => {
    //         dispatch(setSearchQuery(input))
    //         if (input.trim() === "") return;
    //         dispatch(searchProducts(input))
    //     }, 1000)

    //     return () => clearInterval(timeOut)
    // }, [input])

    useEffect(() => {
        setValue("searchQuery", searchParams.get("query"))
    }, [searchParams])

    const navigationItems = [
        { name: "Home", path: "/" },
        { name: "Products", path: "/products" },
    ];

    return (
        <>
            <AppBar position="sticky" elevation={1}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ minHeight: { xs: 56, sm: 64 } }}>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={toggleMobileDrawer(true)}
                            sx={{ mr: 1, my: "auto", display: { xs: 'block', md: 'none' }, pt: 0, }}
                        >
                            <MenuIcon sx={{fontSize: 30}}/>
                        </IconButton>

                        <Box sx={{ display: 'flex', alignItems: 'center', mr: { xs: 1, md: 2 } }}>
                            <Box sx={{ width: { xs: "60px", md: "80px" }, mr: 1 }}>
                                <NavLink to="/">
                                    <img 
                                        src={cartifyLogo} 
                                        alt="logo" 
                                        style={{ width: '100%', height: 'auto' }}
                                    />
                                </NavLink>
                            </Box>
                        </Box>

                        {/* <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 'auto' }}>
                            {navigationItems.map((item) => (
                                <NavLink key={item.name} to={item.path}>
                                    {({ isActive }) => (
                                        <Typography sx={getNavClass(isActive)}>
                                            {item.name}
                                        </Typography>
                                    )}
                                </NavLink>
                            ))}
                        </Box> */}

                        <Box sx={{ display: "flex", alignItems: "center", ml: "auto", gap: { xs: 0.5, sm: 1 } }}>
                            <Box sx={{ 
                                display: { xs: 'none', sm: 'flex' },
                                bgcolor: "white", 
                                p: 0.75, 
                                px: 2, 
                                borderRadius: "30px", 
                                minWidth: { sm: "200px", md: "250px", lg: "300px" }, 
                                alignItems: "center"
                            }}>
                                {/* <SearchIcon color="primary" sx={{ mr: 1 }} />
                                <TextField 
                                    variant="standard" 
                                    placeholder="Search products..." 
                                    fullWidth
                                    slotProps={{ input: { disableUnderline: true } }} 
                                    onChange={handleChange}
                                    onKeyDown={handleEnter}
                                    value={input}
                                /> */}
                                <form onSubmit={handleSubmit(handleSearchSubmit)} style={{width: "100%"}}>
                                    <TextField
                                        // defaultValue={searchReducer.query}
                                        variant="standard"
                                        placeholder="Search products..."
                                        fullWidth
                                        size="small"
                                        // value={searchParams.get("query") || ""}
                                        // onChange={handleChange}
                                        {...register("searchQuery")}
                                        slotProps={{ 
                                            input: { 
                                                disableUnderline: true, 
                                                startAdornment: 
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>,
                                                endAdornment:
                                                    searchQueryValue?
                                                    <IconButton size="small" sx={{p: 0}} onClick={handleClearSearch}>
                                                        <CloseIcon />
                                                    </IconButton>
                                                    :
                                                    null
                                                }
                                            }}
                                    />
                                </form>
                            </Box>

                            {/* {
                                userState.userName ? 
                                <NavLink to="/my-wishlist">
                                    <IconButton color="inherit" sx={{ p: { xs: 0.5, sm: 1 } }}>
                                        <Badge badgeContent="0" color="secondary">
                                            <FavoriteIcon sx={{ fontSize: { xs: 28, sm: 32 } }} /> 
                                        </Badge>
                                    </IconButton>
                                </NavLink>
                                :
                                null
                            } */}

                            <NavLink to="/cart">
                                <IconButton color="inherit" sx={{ p: { xs: 0.5, sm: 1 } }}>
                                    <Badge badgeContent={noOfItems} color="secondary">
                                        <ShoppingCartIcon sx={{ fontSize: { xs: 28, sm: 32 } }} /> 
                                    </Badge>
                                </IconButton>
                            </NavLink>

                            <Tooltip title="Account">
                                <IconButton 
                                    onClick={handleMenu}
                                    sx={{ p: { xs: 0.5, sm: 1 } }}
                                >
                                    <Avatar sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }}>
                                        {userState.userName?.charAt(0).toUpperCase()}
                                    </Avatar>
                                </IconButton>
                            </Tooltip>
                        </Box>

                        <Menu
                            anchorEl={anchorEl}
                            id="account-menu"
                            open={open}
                            onClose={handleClose}
                            onClick={handleClose}
                            slotProps={{
                                paper: {
                                    elevation: 0,
                                    sx: {
                                        overflow: 'visible',
                                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                        mt: 1.5,
                                        minWidth: 130,
                                        '&::before': {
                                            content: '""',
                                            display: 'block',
                                            position: 'absolute',
                                            top: 0,
                                            right: 14,
                                            width: 10,
                                            height: 10,
                                            bgcolor: 'background.paper',
                                            transform: 'translateY(-50%) rotate(45deg)',
                                            zIndex: 0,
                                        },
                                    },
                                },
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <MenuItem onClick={handleAuth} id="orders">My Orders</MenuItem>
                            <MenuItem onClick={handleAuth} id="wishlist">My Wishlist</MenuItem>
                            {userState.userName ?
                                <Box>
                                    <MenuItem onClick={() => { navigate("/my-wallet"); handleClose(); }}>
                                        My Wallet
                                    </MenuItem>
                                    <MenuItem onClick={() => { navigate("/my-profile"); handleClose(); }}>
                                        Profile
                                    </MenuItem>
                                    <MenuItem onClick={() => { navigate("/user-referrals"); handleClose(); }}>
                                        Referral
                                    </MenuItem>
                                </Box>
                            : 
                            null}
                            <MenuItem onClick={handleAuth} id="login">
                                {userState.userName ? "Logout" : "Login"}
                            </MenuItem>
                        </Menu>
                    </Toolbar>
                </Container>
            </AppBar>

            <MobileDrawer 
                mobileDrawerOpen={mobileDrawerOpen}
                toggleMobileDrawer={toggleMobileDrawer}
                navigationItems={navigationItems}
                navigate={navigate}
                input={input}
                handleChange={handleChange}
                setMobileDrawerOpen={setMobileDrawerOpen}
            />
        </>
    )
}

export default NavBar