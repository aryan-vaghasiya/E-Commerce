// import Box from '@mui/material/Box'
// import Button from '@mui/material/Button'
// import Card from '@mui/material/Card'
// import Typography from '@mui/material/Typography'
// import { useEffect, useState } from 'react'
// import { useDispatch, useSelector } from 'react-redux'
// import { useNavigate } from 'react-router'
// import Container from '@mui/material/Container'
// import Skeleton from '@mui/material/Skeleton'
// import Stepper from '@mui/material/Stepper'
// import Step from '@mui/material/Step'
// import StepLabel from '@mui/material/StepLabel'
// import Dialog from '@mui/material/Dialog'
// import DialogTitle from '@mui/material/DialogTitle'
// import DialogContent from '@mui/material/DialogContent'
// import DialogContentText from '@mui/material/DialogContentText'
// import DialogActions from '@mui/material/DialogActions'
// import Pagination from '@mui/material/Pagination'
// import { Paper, Divider, Grid, Chip, Collapse, useMediaQuery, useTheme } from '@mui/material'
// import { ExpandMore, ExpandLess } from '@mui/icons-material'
// import OrderItem from './OrderItem'
// import OrderFilterModal from './OrderFilterModal'
// import FilterAltIcon from '@mui/icons-material/FilterAlt';

// function MyOrders() {
//     const userState = useSelector(state => state.userReducer)
//     const navigate = useNavigate()
//     const dispatch = useDispatch()
//     const [loading, setLoading] = useState(true)
//     const [openDialog, setOpenDialog] = useState(false)
//     const [selectedOrderId, setSelectedOrderId] = useState(null)
//     const [expandedOrder, setExpandedOrder] = useState(null)

//     const theme = useTheme()
//     const isMobile = useMediaQuery(theme.breakpoints.down('md'))

//     const [allOrders, setAllOrders] = useState(null)
//     const [currentPage, setCurrentPage] = useState(1)
//     const [totalPages, setTotalPages] = useState(1)
//     const [totalFilteredOrders, setTotalFilteredOrders] = useState(1)
//     const [totalOrders, setTotalOrders] = useState(1)
//     const [filterModalOpen, setFilterModalOpen] = useState(false)
//     const [activeFilters, setActiveFilters] = useState({
//         "dateOption": "last3months",
//         "status": "All",
//         "sortBy": "date",
//         "orderBy": "desc"
//     })

//     const activeFilterCount = Object.keys(activeFilters).length
//     const steps = ["Order Placed", "Order Accepted", "Order Dispatched", "Order Delivered"]
//     const cancelledSteps = ["Order Placed", "Order Cancelled"]
//     const allStatus = ["pending", "accepted", "dispatched", "delivered"]
//     const defaultFilters = {
//         "dateOption": "last3months",
//         "status": "All",
//         "sortBy": "date",
//         "orderBy": "desc"
//     }

//     const fetchOrders = async (token, page = 1, limit = 10, filters = activeFilters) => {
//         setLoading(true)
//         try {
//             console.log(activeFilters);
            
//             const params = new URLSearchParams({page, limit, ...filters})
//             console.log(params.toString());
            
//             // const res = await fetch(`http://localhost:3000/orders/get-orders?page=${page}&limit=${limit}`, {
//             const res = await fetch(`http://localhost:3000/orders/get-orders?${params.toString()}`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });
//             if(!res.ok){
//                 const error = await res.json();
//                 console.error("Could not fetch Orders:", error.error)
//                 return false
//             }
//             const orderData = await res.json();
//             console.log(orderData);
//             // setAllOrders(orderData.orders.reverse())
//             setAllOrders(orderData.orders)
//             setCurrentPage(orderData.currentPage)
//             setTotalPages(orderData.pages)
//             setTotalFilteredOrders(orderData.totalFiltered)
//             setTotalOrders(orderData.total)
//         }
//         catch (err) {
//             console.error("Orders fetch failed:", err.message);
//         }
//         finally{
//             setLoading(false)
//         }
//     }

//     const handleRepeatOrder = async (products)=> {
//         const newItems = products.map(item => ({productId: item.id, quantity: item.quantity}))
//         console.log(newItems);

