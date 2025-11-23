import { memo, useCallback, useState } from 'react';
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

const ProductItemSkeleton = () => (
    <Card sx={{ 
        height: "100%", 
        width: { xs: "100%", sm: 275 },
        mx: "auto",
        display: 'flex', 
        flexDirection: 'column', 
        minWidth: 0 
    }}>
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

const selectUserName = (state) => state.userReducer.userName;

function ProductItem({ product, loading = true }) {
    const dispatch = useDispatch();
    const userName = useSelector(selectUserName);
    const [wishlisted, setWishlisted] = useState(product?.wishlisted)

    const handleWishlist = useCallback(() => {
        if (!userName) {
            dispatch(showSnack({ 
                message: "Please Login to Add to Wishlist", 
                severity: "warning" 
            }));
            return;
        }
        
        // if (product.wishlisted) {
        if (wishlisted) {
            dispatch(removeWishlistDb(product));
        } else {
            dispatch(addWishlistDb(product));
        }
        setWishlisted(prev => !prev)
    }, [dispatch, product, userName]);

    if (loading) {
        return <ProductItemSkeleton />;
    }

    if (!product || !product.id) {
        return null;
    }

    const discountPercent = calculateDiscount(product.mrp, product.price);
    const isOutOfStock = product.stock === 0;
    const thumbnailUrl = getImageUrl(product.thumbnail);

    return (
        <Card sx={{
            height: "100%",
            width: { xs: "100%", sm: 275 },
            mx: "auto",
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            "&:hover": { 
                transform: "translateY(-5px)", 
                boxShadow: 6 
            },
            position: 'relative',
        }}>
            {discountPercent > 0 &&
                <Chip
                    label={`${discountPercent}% OFF`}
                    color="primary"
                    size="small"
                    sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        left: 8, 
                        fontWeight: 'bold',
                        zIndex: 1 
                    }}
                />
            }
            
            <Box 
                component={Link}
                to={`/products/${product.id}`}
                sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    width: "100%",
                    minWidth: 0
                }}
            >
                <CardMedia
                    component="img"
                    image={thumbnailUrl}
                    alt={product.title || 'Product image'}
                    loading="lazy"
                    sx={{
                        height: 180,
                        objectFit: 'contain',
                        p: 1,
                        bgcolor: 'background.paper'
                    }}
                />
                <CardContent sx={{ flexGrow: 1, pb: 0, width: '100%' }}>
                    {product.brand &&
                        <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            noWrap
                        >
                            {product.brand}
                        </Typography>
                    }
                    <Typography 
                        gutterBottom 
                        noWrap 
                        variant="h6" 
                        component="h2" 
                        sx={{ minHeight: '2rem' }}
                    >
                        {product.title || 'Untitled Product'}
                    </Typography>
                    
                    {product.rating != null &&
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Rating 
                                name="read-only" 
                                value={product.rating} 
                                precision={0.1} 
                                readOnly 
                                size="small" 
                            />
                            <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ ml: 0.5 }}
                            >
                                {product.rating?.toFixed(1)}
                            </Typography>
                        </Box>
                    }
                    
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                        <Typography variant="h5" color="text.primary">
                            ${product.price?.toFixed(2)}
                        </Typography>
                        {discountPercent > 0 &&
                            <Typography 
                                variant="body1" 
                                color="text.secondary" 
                                sx={{ textDecoration: 'line-through' }}
                            >
                                ${product.mrp?.toFixed(2)}
                            </Typography>
                        }
                    </Box>
                    
                    {product.offer_discount &&
                        <Box sx={{ display: "flex", pt: 0.5 }}>
                            <Typography 
                                sx={{
                                    bgcolor: 'primary.main', 
                                    color: "white", 
                                    borderRadius: 1, 
                                    px: 1, 
                                    py: 0.25,
                                    fontSize: 13,
                                }}
                            >
                                Limited time deal
                            </Typography>
                        </Box>
                    }
                </CardContent>
            </Box>

            <CardActions sx={{ mt: 'auto', p: 2, pt: 1, width: "100%" }}>
                <Button
                    variant="contained"
                    fullWidth
                    onClick={() => dispatch(addToCart(product))}
                    disabled={isOutOfStock}
                    startIcon={<AddShoppingCart />}
                    sx={{ mr: 1 }}
                    aria-label={isOutOfStock ? 'Out of stock' : 'Add to cart'}
                >
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                <Tooltip title={wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}>
                    <Button 
                        variant='outlined' 
                        onClick={handleWishlist} 
                        sx={{ minWidth: '40px', p: '7px' }} 
                        color={wishlisted ? "error" : "primary"}
                        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        {wishlisted ? <Favorite /> : <FavoriteBorder />}
                    </Button>
                </Tooltip>
            </CardActions>
        </Card>
    );
}

export default memo(ProductItem);