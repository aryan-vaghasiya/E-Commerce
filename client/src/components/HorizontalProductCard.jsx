// import { useDispatch, useSelector } from 'react-redux';
// import { Link } from 'react-router';
// import {
//     Button, Card, CardContent, CardMedia, CardActions, Typography,
//     Box, Skeleton, Chip, Rating, Tooltip, Stack
// } from '@mui/material';
// import { AddShoppingCart, Favorite, FavoriteBorder } from '@mui/icons-material';
// import { addToCart } from '../redux/cart/cartActions';
// import { showSnack } from '../redux/snackbar/snackbarActions';
// import { addWishlistDb, removeWishlistDb } from '../redux/wishlist/wishlistActions';
// import { getImageUrl } from '../utils/imageUrl';

// const calculateDiscount = (mrp, price) => {
//     if (!mrp || mrp <= price) return 0;
//     return Math.round(((mrp - price) / mrp) * 100);
// };

// function HorizontalProductCard({ product, loading }) {
//     const dispatch = useDispatch();
//     const { userName } = useSelector(state => state.userReducer);

//     if (loading) {
//         return (
//             <Card sx={{ 
//                 display: 'flex', 
//                 flexDirection: { xs: 'column', sm: 'row' },
//                 width: '100%',
//                 minHeight: { xs: 320, sm: 180 }
//             }}>
//                 <Skeleton 
//                     variant='rectangular' 
//                     sx={{ 
//                         width: { xs: '100%', sm: 200 },
//                         height: { xs: 180, sm: '100%' },
//                         flexShrink: 0
//                     }} 
//                     animation="wave" 
//                 />
//                 <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, p: 2 }}>
//                     <Skeleton variant='text' sx={{ fontSize: '1.5rem', width: '60%' }} animation="wave" />
//                     <Skeleton variant='text' sx={{ width: '40%' }} animation="wave" />
//                     <Skeleton variant='text' sx={{ width: '30%', mt: 1 }} animation="wave" />
//                     <Box sx={{ mt: 'auto', pt: 2 }}>
//                         <Skeleton variant='rounded' height={36} sx={{ width: { xs: '100%', sm: 140 } }} animation="wave" />
//                     </Box>
//                 </Box>
//             </Card>
//         );
//     }

//     const discountPercent = calculateDiscount(product.mrp, product.price);

//     const handleAddToCart = () => {
//         dispatch(addToCart(product));
//     };

//     const handleWishlist = () => {
//         if (!userName) {
//             dispatch(showSnack({ message: "Please Login to Add to Wishlist", severity: "warning" }));
//             return;
//         }
//         if (product.wishlisted) {
//             dispatch(removeWishlistDb(product));
//         } else {
//             dispatch(addWishlistDb(product));
//         }
//     };

//     const isOutOfStock = product.stock === 0;

//     return (
//         <Card sx={{
//             display: 'flex',
//             flexDirection: { xs: 'column', sm: 'row' },
//             width: '100%',
//             transition: "box-shadow .2s ease",
//             "&:hover": { boxShadow: 4 },
//             position: 'relative',
//             minHeight: { xs: 'auto', sm: 180 }
//         }}>
//             {/* Discount Badge */}
//             {discountPercent > 0 && (
//                 <Chip
//                     label={`${discountPercent}% OFF`}
//                     color="primary"
//                     size="small"
//                     sx={{ 
//                         position: 'absolute', 
//                         top: 8, 
//                         left: 8, 
//                         fontWeight: 'bold',
//                         zIndex: 1
//                     }}
//                 />
//             )}
            
//             {/* Product Image */}
//             <Box 
//                 component={Link} 
//                 to={`/products/${product.id}`}
//                 sx={{ 
//                     width: { xs: '100%', sm: 200 },
//                     height: { xs: 180, sm: 'auto' },
//                     flexShrink: 0,
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     textDecoration: 'none',
//                     p: 2,
//                     bgcolor: 'background.paper'
//                 }}
//             >
//                 <CardMedia
//                     component="img"
//                     image={getImageUrl(product.thumbnail)}
//                     alt={product.title}
//                     sx={{ 
//                         width: '100%',
//                         height: '100%',
//                         objectFit: 'contain',
//                     }}
//                 />
//             </Box>

