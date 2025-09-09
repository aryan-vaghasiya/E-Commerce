// import flipkartLogo from "../assets/flipkart-logo.png"
// import cartifyLogo from "../assets/cartify-logo.png"
// import { useDispatch, useSelector } from 'react-redux'
// import { NavLink, useNavigate } from 'react-router'

// import AppBar from "@mui/material/AppBar"
// import Container from "@mui/material/Container"
// import Toolbar from "@mui/material/Toolbar"
// import Box from "@mui/material/Box"
// import Typography from "@mui/material/Typography"
// import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
// import Badge from "@mui/material/Badge"
// import { showSnack } from "../redux/snackbar/snackbarActions"
// import SearchIcon from '@mui/icons-material/Search';
// import TextField from "@mui/material/TextField"
// import { useEffect, useState } from "react"
// import { searchProducts, setSearchQuery } from "../redux/search/searchActions"
// import Avatar from "@mui/material/Avatar"
// import Tooltip from "@mui/material/Tooltip"
// import IconButton from "@mui/material/IconButton"
// import Menu from "@mui/material/Menu"
// import MenuItem from "@mui/material/MenuItem"
// import '@fontsource-variable/playfair-display';


// function NavBar() {
//     const noOfItems = useSelector(state=> state.cartReducer.noOfItems)
//     const userState = useSelector(state => state.userReducer)
//     const navigate = useNavigate()
//     const dispatch = useDispatch()
//     const [input, setInput] = useState("")
//     const [anchorEl, setAnchorEl] = useState(null);

//     const getNavClass = (isActive) => ({
//         mr: 2,
//         fontWeight: isActive ? "bold" : "normal",
//         "&:hover" : {fontWeight: 700}
//     })

//     const open = Boolean(anchorEl);
//     const handleMenu = (event) => {
//         setAnchorEl(event.currentTarget)
//     }
//     const handleClose = () => {
//         setAnchorEl(null)
//     }

//     const handleAuth = (e) => {
//         // console.log(e.target.id);
//         // console.log(e.currentTarget.id);

//         const navTo = e.target.id === "orders" ? "/my-orders" :
//                     e.target.id === "wishlist" ? "/my-wishlist" :
//                     "/"
        
//         if(!userState.userName){
//             navigate("/login", {state: navTo})
//             setAnchorEl(null)
//         }
//         else if(navTo === "/"){
//             localStorage.clear() 
//             window.location.href = '/';
//         }
//         else{
//             navigate(navTo)
//         }
//     }

//     const handleChange = (e) => {
//         setInput(e.target.value)
//         // const timeOut = setTimeout(() => {
//             // dispatch(setSearchQuery(e.target.value))
//         //     dispatch(searchProducts(e.target.value))
//         // },1000)
//     }

//     useEffect(() => {
//         const timeOut = setTimeout(() => {
//             dispatch(setSearchQuery(input))
//             if (input.trim() === "") return;
//             dispatch(searchProducts(input))
//         },1000)

//         return () => clearInterval(timeOut)
//     },[input])

//     // const handleEnter = (e) => {
//     //     if (e.key === "Enter" && input.length > 0) {
//     //         dispatch(setSearchQuery(e.target.value))
//     //         dispatch(searchProducts(e.target.value))
//     //         // navigate("/products")
//     //     }
//     //     if (e.key === "Enter" && input.length === 0){
//     //         dispatch(setSearchQuery(e.target.value))
//     //     }
//     // }

//     const HandleLogin = async (e) => {
//         e.preventDefault()

//         if(userState.token){
//             const res = await fetch("http://localhost:3000/auth/check", {
//                 headers: {
//                     Authorization: `Bearer ${userState.token}`
//                     // Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXN`
//                 }
//             });
//             if(res.status === 200){
//                 navigate("/my-orders")
//             }
//             else{
//                 dispatch(showSnack({message: "Session Expired, Login Again", severity: "warning"}))
//                 navigate("/login", {state: "/my-orders"})
//             }
//         }
//         else{
//             dispatch(showSnack({message: "Please Login to access this Section", severity: "warning"}))
//             return navigate("/login", {state: "/my-orders"})
//         }
//     }

