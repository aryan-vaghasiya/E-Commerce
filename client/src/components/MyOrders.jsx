import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import Container from '@mui/material/Container'
import Skeleton from '@mui/material/Skeleton'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Pagination from '@mui/material/Pagination'
import { Paper, Divider, Grid, Chip, IconButton, Collapse, useMediaQuery, useTheme } from '@mui/material'
import { ExpandMore, ExpandLess } from '@mui/icons-material'
import OrderItem from './OrderItem'
import OrderFilterModal from './OrderFilterModal'
import FilterAltIcon from '@mui/icons-material/FilterAlt';

function MyOrders() {
    const userState = useSelector(state => state.userReducer)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(true)
    const [openDialog, setOpenDialog] = useState(false)
    const [selectedOrderId, setSelectedOrderId] = useState(null)
    const [expandedOrder, setExpandedOrder] = useState(null)

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))

    const [allOrders, setAllOrders] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalOrders, setTotalOrders] = useState(1)

    const steps = ["Order Placed", "Order Accepted", "Order Dispatched", "Order Delivered"]
    const cancelledSteps = ["Order Placed", "Order Cancelled"]
    const allStatus = ["pending", "accepted", "dispatched", "delivered"]

    const fetchOrders = async (token, page = 1, limit = 10, filters = {}) => {
        setLoading(true)
        try {
            const params = new URLSearchParams({page, limit, ...filters})
            console.log(params.toString());
            
            // const res = await fetch(`http://localhost:3000/orders/get-orders?page=${page}&limit=${limit}`, {
            const res = await fetch(`http://localhost:3000/orders/get-orders?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if(!res.ok){
                const error = await res.json();
                console.error("Could not fetch Orders:", error.error)
                return false
            }
            const orderData = await res.json();
            setAllOrders(orderData.orders.reverse())
            setCurrentPage(orderData.currentPage)
            setTotalPages(orderData.pages)
            setTotalOrders(orderData.total)
        }
        catch (err) {
            console.error("Orders fetch failed:", err.message);
        }
        finally{
            setLoading(false)
        }
    }

    const handleRepeatOrder = async (products)=> {
        const newItems = products.map(item => ({productId: item.id, quantity: item.quantity}))
        console.log(newItems);

        try{
            const response = await fetch(`http://localhost:3000/cart/bulk-add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization : `Bearer ${userState.token}`
                },
                body: JSON.stringify({items: newItems})
            })
            if(!response.ok){
                const error = await response.json()
                return console.log(error)
            }
            navigate("/cart")
        }
        catch(err){
            console.error(err.message)
        }
    }

    const handleCancel = async () => {
        if(!selectedOrderId) return
        try{
            const response = await fetch(`http://localhost:3000/orders/cancel-user`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${userState.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({orderId: selectedOrderId})
            })
            if(!response.ok){
                const error = await response.json()
                console.error("Could not cancel Order:", error.error);
                return
            }
            handleDialogClose()
            fetchOrders(userState.token, 1, 10)
        }
        catch (err){
            console.error("Could not cancel Order:", err.message);
        }
    }

    const handleDialogOpen = (orderId) => {
        setSelectedOrderId(orderId)
        setOpenDialog(true)
    }
    
    const handleDialogClose = () => {
        setOpenDialog(false)
        setSelectedOrderId(null)
    }

    const handlePageChange = (event, value) => {
        fetchOrders(userState.token, value, 10)
        window.scrollTo({top: 0, left: 0, behavior: 'smooth'})
    }

    const getCurrentStatus = (status) => {
        const index = allStatus.indexOf(status)
        return status === "delivered"? index+1 : status !== "cancelled" ? index : null
    }

    const isStepFailed = (step) => {
        return step === 1;
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'pending': return 'warning'
            case 'accepted': return 'info' 
            case 'dispatched': return 'primary'
            case 'delivered': return 'success'
            case 'cancelled': return 'error'
            default: return 'default'
        }
    }

    const [filterModalOpen, setFilterModalOpen] = useState(false)
    const [activeFilters, setActiveFilters] = useState({})
    const activeFilterCount = Object.keys(activeFilters).length

    // Add this function to handle filter application
    const handleApplyFilters = (filters) => {
        setActiveFilters(filters)

        const params = new URLSearchParams();

        for (const [key, value] of Object.entries(filters)) {
            params.set(key, value)
        }

        fetchOrders(userState.token, 1, 10, Object.fromEntries(params))
    }

    const handleExpandOrder = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId)
    }

    if (allOrders?.length === 0) {
        return (
            <Box sx={{ 
                display: "flex", 
                flexDirection: "column", 
                bgcolor: "#F8F9FA", 
                alignItems: "center", 
                justifyContent: "center",
                minHeight: "91vh",
                p: 3
            }}>
                <Typography variant="h5" component="h1" gutterBottom color="text.secondary">
                    No Orders Yet
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                    Start shopping to see your orders here
                </Typography>
                <Button 
                    variant="contained" 
                    onClick={() => navigate("/")} 
                    size="large"
                    sx={{ minWidth: 200 }}
                >
                    Start Shopping
                </Button>
            </Box>
        )
    }

    useEffect(() => {
        fetchOrders(userState.token, 1, 10)
    },[])

    return (
        <Box sx={{ 
            // bgcolor: "#F8F9FA", 
            bgcolor: "#EEEEEE", 
            minHeight: "91vh", 
            py: { xs: 2, md: 3 }
        }}>
            
            <OrderFilterModal
                open={filterModalOpen}
                onClose={() => setFilterModalOpen(false)}
                onApplyFilters={handleApplyFilters}
                currentFilters={activeFilters}
            />

            {/* Cancel Order Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleDialogClose}
                maxWidth="sm"
                fullWidth
                slotProps={{
                    paper:{
                        sx: { m: { xs: 2, sm: 3 } }
                    }
                }}
                // PaperProps={{
                //     sx: { m: { xs: 2, sm: 3 } }
                // }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    Cancel Order?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Are you sure you want to cancel this order?
                    </DialogContentText>
                    <DialogContentText color="text.secondary">
                        If this is a prepaid order, you will get a refund in your wallet.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={handleDialogClose} sx={{ mr: 1 }}>
                        Keep Order
                    </Button>
                    <Button 
                        onClick={handleCancel} 
                        variant='contained' 
                        color='error'
                        autoFocus
                    >
                        Cancel Order
                    </Button>
                </DialogActions>
            </Dialog>

            <Container maxWidth="lg">
                {loading ? (
                    // Loading Skeletons
                    Array.from(Array(3)).map((_, index) => (
                        <Paper key={index} elevation={1} sx={{ mb: 3, overflow: 'hidden' }}>
                            <Box sx={{ p: { xs: 2, md: 3 } }}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'flex-start',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    gap: 2,
                                    mb: 2
                                }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Skeleton variant='text' width="60%" height={24} />
                                        <Skeleton variant='text' width="40%" height={20} />
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Skeleton variant='rectangular' width={100} height={32} />
                                        <Skeleton variant='rectangular' width={120} height={32} />
                                    </Box>
                                </Box>

                                <Card sx={{ bgcolor: "#EEEEEE", mb: 2 }}>
                                    <Box sx={{ 
                                        display: "flex", 
                                        p: 2, 
                                        gap: 2,
                                        flexDirection: { xs: 'column', sm: 'row' }
                                    }}>
                                        <Skeleton variant='rounded' sx={{ 
                                            width: { xs: '100%', sm: 120 }, 
                                            height: { xs: 120, sm: 120 }
                                        }} />
                                        <Box sx={{ flex: 1 }}>
                                            <Skeleton variant='text' width="80%" height={24} />
                                            <Skeleton variant='text' width="30%" height={20} />
                                            <Skeleton variant='text' width="40%" height={20} />
                                        </Box>
                                    </Box>
                                </Card>

                                <Skeleton variant='rectangular' height={60} />
                            </Box>
                        </Paper>
                    ))
                ) : (
                    <>
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        mb: 3,
                        px: { xs: 2, md: 0 }
                    }}>
                        <Typography variant="h5" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                            My Orders
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={<FilterAltIcon />}
                            onClick={() => setFilterModalOpen(true)}
                            sx={{ 
                                minWidth: { xs: 'auto', sm: 120 },
                                px: { xs: 1, sm: 2 }
                            }}
                        >
                            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Filter</Box>
                            {activeFilterCount > 0 && (
                                <Chip 
                                    label={activeFilterCount} 
                                    size="small" 
                                    color="primary"
                                    sx={{ ml: { xs: 0, sm: 1 }, minWidth: 20, height: 20 }}
                                />
                            )}
                        </Button>
                    </Box>
                    {allOrders?.map((order, index) => (
                        <Paper key={index} elevation={2} sx={{ mb: 3, overflow: 'hidden' }}>
                            {/* Order Header */}
                            <Box sx={{ 
                                p: { xs: 2, md: 3 },
                                bgcolor: 'background.paper'
                            }}>
                                <Grid container spacing={2} alignItems="flex-start">
                                    <Grid size={{xs: 12, md: 8}}>
                                        <Typography 
                                            variant="subtitle1" 
                                            fontWeight="bold" 
                                            sx={{ mb: 1, fontSize: { xs: '1rem', md: '1.1rem' } }}
                                        >
                                            Order ID: #{order.order_id}
                                        </Typography>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                ${order.cartValue}
                                            </Typography>
                                            <Chip 
                                                label={order.status.toUpperCase()} 
                                                color={getStatusColor(order.status)}
                                                size="small"
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </Box>

                                        {order.final_total && order.discount > 0 && (
                                            <Box sx={{ mt: 1 }}>
                                                <Typography variant="body2" color="success.main" fontWeight="500">
                                                    Discount: -${order.discount}
                                                </Typography>
                                                <Typography variant="body1" fontWeight="bold">
                                                    Total: ${order.final_total}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Grid>

                                    <Grid size={{xs: 12, md: 4}}>
                                        <Box sx={{ 
                                            display: "flex", 
                                            gap: 1, 
                                            flexDirection: { xs: 'row', md: 'column' },
                                            flexWrap: 'wrap'
                                        }}>
                                            {(order.status === "pending" || order.status === "accepted") && (
                                                <Button 
                                                    variant='outlined' 
                                                    size='small' 
                                                    color='error' 
                                                    onClick={() => handleDialogOpen(order.order_id)}
                                                    sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                                                >
                                                    Cancel Order
                                                </Button>
                                            )}
                                            <Button 
                                                variant='outlined' 
                                                size='small' 
                                                onClick={() => handleRepeatOrder(order.items)}
                                                sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                                            >
                                                Repeat Order
                                            </Button>
                                            
                                            {/* Show/Hide Items Button for Mobile */}
                                            {isMobile && (
                                                <Button
                                                    onClick={() => handleExpandOrder(order.order_id)}
                                                    endIcon={expandedOrder === order.order_id ? <ExpandLess /> : <ExpandMore />}
                                                    size="small"
                                                    fullWidth
                                                    sx={{ textTransform: 'none', mt: 1 }}
                                                >
                                                    {expandedOrder === order.order_id ? 'Hide' : 'Show'} Items ({order.items.length})
                                                </Button>
                                            )}
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Divider />

                            {/* Order Items - Always visible on desktop, collapsible on mobile */}
                            {!isMobile && (
                                <Box>
                                    {order.items.map(item => (
                                        <OrderItem key={item.id} item={item} />
                                    ))}
                                </Box>
                            )}

                            {/* Collapsible items for mobile */}
                            {isMobile && (
                                <Collapse in={expandedOrder === order.order_id} timeout="auto">
                                    {order.items.map(item => (
                                        <OrderItem key={item.id} item={item} />
                                    ))}
                                </Collapse>
                            )}

                            {/* Order Status Stepper */}
                            <Box sx={{ 
                                p: { xs: 2, md: 3 }, 
                                bgcolor: 'grey.50'
                            }}>
                                {order.status === "cancelled" ? (
                                    <Stepper 
                                        activeStep={1} 
                                        alternativeLabel
                                        sx={{
                                            '& .MuiStepLabel-label': {
                                                fontSize: { xs: '0.8rem', md: '0.875rem' }
                                            }
                                        }}
                                    >
                                        {cancelledSteps.map((label, index) => {
                                            const labelProps = {};
                                            if (isStepFailed(index)) {
                                                labelProps.error = true;
                                            }
                                            return (
                                                <Step key={label}>
                                                    <StepLabel {...labelProps}>{label}</StepLabel>
                                                </Step>
                                            );
                                        })}
                                    </Stepper>
                                ) : (
                                    <Stepper 
                                        activeStep={getCurrentStatus(order.status)} 
                                        alternativeLabel
                                        sx={{
                                            '& .MuiStepLabel-label': {
                                                fontSize: { xs: '0.8rem', md: '0.875rem' }
                                            }
                                        }}
                                    >
                                        {steps.map((label) => (
                                            <Step key={label}>
                                                <StepLabel>{label}</StepLabel>
                                            </Step>
                                        ))}
                                    </Stepper>
                                )}
                            </Box>
                        </Paper>
                    ))
                    }
                    </>
                )}

                {/* Pagination */}
                {!loading && allOrders?.length > 0 && (
                    <Box sx={{ 
                        display: "flex", 
                        justifyContent: "center", 
                        py: 3
                    }}>
                        <Pagination 
                            count={totalPages} 
                            page={currentPage} 
                            onChange={handlePageChange} 
                            color="primary" 
                            showFirstButton 
                            showLastButton
                            size={isMobile ? 'small' : 'medium'}
                        />
                    </Box>
                )}
            </Container>
        </Box>
    )
}

// Separate component for order items to keep code clean
// function OrderItem({ item }) {
//     return (
//         <Box sx={{ borderBottom: '1px solid', borderColor: 'divider'}}>
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

export default MyOrders
