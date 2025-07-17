import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useDispatch } from 'react-redux'
import StarIcon from '@mui/icons-material/Star'
import Container from '@mui/material/Container'
import DeleteIcon from '@mui/icons-material/Delete'
import Tooltip from '@mui/material/Tooltip'
import { removeFromWishlist, removeWishlistDb } from '../redux/wishlist/wishlistActions'
import { getImageUrl } from '../utils/imageUrl'

function WishlistItem({item}) {
const dispatch = useDispatch()

    return (
        <Container>
            <Card sx={{my: 2, width: "90%", mx: "auto"}}>
            <CardContent sx={{display: "inline-flex", justifyContent: "flex-start"}}>
                <CardMedia
                    component="img"
                    sx={{ maxWidth: 200}}
                    image={getImageUrl(item.thumbnail)}
                    alt="Product Image"
                />
                <Box sx={{p: 1, maxWidth: "100%", position: "relative", ml: 1}}>
                    <Typography variant='h6' sx={{width: "93%"}}>{item.title}</Typography>
                    <Typography sx={{width: "93%"}}>{item.description}</Typography>
                    <Typography sx={{fontSize: 13}}>Brand: {item.brand}</Typography>
                    <Box sx={{display: "inline-flex", alignItems: "center"}}>
                        <StarIcon sx={{color: "#FF8C00", fontSize: 20}}></StarIcon>
                        <Typography sx={{fontSize: 14, pt: 0.3, pr: 0.2}}>
                            {item.rating}
                        </Typography>
                    </Box>
                    <Typography>Price: ${item.price}</Typography>

                    <Typography>Item Value: $
                        {
                            (item.priceValue)
                        }
                    </Typography>
                    

                    {/* <Box sx={{display: "flex", justifyContent: "center"}}>
                        <Box sx={{bgcolor: "#EEEEEE", borderRadius: 5}} >
                            <Button variant='contained' sx={{borderTopLeftRadius: "16px", borderBottomLeftRadius: "16px", 
                                maxWidth: '35px', maxHeight: '35px', minWidth: '35px', minHeight: '35px'
                            }}  onClick={() => dispatch(removeFromCart(item))}>-</Button>
                            <span style={{margin: "10px 10px"}}>{item.quantity}</span>
                            <Button variant='contained' sx={{borderTopRightRadius: "16px", borderBottomRightRadius: "16px",
                                maxWidth: '35px', maxHeight: '35px', minWidth: '35px', minHeight: '35px'
                            }} onClick={() => dispatch(addToCart(item))}>+</Button>
                        </Box>
                    </Box> */}
                    <Tooltip title="Remove from Wishlist">
                        <Button onClick={() => dispatch(removeWishlistDb(item))} sx={{position: "absolute", right: 2, top: 2}}>
                            <DeleteIcon sx={{}}></DeleteIcon>
                        </Button>
                    </Tooltip>
                </Box>
                </CardContent>
            </Card>
        </Container>
    )
}

export default WishlistItem