//             {/* Content Section */}
//             <Box sx={{ 
//                 display: 'flex', 
//                 flexDirection: 'column', 
//                 flex: 1,
//                 minWidth: 0,
//                 p: 2
//             }}>
//                 <Box 
//                     component={Link} 
//                     to={`/products/${product.id}`}
//                     sx={{ 
//                         textDecoration: 'none', 
//                         color: 'inherit',
//                         flex: 1,
//                         minWidth: 0
//                     }}
//                 >
//                     <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
//                         {/* Brand */}
//                         <Typography 
//                             variant="body2" 
//                             color="text.secondary"
//                             sx={{ 
//                                 overflow: 'hidden',
//                                 textOverflow: 'ellipsis',
//                                 whiteSpace: 'nowrap'
//                             }}
//                         >
//                             {product.brand}
//                         </Typography>

//                         {/* Title */}
//                         <Typography 
//                             variant="h6" 
//                             component="h2"
//                             sx={{
//                                 display: '-webkit-box',
//                                 WebkitLineClamp: 2,
//                                 WebkitBoxOrient: 'vertical',
//                                 overflow: 'hidden',
//                                 textOverflow: 'ellipsis',
//                                 lineHeight: 1.3,
//                                 mb: 1,
//                                 fontWeight: 500
//                             }}
//                         >
//                             {product.title}
//                         </Typography>

//                         {/* Rating */}
//                         <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
//                             <Rating 
//                                 name="read-only" 
//                                 value={product.rating} 
//                                 precision={0.1} 
//                                 readOnly 
//                                 size="small" 
//                             />
//                             <Typography 
//                                 variant="body2" 
//                                 color="text.secondary" 
//                                 sx={{ ml: 0.5 }}
//                             >
//                                 ({product.rating.toFixed(1)})
//                             </Typography>
//                         </Box>

//                         {/* Pricing */}
//                         <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mb: 1 }}>
//                             <Typography variant="h5" color="text.primary" fontWeight="bold">
//                                 ${product.price.toFixed(2)}
//                             </Typography>
//                             {discountPercent > 0 && (
//                                 <Typography 
//                                     variant="body1" 
//                                     color="text.secondary" 
//                                     sx={{ textDecoration: 'line-through' }}
//                                 >
//                                     ${product.mrp.toFixed(2)}
//                                 </Typography>
//                             )}
//                         </Stack>

//                         {/* Limited Time Deal Badge */}
//                         {product.offer_discount && (
//                             <Chip
//                                 label="Limited time deal"
//                                 size="small"
//                                 sx={{
//                                     bgcolor: '#1976D2',
//                                     color: 'white',
//                                     fontSize: 12,
//                                     height: 24
//                                 }}
//                             />
//                         )}
//                     </CardContent>
//                 </Box>

//                 {/* Action Buttons */}
//                 <CardActions sx={{ p: 0, mt: 2 }}>
//                     <Button
//                         variant="contained"
//                         onClick={handleAddToCart}
//                         disabled={isOutOfStock}
//                         startIcon={<AddShoppingCart />}
//                         size="medium"
//                         sx={{ 
//                             mr: 1,
//                             minWidth: { xs: 'auto', sm: 140 }
//                         }}
//                     >
//                         {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
//                     </Button>
//                     <Tooltip title={product.wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}>
//                         <Button 
//                             variant='outlined' 
//                             onClick={handleWishlist} 
//                             sx={{ minWidth: '40px', p: '7px' }} 
//                             color={product.wishlisted ? "error" : "primary"}
//                         >
//                             {product.wishlisted ? <Favorite /> : <FavoriteBorder />}
//                         </Button>
//                     </Tooltip>
//                 </CardActions>
//             </Box>
//         </Card>
//     );
// }

// export default HorizontalProductCard;




// import { useDispatch, useSelector } from 'react-redux';
// import { Link } from 'react-router';
// import {
//     Button, Card, CardContent, CardMedia, Typography,
//     Box, Skeleton, Chip, Rating, Tooltip, IconButton, Divider
// } from '@mui/material';
// import { AddShoppingCart, Favorite, FavoriteBorder, ArrowForward } from '@mui/icons-material';
// import { addToCart } from '../redux/cart/cartActions';
// import { showSnack } from '../redux/snackbar/snackbarActions';
// import { addWishlistDb, removeWishlistDb } from '../redux/wishlist/wishlistActions';
// import { getImageUrl } from '../utils/imageUrl';

// const calculateDiscount = (mrp, price) => {
//     if (!mrp || mrp <= price) return 0;
//     return Math.round(((mrp - price) / mrp) * 100);
// };

