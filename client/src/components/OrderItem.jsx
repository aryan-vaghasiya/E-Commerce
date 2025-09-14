// import { Box, CardMedia, Typography } from "@mui/material"
// import StarIcon from '@mui/icons-material/Star'
// import { getImageUrl } from "../utils/imageUrl"

// function OrderItem({ item }) {
//     return (
//         <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
//             <Box sx={{ p: { xs: 2, md: 3 } }}>
//                 <Box sx={{
//                     display: "flex",
//                     gap: { xs: 2, md: 3 },
//                     flexDirection: { xs: 'column', sm: 'row' },
//                     alignItems: { xs: 'center', sm: 'flex-start' }
//                 }}>
//                     {/* Product Image */}
//                     <CardMedia
//                         component="img"
//                         sx={{ 
//                             width: { xs: '100%', sm: 120, md: 140 },
//                             maxWidth: { xs: 200, sm: 120, md: 140 },
//                             height: { xs: 120, sm: 120, md: 140 },
//                             objectFit: 'contain',
//                             borderRadius: 2,
//                             bgcolor: 'grey.100',
//                             border: '1px solid',
//                             borderColor: 'grey.200',
//                             flexShrink: 0
//                         }}
//                         image={getImageUrl(item.thumbnail)}
//                         alt={item.title}
//                     />
                    
//                     {/* Product Details */}
//                     <Box sx={{ 
//                         display: "flex", 
//                         flexDirection: "column", 
//                         justifyContent: "center",
//                         flex: 1,
//                         textAlign: { xs: 'center', sm: 'left' },
//                         minWidth: 0
//                     }}>
//                         <Typography 
//                             variant='subtitle1' 
//                             fontWeight="600"
//                             sx={{ 
//                                 mb: 1,
//                                 fontSize: { xs: '1rem', md: '1.1rem' },
//                                 lineHeight: 1.3
//                             }}
//                         >
//                             {item.title}
//                         </Typography>
                        
//                         <Typography 
//                             variant="body2" 
//                             color="text.secondary" 
//                             sx={{ mb: 0.5, fontSize: { xs: '0.8rem', md: '0.875rem' } }}
//                         >
//                             <strong>Brand:</strong> {item.brand}
//                         </Typography>
                        
//                         <Box sx={{ 
//                             display: "flex", 
//                             alignItems: "center", 
//                             mb: 1,
//                             justifyContent: { xs: 'center', sm: 'flex-start' }
//                         }}>
//                             <StarIcon sx={{ color: "#FF8C00", fontSize: { xs: 16, md: 18 }, mr: 0.5 }} />
//                             <Typography 
//                                 variant="body2" 
//                                 sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
//                             >
//                                 {item.rating}
//                             </Typography>
//                         </Box>
                        
//                         <Typography 
//                             variant="body1" 
//                             fontWeight="600"
//                             color="primary.main"
//                             sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
//                         >
//                             ${item.price}
//                         </Typography>
//                     </Box>
                    
//                     {/* Quantity and Total */}
//                     <Box sx={{ 
//                         display: "flex", 
//                         flexDirection: { xs: 'row', sm: 'column' },
//                         alignItems: { xs: 'center', sm: 'flex-end' },
//                         gap: { xs: 3, sm: 1 },
//                         textAlign: { xs: 'center', sm: 'right' },
//                         minWidth: { sm: 80, md: 100 }
//                     }}>
//                         <Typography 
//                             variant="body2" 
//                             color="text.secondary"
//                             sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
//                         >
//                             Qty: {item.quantity}
//                         </Typography>
//                         <Typography 
//                             variant="body1" 
//                             fontWeight="bold"
//                             sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
//                         >
//                             ${(item.quantity * item.price).toFixed(2)}
//                         </Typography>
//                     </Box>
//                 </Box>
//             </Box>
//         </Box>
//     )
// }

// export default OrderItem

import { Box, CardMedia, Typography, Paper, Stack } from "@mui/material"
import StarIcon from '@mui/icons-material/Star'
import { getImageUrl } from "../utils/imageUrl"

function OrderItem({ item }) {
    return (
        <Box sx={{ 
            borderBottom: '1px solid', 
            borderColor: 'grey.200',
            '&:last-child': {
                borderBottom: 'none'
            }
        }}>
            <Box sx={{ p: 1.5 }}>
                <Box sx={{
                    display: "flex",
                    gap: 1.5,
                    alignItems: 'center'
                }}>
                    {/* Compact Product Image */}
                    <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                        <CardMedia
                            component="img"
                            sx={{ 
                                width: { xs: 70, sm: 80 },
                                height: { xs: 70, sm: 80 },
                                objectFit: 'contain',
                                bgcolor: 'grey.50'
                            }}
                            image={getImageUrl(item.thumbnail)}
                            alt={item.title}
                        />
                    </Paper>
                    
                    {/* Product Details - Horizontal Layout */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                            variant='body2' 
                            fontWeight="600"
                            sx={{ 
                                fontSize: { xs: '0.85rem', md: '0.9rem' },
                                lineHeight: 1.2,
                                mb: 0.3,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}
                        >
                            {item.title}
                        </Typography>
                        
                        <Stack direction="row" spacing={1} sx={{ mb: 0.3 }}>
                            <Typography variant="caption" color="text.secondary" >
                                {item.brand}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                                <StarIcon sx={{ color: "#FF8C00", fontSize: 12 }} />
                                <Typography variant="caption">
                                    {item.rating}
                                </Typography>
                            </Box>
                        </Stack>
                        
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography 
                                variant="body2" 
                                fontWeight="600"
                                color="primary.main"
                                sx={{ fontSize: { xs: '0.8rem', md: '0.85rem' } }}
                            >
                                ${item.price} x {item.quantity}
                            </Typography>
                            <Typography 
                                variant="body1" 
                                fontWeight="bold"
                                sx={{ 
                                    fontSize: { xs: '0.9rem', md: '1rem' },
                                    bgcolor: 'primary.main',
                                    color: 'primary.contrastText',
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: 1
                                }}
                            >
                                ${(item.quantity * item.price).toFixed(2)}
                            </Typography>
                        </Stack>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default OrderItem
