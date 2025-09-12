import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../redux/cart/cartActions'
import { Link } from 'react-router'
import { useState, useRef, useEffect, useCallback } from 'react'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import CardActions from '@mui/material/CardActions'
import CardActionArea from '@mui/material/CardActionArea'
import Typography from '@mui/material/Typography'
import StarIcon from '@mui/icons-material/Star'
import Box from '@mui/material/Box'
import { showSnack } from '../redux/snackbar/snackbarActions'
import Skeleton from '@mui/material/Skeleton'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { addWishlistDb, removeWishlistDb } from '../redux/wishlist/wishlistActions'
import { getOptimizedProductImage, preloadImage } from '../utils/imageUrl'
import placeholderImg from '../assets/loading-img.jpg'

function ProductCard({ product, loading }) {
    const dispatch = useDispatch()
    const userState = useSelector(state => state.userReducer)
    const [imageLoaded, setImageLoaded] = useState(false)
    const [imageError, setImageError] = useState(false)
    const [isInView, setIsInView] = useState(false)
    const [imageRetryCount, setImageRetryCount] = useState(0)
    const cardRef = useRef(null)
    const imageRef = useRef(null)

    // Enhanced Intersection Observer for lazy loading with better performance
    useEffect(() => {
        if (!cardRef.current) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true)
                    observer.disconnect()
                }
            },
            { 
                threshold: 0.1,
                rootMargin: '100px' // Increased for better UX
            }
        )

        observer.observe(cardRef.current)
        return () => observer.disconnect()
    }, [])

    // Get optimized image URL
    const getProductImageUrl = useCallback(() => {
        if (!product?.thumbnail) return null;
        return getOptimizedProductImage(product.thumbnail);
    }, [product?.thumbnail])

    const handleAddToCart = () => {
        dispatch(addToCart(product))
    }

    const handleWishlist = () => {
        if (userState.userName) {
            if (!product.wishlisted) {
                dispatch(addWishlistDb(product))
            } else {
                dispatch(removeWishlistDb(product))
            }
        } else {
            dispatch(showSnack({ message: "Please Login to Add to Wishlist", severity: "warning" }))
        }
    }

    const handleImageLoad = useCallback(() => {
        setImageLoaded(true)
        setImageError(false)
    }, [])

    const handleImageError = useCallback(() => {
        // Retry loading image up to 2 times before showing placeholder
        if (imageRetryCount < 2) {
            setImageRetryCount(prev => prev + 1)
            // Force reload by updating the src
            if (imageRef.current) {
                const currentSrc = imageRef.current.src
                imageRef.current.src = ''
                setTimeout(() => {
                    if (imageRef.current) {
                        imageRef.current.src = currentSrc
                    }
                }, 100)
            }
        } else {
            setImageError(true)
            setImageLoaded(true)
        }
    }, [imageRetryCount])

    // Preload optimized image when in view
    useEffect(() => {
        if (isInView && product?.thumbnail && !imageLoaded && !imageError) {
            const imageUrl = getProductImageUrl()
            if (imageUrl) {
                preloadImage(imageUrl)
                    .then(() => {
                        setImageLoaded(true)
                    })
                    .catch(() => {
                        handleImageError()
                    })
            }
        }
    }, [isInView, product?.thumbnail, imageLoaded, imageError, getProductImageUrl, handleImageError])

    if (loading) {
        return (
            <Card 
                sx={{ 
                    height: 400,
                    minWidth: 200,
                    maxWidth: 280,
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <CardContent sx={{ flex: 1, p: 2 }}>
                    <Skeleton variant="rounded" height={200} animation="wave" />
                    <Skeleton variant="text" sx={{ fontSize: 16, mt: 1 }} animation="wave" />
                    <Skeleton variant="text" sx={{ fontSize: 14, width: "60%" }} animation="wave" />
                    <Skeleton variant="text" sx={{ fontSize: 14, width: "40%" }} animation="wave" />
                    <Skeleton variant="text" sx={{ fontSize: 15, width: "50%" }} animation="wave" />
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                    <Skeleton variant="rounded" height={36} sx={{ width: "75%", mr: 1 }} animation="wave" />
                    <Skeleton variant="rounded" height={36} sx={{ width: "25%" }} animation="wave" />
                </CardActions>
            </Card>
        )
    }

    return (
        <Card 
            ref={cardRef}
            sx={{
                height: 400,
                minWidth: 200,
                maxWidth: 280,
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': { 
                    transform: 'translateY(-4px)', 
                    boxShadow: (theme) => theme.shadows[8]
                },
            }}
        >
            <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <CardActionArea sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                    <Box 
                        sx={{ 
                            height: 200,
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 1,
                            bgcolor: 'grey.50',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Enhanced loading skeleton with shimmer effect */}
                        {!imageLoaded && !imageError && (
                            <Skeleton 
                                variant="rectangular" 
                                width="100%" 
                                height="100%" 
                                animation="wave"
                                sx={{ 
                                    position: 'absolute', 
                                    top: 0, 
                                    left: 0,
                                    '&::after': {
                                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                                        animation: 'shimmer 1.5s infinite'
                                    }
                                }}
                            />
                        )}
                        
                        {/* Placeholder image for errors */}
                        {imageError ? (
                            <Box
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: 'grey.100',
                                    position: 'relative'
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    image={placeholderImg}
                                    alt="Product placeholder"
                                    sx={{ 
                                        width: '80%',
                                        height: '80%',
                                        objectFit: 'contain',
                                        opacity: 0.6,
                                        filter: 'grayscale(100%)'
                                    }}
                                />
                                <Typography
                                    variant="caption"
                                    sx={{
                                        position: 'absolute',
                                        bottom: 8,
                                        left: 8,
                                        right: 8,
                                        textAlign: 'center',
                                        color: 'text.secondary',
                                        fontSize: 10
                                    }}
                                >
                                    Image unavailable
                                </Typography>
                            </Box>
                        ) : (
                            /* Optimized image with proper aspect ratio */
                            isInView && (
                                <Box
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        position: 'relative',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <CardMedia
                                        ref={imageRef}
                                        component="img"
                                        image={getProductImageUrl()}
                                        alt={product.title}
                                        loading="lazy"
                                        onLoad={handleImageLoad}
                                        onError={handleImageError}
                                        sx={{ 
                                            maxWidth: '100%',
                                            maxHeight: '100%',
                                            width: 'auto',
                                            height: 'auto',
                                            objectFit: 'contain',
                                            aspectRatio: '1 / 1', // Maintain consistent aspect ratio
                                            opacity: imageLoaded ? 1 : 0,
                                            transition: 'opacity 0.3s ease-in-out, transform 0.2s ease-in-out',
                                            '&:hover': {
                                                transform: 'scale(1.05)'
                                            },
                                            // Ensure proper image rendering
                                            imageRendering: 'auto',
                                            WebkitImageSmoothing: true,
                                            MozImageSmoothing: true,
                                            msImageSmoothing: true,
                                            imageSmoothing: true
                                        }}
                                    />
                                </Box>
                            )
                        )}
                    </Box>
                    <CardContent sx={{ flex: 1, p: 2, pb: 1 }}>
                        <Typography 
                            variant="h6" 
                            noWrap 
                            sx={{ 
                                fontSize: 16,
                                fontWeight: 500,
                                mb: 1,
                                lineHeight: 1.2
                            }}
                        >
                            {product.title}
                        </Typography>
                        
                        <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ fontSize: 13, mb: 1 }}
                        >
                            Brand: {product.brand || 'Generic'}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <StarIcon sx={{ color: 'warning.main', fontSize: 18, mr: 0.5 }} />
                            <Typography variant="body2" sx={{ fontSize: 14 }}>
                                {product.rating.toFixed(1)}
                            </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    fontSize: 18,
                                    fontWeight: 600,
                                    color: 'primary.main'
                                }}
                            >
                                ${product.price.toFixed(2)}
                            </Typography>
                            {product.offer_discount && (
                                <Typography 
                                    variant="caption"
                                    sx={{
                                        bgcolor: 'primary.main',
                                        color: 'primary.contrastText',
                                        borderRadius: 1,
                                        px: 1,
                                        py: 0.25,
                                        ml: 1,
                                        fontSize: 11,
                                        fontWeight: 500
                                    }}
                                >
                                    Limited Deal
                                </Typography>
                            )}
                        </Box>
                    </CardContent>
                </CardActionArea>
            </Link>
            
            <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                <Button 
                    variant="outlined"
                    disabled={product.stock <= 0 && product.status === "active"}
                    color={product.stock <= 0 && product.status === "active" ? "error" : "primary"}
                    onClick={handleAddToCart}
                    sx={{ 
                        flex: 1,
                        textTransform: 'none',
                        fontWeight: 500
                    }}
                >
                    {product.stock <= 0 && product.status === "active" ? "Out of Stock" : "Add to Cart"}
                </Button>
                
                <Button 
                    variant="outlined"
                    onClick={handleWishlist}
                    sx={{ 
                        minWidth: 48,
                        p: 1,
                        color: product.wishlisted ? 'error.main' : 'text.secondary',
                        borderColor: product.wishlisted ? 'error.main' : 'grey.300',
                        '&:hover': {
                            borderColor: product.wishlisted ? 'error.dark' : 'primary.main',
                            bgcolor: product.wishlisted ? 'error.50' : 'primary.50'
                        }
                    }}
                >
                    {product.wishlisted ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </Button>
            </CardActions>
        </Card>
    )
}

export default ProductCard