//     return (
//         <AppBar position="sticky">
//             <Container maxWidth="xl">
//                 <Toolbar disableGutters>
//                     <Box sx={{width: "7%", marginRight: 2, paddingTop: 0}}>
//                         <NavLink to={"/"}>
//                             <img src={cartifyLogo} alt="logo"/>
//                         </NavLink>
//                     </Box>
//                     <NavLink to={"/"}>
//                         {({isActive}) => (
//                             <Typography sx={getNavClass(isActive)}>
//                             Home
//                             </Typography>
                        
//                         )}
//                     </NavLink>
//                     <NavLink to={"/products"}>
//                         {({isActive}) => (
//                             <Typography
//                             sx={getNavClass(isActive)}>
//                             Products
//                             </Typography>
//                         )}
//                     </NavLink>
//                     <Box sx={{ml: "auto", display: "flex", alignItems: "center"}}>
//                         <Box sx={{mr: 1.5, bgcolor: "white", p: 0.75, px: 2, borderRadius: "30px", height: "40px", display: "flex", minWidth: "250px", width: "100%", alignItems: "center"}}>
//                             <SearchIcon color="primary" sx={{mr: 1}}></SearchIcon>
//                             <TextField variant="standard" slotProps={{input : {disableUnderline: true}}} onChange={handleChange}></TextField >
//                         </Box>
//                         <NavLink to={"/cart"}>
//                             <Badge badgeContent={noOfItems} color="secondary">
//                                 <ShoppingCartIcon sx={{fontSize: 33}}/> 
//                             </Badge>
//                         </NavLink>
//                         <Tooltip title="Account settings">
//                             <IconButton sx={{mr: -2, ml: 1}} onClick={handleMenu}>
//                                 <Avatar >{userState.userName.toUpperCase().split('')[0]}</Avatar>
//                             </IconButton>
//                         </Tooltip>
//                         <Menu
//                             anchorEl={anchorEl}
//                             id="account-menu"
//                             open={open}
//                             onClose={handleClose}
//                             onClick={handleClose}
//                             slotProps={{
//                                 paper: {
//                                     elevation: 0,
//                                     sx: {
//                                         overflow: 'visible',
//                                         filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
//                                         mt: 1.5,
//                                         '&::before': {
//                                             content: '""',
//                                             display: 'block',
//                                             position: 'absolute',
//                                             top: 0,
//                                             right: 14,
//                                             width: 10,
//                                             height: 10,
//                                             bgcolor: 'background.paper',
//                                             transform: 'translateY(-50%) rotate(45deg)',
//                                             zIndex: 0,
//                                         },
//                                     },
//                                 },
//                             }}
//                             transformOrigin={{ horizontal: 'right', vertical: 'top' }}
//                             anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
//                         >
//                             <MenuItem onClick={handleAuth} id="orders">My Orders</MenuItem>
//                             <MenuItem onClick={handleAuth} id="wishlist">My Wishlist</MenuItem>
//                             {
//                                 userState.userName ? 
//                                 <Box>
//                                     <MenuItem onClick={() => navigate("/my-wallet")}>My Wallet</MenuItem>
//                                     <MenuItem onClick={() => navigate("/my-profile")}>Profile</MenuItem>
//                                     <MenuItem onClick={() => navigate("/user-referrals")}>Referral</MenuItem>
//                                 </Box>
//                                 :
//                                 null
//                             }
//                             <MenuItem onClick={handleAuth} id="login">{userState.userName? "Logout" : "Login"}</MenuItem>
//                         </Menu>
//                     </Box>
//                 </Toolbar>
//             </Container>
//         </AppBar>
//     )
// }

// export default NavBar

