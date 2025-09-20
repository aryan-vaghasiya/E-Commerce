import { useDispatch, useSelector } from 'react-redux'
import CartItem from './CartItem'
import SavedItem from './SavedItem'
import { useLocation, useNavigate } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Skeleton from '@mui/material/Skeleton'
import { useEffect, useState } from 'react'
import { hideSnack, showSnack } from '../redux/snackbar/snackbarActions'
import { fetchCart } from '../redux/cart/cartActions'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { Container, Paper, Divider } from '@mui/material'

function MyCart() {
    const savedItems = useSelector(state => state.cartReducer.saved)
    const productState = useSelector(state => state.cartReducer.items)
    const noOfItems = useSelector(state => state.cartReducer.noOfItems)
    const cartValue = useSelector(state => state.cartReducer.cartValue)
    const userState = useSelector(state => state.userReducer)
    const snackbarState = useSelector(state => state.snackbarReducer)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(true)
    const shippingCharges = 4.99

    const checkOutNavigate = async () => {
        if (userState.token) {
            const res = await fetch("http://localhost:3000/auth/check", {
                headers: {
                    Authorization: `Bearer ${userState.token}`
                }
            });
            if(!res.ok){
                navigate("/login", { state: "/checkout" })
                return dispatch(showSnack({ message: "Session Expired, Login Again", severity: "warning" }))
            }
            const compareWalletBalance = await fetch(`http://localhost:3000/wallet/compare-balance?amount=${cartValue}`, {
                headers: {
                    Authorization: `Bearer ${userState.token}`
                }
            })
            if(!compareWalletBalance.ok){
                return dispatch(showSnack({ message: "Wallet balance mismatch/Server Error", severity: "error" }))
            }
            const canAfford = await compareWalletBalance.json()
            if(!canAfford){
                return dispatch(showSnack({ message: "Insufficient wallet balance", severity: "warning" }))
            }
            navigate("/checkout")
        }
        else {
            navigate("/login", { state: "/checkout" })
            return dispatch(showSnack({ message: "Please Login to access this Section", severity: "warning" }))
        }
    }

    useEffect(() => {
        if(userState.userName){
            dispatch(fetchCart(userState.token))
        }
        const timeOut = setTimeout(() => {
            setLoading(false)
        }, 1000)
        return () => clearInterval(timeOut)
    }, [])

    const CheckoutCard = () => (
        <Paper 
            elevation={3} 
            sx={{ 
                p: { xs: 2, sm: 2.5, md: 3 },
                position: { md: 'sticky' },
                top: { md: 20 },
                height: 'fit-content',
                mb: { xs: 3, md: 0 },
                minWidth: { sm: 280, md: 300 }
            }}
        >
            <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                Cart Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {productState.length === 0 ? (
                <Box textAlign="center" py={2}>
                    <Typography color="text.secondary" variant="body2">
                        No items in cart
                    </Typography>
                </Box>
            ) : (
                <>
                    <Box sx={{ mb: 3 }}>
                        {cartValue < 50 ?
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                                <Typography variant='caption' color='error'>
                                {`Shop worth ${(50 - cartValue).toFixed(2)} more for FREE Shipping`}
                                </Typography>
                            </Box>
                            :
                            null
                        }
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Items ({noOfItems})</Typography>
                            <Typography variant="body2">${cartValue?.toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Shipping</Typography>
                            <Typography variant="body2" color="success.main">{cartValue >= 50 ? `FREE` : `+$${shippingCharges}`}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Tax</Typography>
                            <Typography variant="body2">$0.00</Typography>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                                Total
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                                ${(cartValue + shippingCharges).toFixed(2)}
                            </Typography>
                        </Box>
                    </Box>

                    {productState.some(item => item.stock < item.quantity || item.status !== "active") ? (
                        <Box textAlign="center">
                            <Typography color='error' variant="body2" sx={{ mb: 2, fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                                Some items are unavailable
                            </Typography>
                            <Button 
                                variant='contained' 
                                disabled 
                                fullWidth 
                                size="large"
                                sx={{ py: { xs: 1, md: 1.5 }, fontSize: { xs: '0.9rem', md: '1rem' } }}
                            >
                                Checkout
                            </Button>
                        </Box>
                    ) : (
                        <Button 
                            variant='contained' 
                            onClick={checkOutNavigate} 
                            fullWidth 
                            size="large"
                            sx={{ py: { xs: 1, md: 1.5 }, fontSize: { xs: '0.9rem', md: '1rem' } }}
                        >
                            Proceed to Checkout
                        </Button>
                    )}
                </>
            )}
        </Paper>
    )

    return (
        <Box sx={{ bgcolor: "#F8F9FA", minHeight: "91vh", py: { xs: 2, md: 3 } }}>
            <Container maxWidth="xl">
                <Snackbar
                    open={snackbarState.show}
                    anchorOrigin={{ vertical: "top", horizontal: "center" }}
                    autoHideDuration={2000}
                    onClose={() => dispatch(hideSnack())}
                    sx={{ '&.MuiSnackbar-root': { top: '70px' } }}
                >
                    <Alert onClose={() => dispatch(hideSnack())} severity={snackbarState.severity} variant="filled">
                        {snackbarState.message}
                    </Alert>
                </Snackbar>

                {loading ? (
                    <Box 
                        sx={{ 
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            gap: { xs: 2, md: 3 }
                        }}
                    >
                        <Box sx={{ 
                            width: { xs: '100%', md: '300px' }, 
                            flexShrink: 0,
                            order: { xs: 1, md: 2 }
                        }}>
                            <Skeleton variant='rounded' height={300} animation="wave" />
                        </Box>
                        
                        <Box sx={{ 
                            flex: 1,
                            order: { xs: 2, md: 1 }
                        }}>
                            {Array.from(Array(3)).map((_, index) => (
                                <Card key={index} sx={{ mb: 2, p: 2 }}>
                                    <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                                        <Skeleton variant='rounded' sx={{ 
                                            width: { xs: '100%', sm: 150 }, 
                                            height: { xs: 150, sm: 150 } 
                                        }} animation="wave" />
                                        <Box sx={{ flex: 1 }}>
                                            <Skeleton variant='text' sx={{ fontSize: 24, width: "80%" }} animation="wave" />
                                            <Skeleton variant='text' sx={{ fontSize: 16, width: "60%" }} animation="wave" />
                                            <Skeleton variant='text' sx={{ fontSize: 16, width: "40%" }} animation="wave" />
                                            <Skeleton variant='rectangular' sx={{ width: 100, height: 30, mt: 2 }} animation="wave" />
                                        </Box>
                                    </Box>
                                </Card>
                            ))}
                        </Box>
                    </Box>
                ) : (
                    <Box 
                        sx={{ 
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            gap: { xs: 2, md: 3 },
                            alignItems: 'flex-start'
                        }}
                    >
                        <Box sx={{ 
                            width: { xs: '100%', md: '300px' }, 
                            flexShrink: 0,
                            order: { xs: 1, md: 2 }
                        }}>
                            <CheckoutCard />
                        </Box>

                        <Box sx={{ 
                            flex: 1, 
                            minWidth: 0,
                            order: { xs: 2, md: 1 },
                            width: { xs: '100%', md: 'calc(100% - 320px)' }
                        }}>
                            <Paper elevation={2} sx={{ mb: 3, overflow: 'hidden' }}>
                                <Box sx={{ 
                                    // p: { xs: 2, md: 2.5 }, 
                                    p: 2, 
                                    bgcolor: 'primary.main', 
                                    color: 'primary.contrastText',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                                        Shopping Cart
                                    </Typography>
                                    {productState.length > 0 && (
                                        <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                                            {noOfItems} item{noOfItems !== 1 ? 's' : ''}
                                        </Typography>
                                    )}
                                </Box>
                                
                                {productState.length === 0 ? (
                                    <Box sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
                                        <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                                            Your Cart is Empty
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                            Add items to get started
                                        </Typography>
                                        <Button 
                                            variant="contained" 
                                            onClick={() => navigate("/")}
                                            size="large"
                                        >
                                            Start Shopping
                                        </Button>
                                    </Box>
                                ) : (
                                    <Box>
                                        {productState.map(item => (
                                            <CartItem key={item.id} item={item} />
                                        ))}
                                    </Box>
                                )}
                            </Paper>

                            {savedItems.length > 0 && (
                                <Paper elevation={2} sx={{ overflow: 'hidden' }}>
                                    <Box sx={{ 
                                        // p: { xs: 2, md: 2.5 }, 
                                        p: 2, 
                                        bgcolor: 'secondary.main', 
                                        color: 'secondary.contrastText',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                                            Saved For Later
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                                            {savedItems.length} item{savedItems.length !== 1 ? 's' : ''}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        {savedItems.map(item => (
                                            <SavedItem key={item.id} item={item} />
                                        ))}
                                    </Box>
                                </Paper>
                            )}
                        </Box>
                    </Box>
                )}
            </Container>
        </Box>
    )
}

export default MyCart
