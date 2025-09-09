import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import { useDispatch } from 'react-redux'
import StarIcon from '@mui/icons-material/Star'
import Container from '@mui/material/Container'
import DeleteIcon from '@mui/icons-material/Delete'
import Tooltip from '@mui/material/Tooltip'
import { removeWishlistDb } from '../redux/wishlist/wishlistActions'
import { getImageUrl } from '../utils/imageUrl'
import { addToCart } from '../redux/cart/cartActions'

function WishlistItem({item}) {
const dispatch = useDispatch()

    const handleAddToCart = () => {
        dispatch(addToCart(item))
    }

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
                        <Box sx={{display: "flex", justifyContent: "center"}}>
                            <Button variant='contained' onClick={handleAddToCart} sx={{mt: {xs: 1, sm: 0}}}>Add To Cart</Button>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 5 }}>
                    <Tooltip title="Remove from Wishlist">
                        <Button 
                            onClick={() => dispatch(removeWishlistDb(item))}
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

export default WishlistItem