//         try{
//             const response = await fetch(`http://localhost:3000/cart/bulk-add`, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     Authorization : `Bearer ${userState.token}`
//                 },
//                 body: JSON.stringify({items: newItems})
//             })
//             if(!response.ok){
//                 const error = await response.json()
//                 return console.log(error)
//             }
//             navigate("/cart")
//         }
//         catch(err){
//             console.error(err.message)
//         }
//     }

//     const handleCancel = async () => {
//         if(!selectedOrderId) return
//         try{
//             const response = await fetch(`http://localhost:3000/orders/cancel-user`, {
//                 method: "POST",
//                 headers: {
//                     Authorization: `Bearer ${userState.token}`,
//                     "Content-Type": "application/json"
//                 },
//                 body: JSON.stringify({orderId: selectedOrderId})
//             })
//             if(!response.ok){
//                 const error = await response.json()
//                 console.error("Could not cancel Order:", error.error);
//                 return
//             }
//             handleDialogClose()
//             fetchOrders(userState.token, 1, 10)
//         }
//         catch (err){
//             console.error("Could not cancel Order:", err.message);
//         }
//     }

//     const handleDialogOpen = (orderId) => {
//         setSelectedOrderId(orderId)
//         setOpenDialog(true)
//     }
    
//     const handleDialogClose = () => {
//         setOpenDialog(false)
//         setSelectedOrderId(null)
//     }

//     const handlePageChange = (event, value) => {
//         fetchOrders(userState.token, value, 10, activeFilters)
//         window.scrollTo({top: 0, left: 0, behavior: 'smooth'})
//     }

//     const getCurrentStatus = (status) => {
//         const index = allStatus.indexOf(status)
//         return status === "delivered"? index+1 : status !== "cancelled" ? index : null
//     }

//     const isStepFailed = (step) => {
//         return step === 1;
//     };

//     const getStatusColor = (status) => {
//         switch(status) {
//             case 'pending': return 'warning'
//             case 'accepted': return 'info' 
//             case 'dispatched': return 'primary'
//             case 'delivered': return 'success'
//             case 'cancelled': return 'error'
//             default: return 'default'
//         }
//     }

//     const handleApplyFilters = (filters) => {
//         setActiveFilters(filters)

//         const params = new URLSearchParams();

//         for (const [key, value] of Object.entries(filters)) {
//             params.set(key, value)
//         }

//         fetchOrders(userState.token, 1, 10, Object.fromEntries(params))
//     }

//     const handleExpandOrder = (orderId) => {
//         setExpandedOrder(expandedOrder === orderId ? null : orderId)
//     }

//     useEffect(() => {
//         fetchOrders(userState.token, 1, 10)
//     },[])

//     if (totalOrders === 0 && allOrders?.length === 0) {
//         return (
//             <Box sx={{ 
//                 display: "flex", 
//                 flexDirection: "column", 
//                 bgcolor: "#F8F9FA", 
//                 alignItems: "center", 
//                 justifyContent: "center",
//                 minHeight: "91vh",
//                 p: 3
//             }}>
//                 <Typography variant="h5" component="h1" gutterBottom color="text.secondary">
//                     No Orders Yet
//                 </Typography>
//                 <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
//                     Start shopping to see your orders here
//                 </Typography>
//                 <Button 
//                     variant="contained" 
//                     onClick={() => navigate("/")} 
//                     size="large"
//                     sx={{ minWidth: 200 }}
//                 >
//                     Start Shopping
//                 </Button>
//             </Box>
//         )
//     }

//     if (totalOrders !== 0 && allOrders?.length === 0) {
//         return (
//             <Box sx={{ 
//                 display: "flex", 
//                 flexDirection: "column", 
//                 bgcolor: "#F8F9FA", 
//                 alignItems: "center", 
//                 justifyContent: "center",
//                 minHeight: "91vh",
//                 p: 3
//             }}>
//                 <OrderFilterModal
//                     open={filterModalOpen}
//                     onClose={() => setFilterModalOpen(false)}
//                     onApplyFilters={handleApplyFilters}
//                     currentFilters={activeFilters}
//                 />
//                 <Typography variant="h5" component="h1" gutterBottom color="text.secondary">
//                     No results found for these Filter options
//                 </Typography>
//                 <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
//                     Change filters to get order details
//                 </Typography>
//                 {/* <Button 
//                     variant="contained" 
//                     onClick={() => navigate("/")} 
//                     size="large"
//                     sx={{ minWidth: 200 }}
//                 >
//                     Start Shopping
//                 </Button> */}
//                 <Button
//                     variant="outlined"
//                     startIcon={<FilterAltIcon />}
//                     onClick={() => setFilterModalOpen(true)}
//                     sx={{ 
//                         minWidth: { xs: 'auto', sm: 120 },
//                         px: { xs: 1, sm: 2 }
//                     }}
//                 >
//                     <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Filter</Box>
//                     {activeFilterCount > 0 && (
//                         <Chip 
//                             label={activeFilterCount} 
//                             size="small" 
//                             color="primary"
//                             sx={{ ml: { xs: 0, sm: 1 }, minWidth: 20, height: 20 }}
//                         />
//                     )}
//                 </Button>
//             </Box>
//         )
//     }

