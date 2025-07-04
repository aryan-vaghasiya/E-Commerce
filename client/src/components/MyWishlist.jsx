import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import React from 'react'
import CartItem from './CartItem'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import WishlistItem from './WishlistItem'

function MyWishlist() {
    const productState = useSelector(state => state.productReducer.products)
    const wishlist = useSelector(state => state.wishlistReducer)
    // console.log(productState);
    
    const filtered = productState.filter(item => wishlist.includes(item.id))

    // console.log(filtered);
    
    
    // const productState = useSelector(state => state.cartReducer.products)
    // const noOfItems = useSelector(state => state.cartReducer.noOfItems)
    const noOfItems = filtered.length
    const cartValue = useSelector(state => state.cartReducer.cartValue)
    const userState = useSelector(state => state.userReducer)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    return (
        <Box>
            {
                // loading ?
                //     (
                //         <Box sx={{ display: "flex", flexDirection: "column", bgcolor: "#EEEEEE", alignItems: "center", minHeight: "91vh" }}>
                //             {
                //                 Array.from(Array(5)).map((_, index) => (
                //                     <Card key={index} sx={{ display: "inline-flex", width: "70%", mx: "auto", mt: 2 }}>
                //                         <Skeleton variant='rounded' sx={{ minHeight: 250, minWidth: 200, m: 1 }} animation="wave"></Skeleton>
                //                         <Box sx={{ width: "100%", mx: 1, mt: 1.5 }}>
                //                             <Skeleton variant='text' sx={{ fontSize: 28, width: "95%" }} animation="wave"></Skeleton>
                //                             <Skeleton variant='text' sx={{ fontSize: 60, width: "95%", mt: -2.5 }} animation="wave"></Skeleton>
                //                             <Skeleton variant='text' sx={{ fontSize: 15, width: "25%", mt: -1.5 }} animation="wave"></Skeleton>
                //                             <Skeleton variant='text' sx={{ fontSize: 15, width: "10%" }} animation="wave"></Skeleton>
                //                             <Skeleton variant='text' sx={{ fontSize: 18, width: "25%" }} animation="wave"></Skeleton>
                //                             <Skeleton variant='text' sx={{ fontSize: 18, width: "25%" }}animation="wave"></Skeleton>
                //                             <Box>
                //                                 <Skeleton variant='rounded' height={37} width={"12%"} sx={{ mx: "auto" }} animation="wave"></Skeleton>
                //                             </Box>
                //                         </Box>
                //                     </Card>
                //                 ))
                //             }
                //         </Box>
                //     )
                //     :
                    (
                        <Box sx={{ display: "flex", flexDirection: "column", bgcolor: "#EEEEEE", alignItems: "center", minHeight: "91vh" }}>
                            {
                                filtered.length === 0 ?
                                    (
                                        <Box sx={{ display: "block", margin: "auto" }}>
                                            <Typography component="h1">Your Wishlist is Empty...</Typography>
                                            <Button variant="contained" onClick={() => navigate("/")} sx={{ width: "100%", my: 1 }}>Add Something</Button>
                                        </Box>
                                    )
                                    :
                                    (
                                        <Typography sx={{ mt: 1 }}>({noOfItems}) Items in WishList</Typography>
                                    )
                            }
                            {
                                filtered.map(item =>
                                    <Box key={item.id}>
                                        <WishlistItem item={item} />
                                    </Box>
                                )
                            }
                            {
                                // filtered.length > 0 ?
                                //     <Box textAlign="center">
                                //         <Typography>Cart Value: ${cartValue}</Typography>
                                //         {/* <Button variant='contained' onClick={checkOutNavigate} sx={{ my: 1 }}>Checkout</Button > */}
                                //     </Box>
                                //     :
                                //     null
                            }
                        </Box>
                    )
            }
        </Box>
    )
}

export default MyWishlist