import cartifyLogo from "../assets/cartify-logo.png"
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, useNavigate } from 'react-router'

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

            <List sx={{ pt: 2 }}>
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
            </List>

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
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [input, setInput] = useState("")
    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

    const getNavClass = (isActive) => ({
        mr: 2,
        fontWeight: isActive ? "bold" : "normal",
        "&:hover": { fontWeight: 700 },
        color: "inherit",
        textDecoration: "none"
    })

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

    useEffect(() => {
        const timeOut = setTimeout(() => {
            dispatch(setSearchQuery(input))
            if (input.trim() === "") return;
            dispatch(searchProducts(input))
        }, 1000)

        return () => clearInterval(timeOut)
    }, [input])

    const HandleLogin = async (e) => {
        e.preventDefault()

        if(userState.token){
            const res = await fetch("http://localhost:3000/auth/check", {
                headers: {
                    Authorization: `Bearer ${userState.token}`
                }
            });
            if(res.status === 200){
                navigate("/my-orders")
            }
            else{
                dispatch(showSnack({message: "Session Expired, Login Again", severity: "warning"}))
                navigate("/login", {state: "/my-orders"})
            }
        }
        else{
            dispatch(showSnack({message: "Please Login to access this Section", severity: "warning"}))
            return navigate("/login", {state: "/my-orders"})
        }
    }

    // Navigation items for mobile drawer
    const navigationItems = [
        { name: "Home", path: "/" },
        { name: "Products", path: "/products" },
    ];

    return (
        <>
            <AppBar position="sticky" elevation={1}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ minHeight: { xs: 56, sm: 64 } }}>
                        {/* Mobile Menu Button */}
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={toggleMobileDrawer(true)}
                            sx={{ mr: 1, my: "auto", display: { xs: 'block', md: 'none' }, pt: 0, }}
                        >
                            <MenuIcon sx={{fontSize: 30}}/>
                        </IconButton>

                        {/* Logo */}
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

                        {/* Desktop Navigation */}
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 'auto' }}>
                            {navigationItems.map((item) => (
                                <NavLink key={item.name} to={item.path}>
                                    {({ isActive }) => (
                                        <Typography sx={getNavClass(isActive)}>
                                            {item.name}
                                        </Typography>
                                    )}
                                </NavLink>
                            ))}
                        </Box>

                        {/* Right side items */}
                        <Box sx={{ display: "flex", alignItems: "center", ml: "auto", gap: { xs: 0.5, sm: 1 } }}>
                            {/* Desktop Search */}
                            <Box sx={{ 
                                display: { xs: 'none', sm: 'flex' },
                                bgcolor: "white", 
                                p: 0.75, 
                                px: 2, 
                                borderRadius: "30px", 
                                minWidth: { sm: "200px", md: "250px", lg: "300px" }, 
                                alignItems: "center" 
                            }}>
                                <SearchIcon color="primary" sx={{ mr: 1 }} />
                                <TextField 
                                    variant="standard" 
                                    placeholder="Search products..." 
                                    fullWidth
                                    slotProps={{ input: { disableUnderline: true } }} 
                                    onChange={handleChange}
                                    value={input}
                                />
                            </Box>

                            {/* Cart */}
                            <NavLink to="/cart">
                                <IconButton color="inherit" sx={{ p: { xs: 0.5, sm: 1 } }}>
                                    <Badge badgeContent={noOfItems} color="secondary">
                                        <ShoppingCartIcon sx={{ fontSize: { xs: 28, sm: 32 } }} /> 
                                    </Badge>
                                </IconButton>
                            </NavLink>

                            {/* User Menu */}
                            <Tooltip title="Account settings">
                                <IconButton 
                                    onClick={handleMenu}
                                    sx={{ p: { xs: 0.5, sm: 1 } }}
                                >
                                    <Avatar sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }}>
                                        {userState.userName ? userState.userName.toUpperCase().split('')[0] : 'G'}
                                    </Avatar>
                                </IconButton>
                            </Tooltip>
                        </Box>

                        {/* Account Menu */}
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