// function HorizontalProductCard({ product, loading }) {
//     const dispatch = useDispatch();
//     const { userName } = useSelector(state => state.userReducer);

//     if (loading) {
//         return (
//             <Card sx={{ 
//                 display: 'flex', 
//                 flexDirection: { xs: 'column', sm: 'row' },
//                 width: '100%',
//                 height: { xs: 'auto', sm: 160 }
//             }}>
//                 <Skeleton 
//                     variant='rectangular' 
//                     sx={{ 
//                         width: { xs: '100%', sm: 160 },
//                         height: { xs: 160, sm: '100%' },
//                         flexShrink: 0
//                     }} 
//                     animation="wave" 
//                 />
//                 <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, p: 2, justifyContent: 'space-between' }}>
//                     <Box>
//                         <Skeleton variant='text' sx={{ fontSize: '0.875rem', width: '30%' }} animation="wave" />
//                         <Skeleton variant='text' sx={{ fontSize: '1.25rem', width: '70%' }} animation="wave" />
//                         <Skeleton variant='text' sx={{ width: '50%', mt: 0.5 }} animation="wave" />
//                     </Box>
//                     <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
//                         <Skeleton variant='rounded' height={36} sx={{ flex: 1, maxWidth: 140 }} animation="wave" />
//                         <Skeleton variant='circular' width={36} height={36} animation="wave" />
//                     </Box>
//                 </Box>
//             </Card>
//         );
//     }

//     const discountPercent = calculateDiscount(product.mrp, product.price);

//     const handleAddToCart = () => {
//         dispatch(addToCart(product));
//     };

//     const handleWishlist = () => {
//         if (!userName) {
//             dispatch(showSnack({ message: "Please Login to Add to Wishlist", severity: "warning" }));
//             return;
//         }
//         if (product.wishlisted) {
//             dispatch(removeWishlistDb(product));
//         } else {
//             dispatch(addWishlistDb(product));
//         }
//     };

//     const isOutOfStock = product.stock === 0;

//     return (
//         <Card sx={{
//             display: 'flex',
//             flexDirection: { xs: 'column', sm: 'row' },
//             width: '100%',
//             height: { xs: 'auto', sm: 160 },
//             transition: "all .2s ease",
//             "&:hover": { 
//                 boxShadow: 4,
//                 '& .view-details-btn': {
//                     opacity: 1,
//                     transform: 'translateX(0)'
//                 }
//             },
//             position: 'relative',
//             overflow: 'hidden'
//         }}>
//             {/* Discount Badge */}
//             {discountPercent > 0 && (
//                 <Chip
//                     label={`-${discountPercent}%`}
//                     color="error"
//                     size="small"
//                     sx={{ 
//                         position: 'absolute', 
//                         top: 8, 
//                         left: 8, 
//                         fontWeight: 'bold',
//                         zIndex: 1,
//                         height: 24,
//                         fontSize: '0.75rem'
//                     }}
//                 />
//             )}
            
//             {/* Product Image */}
//             <Box 
//                 component={Link} 
//                 to={`/products/${product.id}`}
//                 sx={{ 
//                     width: { xs: '100%', sm: 160 },
//                     height: { xs: 160, sm: '100%' },
//                     flexShrink: 0,
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     textDecoration: 'none',
//                     p: 1.5,
//                     bgcolor: '#fafafa',
//                     borderRight: { xs: 'none', sm: '1px solid' },
//                     borderBottom: { xs: '1px solid', sm: 'none' },
//                     borderColor: 'divider'
//                 }}
//             >
//                 <CardMedia
//                     component="img"
//                     image={getImageUrl(product.thumbnail)}
//                     alt={product.title}
//                     sx={{ 
//                         width: '100%',
//                         height: '100%',
//                         objectFit: 'contain',
//                     }}
//                 />
//             </Box>

//             {/* Content Section */}
//             <Box sx={{ 
//                 display: 'flex', 
//                 flexDirection: 'column',
//                 flex: 1,
//                 minWidth: 0,
//                 p: { xs: 2, sm: 1.5 },
//                 justifyContent: 'space-between'
//             }}>
//                 {/* Top Section: Title, Brand, Rating */}
//                 <Box 
//                     component={Link} 
//                     to={`/products/${product.id}`}
//                     sx={{ 
//                         textDecoration: 'none', 
//                         color: 'inherit',
//                         minWidth: 0,
//                         mb: { xs: 1.5, sm: 0 }
//                     }}
//                 >
//                     <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
//                         {/* Brand */}
//                         <Typography 
//                             variant="caption" 
//                             color="text.secondary"
//                             sx={{ 
//                                 textTransform: 'uppercase',
//                                 fontWeight: 600,
//                                 letterSpacing: 0.5,
//                                 display: 'block',
//                                 mb: 0.25
//                             }}
//                         >
//                             {product.brand}
//                         </Typography>

