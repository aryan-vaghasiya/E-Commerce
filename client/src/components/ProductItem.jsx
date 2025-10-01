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

    // // Normalize API response shape:
    // // Accepts either legacy { id, title, ... } or new { _id, _source: { ... } }
    // const normalizedProduct = (() => {
    //     if (!product) return null;

    //     const isApiShape = typeof product._id !== 'undefined' && product._source;
    //     if (isApiShape) {
    //         const src = product._source || {};
    //         return {
    //             id: product._id, // string per API
    //             title: src.title ?? '',
    //             description: src.description ?? '',
    //             rating: typeof src.rating === 'number' ? src.rating : 0,
    //             brand: src.brand ?? '',
    //             status: src.status ?? '',
    //             category: src.category ?? '',
    //             mrp: typeof src.mrp === 'number' ? src.mrp : undefined,
    //             stock: typeof src.stock === 'number' ? src.stock : 0,
    //             offer_discount: src.offer_discount ?? null,
    //             price: typeof src.price === 'number' ? src.price : 0,
    //             wishlisted: Boolean(src.wishlisted),
    //             // Fallbacks for fields used by UI but not present in API
    //             thumbnail: src.thumbnail ?? '', // might be absent; getImageUrl should handle empty
    //         };
    //     }

    //     // fallback to legacy shape unchanged
    //     return {
    //         id: product.id,
    //         title: product.title,
    //         description: product.description,
    //         rating: typeof product.rating === 'number' ? product.rating : 0,
    //         brand: product.brand,
    //         status: product.status,
    //         category: product.category,
    //         mrp: product.mrp,
    //         stock: product.stock,
    //         offer_discount: product.offer_discount,
    //         price: product.price,
    //         wishlisted: Boolean(product.wishlisted),
    //         thumbnail: product.thumbnail ?? '',
    //     };
    // })();


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
                        <Typography gutterBottom noWrap variant="h6" component="h2" sx={{
                            minHeight: '2rem'
                        }}>
                            {product.title}
                        </Typography>
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