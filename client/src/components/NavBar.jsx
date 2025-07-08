import flipkartLogo from "../assets/flipkart-logo.png"
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


function NavBar() {
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
    }
    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleAuth = (e) => {
        // console.log(e.target.id);
        // console.log(e.currentTarget.id);

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
        // const timeOut = setTimeout(() => {
            // dispatch(setSearchQuery(e.target.value))
        //     dispatch(searchProducts(e.target.value))
        // },1000)
    }

    useEffect(() => {
        // if (input.trim() === "") return;
        const timeOut = setTimeout(() => {
            dispatch(setSearchQuery(input))
            dispatch(searchProducts(input))
        },1000)

        return () => clearInterval(timeOut)
    },[input])

    // const handleEnter = (e) => {
    //     if (e.key === "Enter" && input.length > 0) {
    //         dispatch(setSearchQuery(e.target.value))
    //         dispatch(searchProducts(e.target.value))
    //         // navigate("/products")
    //     }
    //     if (e.key === "Enter" && input.length === 0){
    //         dispatch(setSearchQuery(e.target.value))
    //     }
    // }

    const HandleLogin = async (e) => {
        e.preventDefault()

        if(userState.token){
            const res = await fetch("http://localhost:3000/auth/check", {
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
                    <Box sx={{width: "7%", marginRight: 2, paddingTop: 0.5}}>
                        <img src={flipkartLogo} alt="logo"  />
                    </Box>
                    <NavLink to={"/"}>
                        {({isActive}) => (
                            <Typography sx={getNavClass(isActive)}>
                            Home
                            </Typography>
                        
                        )}
                    </NavLink>
                    <NavLink to={"/products"}>
                        {({isActive}) => (
                            <Typography
                            sx={getNavClass(isActive)}>
                            Products
                            </Typography>
                        )}
                    </NavLink>
                    {/* {
                        userState.userName 
                        ?
                        (<NavLink onClick={HandleLogin} to={"/my-orders"}>{({isActive}) => (
                            <Typography
                            sx={getNavClass(isActive)}>
                            My Orders
                            </Typography>
                        )}</NavLink>)
                        :
                        (<NavLink onClick={HandleLogin} to={"/login"}>{({isActive}) => (
                            <Typography
                            sx={getNavClass(isActive)}>
                            My Orders
                            </Typography>
                        )}</NavLink>)
                    } */}
                    <Box sx={{ml: "auto", display: "flex", alignItems: "center"}}>
                        <Box sx={{mr: 1.5, bgcolor: "white", p: 0.75, px: 2, borderRadius: "30px", height: "40px", display: "flex", minWidth: "250px", width: "100%", alignItems: "center"}}>
                            <SearchIcon color="primary" sx={{mr: 1}}></SearchIcon>
                            {/* <Autocomplete
                                sx={{ flex: 1 }}
                                freeSolo
                                // noOptionsText="No Products Found"
                                // disableClearable
                                options={productsState}
                                getOptionLabel={(option) => option.title || ""}
                                onChange={handleSelect} 
                                onKeyDown={handleEnter}
                                inputValue={input}
                                onInputChange={(e, value, reason) => {
                                    if(reason === "reset"){
                                        setInput("")
                                        return
                                    }
                                    setInput(value)
                                }}
                                filterOptions={(options) => 
                                    input.length === 0
                                    ? []
                                    : options.filter((option) =>
                                        option.title.toLowerCase().includes(input.toLowerCase())
                                        )
                                }
                                renderInput={(params) => (
                                    <TextField
                                    {...params}
                                    variant="standard"
                                    // slotProps={{
                                    //     input: {
                                    //         ...params.InputProps,
                                    //         type: 'search',
                                    //     },
                                    // }}
                                    />
                                )}
                            /> */}
                            <TextField variant="standard" slotProps={{input : {disableUnderline: true}}} onChange={handleChange}></TextField >
                            {/* <TextField variant="standard" slotProps={{input : {disableUnderline: true}}} onChange={handleChange} onKeyDown={handleEnter}></TextField > */}
                        </Box>
                        <NavLink to={"/cart"}>
                            <Badge badgeContent={noOfItems} color="secondary">
                                <ShoppingCartIcon sx={{fontSize: 33}}/> 
                            </Badge>
                        </NavLink>
                        <Tooltip title="Account settings">
                            <IconButton sx={{mr: -2, ml: 1}} onClick={handleMenu}>
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
                                <MenuItem onClick={handleAuth} id="orders">My Orders</MenuItem>
                                <MenuItem onClick={handleAuth} id="login">{userState.userName? "Logout" : "Login"}</MenuItem>
                                <MenuItem onClick={handleAuth} id="wishlist">My Wishlist</MenuItem>
                            </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    )
}

export default NavBar