//                         {/* Title */}
//                         <Typography 
//                             variant="body1" 
//                             component="h3"
//                             sx={{
//                                 display: '-webkit-box',
//                                 WebkitLineClamp: 2,
//                                 WebkitBoxOrient: 'vertical',
//                                 overflow: 'hidden',
//                                 textOverflow: 'ellipsis',
//                                 lineHeight: 1.3,
//                                 fontWeight: 500,
//                                 mb: 0.5,
//                                 fontSize: { xs: '1rem', sm: '0.95rem' }
//                             }}
//                         >
//                             {product.title}
//                         </Typography>

//                         {/* Rating & Stock Status */}
//                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
//                             <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                                 <Rating 
//                                     name="read-only" 
//                                     value={product.rating} 
//                                     precision={0.1} 
//                                     readOnly 
//                                     size="small"
//                                     sx={{ fontSize: '1rem' }}
//                                 />
//                                 <Typography 
//                                     variant="caption" 
//                                     color="text.secondary" 
//                                     sx={{ ml: 0.5, fontWeight: 500 }}
//                                 >
//                                     {product.rating.toFixed(1)}
//                                 </Typography>
//                             </Box>
//                             {product.stock > 0 && product.stock < 20 && (
//                                 <Typography 
//                                     variant="caption" 
//                                     sx={{ 
//                                         color: 'warning.main',
//                                         fontWeight: 600
//                                     }}
//                                 >
//                                     Only {product.stock} left
//                                 </Typography>
//                             )}
//                         </Box>
//                     </CardContent>
//                 </Box>

//                 {/* Bottom Section: Price & Actions */}
//                 <Box sx={{ 
//                     display: 'flex', 
//                     alignItems: 'center', 
//                     justifyContent: 'space-between',
//                     gap: 1.5,
//                     flexWrap: { xs: 'wrap', sm: 'nowrap' }
//                 }}>
//                     {/* Price Section */}
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
//                         <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
//                             <Typography 
//                                 variant="h6" 
//                                 sx={{ 
//                                     fontWeight: 700,
//                                     color: 'text.primary',
//                                     fontSize: { xs: '1.25rem', sm: '1.15rem' }
//                                 }}
//                             >
//                                 ${product.price.toFixed(2)}
//                             </Typography>
//                             {discountPercent > 0 && (
//                                 <Typography 
//                                     variant="body2" 
//                                     color="text.secondary" 
//                                     sx={{ 
//                                         textDecoration: 'line-through',
//                                         fontSize: '0.875rem'
//                                     }}
//                                 >
//                                     ${product.mrp.toFixed(2)}
//                                 </Typography>
//                             )}
//                         </Box>
                        
//                         {product.offer_discount && (
//                             <Chip
//                                 label="Limited deal"
//                                 size="small"
//                                 sx={{
//                                     bgcolor: 'error.light',
//                                     color: 'error.dark',
//                                     fontSize: '0.7rem',
//                                     height: 20,
//                                     fontWeight: 600
//                                 }}
//                             />
//                         )}
//                     </Box>

//                     {/* Action Buttons */}
//                     <Box sx={{ 
//                         display: 'flex', 
//                         gap: 1,
//                         alignItems: 'center'
//                     }}>
//                         <Button
//                             variant="contained"
//                             onClick={handleAddToCart}
//                             disabled={isOutOfStock}
//                             startIcon={<AddShoppingCart />}
//                             size="small"
//                             sx={{ 
//                                 whiteSpace: 'nowrap',
//                                 px: { xs: 2, sm: 1.5 },
//                                 textTransform: 'none',
//                                 fontWeight: 600,
//                                 fontSize: '0.875rem'
//                             }}
//                         >
//                             {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
//                         </Button>
                        
