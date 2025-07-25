import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../redux/cart/cartActions'
import { Link } from 'react-router'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import CardActions from '@mui/material/CardActions'
import CardActionArea from '@mui/material/CardActionArea'
import Typography from '@mui/material/Typography'
import StarIcon from '@mui/icons-material/Star';
import Box from '@mui/material/Box'
import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import { showSnack } from '../redux/snackbar/snackbarActions'
import Skeleton from '@mui/material/Skeleton'
import loadingImg from "../assets/loading-img.jpg"
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { addToWishlist, addWishlistDb, removeFromWishlist, removeWishlistDb } from '../redux/wishlist/wishlistActions'

import styled from "styled-components";
import IconButton from '@mui/material/IconButton'
import { getImageUrl } from '../utils/imageUrl'

export const ButtonBlue = styled.button`
background-color: ${props => props.$variant === "contained" ? "#1976d2" : "white"};
color: ${props => props.$variant === "contained" ? "white" : "#1976d2"};
border: ${props => props.$variant === "outlined" ? `1px solid #1976d2` : `none` } ;
border-radius: 5px;
width: 100%;
height: 100%;
padding-top: 7px;
padding-bottom: 7px;
margin-top: 8px;
font-size: 14px;
font-weight: bold;
&:hover {
background-color: #EEEEEE;
}
&:active {
transform: scale(0.95)
}
`;

function ProductItem({product, loading}) {
    const dispatch = useDispatch()
    // const [wishlisted, setWishlisted] = useState(false)
    const wishlistState = useSelector(state => state.wishlistReducer)
    const userState = useSelector(state => state.userReducer)
    // console.log(product);
    
    // const included = wishlistState.includes(product.id)
    // console.log(included);
    

    const handleAddToCart = () => {
        dispatch(addToCart(product))
        // dispatch(showSnack({message: "Item added to Cart", severity: "success"}))
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

    return (
            <Box>
                {
                    loading? (
                        <Card sx={{mb: 2.5, height: "100%", minWidth: "200px" /* ,  display: "flex", alignItems: "stretch" */}}>
                            <CardContent>
                                <Skeleton variant='rounded' height={300} animation="wave"></Skeleton>
                                <Skeleton variant='text' sx={{fontSize: 16, mt: 0.5}} animation="wave"></Skeleton>
                                <Skeleton variant='text' sx={{fontSize: 14, width: "50%"}} animation="wave"></Skeleton>
                                <Skeleton variant='text' sx={{fontSize: 14, width: "25%"}} animation="wave"></Skeleton>
                                <Skeleton variant='text' sx={{fontSize: 15, width: "25%"}} animation="wave"></Skeleton>
                                <Box sx={{display: "flex"}}>
                                    <Skeleton variant='rounded' height={37} sx={{mt: 2, mb: 1.5,mr: 1, width: "75%"}} animation="wave"></Skeleton>
                                    <Skeleton variant='rounded' height={37} sx={{mt: 2, mb: 1.5, width: "25%"}} animation="wave"></Skeleton>
                                </Box>
                            </CardContent>
                        </Card>
                    )
                    :
                    (
                        <Card sx={{mb: 2.5, /* height: "100%",  display: "flex", alignItems: "stretch" */}}>
                        <CardContent>
                        <Link to={`/products/${product.id}`}>
                        <CardActionArea>
                            <CardMedia
                                component="img"
                                image={getImageUrl(product.thumbnail)}
                                alt="Product Image"
                                sx={{ minHeight: 300, objectFit: "contain" }}
                            />
                            <Typography level="h3">{product.title}</Typography>
                            {
                            product.brand ?
                            (<Typography sx={{fontSize: 13}}>Brand: {product.brand}</Typography>)
                            :
                            (<Typography sx={{fontSize: 13}}>Brand: Generic</Typography>)
                            }
                            <Box sx={{display: "inline-flex", alignItems: "center"}}>
                                <StarIcon sx={{color: "#FF8C00", fontSize: 20}}></StarIcon>
                                <Typography sx={{fontSize: 14, pt: 0.3, pr: 0.2}}>
                                    {product.rating}
                                </Typography>
                            </Box>
                            {/* <Typography sx={{fontSize: 16}}>${product.offer_price ?? product.price}</Typography> */}
                            <Box sx={{display: "flex", alignItems: "center"}}>
                            <Typography sx={{fontSize: 16}}>${product.price}</Typography>
                            {
                                product.offer_discount?
                                <Typography 
                                    sx={{bgcolor: '#1976D2', color: "white", borderRadius: 1, px: 1, ml: 1, fontSize: 13,}}>
                                    Limited time deal
                                </Typography>
                                :
                                null
                            }
                            </Box>
                            {/* <Typography sx={{fontSize: 16}}>{product.stock}</Typography> */}
                        </CardActionArea>
                        </Link>
                        <CardActions sx={{px: 0}}>

                            {/* <ButtonBlue $variant="outlined" onClick={handleAddToCart}>ADD TO CART</ButtonBlue> */}

                            {
                                product.stock > 0 || product.status !== "active"?
                                <Button disabled={false} variant='outlined' sx={{width: "75%", mt: 1}}
                                    onClick={handleAddToCart}
                                >Add to Cart</Button>
                                :
                                <Button disabled={true} color='error' variant='outlined' sx={{width: "75%", mt: 1}}
                                    onClick={handleAddToCart}
                                >OUT OF STOCK</Button>
                            }
                            {/* <IconButton></IconButton> */}
                            <Button variant='outlined' sx={{mt: 1, width: "25%"}} onClick={handleWishlist}>
                                {
                                    // wishlisted?
                                    // wishlistState.products.includes(product.id)?
                                    // wishlistState.products.includes({id: product.id, ...product})?
                                    wishlistState.products.some(item => item.id === product.id)?
                                    <FavoriteIcon></FavoriteIcon>
                                    :
                                    <FavoriteBorderIcon></FavoriteBorderIcon>
                                }
                            </Button>
                        </CardActions>
                        </CardContent>
                        </Card>
                    )
                }
                
            </Box>
    )
}

export default ProductItem
