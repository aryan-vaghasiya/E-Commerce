import { Box, CardMedia, Typography, Paper, Stack } from "@mui/material"
import StarIcon from '@mui/icons-material/Star'
import { getImageUrl } from "../utils/imageUrl"

function OrderItem({ item }) {
    return (
        <Box sx={{ 
            borderBottom: '2px solid', 
            borderColor: 'grey.200',
            '&:last-child': {
                borderBottom: 'none'
            },
            mx: 2,
            my: 1
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
                    <Box sx={{minWidth: 0, flex: 1, display: "flex", flexDirection: "row" }}>
                        <Box sx={{flex: 1}}>
                            <Typography 
                                variant='body2' 
                                fontWeight="600"
                                sx={{ 
                                    fontSize: { xs: '0.85rem', md: '0.9rem' },
                                    lineHeight: 1.2,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                    // display: "box", // or just block, but "box" works with line-clamp
                                    // lineClamp: 2,   // clamp to 2 lines
                                    // boxOrient: "vertical", 
                                    // overflow: "hidden",
                                    // textOverflow: "ellipsis",
                                }}
                            >
                                {item.title}
                                {/* Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. */}
                            </Typography>
                            
                            <Typography variant="caption" color="text.secondary" >
                                {item.brand}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                                <StarIcon sx={{ color: "#FF8C00", fontSize: 12 }} />
                                <Typography variant="caption">
                                    {item.rating}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{display: "flex", flexDirection: "column", justifyContent: "space-around", ml: 1}}>
                        {/* <Stack direction="row" justifyContent="space-between" alignItems="center"> */}
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
                        {/* </Stack> */}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default OrderItem
