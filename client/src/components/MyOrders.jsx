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
import { Paper, Divider, Grid, Chip, Collapse, useMediaQuery, useTheme, Stack, Avatar, IconButton, CardActionArea, Tooltip } from '@mui/material'
import { ExpandMore, ExpandLess, LocalShipping, CheckCircle, Cancel, Pending, Repeat, ArrowForward } from '@mui/icons-material'
import OrderItem from './OrderItem'
import OrderFilterModal from './OrderFilterModal'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import { orderService } from '../api/services/orderService'
import { cartService } from '../api/services/cartService'
const API_URL = import.meta.env.VITE_API_SERVER;

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
    const [totalFilteredOrders, setTotalFilteredOrders] = useState(1)
    const [totalOrders, setTotalOrders] = useState(1)
    const [filterModalOpen, setFilterModalOpen] = useState(false)
    const [activeFilters, setActiveFilters] = useState({
        "dateOption": "last3months",
        "status": "All",
        "sortBy": "date",
        "orderBy": "desc"
    })

    const activeFilterCount = Object.keys(activeFilters).length

    const fetchOrders = async (token, page = 1, limit = 10, filters = activeFilters) => {
        setLoading(true)
        try {
            const params = new URLSearchParams({page, limit, ...filters})

            // const res = await fetch(`${API_URL}/orders/get-orders?${params.toString()}`, {
            //     headers: {
            //         Authorization: `Bearer ${token}`,
            //     },
            // });
            // if(!res.ok){
            //     const error = await res.json();
            //     console.error("Could not fetch Orders:", error.error)
            //     return false
            // }
            // const orderData = await res.json();

            const orderData = await orderService.getUserOrders(params)
            setAllOrders(orderData.orders)
            setCurrentPage(orderData.currentPage)
            setTotalPages(orderData.pages)
            setTotalFilteredOrders(orderData.totalFiltered)
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
        try{
            // const response = await fetch(`${API_URL}/cart/bulk-add`, {
            //     method: "POST",
            //     headers: {
            //         Authorization : `Bearer ${userState.token}`,
            //         "Content-Type": "application/json"
            //     },
            //     body: JSON.stringify({items: newItems})
            // })
            // if(!response.ok){
            //     const error = await response.json()
            //     return console.log(error)
            // }

            const bulkAddToCart = await cartService.repeatOrder(newItems)
            navigate("/cart")
        }
        catch(err){
            console.error(err.message)
        }
    }

    const handleCancel = async () => {
        if(!selectedOrderId) return
        try{
            // const response = await fetch(`${API_URL}/orders/cancel-user`, {
            //     method: "POST",
            //     headers: {
            //         Authorization: `Bearer ${userState.token}`,
            //         "Content-Type": "application/json"
            //     },
            //     body: JSON.stringify({orderId: selectedOrderId})
            // })
            // if(!response.ok){
            //     const error = await response.json()
            //     console.error("Could not cancel Order:", error.error);
            //     return
            // }

            const cancelOrder = await orderService.cancelOrderUser(selectedOrderId)
            handleDialogClose()
            fetchOrders(userState.token, 1, 10)
        }
        catch (err){
            console.error("Could not cancel Order:", err.message);
        } finally {
            handleDialogClose()
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
        fetchOrders(userState.token, value, 10, activeFilters)
        window.scrollTo({top: 0, left: 0, behavior: 'smooth'})
    }

    const getStatusConfig = (status) => {
        switch(status) {
            case 'pending': 
                return { color: 'warning', icon: <Pending sx={{ fontSize: 16 }} />, bg: '#fff3cd' }
            case 'accepted': 
                return { color: 'info', icon: <CheckCircle sx={{ fontSize: 16 }} />, bg: '#d1ecf1' } 
            case 'dispatched': 
                return { color: 'primary', icon: <LocalShipping sx={{ fontSize: 16 }} />, bg: '#d4edda' }
            case 'delivered': 
                return { color: 'success', icon: <CheckCircle sx={{ fontSize: 16 }} />, bg: '#d4edda' }
            case 'cancelled': 
                return { color: 'error', icon: <Cancel sx={{ fontSize: 16 }} />, bg: '#f8d7da' }
            default: 
                return { color: 'default', icon: <Pending sx={{ fontSize: 16 }} />, bg: '#f8f9fa' }
        }
    }

    const handleApplyFilters = (filters) => {
        setActiveFilters(filters)
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(filters)) {
            params.set(key, value)
        }
        fetchOrders(userState.token, 1, 10, Object.fromEntries(params))
    }

    useEffect(() => {
        fetchOrders(userState.token, 1, 10)
    },[])

    if (totalOrders === 0 && allOrders?.length === 0) {
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

    if (totalOrders !== 0 && allOrders?.length === 0) {
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
                <OrderFilterModal
                    open={filterModalOpen}
                    onClose={() => setFilterModalOpen(false)}
                    onApplyFilters={handleApplyFilters}
                    currentFilters={activeFilters}
                />
                <Typography variant="h5" component="h1" gutterBottom color="text.secondary">
                    No results found for these Filter options
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                    Change filters to get order details
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
        )
    }

    return (
        <Box sx={{ 
            // bgcolor: "#f5f5f5", 
            bgcolor: "#EEEEEE", 
            minHeight: "91vh", 
            py: { xs: 1, md: 2 }
        }}>
            
            <OrderFilterModal
                open={filterModalOpen}
                onClose={() => setFilterModalOpen(false)}
                onApplyFilters={handleApplyFilters}
                currentFilters={activeFilters}
            />

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

            <Container maxWidth="md" sx={{ px: { xs: 1, md: 3 } }}>
                {loading ? (
                    Array.from(Array(3)).map((_, index) => (
                        <Card key={index} elevation={2} sx={{ mb: 1.5, borderRadius: 2 }}>
                            <Box sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Skeleton variant="circular" width={32} height={32} />
                                        <Box>
                                            <Skeleton variant='text' width="120px" height={20} />
                                            <Skeleton variant='text' width="80px" height={16} />
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Skeleton variant='rounded' width={70} height={24} />
                                        <Skeleton variant='rounded' width={90} height={24} />
                                    </Box>
                                </Box>
                                <Skeleton variant='rectangular' height={80} sx={{ borderRadius: 1 }} />
                            </Box>
                        </Card>
                    ))
                ) : (
                    <>
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        mb: 2,
                        bgcolor: 'white',
                        p: 2,
                        borderRadius: 2,
                        boxShadow: 1
                    }}>
                        <Typography variant="h4" fontWeight="bold" color="primary.main" sx={{ fontSize: { xs: '1rem', md: '1.5rem' } }}>
                            My Orders
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<FilterAltIcon />}
                            onClick={() => setFilterModalOpen(true)}
                            sx={{ 
                                borderRadius: 2,
                                px: 2,
                                py: 1,
                                textTransform: 'none',
                                fontWeight: 600
                            }}
                        >
                            <Box sx={{ display: { xs: 'none', sm: 'inline' }, mr: activeFilterCount > 0 ? 1 : 0 }}>
                                Filters
                            </Box>
                            {activeFilterCount > 0 && (
                                <Chip 
                                    label={activeFilterCount} 
                                    size="small" 
                                    sx={{ 
                                        bgcolor: "warning.main",
                                        color: 'white',
                                        height: 20,
                                        '& .MuiChip-label': { px: 1, fontSize: '0.75rem' }
                                    }}
                                />
                            )}
                        </Button>
                    </Box>
                    
                    {allOrders?.length > 0 && allOrders.map((order, index) => {
                        const statusConfig = getStatusConfig(order.status)
                        return (
                            <Card key={index} elevation={3} sx={{ 
                                mb: 2, 
                                borderRadius: 2,
                                overflow: 'hidden',
                                border: '1px solid',
                                borderColor: 'grey.200',
                            }}>

                                <Box sx={{ 
                                    bgcolor: statusConfig.bg,
                                    borderBottom: '1px solid',
                                    borderColor: 'divider'
                                }}>
                                    <Box sx={{ p: 1.5 }}>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            gap: 1
                                        }}>
                                            {/* Order Info with Status Icon */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ 
                                                    bgcolor: `${statusConfig.color}.main`,
                                                    width: 32, 
                                                    height: 32 
                                                }}>
                                                    {statusConfig.icon}
                                                </Avatar>
                                                <Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.9rem' }}>
                                                            #{order.order_id}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Chip 
                                                            label={order.status.toUpperCase()} 
                                                            color={statusConfig.color}
                                                            size="small"
                                                            sx={{ 
                                                                height: 20,
                                                                fontSize: '0.7rem',
                                                                fontWeight: 600,
                                                                '& .MuiChip-label': { px: 1 }
                                                            }}
                                                        />
                                                        <Typography variant="body1" fontWeight="600" color="primary.main">
                                                            ${order.final_total || order.cartValue}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: "center" }}>
                                                {(order.status === "pending" || order.status === "accepted") && (
                                                    <Button 
                                                        variant='outlined' 
                                                        size='small' 
                                                        color='error' 
                                                        onClick={() => handleDialogOpen(order.order_id)}
                                                        sx={{ 
                                                            fontSize: '0.8rem', 
                                                            py: 0.25, 
                                                            px: 1,
                                                            minWidth: 'auto',
                                                            textTransform: 'none'
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                )}
                                                <Button 
                                                    variant='outlined' 
                                                    size='small'
                                                    onClick={() => handleRepeatOrder(order.items)}
                                                    startIcon={<Repeat sx={{ fontSize: 14 }} />}
                                                    sx={{ 
                                                        fontSize: '0.8rem', 
                                                        py: 0.25, 
                                                        px: 1,
                                                        textTransform: 'none'
                                                    }}
                                                >
                                                    Reorder
                                                </Button>
                                                <Tooltip title="Order Details">
                                                    <IconButton onClick={() => navigate(`/my-orders/${order.order_id}`, {state: order})}>
                                                        <ArrowForward/>
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>

                                        {/* {order.final_total && order.discount > 0 && (
                                            <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block' }}>
                                                Saved ${order.discount} with discount!
                                            </Typography>
                                        )} */}
                                    </Box>
                                </Box>

                                <Box sx={{ bgcolor: 'white' }}>
                                    {order.items.map(item => (
                                        <OrderItem key={item.id} item={item} />
                                    ))}
                                </Box>
                            </Card>
                        )
                    })}
                    </>
                )}

                {!loading && allOrders?.length > 0 && (
                    <Box sx={{ 
                        display: "flex", 
                        justifyContent: "center", 
                        py: 2,
                        mt: 2
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

export default MyOrders
