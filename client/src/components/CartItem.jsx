import { useDispatch } from 'react-redux'
import {addToCart, removeCartItem, removeFromCart} from '../redux/cart/cartActions'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import StarIcon from '@mui/icons-material/Star'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Skeleton from '@mui/material/Skeleton'
import Tooltip from '@mui/material/Tooltip'
import DeleteIcon from '@mui/icons-material/Delete'


function CartItem({item}) {
    const dispatch = useDispatch()

    return (
        <Container>
            <Card sx={{my: 2, width: "90%", mx: "auto"}}>
            <CardContent sx={{display: "inline-flex", justifyContent: "space-between"}}>
                <CardMedia
                    component="img"
                    sx={{ maxWidth: 200}}
                    image={item.thumbnail}
                    alt="Product Image"
                />
                <Box sx={{p: 1}}>
                    <Typography variant='h6'>{item.title}</Typography>
                    <Typography>{item.description}</Typography>
                    <Typography sx={{fontSize: 13}}>Brand: {item.brand}</Typography>
                    <Box sx={{display: "inline-flex", alignItems: "center"}}>
                        <StarIcon sx={{color: "#FF8C00", fontSize: 20}}></StarIcon>
                        <Typography sx={{fontSize: 14, pt: 0.3, pr: 0.2}}>
                            {item.rating}
                        </Typography>
                    </Box>
                    <Typography>Price: ${item.price}</Typography>
                    {/* <Typography>Stock: {item.stock}</Typography> */}

                    <Typography>Item Value: $
                        {
                            (item.priceValue)
                        }
                    </Typography>

                    {
                        item.stock > 0?
                        <Box textAlign={"center"}>
                            <Box sx={{display: "flex", justifyContent: "center"}}>
                                <Box sx={{bgcolor: "#EEEEEE", borderRadius: 5}} >
                                    <Button variant='contained' sx={{borderTopLeftRadius: "16px", borderBottomLeftRadius: "16px", 
                                        maxWidth: '35px', maxHeight: '35px', minWidth: '35px', minHeight: '35px'
                                    }}  onClick={() => dispatch(removeFromCart(item))}>-</Button>
                                    <span style={{margin: "10px 10px"}}>{item.quantity}</span>
                                    <Button variant='contained' sx={{borderTopRightRadius: "16px", borderBottomRightRadius: "16px",
                                        maxWidth: '35px', maxHeight: '35px', minWidth: '35px', minHeight: '35px'
                                    }} onClick={() => dispatch(addToCart(item))}>+</Button>
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
                        <Box sx={{display: "flex", justifyContent: "center"}}>
                            <Typography color='error'>OUT OF STOCK!</Typography>
                        </Box>
                    }
                </Box>
                    <Tooltip title="Remove from Wishlist">
                        <Button onClick={() => dispatch(removeCartItem(item))}>
                            <DeleteIcon sx={{mt: 1, mr: 1}}></DeleteIcon>
                        </Button>
                    </Tooltip>
                </CardContent>
            </Card>
        </Container>
    )
}

export default CartItem