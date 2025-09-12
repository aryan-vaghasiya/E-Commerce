import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import WishlistItem from './WishlistItem'
import { hideSnack, showSnack } from '../redux/snackbar/snackbarActions'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

function MyWishlist() {
    const userState = useSelector(state => state.userReducer)
    const snackbarState = useSelector(state => state.snackbarReducer)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [wishlist, setWishlist] = useState([])
    const [noOfItems, setNoOfItems] = useState(0)
    const [loading, setLoading] = useState(true)

    const handleRemoveFromWishlist = (id) => {
        setLoading(true)
        setWishlist(prev => prev.filter(i => i.id !== id));
        setNoOfItems(prev => prev - 1);
        dispatch(showSnack({message: "Wishlist item removed", severity: "success"}))
        setLoading(false)
    }

    const fetchMyWishlist = async () => {
        setLoading(true)
        try{
            const response = await fetch(`http://localhost:3000/wishlist/get-wishlist`, {
                headers: {
                    Authorization : `Bearer ${userState.token}`
                }
            })
            if(!response.ok){
                const error = await response.json()
                return console.log(error)
            }
            const result = await response.json()
            console.log(result)
            if(result.items){
                setNoOfItems(result.noOfItems)
                setWishlist(result.items)
                return
            }
        }
        catch(err){
            console.error(err.message)
        }
        finally{
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMyWishlist()
    }, [])

    return (
        <Box sx={{ display: "flex", flexDirection: "column", bgcolor: "#EEEEEE", alignItems: "center", minHeight: "91vh" }}>
            <Snackbar
                open={snackbarState.show}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                autoHideDuration={1000}
                onClose={() => dispatch(hideSnack())}
                sx={{
                    '&.MuiSnackbar-root': { top: '70px' },
                }}
            >
                <Alert onClose={() => dispatch(hideSnack())} severity={snackbarState.severity} variant="filled">
                    {snackbarState.message}
                </Alert>
            </Snackbar>
            {loading ?
                Array.from(Array(5)).map((_, index) => (
                    <Card key={index} sx={{ display: "inline-flex", width: "70%", mx: "auto", mt: 2 }}>
                        <Skeleton variant='rounded' sx={{ minHeight: 250, minWidth: 200, m: 1 }} animation="wave"></Skeleton>
                        <Box sx={{ width: "100%", mx: 1, mt: 1.5 }}>
                            <Skeleton variant='text' sx={{ fontSize: 28, width: "95%" }} animation="wave"></Skeleton>
                            <Skeleton variant='text' sx={{ fontSize: 60, width: "95%", mt: -2.5 }} animation="wave"></Skeleton>
                            <Skeleton variant='text' sx={{ fontSize: 15, width: "25%", mt: -1.5 }} animation="wave"></Skeleton>
                            <Skeleton variant='text' sx={{ fontSize: 15, width: "10%" }} animation="wave"></Skeleton>
                            <Skeleton variant='text' sx={{ fontSize: 18, width: "25%" }} animation="wave"></Skeleton>
                            <Skeleton variant='text' sx={{ fontSize: 18, width: "25%" }}animation="wave"></Skeleton>
                            <Box>
                                <Skeleton variant='rounded' height={37} width={"12%"} sx={{ mx: "auto" }} animation="wave"></Skeleton>
                            </Box>
                        </Box>
                    </Card>
                ))
            : wishlist.length > 0 ?
                <>
                    <Typography sx={{ mt: 1 }}>({noOfItems}) Items in Wish List</Typography>
                    {wishlist.map(item =>
                        <Box key={item.id} sx={{width: {xs: "90%", sm: "100%"}}}>
                            <WishlistItem item={item} onRemove={handleRemoveFromWishlist}/>
                        </Box>
                    )}
                </>
            :
                <Box sx={{ display: "block", margin: "auto" }}>
                    <Typography component="h1">Your Wishlist is Empty...</Typography>
                    <Button variant="contained" onClick={() => navigate("/")} sx={{ width: "100%", my: 1 }}>Add Something</Button>
                </Box>
            }
        </Box>
    )
}

export default MyWishlist