//                         <Tooltip title={product.wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}>
//                             <IconButton 
//                                 onClick={handleWishlist} 
//                                 size="small"
//                                 color={product.wishlisted ? "error" : "default"}
//                                 sx={{
//                                     border: '1px solid',
//                                     borderColor: product.wishlisted ? 'error.main' : 'divider',
//                                     '&:hover': {
//                                         bgcolor: product.wishlisted ? 'error.light' : 'action.hover'
//                                     }
//                                 }}
//                             >
//                                 {product.wishlisted ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
//                             </IconButton>
//                         </Tooltip>

//                         {/* View Details - Hidden on Mobile, Shows on Hover on Desktop */}
//                         <Tooltip title="View Details">
//                             <IconButton
//                                 component={Link}
//                                 to={`/products/${product.id}`}
//                                 size="small"
//                                 className="view-details-btn"
//                                 sx={{
//                                     display: { xs: 'none', md: 'flex' },
//                                     opacity: 0,
//                                     transform: 'translateX(-10px)',
//                                     transition: 'all 0.2s ease',
//                                     border: '1px solid',
//                                     borderColor: 'primary.main',
//                                     color: 'primary.main',
//                                     '&:hover': {
//                                         bgcolor: 'primary.main',
//                                         color: 'white'
//                                     }
//                                 }}
//                             >
//                                 <ArrowForward fontSize="small" />
//                             </IconButton>
//                         </Tooltip>
//                     </Box>
//                 </Box>
//             </Box>
//         </Card>
//     );
// }

// export default HorizontalProductCard;





import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import {
    Button, Card, CardContent, CardMedia, Typography,
    Box, Skeleton, Chip, Rating, Tooltip, IconButton
} from '@mui/material';
import { AddShoppingCart, Favorite, FavoriteBorder, ArrowForward } from '@mui/icons-material';
import { addToCart } from '../redux/cart/cartActions';
import { showSnack } from '../redux/snackbar/snackbarActions';
import { addWishlistDb, removeWishlistDb } from '../redux/wishlist/wishlistActions';
import { getImageUrl } from '../utils/imageUrl';

const calculateDiscount = (mrp, price) => {
    if (!mrp || mrp <= price) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
};

