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
import { fetchOrders } from '../redux/order/orderActions'
import { getImageUrl } from '../utils/imageUrl'

function MyOrders() {

    const ordersState = useSelector(state => state.orderReducer)
    const userState = useSelector(state => state.userReducer)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [loading, setLoading] = useState  (true)
    const steps = ["Order Placed", "Order Accepted", "Order Dispatched", "Order Delivered"]
    const cancelledSteps = ["Order Placed", "Order Cancelled by Seller"]
    const allStatus = ["pending", "accepted", "dispatched", "delivered"]

    useEffect(() => {
        dispatch(fetchOrders(userState.token))
        const timeOut = setTimeout(() => {
            setLoading(false)
        },1000)

        return () => clearInterval(timeOut)
    },[])   

    const handleRepeatOrder = (products)=> {
        // console.log(products);
        const newItems = products.map(item => ({productId: item.id, quantity: item.quantity}))
        console.log(newItems);

        
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
            {
            ordersState.length === 0 ?
            (
            <Box sx={{ display: "block", margin: "auto", textAlign: "center" }}>
                <Typography component="h1">No Orders Yet...</Typography>
                <Button variant="contained" onClick={() => navigate("/")} sx={{ width: "100%", my: 1 }}>Buy Something</Button>
            </Box>
            )
            :
            (
            <Container >
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
                    ordersState.map((order, index) => (
                        <Card key={index} sx={{mx: "auto", bgcolor: "white", width: "80%", my: 2}} >
                            {/* <Box sx={{textAlign: "left", pt: 2, px: 3}}> */}
                            <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", pt: 2, px: 3}}>
                                {/* <Typography>Order Number: {ordersState.length - index}</Typography> */}
                                <Box>
                                    <Typography>Order Value: ${order.cartValue}</Typography>
                                    {
                                        order.final_total && order.discount > 0?
                                        <Box>
                                            <Typography color='success' sx={{fontWeight: 500}}>Coupon: -${order.discount}</Typography>
                                            <Typography>Order Total: ${order.final_total}</Typography>
                                        </Box>
                                        :
                                        null
                                    }
                                </Box>
                                <Box>
                                    <Button variant='contained' onClick={() => handleRepeatOrder(order.products)}>Repeat Order</Button>
                                </Box>
                            </Box>
                            {order.products.map(item => (
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
            </Container>
            )
            }
        </Box>
    )
}

export default MyOrders