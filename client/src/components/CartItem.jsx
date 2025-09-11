import { useDispatch } from 'react-redux'
import {addToCart, removeCartItem, removeFromCart, saveForLater} from '../redux/cart/cartActions'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import StarIcon from '@mui/icons-material/Star'
import Button from '@mui/material/Button'
import DeleteIcon from '@mui/icons-material/Delete'
import { getImageUrl } from '../utils/imageUrl'
import IconButton from '@mui/material/IconButton'
import { Container, Tooltip } from '@mui/material'

function CartItem({item}) {
    const dispatch = useDispatch()

    return (
        <Container>
            <Card sx={{my: 2, borderRadius: "7px"}}>
                <CardContent sx={{ display: "flex", width: "100%", position: "relative", pr: {xs: 2, sm: 6} }}>
                    <Box sx={{display: "flex", gap: 1, flex: 1, flexDirection: {xs: "column", sm: "row"}}}>
                        <CardMedia
                            component="img"
                            sx={{ maxWidth: 200, maxHeight: 200, objectFit: "contain", mx: "auto"}}
                            image={getImageUrl(item.thumbnail)}
                            alt="Product Image"
                        />
                        <Box sx={{display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between"}}>
                            <Typography variant='h6'>{item.title}</Typography>
                            <Typography sx={{display: {xs: "none", sm: "block"}}}>{item.description}</Typography>
                            <Typography sx={{fontSize: 13}}><strong>Brand:</strong> {item.brand}</Typography>
                            <Box sx={{display: "inline-flex", alignItems: "center"}}>
                                <StarIcon sx={{color: "#FF8C00", fontSize: 20}}></StarIcon>
                                <Typography sx={{fontSize: 14, pt: 0.3, pr: 0.2}}>
                                    {item.rating?.toFixed(1)}
                                </Typography>
                            </Box>
                            <Typography>Price: ${item.price?.toFixed(2)}</Typography>
                            <Typography>Item Value: ${item.priceValue?.toFixed(2)}</Typography>
                            {item.stock > 0 && item.status === "active"?
                                <Box textAlign={"center"} sx={{mt: {xs: 1, sm: 0}}}>
                                    <Box sx={{display: "flex", justifyContent: "center", gap: 1,}}>
                                        <Box>
                                            <Button variant='outlined' onClick={() => dispatch(saveForLater(item))}>Save for Later</Button>
                                        </Box>
                                        <Box sx={{bgcolor: "#EEEEEE", borderRadius: 5}} >
                                            <Button 
                                                variant='contained' 
                                                sx={{
                                                    borderTopLeftRadius: "16px",
                                                    borderBottomLeftRadius: "16px",       
                                                    maxWidth: '35px', 
                                                    maxHeight: '35px', 
                                                    minWidth: '35px', 
                                                    minHeight: '35px'
                                                }}  
                                                onClick={() => dispatch(removeFromCart(item))}
                                            >
                                                -
                                            </Button>
                                            <span style={{margin: "10px 10px"}}>{item.quantity}</span>
                                            <Button 
                                                variant='contained' 
                                                sx={{
                                                    borderTopRightRadius: "16px", 
                                                    borderBottomRightRadius: "16px",
                                                    maxWidth: '35px', 
                                                    maxHeight: '35px', 
                                                    minWidth: '35px', 
                                                    minHeight: '35px'
                                                }} 
                                                onClick={() => dispatch(addToCart(item))}
                                            >
                                                +
                                            </Button>
                                        </Box>
                                    </Box>
                                    {
                                        item.stock < item.quantity?
                                        <Typography color='error'>Only {item.stock} left! Decrease Order Quantity</Typography>
                                        :
                                        null
                                    }
                                </Box>
                                :
                                item.stock < item.quantity ?
                                <Box sx={{display: "flex", justifyContent: "center"}}>
                                    <Typography color='error'>OUT OF STOCK!</Typography>
                                </Box>
                                :
                                <Box sx={{display: "flex", justifyContent: "center"}}>
                                    <Typography color='error'>UNLISTED PRODUCT</Typography>
                                </Box>
                            }
                        </Box>
                    </Box>
                    <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 5 }}>
                        <Tooltip title="Remove from Cart">
                            <Button 
                                onClick={() => dispatch(removeCartItem(item))}
                                sx={{ minWidth: "auto", p: 1 }}
                            >
                                <DeleteIcon />
                            </Button>
                        </Tooltip>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    )
}

export default CartItem