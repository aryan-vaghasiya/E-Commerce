import { useDispatch } from 'react-redux'
import { addToCart, removeCartItem, removeFromCart, saveForLater } from '../redux/cart/cartActions'
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

function CartItem({ item }) {
    const dispatch = useDispatch()
    
    return (
        <Box>
            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Box sx={{
                    display: "flex", 
                    gap: { xs: 2, sm: 2.5, md: 3 }, 
                    flexDirection: { xs: "column", sm: "row" },
                    position: "relative"
                }}>
                    <Box sx={{ 
                        position: "absolute", 
                        top: { xs: -8, sm: -12, md: -16 }, 
                        right: { xs: -8, sm: -12, md: -16 },
                        zIndex: 1 
                    }}>
                        <Tooltip title="Remove from Cart">
                            <IconButton 
                                onClick={() => dispatch(removeCartItem(item))}
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
                    </Box>

                    <Box sx={{ 
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minWidth: { xs: '100%', sm: 180, lg: 200 },
                        maxWidth: { xs: '100%', sm: 180, lg: 200 },
                        flexShrink: 0
                    }}>
                        <CardMedia
                            component="img"
                            sx={{ 
                                width: '100%',
                                maxWidth: { xs: 250, sm: 180, lg: 200 },
                                height: { xs: 200, sm: 160, lg: 180 },
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
                        minHeight: { sm: 160, lg: 180 },
                        minWidth: 0
                    }}>
                        <Box>
                            <Typography variant='h6' sx={{ 
                                // mb: { xs: 1, md: 1.5 }, 
                                // mb: 1, 
                                lineHeight: 1.3,
                                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                                fontWeight: 600
                            }}>
                                {item.title}
                            </Typography>

                            {/* <Box sx={{ 
                                display: 'flex', 
                                gap: { xs: 1, md: 2 }, 
                                mb: 1, 
                                flexWrap: 'wrap',
                                alignItems: 'center'
                            }}> */}
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                                    {item.brand}
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <StarIcon sx={{ color: "#FF8C00", fontSize: { xs: 14, md: 16 }, mr: 0.5 }} />
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                                        {item.rating?.toFixed(1)}
                                    </Typography>
                                </Box>
                            {/* </Box> */}

                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'baseline', mb: { xs: 1.5, md: 2 }, flexWrap: 'wrap' }}>
                                <Typography variant="h6" color="primary.main" fontWeight="bold" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                                    ${item.price?.toFixed(2)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                                    Total: ${item.priceValue?.toFixed(2)}
                                </Typography>
                            </Box>
                        </Box>

                        <Box>
                            {item.stock > 0 && item.status === "active" ? (
                                <Box>
                                    <Box sx={{
                                        display: "flex", 
                                        gap: { xs: 1.5, md: 2 },
                                        flexDirection: { xs: 'column', md: 'row' },
                                        alignItems: { xs: 'stretch', md: 'center' },
                                        mb: 2
                                    }}>
                                        <Button 
                                            variant='outlined' 
                                            size="small"
                                            onClick={() => dispatch(saveForLater(item))}
                                            sx={{ 
                                                minWidth: { xs: 'auto', lg: 120 },
                                                fontSize: { xs: '0.8rem', md: '0.875rem' },
                                                py: { xs: 0.5, md: 1 }
                                            }}
                                        >
                                            Save for Later
                                        </Button>
                                        
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 1,
                                            justifyContent: { xs: 'center', lg: 'flex-start' },
                                            flexWrap: 'wrap'
                                        }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ 
                                                mr: { xs: 0, lg: 1 },
                                                fontSize: { xs: '0.8rem', md: '0.875rem' }
                                            }}>
                                                Qty:
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Button 
                                                    variant='outlined' 
                                                    size="small"
                                                    sx={{ 
                                                        minWidth: '32px', 
                                                        width: '32px', 
                                                        height: '32px',
                                                        p: 0,
                                                        fontSize: { xs: '0.9rem', md: '1rem' }
                                                    }}
                                                    onClick={() => dispatch(removeFromCart(item))}
                                                >
                                                    -
                                                </Button>
                                                <Typography 
                                                    sx={{ 
                                                        minWidth: '45px', 
                                                        textAlign: 'center',
                                                        fontWeight: 600,
                                                        fontSize: { xs: '0.9rem', md: '1rem' },
                                                        border: '2px solid',
                                                        borderColor: 'primary.main',
                                                        borderRadius: 1,
                                                        py: 0.5,
                                                        px: 1,
                                                        color: 'primary.main'
                                                    }}
                                                >
                                                    {item.quantity}
                                                </Typography>
                                                <Button 
                                                    variant='outlined' 
                                                    size="small"
                                                    sx={{ 
                                                        minWidth: '32px', 
                                                        width: '32px', 
                                                        height: '32px',
                                                        p: 0,
                                                        fontSize: { xs: '0.9rem', md: '1rem' }
                                                    }}
                                                    onClick={() => dispatch(addToCart(item))}
                                                >
                                                    +
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Box>
                                    
                                    {item.stock < item.quantity && (
                                        <Box sx={{ 
                                            bgcolor: 'error.light', 
                                            color: 'error.contrastText',
                                            p: { xs: 1, md: 1.5 },
                                            borderRadius: 1,
                                            textAlign: 'center'
                                        }}>
                                            <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                                                ⚠️ Only {item.stock} left! Please decrease quantity
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            ) : (
                                <Box sx={{ textAlign: 'center' }}>
                                    <Chip 
                                        label={item.stock < item.quantity ? "OUT OF STOCK" : "UNLISTED PRODUCT"} 
                                        color="error" 
                                        size="medium"
                                        sx={{ 
                                            fontWeight: 600,
                                            fontSize: { xs: '0.75rem', md: '0.8125rem' }
                                        }}
                                    />
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
            </CardContent>
            <Divider />
        </Box>
    )
}

export default CartItem
