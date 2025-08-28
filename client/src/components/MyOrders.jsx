import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import StarIcon from '@mui/icons-material/Star'
import Container from '@mui/material/Container'
import Skeleton from '@mui/material/Skeleton'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
// import { fetchOrders } from '../redux/order/orderActions'
import { getImageUrl } from '../utils/imageUrl'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Pagination from '@mui/material/Pagination'

function MyOrders() {
    // const ordersState = useSelector(state => state.orderReducer.orders)
    // const currentPage = useSelector(state => state.orderReducer.currentPage)
    // const totalPages = useSelector(state => state.orderReducer.pages)
    // const totalOrders = useSelector(state => state.orderReducer.total)

    const userState = useSelector(state => state.userReducer)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(true)
    const [openDialog, setOpenDialog] = useState(false)
    const [selectedOrderId, setSelectedOrderId] = useState(null)

    const [allOrders, setAllOrders] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalOrders, setTotalOrders] = useState(1)

    const steps = ["Order Placed", "Order Accepted", "Order Dispatched", "Order Delivered"]
    const cancelledSteps = ["Order Placed", "Order Cancelled"]
    const allStatus = ["pending", "accepted", "dispatched", "delivered"]

    const fetchOrders = async (token, page = 1, limit = 10) => {
        try {
            const res = await fetch(`http://localhost:3000/orders/get-orders?page=${page}&limit=${limit}`, {
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
            // console.log(orderData);
            setAllOrders(orderData.orders.reverse())
            setCurrentPage(orderData.currentPage)
            setTotalPages(orderData.pages)
            setTotalOrders(orderData.total)
        }
        catch (err) {
            console.error("Orders fetch failed:", err.message);
        }
    }

    useEffect(() => {
        // dispatch(fetchOrders(userState.token, 1, 10))
        fetchOrders(userState.token, 1, 10)
        const timeOut = setTimeout(() => {
            setLoading(false)
        },1000)

        return () => clearInterval(timeOut)
    },[])   

    const handleRepeatOrder = async (products)=> {
        // console.log(products);
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
        console.log(selectedOrderId);
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
                const error = await adminOrders.json()
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
        // dispatch(fetchOrders(userState.token, value, 10))
        fetchOrders(userState.token, value, 10)
        window.scrollTo({top: 0, left: 0, behavior: 'smooth'})
    }

    const getCurrentStatus = (status) => {
        // if(status === "delivered"){
        //     const index = allStatus.indexOf(status)
        //     // console.log(index);
        //     return index
        // }
        // else if(status !== "cancelled" && status !== "delivered"){
        //     const index = allStatus.indexOf(status)
        //     // console.log(index);
        //     return index
        // }
        const index = allStatus.indexOf(status)
        return status === "delivered"? index+1 : status !== "cancelled" ? index : null
    }

    const isStepFailed = (step) => {
        return step === 1;
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", bgcolor: "#EEEEEE", alignItems: "center", minHeight: "91vh" }}>
            <Dialog
                open={openDialog}
                onClose={handleDialogClose}
            >
                <DialogTitle>
                    Cancel this order ?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to cancel this order?
                    </DialogContentText>
                    <DialogContentText>
                        If this is a prepaid order, you will get a refund in you wallet.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant='contained' onClick={handleDialogClose}>Back</Button>
                    <Button onClick={handleCancel} autoFocus variant='contained' color='error'>
                        Confirm Cancel
                    </Button>
                </DialogActions>
            </Dialog>
            {
            allOrders.length === 0 ?
            (
            <Box sx={{ display: "block", margin: "auto", textAlign: "center" }}>
                <Typography component="h1">No Orders Yet...</Typography>
                <Button variant="contained" onClick={() => navigate("/")} sx={{ width: "100%", my: 1 }}>Buy Something</Button>
            </Box>
            )
            :
            (
            <Container>
                {
                    loading? (
                        Array.from(Array(5)).map((_, index) => (
                            <Card key={index} sx={{mx: "auto", bgcolor: "white", width: "80%", my: 2}}>
                                <Box sx={{display: "flex", flexDirection: "column", alignItems: "start", ml: 3, mt: 2}}>
                                    <Skeleton variant='text' sx={{fontSize: 18, width: "10%"}} animation="wave"></Skeleton>
                                    <Skeleton variant='text' sx={{fontSize: 18, width: "13%"}} animation="wave"></Skeleton>
                                </Box>
                                <Card sx={{display: "flex", my: 2, mx: 3}} >
                                    <Box sx={{display: "inline-flex", width: "100%", alignItems: "center"}}>
                                        <Skeleton variant='rounded' sx={{minHeight: 200, minWidth: 200}} animation="wave"></Skeleton>
                                        <Box sx={{width: "60%", mx: 1}}>
                                            <Skeleton variant='text' sx={{fontSize: 24, width: "70%"}} animation="wave"></Skeleton>
                                            <Skeleton variant='text' sx={{fontSize: 14, width: "25%"}} animation="wave"></Skeleton>
                                            <Skeleton variant='text' sx={{fontSize: 15, width: "10%"}} animation="wave"></Skeleton>
                                            <Skeleton variant='text' sx={{fontSize: 18, width: "15%"}} animation="wave"></Skeleton>
                                        </Box>
                                        <Box sx={{width: "15%", mx: 1}}>
                                            <Skeleton variant='text' sx={{fontSize: 16, width: "60%"}} animation="wave"></Skeleton>
                                            <Skeleton variant='text' sx={{fontSize: 16, width: "70%"}} animation="wave"></Skeleton>
                                        </Box>
                                    </Box>
                                </Card>
                            </Card>
                        ))
                    )
                    :
                    (
                    allOrders.map((order, index) => (
                        <Card key={index} sx={{mx: "auto", bgcolor: "white", width: "80%", my: 2}} >
                            {/* <Box sx={{textAlign: "left", pt: 2, px: 3}}> */}
                            <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", pt: 2, px: 3}}>
                                {/* <Typography>Order Number: {allOrders.length - index}</Typography> */}
                                <Box>
                                    <Typography>Order ID: {order.order_id}</Typography>
                                    <Typography>Order Value: ${order.cartValue}</Typography>
                                    {order.final_total && order.discount > 0?
                                        <Box>
                                            <Typography color='success' sx={{fontWeight: 500}}>Coupon: -${order.discount}</Typography>
                                            <Typography>Order Total: ${order.final_total}</Typography>
                                        </Box>
                                        :
                                        null
                                    }
                                </Box>
                                <Box sx={{display: "flex", gap: 1}}>
                                    {
                                        order.status === "pending" || order.status === "accepted" ?
                                        <Button variant='outlined' size='small' color='error' onClick={() => handleDialogOpen(order.order_id)}>Cancel Order</Button>
                                        :
                                        null
                                    }
                                    <Button variant='outlined' size='small' onClick={() => handleRepeatOrder(order.items)}>Repeat Order</Button>
                                </Box>
                            </Box>
                            {order.items.map(item => (
                                <Card key={item.id} sx={{display: "flex",bgcolor: "#EEEEEE", my: 2, mx: 3}} >
                                    <CardMedia
                                        component="img"
                                        sx={{ maxWidth: 200, minHeight: 200}}
                                        image={getImageUrl(item.thumbnail)}
                                        alt="Product Image"
                                    />
                                    
                                    <Box sx={{display: "flex", flexDirection: "column", justifyContent: "center"}}>
                                        <Typography variant='h6'>{item.title}</Typography>
                                        <Typography sx={{fontSize: 13}}>Brand: {item.brand}</Typography>
                                        <Box sx={{display: "inline-flex", alignItems: "center"}}>
                                                <StarIcon sx={{color: "#FF8C00", fontSize: 20}}></StarIcon>
                                                <Typography sx={{fontSize: 14, pt: 0.3, pr: 0.2}}>
                                                    {item.rating}
                                                </Typography>
                                            </Box>
                                        <Typography>Price: ${item.price}</Typography>
                                    </Box>
                                    <Box sx={{ml: "auto", display: "flex", flexDirection: "column", justifyContent: "center", pr: 5}} >
                                        <Typography>Quantity: {item.quantity}</Typography>
                                        <Typography>Total: ${item.quantity * item.price}</Typography>
                                    </Box>
                                </Card>
                            ))}
                            <Box sx={{p: 2, pb: 3}}>
                            {
                                order.status === "cancelled"?
                                <Stepper activeStep={1} alternativeLabel>
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
                                :
                                <Stepper activeStep={getCurrentStatus(order.status)} alternativeLabel>
                                {steps.map((label) => (
                                    <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                    </Step>
                                ))}
                                </Stepper>
                            }
                            </Box>
                        </Card>
                    ))
                )
                }
                <Box sx={{display: "flex", justifyContent: "center", pb: 2}}>
                    <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" showFirstButton showLastButton/>
                </Box>
            </Container>
            )
            }
        </Box>
    )
}

export default MyOrders