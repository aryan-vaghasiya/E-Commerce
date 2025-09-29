// import { useDispatch, useSelector } from 'react-redux'
// import { addToCart } from '../redux/cart/cartActions'
// import { Link } from 'react-router'
// import Button from '@mui/material/Button'
// import Card from '@mui/material/Card'
// import CardContent from '@mui/material/CardContent'
// import CardMedia from '@mui/material/CardMedia'
// import CardActions from '@mui/material/CardActions'
// import CardActionArea from '@mui/material/CardActionArea'
// import Typography from '@mui/material/Typography'
// import StarIcon from '@mui/icons-material/Star';
// import Box from '@mui/material/Box'
// import { showSnack } from '../redux/snackbar/snackbarActions'
// import Skeleton from '@mui/material/Skeleton'
// import FavoriteIcon from '@mui/icons-material/Favorite';
// import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
// import { addWishlistDb, removeWishlistDb } from '../redux/wishlist/wishlistActions'
// import { getImageUrl } from '../utils/imageUrl'

// function ProductItem({product, loading}) {
//     const dispatch = useDispatch()
//     const userState = useSelector(state => state.userReducer)

//     const handleAddToCart = () => {
//         dispatch(addToCart(product))
//     }

//     const handleWishlist = () => {
//         if(userState.userName){
//             if(!product.wishlisted){
//                 dispatch(addWishlistDb(product))
//             }
//             else{
//                 dispatch(removeWishlistDb(product))
//             }
//         }
//         else{
//             dispatch(showSnack({message: "Please Login to Add to Wishlist", severity: "warning"}))
//         }
//     }

//     return (
//         <Box>
//             {loading?
//                 <Card sx={{height: "100%", minWidth: "200px"}}>
//                     <CardContent>
//                         <Skeleton variant='rounded' height={300} animation="wave"></Skeleton>
//                         <Skeleton variant='text' sx={{fontSize: 16, mt: 0.5}} animation="wave"></Skeleton>
//                         <Skeleton variant='text' sx={{fontSize: 14, width: "50%"}} animation="wave"></Skeleton>
//                         <Skeleton variant='text' sx={{fontSize: 14, width: "25%"}} animation="wave"></Skeleton>
//                         <Skeleton variant='text' sx={{fontSize: 15, width: "25%"}} animation="wave"></Skeleton>
//                         <Box sx={{display: "flex"}}>
//                             <Skeleton variant='rounded' height={37} sx={{mt: 2, mb: 1.5,mr: 1, width: "75%"}} animation="wave"></Skeleton>
//                             <Skeleton variant='rounded' height={37} sx={{mt: 2, mb: 1.5, width: "25%"}} animation="wave"></Skeleton>
//                         </Box>
//                     </CardContent>
//                 </Card>

//                 :

//                 <Card 
//                     sx={{
//                         transition: "transform .15s ease, box-shadow .15s ease",
//                         "&:hover": { transform: "translateY(-3px)", boxShadow: 4 },
//                     }}
//                 >
//                     <CardContent>
//                         <Link to={`/products/${product.id}`}>
//                             <CardActionArea>
//                                 <CardMedia
//                                     component="img"
//                                     image={getImageUrl(product.thumbnail)}
//                                     alt="Product Image"
//                                     sx={{ maxHeight: 300, objectFit: "contain"}}
//                                 />
//                                 <Typography level="h3" noWrap sx={{width: "99%"}}>{product.title}</Typography>
//                                 {product.brand ?
//                                     <Typography sx={{fontSize: 13}}>Brand: {product.brand}</Typography>
//                                     :
//                                     <Typography sx={{fontSize: 13}}>Brand: Generic</Typography>
//                                 }
//                                 <Box sx={{display: "inline-flex", alignItems: "center"}}>
//                                     <StarIcon sx={{color: "#FF8C00", fontSize: 20}}></StarIcon>
//                                     <Typography sx={{fontSize: 14, pt: 0.3, pr: 0.2}}>
//                                         {(product.rating).toFixed(1)}
//                                     </Typography>
//                                 </Box>
//                                 <Box sx={{display: "flex", alignItems: "center"}}>
//                                 <Typography sx={{fontSize: 16}}>${(product.price).toFixed(2)}</Typography>
//                                 {product.offer_discount?
//                                     <Typography 
//                                         sx={{bgcolor: '#1976D2', color: "white", borderRadius: 1, px: 1, ml: 1, fontSize: 13,}}
//                                     >
//                                         Limited time deal
//                                     </Typography>
//                                     :
//                                     null
//                                 }
//                                 </Box>
//                             </CardActionArea>
//                         </Link>
//                         <CardActions sx={{px: 0}}>
//                             {product.stock > 0 || product.status !== "active"?
//                                 <Button disabled={false} variant='outlined' sx={{width: "75%", mt: 1}}
//                                     onClick={handleAddToCart}
//                                 >
//                                     Add to Cart
//                                 </Button>
//                                 :
//                                 <Button disabled={true} color='error' variant='outlined' sx={{width: "75%", mt: 1}}
//                                     onClick={handleAddToCart}
//                                 >
//                                     Out of Stock
//                                 </Button>
//                             }
//                             <Button variant='outlined' sx={{mt: 1, width: "25%"}} onClick={handleWishlist}>
//                                 {product.wishlisted ?
//                                     <FavoriteIcon></FavoriteIcon>
//                                     :
//                                     <FavoriteBorderIcon></FavoriteBorderIcon>
//                                 }
//                             </Button>
//                         </CardActions>
//                     </CardContent>
//                 </Card>
//             }
//         </Box>
//     )
// }