function HorizontalProductCard({ product, loading }) {
    const dispatch = useDispatch();
    const { userName } = useSelector(state => state.userReducer);

    if (loading) {
        return (
            <Card sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                width: '100%',
                height: { xs: 'auto', sm: 200 }
            }}>
                <Skeleton 
                    variant='rectangular' 
                    sx={{ 
                        width: { xs: '100%', sm: 200 },
                        height: { xs: 180, sm: '100%' },
                        flexShrink: 0
                    }} 
                    animation="wave" 
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, p: 2, justifyContent: 'space-between' }}>
                    <Box>
                        <Skeleton variant='text' sx={{ fontSize: '0.875rem', width: '30%' }} animation="wave" />
                        <Skeleton variant='text' sx={{ fontSize: '1.25rem', width: '70%' }} animation="wave" />
                        <Skeleton variant='text' sx={{ width: '50%', mt: 0.5 }} animation="wave" />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Skeleton variant='rounded' height={36} sx={{ flex: 1, maxWidth: 140 }} animation="wave" />
                        <Skeleton variant='circular' width={36} height={36} animation="wave" />
                    </Box>
                </Box>
            </Card>
        );
    }

    const discountPercent = calculateDiscount(product.mrp, product.price);

    const handleAddToCart = () => {
        dispatch(addToCart(product));
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
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            width: '100%',
            height: { xs: 'auto', sm: 200 },
            transition: "all .2s ease",
            "&:hover": { 
                boxShadow: 4,
                '& .view-details-btn': {
                    opacity: 1,
                    transform: 'translateX(0)'
                }
            },
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Discount Badge */}
            {discountPercent > 0 && (
                <Chip
                    label={`-${discountPercent}%`}
                    color="error"
                    size="small"
                    sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        left: 8, 
                        fontWeight: 'bold',
                        zIndex: 1,
                        height: 24,
                        fontSize: '0.75rem'
                    }}
                />
            )}
            
            {/* Product Image */}
            <Box 
                component={Link} 
                to={`/products/${product.id}`}
                sx={{ 
                    width: { xs: '100%', sm: 200 },
                    height: { xs: 180, sm: '100%' },
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    p: 2,
                    bgcolor: '#fafafa'
                }}
            >
                <CardMedia
                    component="img"
                    image={getImageUrl(product.thumbnail)}
                    alt={product.title}
                    sx={{ 
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                    }}
                />
            </Box>

            {/* Content Section */}
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                flex: 1,
                minWidth: 0,
                p: { xs: 2, sm: 2 },
                justifyContent: 'space-between'
            }}>
                {/* Top Section: Title, Brand, Rating */}
                <Box 
                    component={Link} 
                    to={`/products/${product.id}`}
                    sx={{ 
                        textDecoration: 'none', 
                        color: 'inherit',
                        minWidth: 0,
                        mb: { xs: 1.5, sm: 0 }
                    }}
                >
                    <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                        {/* Brand */}
                        <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ 
                                textTransform: 'uppercase',
                                fontWeight: 600,
                                letterSpacing: 0.5,
                                display: 'block',
                                mb: 0.25
                            }}
                        >
                            {product.brand}
                        </Typography>

                        {/* Title */}
                        <Typography 
                            variant="body1" 
                            component="h3"
                            sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                lineHeight: 1.4,
                                fontWeight: 500,
                                mb: 0.75,
                                fontSize: { xs: '1rem', sm: '1rem' }
                            }}
                        >
                            {product.title}
                        </Typography>

                        {/* Rating & Stock Status */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Rating 
                                    name="read-only" 
                                    value={product.rating} 
                                    precision={0.1} 
                                    readOnly 
                                    size="small"
                                    sx={{ fontSize: '1rem' }}
                                />
                                <Typography 
                                    variant="caption" 
                                    color="text.secondary" 
                                    sx={{ ml: 0.5, fontWeight: 500 }}
                                >
                                    {product.rating.toFixed(1)}
                                </Typography>
                            </Box>
                            {product.stock > 0 && product.stock < 20 && (
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        color: 'warning.main',
                                        fontWeight: 600
                                    }}
                                >
                                    Only {product.stock} left
                                </Typography>
                            )}
                        </Box>
                    </CardContent>
                </Box>

                <Box>
                    {product.offer_discount && (
                        <Chip
                            label="Limited time deal"
                            size="small"
                            sx={{
                                bgcolor: 'error.main',
                                // color: 'error.dark',
                                fontSize: '0.7rem',
                                color: "white",
                                height: 20,
                                fontWeight: 600
                            }}
                        />
                    )}
                </Box>

                {/* Bottom Section: Price & Actions */}
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    gap: 1.5,
                    flexWrap: { xs: 'wrap', sm: 'nowrap' }
                }}>
                    {/* Price Section */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    fontWeight: 700,
                                    color: 'text.primary',
                                    fontSize: { xs: '1.25rem', sm: '1.25rem' }
                                }}
                            >
                                ${product.price.toFixed(2)}
                            </Typography>
                            {discountPercent > 0 && (
                                <Typography 
                                    variant="body2" 
                                    color="text.secondary" 
                                    sx={{ 
                                        textDecoration: 'line-through',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    ${product.mrp.toFixed(2)}
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ 
                        display: 'flex', 
                        gap: 1,
                        alignItems: 'center'
                    }}>
                        <Button
                            variant="contained"
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                            startIcon={<AddShoppingCart />}
                            size="small"
                            sx={{ 
                                whiteSpace: 'nowrap',
                                px: { xs: 2, sm: 1.5 },
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.875rem'
                            }}
                        >
                            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                        
                        <Tooltip title={product.wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}>
                            <IconButton 
                                onClick={handleWishlist} 
                                size="small"
                                color={product.wishlisted ? "error" : "default"}
                                sx={{
                                    border: '1px solid',
                                    borderColor: product.wishlisted ? 'error.main' : 'divider',
                                    '&:hover': {
                                        bgcolor: product.wishlisted ? 'error.light' : 'action.hover'
                                    }
                                }}
                            >
                                {product.wishlisted ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
                            </IconButton>
                        </Tooltip>

                        {/* View Details - Hidden on Mobile, Shows on Hover on Desktop */}
                        <Tooltip title="View Details">
                            <IconButton
                                component={Link}
                                to={`/products/${product.id}`}
                                size="small"
                                className="view-details-btn"
                                sx={{
                                    display: { xs: 'none', md: 'flex' },
                                    opacity: 0,
                                    transform: 'translateX(-10px)',
                                    transition: 'all 0.2s ease',
                                    border: '1px solid',
                                    borderColor: 'primary.main',
                                    color: 'primary.main',
                                    '&:hover': {
                                        bgcolor: 'primary.main',
                                        color: 'white'
                                    }
                                }}
                            >
                                <ArrowForward fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Box>
        </Card>
    );
}

export default HorizontalProductCard;