//     return (
//         <Box sx={{ 
//             // bgcolor: "#F8F9FA", 
//             bgcolor: "#EEEEEE", 
//             minHeight: "91vh", 
//             py: { xs: 2, md: 3 }
//         }}>
            
//             <OrderFilterModal
//                 open={filterModalOpen}
//                 onClose={() => setFilterModalOpen(false)}
//                 onApplyFilters={handleApplyFilters}
//                 currentFilters={activeFilters}
//             />

//             {/* Cancel Order Dialog */}
//             <Dialog
//                 open={openDialog}
//                 onClose={handleDialogClose}
//                 maxWidth="sm"
//                 fullWidth
//                 slotProps={{
//                     paper:{
//                         sx: { m: { xs: 2, sm: 3 } }
//                     }
//                 }}
//                 // PaperProps={{
//                 //     sx: { m: { xs: 2, sm: 3 } }
//                 // }}
//             >
//                 <DialogTitle sx={{ pb: 1 }}>
//                     Cancel Order?
//                 </DialogTitle>
//                 <DialogContent>
//                     <DialogContentText sx={{ mb: 2 }}>
//                         Are you sure you want to cancel this order?
//                     </DialogContentText>
//                     <DialogContentText color="text.secondary">
//                         If this is a prepaid order, you will get a refund in your wallet.
//                     </DialogContentText>
//                 </DialogContent>
//                 <DialogActions sx={{ p: 3, pt: 1 }}>
//                     <Button onClick={handleDialogClose} sx={{ mr: 1 }}>
//                         Keep Order
//                     </Button>
//                     <Button 
//                         onClick={handleCancel} 
//                         variant='contained' 
//                         color='error'
//                         autoFocus
//                     >
//                         Cancel Order
//                     </Button>
//                 </DialogActions>
//             </Dialog>

//             <Container maxWidth="lg">
//                 {loading ? (
//                     // Loading Skeletons
//                     Array.from(Array(3)).map((_, index) => (
//                         <Paper key={index} elevation={1} sx={{ mb: 3, overflow: 'hidden' }}>
//                             <Box sx={{ p: { xs: 2, md: 3 } }}>
//                                 <Box sx={{ 
//                                     display: 'flex', 
//                                     justifyContent: 'space-between', 
//                                     alignItems: 'flex-start',
//                                     flexDirection: { xs: 'column', sm: 'row' },
//                                     gap: 2,
//                                     mb: 2
//                                 }}>
//                                     <Box sx={{ flex: 1 }}>
//                                         <Skeleton variant='text' width="60%" height={24} />
//                                         <Skeleton variant='text' width="40%" height={20} />
//                                     </Box>
//                                     <Box sx={{ display: 'flex', gap: 1 }}>
//                                         <Skeleton variant='rectangular' width={100} height={32} />
//                                         <Skeleton variant='rectangular' width={120} height={32} />
//                                     </Box>
//                                 </Box>

//                                 <Card sx={{ bgcolor: "#EEEEEE", mb: 2 }}>
//                                     <Box sx={{ 
//                                         display: "flex", 
//                                         p: 2, 
//                                         gap: 2,
//                                         flexDirection: { xs: 'column', sm: 'row' }
//                                     }}>
//                                         <Skeleton variant='rounded' sx={{ 
//                                             width: { xs: '100%', sm: 120 }, 
//                                             height: { xs: 120, sm: 120 }
//                                         }} />
//                                         <Box sx={{ flex: 1 }}>
//                                             <Skeleton variant='text' width="80%" height={24} />
//                                             <Skeleton variant='text' width="30%" height={20} />
//                                             <Skeleton variant='text' width="40%" height={20} />
//                                         </Box>
//                                     </Box>
//                                 </Card>