// export default ProductItem



import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import {
    Button, Card, CardContent, CardMedia, CardActions, Typography,
    Box, Skeleton, Chip, Rating, Tooltip
} from '@mui/material';
import { AddShoppingCart, Favorite, FavoriteBorder } from '@mui/icons-material';
import { addToCart } from '../redux/cart/cartActions';
import { showSnack } from '../redux/snackbar/snackbarActions';
import { addWishlistDb, removeWishlistDb } from '../redux/wishlist/wishlistActions';
import { getImageUrl } from '../utils/imageUrl';

const calculateDiscount = (mrp, price) => {
    if (!mrp || mrp <= price) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
};

function ProductItem({ product, loading }) {
    const dispatch = useDispatch();
    const { userName } = useSelector(state => state.userReducer);

    if (loading) {
        return (
            <Card sx={{ height: "100%", width:"100%", display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <Skeleton variant='rectangular' height={180} animation="wave" />
                <CardContent sx={{ flexGrow: 1 }}>
                    <Skeleton variant='text' sx={{ fontSize: '1rem' }} animation="wave" />
                    <Skeleton variant='text' sx={{ width: "60%" }} animation="wave" />
                    <Skeleton variant='text' sx={{ width: "30%", mt: 1 }} animation="wave" />
                </CardContent>
                <CardActions>
                    <Skeleton variant='rounded' height={36} sx={{ width: '100%' }} animation="wave" />
                </CardActions>
            </Card>
        );
    }

    const discountPercent = calculateDiscount(product.mrp, product.price);

    const handleAddToCart = () => {
        dispatch(addToCart(product));
        // dispatch(showSnack({ message: `${product.title} added to cart`, severity: "success" }));
    };

    const handleWishlist = () => {
        if (!userName) {
            dispatch(showSnack({ message: "Please Login to Add to Wishlist", severity: "warning" }));
            return;
        }
        if (product.wishlisted) {
            dispatch(removeWishlistDb(product));
        } else {
            dispatch(addWishlistDb(product));
        }
    };

    const isOutOfStock = product.stock === 0;

    return (
        <Card sx={{
            height: "100%",
            width:"100%",
            // maxWidth: 400,
            // mx: "auto",
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            transition: "transform .2s ease, box-shadow .2s ease",
            "&:hover": { transform: "translateY(-5px)", boxShadow: 6 },
            position: 'relative',
        }}>
            {discountPercent > 0 && (
                <Chip
                    label={`${discountPercent}% OFF`}
                    color="primary"
                    size="small"
                    sx={{ position: 'absolute', top: 8, left: 8, fontWeight: 'bold' }}
                />
            )}
            
            <Box component={Link} to={`/products/${product.id}`} sx={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flexGrow: 1, width: "100%", minWidth: 0 }}>
                <CardMedia
                    component="img"
                    image={getImageUrl(product.thumbnail)}
                    alt={product.title}
                    sx={{ height: 180, objectFit: 'contain', p: 1 }}
                />
                <CardContent sx={{ flexGrow: 1, pb: 0, width: '100%' }}>
                    <Typography variant="body2" color="text.secondary" noWrap>{product.brand}</Typography>
                    {/* <Tooltip title={product.title} placement="top" noWrap> */}
                        <Typography gutterBottom noWrap variant="h6" component="h2" sx={{
                            // overflow: 'hidden',
                            // textOverflow: 'ellipsis',
                            // display: '-webkit-box',
                            // WebkitLineClamp: 2,
                            // WebkitBoxOrient: 'vertical',
                            minHeight: '2rem'
                        }}>
                            {product.title}
                        </Typography>
                    {/* </Tooltip> */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating name="read-only" value={product.rating} precision={0.1} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>({product.rating.toFixed(1)})</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                        <Typography variant="h5" color="text.primary">${product.price.toFixed(2)}</Typography>
                        {discountPercent > 0 && (
                            <Typography variant="body1" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                                ${product.mrp.toFixed(2)}
                            </Typography>
                        )}
                    </Box>
                    {product.offer_discount?
                        <Box sx={{display: "flex", pt: 0.5}}>
                            <Typography 
                                sx={{bgcolor: '#1976D2', color: "white", borderRadius: 1, px: 1, fontSize: 13,}}
                            >
                                Limited time deal
                            </Typography>
                        </Box>
                        :
                        null
                    }
                </CardContent>
            </Box>

            <CardActions sx={{ mt: 'auto', p: 2, pt: 1, width: "100%"}}>
                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    startIcon={<AddShoppingCart />}
                    sx={{ mr: 1 }}
                >
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                <Tooltip title={product.wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}>
                    <Button variant='outlined' onClick={handleWishlist} sx={{ minWidth: '40px', p: '7px' }} color={product.wishlisted ? "error" : "primary"} >
                        {product.wishlisted ? <Favorite /> : <FavoriteBorder />}
                    </Button>
                </Tooltip>
            </CardActions>
        </Card>
    );
}

export default ProductItem;