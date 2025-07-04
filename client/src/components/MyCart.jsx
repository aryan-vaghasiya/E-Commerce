import { useDispatch, useSelector } from 'react-redux'
import CartItem from './CartItem'
import { useLocation, useNavigate } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Skeleton from '@mui/material/Skeleton'
import { useEffect, useState } from 'react'
import { showSnack } from '../redux/snackbar/snackbarActions'

function MyCart() {
    const productState = useSelector(state => state.cartReducer.products)
    const noOfItems = useSelector(state => state.cartReducer.noOfItems)
    const cartValue = useSelector(state => state.cartReducer.cartValue)
    const userState = useSelector(state => state.userReducer)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [loading, setLoading] = useState(true)

    const checkOutNavigate = async () => {

        if (userState.token) {
            const res = await fetch("http://localhost:3000/my-orders", {
                headers: {
                    Authorization: `Bearer ${userState.token}`
                    // Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXN`
                }
            });
            if (res.status === 200) {
                navigate("/checkout")
            }
            // else if(res.status === 402){
            //     dispatch(showSnack({message: "Please Login to access this Section", severity: "warning"}))
            //     navigate("/login", {state: "/my-orders"})
            // }
            else {
                dispatch(showSnack({ message: "Session Expired, Login Again", severity: "warning" }))
                navigate("/login", { state: "/checkout" })
            }
        }
        else {
            dispatch(showSnack({ message: "Please Login to access this Section", severity: "warning" }))
            return navigate("/login", { state: "/checkout" })
        }

        // if(userState.userName){
        //     navigate("/checkout")
        // }
        // else{
        //     return navigate("/login", { state: "/checkout"  })
        // }
    }

    useEffect(() => {
        const timeOut = setTimeout(() => {
            setLoading(false)
        }, 1000)

        return () => clearInterval(timeOut)
    }, [])

    return (
        <Box>
            {
                loading ?
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
                            {
                                productState.length === 0 ?
                                    (
                                        <Box sx={{ display: "block", margin: "auto" }}>
                                            <Typography component="h1">Your Cart is Empty...</Typography>
                                            <Button variant="contained" onClick={() => navigate("/")} sx={{ width: "100%", my: 1 }}>Buy Something</Button>
                                        </Box>
                                    )
                                    :
                                    (
                                        <Typography sx={{ mt: 1 }}>({noOfItems}) Items in Cart</Typography>
                                    )
                            }
                            {
                                productState.map(item =>
                                    <Box key={item.id}>
                                        <CartItem item={item} />
                                    </Box>
                                )
                            }
                            {
                                productState.length > 0 ?
                                    <Box textAlign="center">
                                        <Typography>Cart Value: ${cartValue}</Typography>
                                        <Button variant='contained' onClick={checkOutNavigate} sx={{ my: 1 }}>Checkout</Button >
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