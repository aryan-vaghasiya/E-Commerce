import flipkartLogo from "../assets/flipkart-logo.png"
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
const API_URL = import.meta.env.VITE_API_SERVER;


function AdminNavBar() {
    const noOfItems = useSelector(state=> state.cartReducer.noOfItems)
    const userState = useSelector(state => state.userReducer)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [input, setInput] = useState("")
    const [anchorEl, setAnchorEl] = useState(null);

    const getNavClass = (isActive) => ({
        mr: 2,
        fontWeight: isActive ? "bold" : "normal",
        "&:hover" : {fontWeight: 700}
    })

    const open = Boolean(anchorEl);
    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget)
        // userState.userName ? setAnchorEl(event.currentTarget) : null
    }
    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleAuth = (e) => {
        // console.log(e.target.id);
        // console.log(e.currentTarget.id);

        // const navTo = e.target.id === "orders" ? "/my-orders" :
        //             e.target.id === "wishlist" ? "/my-wishlist" :
        //             "/"
        
        if(userState.userName){
            localStorage.clear() 
            window.location.href = '/admin';
            // navigate("/admin/dashboard")
            setAnchorEl(null)
        }
        // else if(navTo === "/"){
        //     localStorage.clear() 
        //     window.location.href = '/';
        // }
        else{
            navigate("/admin")
        }
    }

    useEffect(() => {
        // if (input.trim() === "") return;
        const timeOut = setTimeout(() => {
            // dispatch(setSearchQuery(input))
            // dispatch(searchProducts(input))
        },1000)

        return () => clearInterval(timeOut)
    },[input])

    const HandleLogin = async (e) => {
        e.preventDefault()

        if(userState.token){
            const res = await fetch(`${API_URL}/auth/check`, {
                headers: {
                    Authorization: `Bearer ${userState.token}`
                    // Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXN`
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

    return (
        <AppBar position="sticky">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Box sx={{width: "7%", marginRight: 3, paddingTop: 0}}>
                        <NavLink to={"/dashboard"}>
                            {/* <img src={flipkartLogo} alt="logo"/> */}
                            <img src={cartifyLogo}  alt="logo"/>
                        </NavLink>
                    </Box>
                    <NavLink to={"/admin/dashboard"}>
                        {({isActive}) => (
                            <Typography sx={getNavClass(isActive)}>
                            Dashboard
                            </Typography>
                        )}
                    </NavLink>
                    <NavLink to={"/admin/products"}>
                        {({isActive}) => (
                            <Typography sx={getNavClass(isActive)}>
                            Products
                            </Typography>
                        )}
                    </NavLink>
                    <NavLink to={"/admin/users"}>
                        {({isActive}) => (
                            <Typography sx={getNavClass(isActive)}>
                            Customers
                            </Typography>
                        )}
                    </NavLink>
                    <NavLink to={"/admin/sales"}>
                        {({isActive}) => (
                            <Typography sx={getNavClass(isActive)}>
                            Orders
                            </Typography>
                        )}
                    </NavLink>
                    <NavLink to={"/admin/coupons"}>
                        {({isActive}) => (
                            <Typography sx={getNavClass(isActive)}>
                            Coupons
                            </Typography>
                        )}
                    </NavLink>
                    <NavLink to={"/admin/campaigns"}>
                        {({isActive}) => (
                            <Typography sx={getNavClass(isActive)}>
                            Campaigns
                            </Typography>
                        )}
                    </NavLink>
                    <Box sx={{ml: "auto", display: "flex", alignItems: "center"}}>
                        <Typography>Admin</Typography>
                        <Tooltip title="Account settings">
                            <IconButton sx={{mr: 0, ml: 0.5}} onClick={handleMenu}>
                                <Avatar >{userState.userName.toUpperCase().split('')[0]}</Avatar>
                                {/* <Avatar ></Avatar> */}
                            </IconButton>
                        </Tooltip>
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
                            <MenuItem onClick={handleAuth} id="login">{userState.userName? "Logout" : "Login"}</MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    )
}

export default AdminNavBar