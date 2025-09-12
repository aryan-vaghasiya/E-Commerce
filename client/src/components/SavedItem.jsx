import { useDispatch, useSelector } from 'react-redux'
import { addToCart, removeFromSavedForLater } from '../redux/cart/cartActions'
import Box from '@mui/material/Box'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import StarIcon from '@mui/icons-material/Star'
import Button from '@mui/material/Button'
import DeleteIcon from '@mui/icons-material/Delete'
import { getImageUrl } from '../utils/imageUrl'
import IconButton from '@mui/material/IconButton'
import { Tooltip, Chip, Divider } from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'

function SavedItem({ item }) {
    const dispatch = useDispatch()
    const userState = useSelector(state => state.userReducer)
    const handleAddToCart = () => {
        dispatch(addToCart(item))
        dispatch(removeFromSavedForLater(item))
    }

    const handleRemoveFromSaved = async () => {
        dispatch(removeFromSavedForLater(item))
        try{
            const response = await fetch("http://localhost:3000/wishlist/remove", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userState.token}`
                },
                body: JSON.stringify({productId: item.id, name: "save_for_later"})
            })
            if(!response.ok){
                const error = await response.json()
                console.error("Could not remove from Wishlist:", error.error);
                return false
            }
            return
        }
        catch(err){
            console.error(err.error);
        }
    }
    
    return (
        <Box>
            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Box sx={{
                    display: "flex", 
                    gap: { xs: 2, sm: 2.5, md: 3 }, 
                    flexDirection: { xs: "column", sm: "row" },
                    position: "relative"
                }}>
                    {/* <Box sx={{ 
                        position: "absolute", 
                        top: { xs: -8, sm: -12, md: -16 }, 
                        right: { xs: -8, sm: -12, md: -16 },
                        zIndex: 1 
                    }}>
                        <Tooltip title="Remove from Saved">
                            <IconButton 
                                onClick={handleRemoveFromSaved}
                                size="small"
                                color="error"
                                sx={{ 
                                    // bgcolor: 'background.paper',
                                    // boxShadow: 1,
                                    '&:hover': { bgcolor: 'error.light', color: 'white' }
                                }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box> */}

                    <Box sx={{ 
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minWidth: { xs: '100%', sm: 150, lg: 160 },
                        maxWidth: { xs: '100%', sm: 150, lg: 160 },
                        flexShrink: 0
                    }}>
                        <CardMedia
                            component="img"
                            sx={{ 
                                width: '100%',
                                maxWidth: { xs: 200, sm: 150, lg: 160 },
                                height: { xs: 160, sm: 130, lg: 140 },
                                objectFit: "contain", 
                                borderRadius: 2,
                                bgcolor: 'grey.50',
                                border: '1px solid',
                                borderColor: 'grey.200'
                            }}
                            image={getImageUrl(item.thumbnail)}
                            alt={item.title}
                        />
                    </Box>

                    <Box sx={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        flex: 1, 
                        justifyContent: "space-between",
                        minHeight: { sm: 130, lg: 140 },
                        minWidth: 0
                    }}>
                        <Box>
                            <Typography variant='subtitle1' sx={{ 
                                mb: { xs: 1, md: 1.5 }, 
                                lineHeight: 1.3,
                                fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
                                fontWeight: 600
                            }}>
                                {item.title}
                            </Typography>
                            
                            {/* <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{
                                    display: { xs: "none", sm: "block" }, 
                                    mb: 1,
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                }}
                            >
                                {item.description}
                            </Typography> */}

                            <Box sx={{ 
                                display: 'flex', 
                                gap: { xs: 1, md: 2 }, 
                                mb: 1, 
                                flexWrap: 'wrap',
                                alignItems: 'center'
                            }}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                                    <strong>Brand:</strong> {item.brand}
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <StarIcon sx={{ color: "#FF8C00", fontSize: { xs: 12, md: 14 }, mr: 0.5 }} />
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                                        {item.rating?.toFixed(1)}
                                    </Typography>
                                </Box>
                            </Box>

                            <Typography variant="h6" color="primary.main" fontWeight="bold" sx={{ 
                                mb: { xs: 1, md: 1.5 },
                                fontSize: { xs: '1rem', md: '1.1rem' }
                            }}>
                                ${item.price?.toFixed(2)}
                            </Typography>
                        </Box>

                        <Box>
                            {/* {item.stock > 0 && item.status === "active" ? ( */}
                                <Box sx={{
                                    display: "flex", 
                                    gap: { xs: 1, md: 1.5 },
                                    flexDirection: { xs: 'column', md: 'row' },
                                    alignItems: { xs: 'stretch', md: 'center' }
                                }}>
                                    <Button 
                                        variant='outlined' 
                                        size="small"
                                        onClick={handleRemoveFromSaved}
                                        color="error"
                                        sx={{ 
                                            fontSize: { xs: '0.8rem', md: '0.875rem' },
                                            py: { xs: 0.5, md: 1 }
                                        }}
                                    >
                                        Remove
                                    </Button>
                                    <Button 
                                        variant='contained' 
                                        size="small"
                                        disabled={!(item.stock > 0 && item.status === "active")}
                                        startIcon={<ShoppingCartIcon fontSize="small" />}
                                        onClick={handleAddToCart}
                                        sx={{ 
                                            fontWeight: 600,
                                            fontSize: { xs: '0.8rem', md: '0.875rem' },
                                            py: { xs: 0.5, md: 1 }
                                        }}
                                    >
                                        {item.stock > 0 && item.status === "active" ? `Move to Cart` : `OUT OF STOCK`}
                                    </Button>
                                </Box>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
            <Divider />
        </Box>
    )
}

export default SavedItem