//                                 <Skeleton variant='rectangular' height={60} />
//                             </Box>
//                         </Paper>
//                     ))
//                 ) : (
//                     <>
//                     <Box sx={{ 
//                         display: 'flex', 
//                         justifyContent: 'space-between', 
//                         alignItems: 'center', 
//                         mb: 3,
//                         px: { xs: 2, md: 0 }
//                     }}>
//                         <Typography variant="h5" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
//                             My Orders
//                         </Typography>
//                         <Button
//                             variant="outlined"
//                             startIcon={<FilterAltIcon />}
//                             onClick={() => setFilterModalOpen(true)}
//                             sx={{ 
//                                 minWidth: { xs: 'auto', sm: 120 },
//                                 px: { xs: 1, sm: 2 }
//                             }}
//                         >
//                             <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Filter</Box>
//                             {activeFilterCount > 0 && (
//                                 <Chip 
//                                     label={activeFilterCount} 
//                                     size="small" 
//                                     color="primary"
//                                     sx={{ ml: { xs: 0, sm: 1 }, minWidth: 20, height: 20 }}
//                                 />
//                             )}
//                         </Button>
//                     </Box>
                    
//                     {allOrders?.length > 0 && allOrders.map((order, index) => (
//                         <Paper key={index} elevation={2} sx={{ mb: 3, overflow: 'hidden' }}>
//                             {/* Order Header */}
//                             <Box sx={{ 
//                                 p: { xs: 2, md: 3 },
//                                 bgcolor: 'background.paper'
//                             }}>
//                                 <Grid container spacing={2} alignItems="flex-start">
//                                     <Grid size={{xs: 12, md: 8}}>
//                                         <Typography 
//                                             variant="subtitle1" 
//                                             fontWeight="bold" 
//                                             sx={{ mb: 1, fontSize: { xs: '1rem', md: '1.1rem' } }}
//                                         >
//                                             Order ID: #{order.order_id}
//                                         </Typography>
                                        
//                                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
//                                             {order.final_total && order.discount > 0 && (
//                                                 <Typography variant="body2" color="text.secondary">
//                                                     ${order.cartValue}
//                                                 </Typography>
//                                             )}
//                                             <Chip 
//                                                 label={order.status.toUpperCase()} 
//                                                 color={getStatusColor(order.status)}
//                                                 size="small"
//                                                 sx={{ fontWeight: 600 }}
//                                             />
//                                         </Box>

//                                             <Box sx={{ mt: 1 }}>
//                                             {order.final_total && order.discount > 0 && (
//                                                 <Typography variant="body2" color="success.main" fontWeight="500">
//                                                     Discount: -${order.discount}
//                                                 </Typography>
//                                             )}
//                                                 <Typography variant="body1" fontWeight="bold">
//                                                     Total: ${order.final_total}
//                                                 </Typography>
//                                             </Box>
                                        
//                                     </Grid>

//                                     <Grid size={{xs: 12, md: 4}}>
//                                         <Box sx={{ 
//                                             display: "flex", 
//                                             gap: 1, 
//                                             flexDirection: { xs: 'row', md: 'column' },
//                                             flexWrap: 'wrap'
//                                         }}>
//                                             {(order.status === "pending" || order.status === "accepted") && (
//                                                 <Button 
//                                                     variant='outlined' 
//                                                     size='small' 
//                                                     color='error' 
//                                                     onClick={() => handleDialogOpen(order.order_id)}
//                                                     sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
//                                                 >
//                                                     Cancel Order
//                                                 </Button>
//                                             )}
//                                             <Button 
//                                                 variant='outlined' 
//                                                 size='small' 
//                                                 onClick={() => handleRepeatOrder(order.items)}
//                                                 sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
//                                             >
//                                                 Repeat Order
//                                             </Button>
                                            
