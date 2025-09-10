import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import React, { useEffect, useState } from 'react'
import CartItem from './CartItem'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import WishlistItem from './WishlistItem'
import { getFullWishlist } from '../redux/wishlist/wishlistActions'

function MyWishlist() {
    const productState = useSelector(state => state.productReducer.products)
    const wishlist = useSelector(state => state.wishlistReducer)
    const token = useSelector(state => state.userReducer.token)

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const timeOut = setTimeout(() => {
            setLoading(false)
        }, 1000)

        return () => clearInterval(timeOut)
    }, [])
    useEffect(() => {
        dispatch(getFullWishlist(token))
    }, [])

    const userState = useSelector(state => state.userReducer)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const noOfItems = wishlist.noOfItems

    return (
        <Box sx={{mb: "auto"}}>
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
                                wishlist.products.length === 0 ?
                                    <Box sx={{ display: "block", margin: "auto" }}>
                                        <Typography component="h1">Your Wishlist is Empty...</Typography>
                                        <Button variant="contained" onClick={() => navigate("/")} sx={{ width: "100%", my: 1 }}>Add Something</Button>
                                    </Box>
                                    :
                                    <Typography sx={{ mt: 1 }}>({noOfItems}) Items in Wish List</Typography>
                            }
                            {
                                wishlist.products.map(item =>
                                    <Box key={item.id} sx={{width: {xs: "90%", sm: "100%"}}}>
                                        <WishlistItem item={item} />
                                    </Box>
                                )
                            }
                        </Box>
                    )
            }
        </Box>
    )
}

export default MyWishlist
