import { Box, CardMedia, Typography } from "@mui/material"
import StarIcon from '@mui/icons-material/Star'
import { getImageUrl } from "../utils/imageUrl"

function OrderItem({ item }) {
    return (
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Box sx={{
                    display: "flex",
                    gap: { xs: 2, md: 3 },
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'center', sm: 'flex-start' }
                }}>
                    {/* Product Image */}
                    <CardMedia
                        component="img"
                        sx={{ 
                            width: { xs: '100%', sm: 120, md: 140 },
                            maxWidth: { xs: 200, sm: 120, md: 140 },
                            height: { xs: 120, sm: 120, md: 140 },
                            objectFit: 'contain',
                            borderRadius: 2,
                            bgcolor: 'grey.100',
                            border: '1px solid',
                            borderColor: 'grey.200',
                            flexShrink: 0
                        }}
                        image={getImageUrl(item.thumbnail)}
                        alt={item.title}
                    />
                    
                    {/* Product Details */}
                    <Box sx={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        justifyContent: "center",
                        flex: 1,
                        textAlign: { xs: 'center', sm: 'left' },
                        minWidth: 0
                    }}>
                        <Typography 
                            variant='subtitle1' 
                            fontWeight="600"
                            sx={{ 
                                mb: 1,
                                fontSize: { xs: '1rem', md: '1.1rem' },
                                lineHeight: 1.3
                            }}
                        >
                            {item.title}
                        </Typography>
                        
                        <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ mb: 0.5, fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                        >
                            <strong>Brand:</strong> {item.brand}
                        </Typography>
                        
                        <Box sx={{ 
                            display: "flex", 
                            alignItems: "center", 
                            mb: 1,
                            justifyContent: { xs: 'center', sm: 'flex-start' }
                        }}>
                            <StarIcon sx={{ color: "#FF8C00", fontSize: { xs: 16, md: 18 }, mr: 0.5 }} />
                            <Typography 
                                variant="body2" 
                                sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                            >
                                {item.rating}
                            </Typography>
                        </Box>
                        
                        <Typography 
                            variant="body1" 
                            fontWeight="600"
                            color="primary.main"
                            sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
                        >
                            ${item.price}
                        </Typography>
                    </Box>
                    
                    {/* Quantity and Total */}
                    <Box sx={{ 
                        display: "flex", 
                        flexDirection: { xs: 'row', sm: 'column' },
                        alignItems: { xs: 'center', sm: 'flex-end' },
                        gap: { xs: 3, sm: 1 },
                        textAlign: { xs: 'center', sm: 'right' },
                        minWidth: { sm: 80, md: 100 }
                    }}>
                        <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                        >
                            Qty: {item.quantity}
                        </Typography>
                        <Typography 
                            variant="body1" 
                            fontWeight="bold"
                            sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
                        >
                            ${(item.quantity * item.price).toFixed(2)}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default OrderItem
