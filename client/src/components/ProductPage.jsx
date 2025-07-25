import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router'
import StarIcon from '@mui/icons-material/Star'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Toolbar from '@mui/material/Toolbar'
import { addToCart } from '../redux/cart/cartActions'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { faL } from '@fortawesome/free-solid-svg-icons'
import Skeleton from '@mui/material/Skeleton'
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

import styled from 'styled-components'
import { ButtonBlue } from './ProductItem'
import { addWishlistDb, removeWishlistDb } from '../redux/wishlist/wishlistActions'
import { hideSnack, showSnack } from '../redux/snackbar/snackbarActions'
import { getImageUrl } from '../utils/imageUrl'

const ButtonRed = styled(ButtonBlue)`
background-color: red;
color: white;
`

function ProductPage() {

    const [imgIndex, setImgIndex] = useState(0)
    // const [wishlisted, setWishlisted] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const wishlistState = useSelector(state => state.wishlistReducer)
    const userState = useSelector(state => state.userReducer)
    const snackbarState = useSelector((state) => state.snackbarReducer)

    const { productId } = useParams()
    // const products = useSelector(state => state.productReducer.products)
    // const product = products.find( item => item.id === parseInt(productId))

    const [product, setProduct] = useState(null)
    const [snack, setSnack] = useState(false)
    // console.log(product);

    useEffect(() => {
        const timeOut1 = setTimeout(() => {
            // fetch(`https://dummyjson.com/products/${productId}`)
            fetch(`http://localhost:3000/products/${productId}`)
            .then(res => res.json())
            .then(data => setProduct(data))
        },1000)      

        return () => clearTimeout(timeOut1)
    }, [productId])

    // console.log(product);

    const handleBuyNow = () => {
        if(userState.userName){
            dispatch(addToCart(product))
            navigate("/checkout")
        }
        dispatch(showSnack({message: "Please Login to Buy", severity: "warning"}))
    }

    const handleAddToCart = () => {
        // setSnack(true)
        dispatch(addToCart(product))
    }

    const handleClose = () => {
        setSnack(false)
    }

    const handleWishlist = () => {
        if(userState.userName){
            if(!wishlistState.products.some(item => item.id === product.id)){
                dispatch(addWishlistDb(product))
            }
            else{
                dispatch(removeWishlistDb(product))
            }
            // setWishlisted(prev => !prev)
            console.log(wishlistState.products.includes({id: product.id}));
        }
        else{
            dispatch(showSnack({message: "Please Login to Add to Wishlist", severity: "warning"}))
        }
    }


    // const isoDate = product.reviews[0].date
    // const date = new Date(isoDate)

    return (
        <Box sx={{ display: "flex", bgcolor: "#EEEEEE", justifyContent: "center", minHeight: "91vh" }}>
            {
                product ?
                    (
                        <Card sx={{ display: "inline-flex", width: "90%" }}>
                            {/* {
                                snack ?
                                <Snackbar
                                open={snack}
                                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                                autoHideDuration={1000}
                                onClose={handleClose}
                                sx={{
                                    '&.MuiSnackbar-root': { top: '70px' },
                                }}
                            >
                                <Alert severity="success" onClose={handleClose} variant='filled'>
                                    Added to cart!
                                </Alert>
                            </Snackbar>
                            :
                            null
                            } */}

                            <Snackbar
                                open={snackbarState.show}
                                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                                autoHideDuration={1000}
                                onClose={() => dispatch(hideSnack())}
                                sx={{
                                    '&.MuiSnackbar-root': { top: '70px' },
                                }}
                            >
                                <Alert onClose={() => dispatch(hideSnack())} severity={snackbarState.severity} variant="filled">
                                    {snackbarState.message}
                                </Alert>
                            </Snackbar>
                            
                            <Box>
                                <Card sx={{ mb: "auto", position: "relative", mt: 2, mx: 3 }}>
                                    <CardMedia
                                        component="img"
                                        sx={{ height: 450, width: 450}}
                                        image={getImageUrl(product.images[imgIndex])}
                                        alt="Product Image"
                                    />
                                    <IconButton
                                        sx={{ position: "absolute", top: "7%", right: 12, transform: "translateY(-50%)" }}
                                        onClick={handleWishlist}
                                    >
                                        {
                                        wishlistState.products.some(item => item.id === product.id)?
                                        <FavoriteIcon color='primary'></FavoriteIcon>
                                        :
                                        <FavoriteBorderIcon color='primary'></FavoriteBorderIcon>
                                        }
                                    </IconButton>
                                    <IconButton
                                        onClick={() => setImgIndex((prev) => (prev - 1 + product.images.length) % product.images.length)}
                                        color='primary'
                                        sx={{ position: "absolute", top: "50%", left: 10, transform: "translateY(-50%)" }}>
                                        <ArrowBackIosIcon></ArrowBackIosIcon>
                                    </IconButton>
                                    <IconButton
                                        onClick={() => setImgIndex((prev) => (prev + 1) % product.images.length)}
                                        color='primary'
                                        sx={{ position: "absolute", top: "50%", right: 10, transform: "translateY(-50%)" }}>
                                        <ArrowForwardIosIcon></ArrowForwardIosIcon>
                                    </IconButton>
                                    <Typography sx={{ position: "absolute", bottom: "1%", left: "50%" }}>
                                        {imgIndex + 1}/{product.images.length}
                                    </Typography>
                                </Card>
                                <Toolbar>

                                    <Button disabled={!product.stock > 0 || product.status != "active"} variant='outlined' sx={{ width: "100%", mt: 1, mr: 2 }}
                                        onClick={handleAddToCart}
                                    >Add to Cart</Button>
                                    {/* <ButtonRed onClick={handleAddToCart}>ADD TO CART</ButtonRed> */}
                                    <Button disabled={!product.stock > 0 || product.status != "active"} variant='outlined' sx={{ width: "100%", mt: 1 }}
                                        onClick={handleBuyNow}
                                    >Buy Now</Button>
                                </Toolbar>
                            </Box>

                            <CardContent>
                                <Typography variant='h4' component="h1" sx={{mt: 1}}>
                                    {product.title}
                                </Typography>
                                <Typography>
                                    Brand: {product.brand}
                                </Typography>
                                <Box sx={{ display: "inline-flex", alignItems: "center" }}>
                                    <StarIcon sx={{ color: "#FF8C00", fontSize: 20 }}></StarIcon>
                                    <Typography sx={{ fontSize: 16, pt: 0.2, pl: 0.2 }}>
                                        {product.rating}
                                    </Typography>
                                </Box>
                                <br />
                                <Box sx={{ display: "inline-flex", alignItems: "center", mt: 1 }}>
                                    <Typography variant='h5'>
                                        ${product.price}
                                    </Typography>
                                    {/* {product.discount > 0? */}
                                    {product.discount || product.offer_discount?
                                    <Box sx={{display: "flex", alignItems: "center"}}>
                                        <Typography color='gray' sx={{ ml: 1, }}>
                                            {/* <s>${parseFloat((product.price + product.price / 100 * product.discount).toFixed(2))}</s> */}
                                            <s>${product.mrp}</s>
                                        </Typography>
                                        <Typography variant='h6' color='success' sx={{ ml: 1 }}>
                                            {product.offer_discount ?? product.discount}%
                                        </Typography>
                                        {
                                            product.offer_discount?
                                            <Typography sx={{bgcolor: '#1976D2', color: "white", borderRadius: 1, px: 1, ml: 1, fontSize: 15}}>Limited time deal</Typography>
                                            :
                                            null
                                        }
                                    </Box>
                                    :
                                    null}
                                </Box>

                                {
                                product.stock > 0?
                                <Box sx={{mt: 1}}>
                                    <Typography color='warning' sx={{}}>
                                        Hurry, only {product.stock} left!
                                    </Typography>
                                </Box>
                                :
                                <Box sx={{mt: 1}}>
                                    <Typography color='error' sx={{}}>
                                        Currently Out of Stock!
                                    </Typography>
                                </Box>
                                }
                                <Box sx={{mt: 3}}>
                                    <Typography sx={{fontSize: 20}}>Description: </Typography>
                                    <Typography>{product.description}</Typography>
                                </Box>

                                {/* <Box sx={{mt: 1}}>
                                    <Typography color='info' sx={{fontSize: 14}}>
                                        {product.shippingInformation}
                                    </Typography>
                                </Box>

                                <Box sx={{width: "100%"}}>
                                    <Typography variant='h5'>Ratings & Reviews</Typography>
                                    <Card>
                                        <Typography>{product.reviews[0].reviewerName}</Typography>
                                        <Typography>{date.toLocaleString()}</Typography>
                                    </Card>
                                </Box> */}
                            </CardContent>
                        </Card>
                    )

                    :

                    (
                        <Card sx={{ display: "inline-flex", width: "90%" }}>
                            <Box>
                                <Card sx={{ mb: "auto", position: "relative", mt: 2, mx: 3 }}>
                                    <Skeleton width={450} height={450} variant='rounded' animation="wave"></Skeleton>
                                    
                                </Card>
                                <Toolbar>
                                    <Skeleton width={"50%"} height={37} variant='rounded' sx={{mt: 2, mr: 2}} animation="wave"></Skeleton>
                                    <Skeleton width={"50%"} height={37} variant='rounded' sx={{mt: 2}} animation="wave"></Skeleton>
                                </Toolbar>
                            </Box>
                            <CardContent sx={{width: "100%"}}>
                                <Skeleton variant='text' sx={{fontSize: 40, width: "90%"}} animation="wave"></Skeleton>
                                <Skeleton variant='text' sx={{fontSize: 20, width: "20%", mt: -1}} animation="wave"></Skeleton>
                                <Skeleton variant='text' sx={{fontSize: 18, width: "7%"}} animation="wave"></Skeleton>
                                <Box sx={{ display: "inline-flex", alignItems: "center" , width:"100%"}}>
                                    <Skeleton variant='text' sx={{fontSize: 30, width: "25%"}} animation="wave"></Skeleton>
                                </Box>
                                {/* <Skeleton variant='text' sx={{fontSize: 18, width: "20%", mt: -0.5}} animation="wave"></Skeleton> */}
                            </CardContent>
                        </Card>

                    )
            }
        </Box>
    )
}

export default ProductPage