//                                             {/* Show/Hide Items Button for Mobile */}
//                                             {isMobile && (
//                                                 <Button
//                                                     onClick={() => handleExpandOrder(order.order_id)}
//                                                     endIcon={expandedOrder === order.order_id ? <ExpandLess /> : <ExpandMore />}
//                                                     size="small"
//                                                     fullWidth
//                                                     sx={{ textTransform: 'none', mt: 1 }}
//                                                 >
//                                                     {expandedOrder === order.order_id ? 'Hide' : 'Show'} Items ({order.items.length})
//                                                 </Button>
//                                             )}
//                                         </Box>
//                                     </Grid>
//                                 </Grid>
//                             </Box>

//                             <Divider />

//                             {/* Order Items - Always visible on desktop, collapsible on mobile */}
//                             {!isMobile && (
//                                 <Box>
//                                     {order.items.map(item => (
//                                         <OrderItem key={item.id} item={item} />
//                                     ))}
//                                 </Box>
//                             )}

//                             {/* Collapsible items for mobile */}
//                             {isMobile && (
//                                 <Collapse in={expandedOrder === order.order_id} timeout="auto">
//                                     {order.items.map(item => (
//                                         <OrderItem key={item.id} item={item} />
//                                     ))}
//                                 </Collapse>
//                             )}

//                             {/* Order Status Stepper */}
//                             <Box sx={{ 
//                                 p: { xs: 2, md: 3 }, 
//                                 bgcolor: 'grey.50'
//                             }}>
//                                 {order.status === "cancelled" ? (
//                                     <Stepper 
//                                         activeStep={1} 
//                                         alternativeLabel
//                                         sx={{
//                                             '& .MuiStepLabel-label': {
//                                                 fontSize: { xs: '0.8rem', md: '0.875rem' }
//                                             }
//                                         }}
//                                     >
//                                         {cancelledSteps.map((label, index) => {
//                                             const labelProps = {};
//                                             if (isStepFailed(index)) {
//                                                 labelProps.error = true;
//                                             }
//                                             return (
//                                                 <Step key={label}>
//                                                     <StepLabel {...labelProps}>{label}</StepLabel>
//                                                 </Step>
//                                             );
//                                         })}
//                                     </Stepper>
//                                 ) : (
//                                     <Stepper 
//                                         activeStep={getCurrentStatus(order.status)} 
//                                         alternativeLabel
//                                         sx={{
//                                             '& .MuiStepLabel-label': {
//                                                 fontSize: { xs: '0.8rem', md: '0.875rem' }
//                                             }
//                                         }}
//                                     >
//                                         {steps.map((label) => (
//                                             <Step key={label}>
//                                                 <StepLabel>{label}</StepLabel>
//                                             </Step>
//                                         ))}
//                                     </Stepper>
//                                 )}
//                             </Box>
//                         </Paper>
//                     ))
//                     }
//                     </>
//                 )}

//                 {/* Pagination */}
//                 {!loading && allOrders?.length > 0 && (
//                     <Box sx={{ 
//                         display: "flex", 
//                         justifyContent: "center", 
//                         py: 3
//                     }}>
//                         <Pagination 
//                             count={totalPages} 
//                             page={currentPage} 
//                             onChange={handlePageChange} 
//                             color="primary" 
//                             showFirstButton 
//                             showLastButton
//                             size={isMobile ? 'small' : 'medium'}
//                         />
//                     </Box>
//                 )}
//             </Container>
//         </Box>
//     )
// }

