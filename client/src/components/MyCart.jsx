import { useDispatch, useSelector } from 'react-redux'
import CartItem from './CartItem'
import { useLocation, useNavigate } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Skeleton from '@mui/material/Skeleton'
import { useEffect, useState } from 'react'
import { hideSnack, showSnack } from '../redux/snackbar/snackbarActions'
import { fetchCart } from '../redux/cart/cartActions'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

function MyCart() {
    const productState = useSelector(state => state.cartReducer.products)
    const noOfItems = useSelector(state => state.cartReducer.noOfItems)
    const cartValue = useSelector(state => state.cartReducer.cartValue)
    const userState = useSelector(state => state.userReducer)
    const snackbarState = useSelector(state => state.snackbarReducer)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(true)

    const checkOutNavigate = async () => {
        if (userState.token) {
            const res = await fetch("http://localhost:3000/auth/check", {
                headers: {
                    Authorization: `Bearer ${userState.token}`
                }
            });
            if(!res.ok){
                navigate("/login", { state: "/checkout" })
                return dispatch(showSnack({ message: "Session Expired, Login Again", severity: "warning" }))
            }

            const compareWalletBalance = await fetch(`http://localhost:3000/wallet/compare-balance?amount=${cartValue}`, {
                headers: {
                    Authorization: `Bearer ${userState.token}`
                }
            })
            if(!compareWalletBalance.ok){
                return dispatch(showSnack({ message: "Wallet balance mismatch/Server Error", severity: "warning" }))
            }
            const canAfford = await compareWalletBalance.json()
            if(!canAfford){
                return dispatch(showSnack({ message: "Insufficient wallet balance", severity: "warning" }))
            }

            navigate("/checkout")
        }
        else {
            navigate("/login", { state: "/checkout" })
            return dispatch(showSnack({ message: "Please Login to access this Section", severity: "warning" }))
        }
    }

    useEffect(() => {
        if(userState.userName){
            dispatch(fetchCart(userState.token))
        }
        const timeOut = setTimeout(() => {
            setLoading(false)
        }, 1000)

        return () => clearInterval(timeOut)
    }, [])

    return (
        <Box>
            {loading ?
                (
                    <Box sx={{ display: "flex", flexDirection: "column", bgcolor: "#EEEEEE", alignItems: "center", minHeight: "91vh" }}>
                        {
                            Array.from(Array(5)).map((_, index) => (
                                <Card key={index} sx={{ display: "inline-flex", width: "70%", mx: "auto", mt: 2 }}>
                                    <Skeleton variant='rounded' sx={{ minHeight: 250, minWidth: 200, m: 1 }} animation="wave"></Skeleton>
                                    <Box sx={{ width: "100%", mx: 1, mt: 1.5 }}>
                                        <Skeleton variant='text' sx={{ fontSize: 28, width: "95%" }} animation="wave"></Skeleton>
                                        <Skeleton variant='text' sx={{ fontSize: 60, width: "95%", mt: -2.5 }} animation="wave"></Skeleton>
                                        <Skeleton variant='text' sx={{ fontSize: 15, width: "25%", mt: -1.5 }} animation="wave"></Skeleton>
                                        <Skeleton variant='text' sx={{ fontSize: 15, width: "10%" }} animation="wave"></Skeleton>
                                        <Skeleton variant='text' sx={{ fontSize: 18, width: "25%" }} animation="wave"></Skeleton>
                                        <Skeleton variant='text' sx={{ fontSize: 18, width: "25%" }}animation="wave"></Skeleton>
                                        <Box>
                                            <Skeleton variant='rounded' height={37} width={"12%"} sx={{ mx: "auto" }} animation="wave"></Skeleton>
                                        </Box>
                                    </Box>
                                </Card>
                            ))
                        }
                    </Box>
                )
                :
                (
                    <Box sx={{ display: "flex", flexDirection: "column", bgcolor: "#EEEEEE", alignItems: "center", minHeight: "91vh" }}>
                        <Snackbar
                            open={snackbarState.show}
                            anchorOrigin={{ vertical: "top", horizontal: "center" }}
                            autoHideDuration={2000}
                            onClose={() => dispatch(hideSnack())}
                            sx={{
                                '&.MuiSnackbar-root': { top: '70px' },
                            }}
                        >
                            <Alert onClose={() => dispatch(hideSnack())} severity={snackbarState.severity} variant="filled">
                                {snackbarState.message}
                            </Alert>
                        </Snackbar>
                        {productState.length === 0 ?
                            <Box sx={{ display: "block", margin: "auto" }}>
                                <Typography component="h1">Your Cart is Empty...</Typography>
                                <Button variant="contained" onClick={() => navigate("/")} sx={{ width: "100%", my: 1 }}>Buy Something</Button>
                            </Box>
                            :
                            <Typography sx={{ mt: 1 }}>({noOfItems}) Items in Cart</Typography>
                        }
                        {productState.map(item =>
                            <Box key={item.id}>
                                <CartItem item={item} />
                            </Box>
                            )
                        }
                        {productState.length > 0 ?
                            <Box textAlign="center">
                                <Typography>Cart Value: ${cartValue}</Typography>
                                {/* {productState.some(item => item.stock === 0)? */}
                                {productState.some(item => item.stock < item.quantity || item.status != "active")?
                                
                                <Box>
                                    <Typography color='error'>Some of the Items in your cart are either Out Of Stock or Unlisted, Please remove them to Checkout</Typography>
                                    <Button variant='contained' disabled onClick={checkOutNavigate} sx={{ my: 1 }}>Checkout</Button >
                                </Box>
                                :
                                <Button variant='contained' onClick={checkOutNavigate} sx={{ my: 1 }}>Checkout</Button >
                                }
                            </Box>
                            :
                            null
                        }
                    </Box>
                )
            }
        </Box>
    )
}

export default MyCart