// export default MyOrders

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
import { Paper, Divider, Grid, Chip, Collapse, useMediaQuery, useTheme, Stack, Avatar, IconButton } from '@mui/material'
import { ExpandMore, ExpandLess, LocalShipping, CheckCircle, Cancel, Pending, Repeat } from '@mui/icons-material'
import OrderItem from './OrderItem'
import OrderFilterModal from './OrderFilterModal'
import FilterAltIcon from '@mui/icons-material/FilterAlt'

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
    const steps = ["Order Placed", "Order Accepted", "Order Dispatched", "Order Delivered"]
    const cancelledSteps = ["Order Placed", "Order Cancelled"]
    const allStatus = ["pending", "accepted", "dispatched", "delivered"]

    const fetchOrders = async (token, page = 1, limit = 10, filters = activeFilters) => {
        setLoading(true)
        try {
            const params = new URLSearchParams({page, limit, ...filters})
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
        fetchOrders(userState.token, value, 10, activeFilters)
        window.scrollTo({top: 0, left: 0, behavior: 'smooth'})
    }

    const getCurrentStatus = (status) => {
        const index = allStatus.indexOf(status)
        return status === "delivered"? index+1 : status !== "cancelled" ? index : null
    }

    const isStepFailed = (step) => {
        return step === 1;
    };

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

    const handleExpandOrder = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId)
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

            <Container maxWidth="lg" sx={{ px: { xs: 1, md: 3 } }}>
                {loading ? (
                    // Redesigned Loading Skeletons
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
                    {/* Redesigned Header */}
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
                                        // bgcolor: 'primary.dark',
                                        bgcolor: "warning.main",
                                        color: 'white',
                                        height: 20,
                                        '& .MuiChip-label': { px: 1, fontSize: '0.75rem' }
                                    }}
                                />
                            )}
                        </Button>
                    </Box>
                    
                    {/* Completely Redesigned Order Cards */}
                    {allOrders?.length > 0 && allOrders.map((order, index) => {
                        const statusConfig = getStatusConfig(order.status)
                        return (
                            <Card key={index} elevation={3} sx={{ 
                                mb: 2, 
                                borderRadius: 2,
                                overflow: 'hidden',
                                border: '1px solid',
                                borderColor: 'grey.200',
                                // '&:hover': {
                                //     boxShadow: 6,
                                //     transform: 'translateY(-2px)',
                                //     transition: 'all 0.2s ease-in-out'
                                // }
                            }}>
                                {/* Compact Order Header with Status Bar */}
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
                                                        <Typography variant="body2" fontWeight="600" color="primary.main">
                                                            ${order.final_total || order.cartValue}
                                                        </Typography>
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
                                                    </Box>
                                                </Box>
                                            </Box>

                                            {/* Action Buttons */}
                                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                {(order.status === "pending" || order.status === "accepted") && (
                                                    <Button 
                                                        variant='outlined' 
                                                        size='small' 
                                                        color='error' 
                                                        onClick={() => handleDialogOpen(order.order_id)}
                                                        sx={{ 
                                                            fontSize: '0.7rem', 
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
                                                        fontSize: '0.7rem', 
                                                        py: 0.25, 
                                                        px: 1,
                                                        textTransform: 'none'
                                                    }}
                                                >
                                                    Reorder
                                                </Button>
                                                
                                                {/* Mobile expand button */}
                                                {isMobile && (
                                                    <IconButton
                                                        onClick={() => handleExpandOrder(order.order_id)}
                                                        size="small"
                                                        sx={{ p: 0.5 }}
                                                    >
                                                        {expandedOrder === order.order_id ? <ExpandLess /> : <ExpandMore />}
                                                    </IconButton>
                                                )}
                                            </Box>
                                        </Box>

                                        {/* Discount info */}
                                        {order.final_total && order.discount > 0 && (
                                            <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block' }}>
                                                Saved ${order.discount} with discount!
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>

                                {/* Order Items */}
                                {!isMobile && (
                                    <Box sx={{ bgcolor: 'white' }}>
                                        {order.items.map(item => (
                                            <OrderItem key={item.id} item={item} />
                                        ))}
                                    </Box>
                                )}

                                {/* Collapsible items for mobile */}
                                {isMobile && (
                                    <Collapse in={expandedOrder === order.order_id} timeout="auto">
                                        <Box sx={{ bgcolor: 'white' }}>
                                            {order.items.map(item => (
                                                <OrderItem key={item.id} item={item} />
                                            ))}
                                        </Box>
                                    </Collapse>
                                )}

                                {/* Compact Progress Stepper */}
                                <Box sx={{ 
                                    p: 1.5, 
                                    bgcolor: 'grey.50',
                                    borderTop: '1px solid',
                                    borderColor: 'divider'
                                }}>
                                    {order.status === "cancelled" ? (
                                        <Stepper 
                                            activeStep={1} 
                                            alternativeLabel
                                            sx={{
                                                '& .MuiStepLabel-label': {
                                                    fontSize: '0.7rem',
                                                    mt: 0.5
                                                },
                                                '& .MuiStepConnector-line': {
                                                    borderTopWidth: 2
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
                                                    fontSize: '0.7rem',
                                                    mt: 0.5
                                                },
                                                '& .MuiStepConnector-line': {
                                                    borderTopWidth: 2
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
                            </Card>
                        )
                    })}
                    </>
                )}

                {/* Styled Pagination */}
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
