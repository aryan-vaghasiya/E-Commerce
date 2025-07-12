import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router'
import StarIcon from '@mui/icons-material/Star'
import Divider from '@mui/material/Divider';
import CardContent from '@mui/material/CardContent';
import HomeIcon from '@mui/icons-material/Home';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import EmailIcon from '@mui/icons-material/Email';
import { updateOrderStatus } from '../redux/adminOrders/adminOrderActions';
import { getImageUrl } from '../utils/imageUrl';


function AdminOrderPage() {
    const { orderId } = useParams()
    const dispatch = useDispatch()
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const token = useSelector(state => state.userReducer.token)
    const allStatus = ["pending", "accepted", "dispatched", "delivered", "cancelled"]
    // const orderParam = useParams()
    // console.log(orderParam); 

    useEffect(() => {
        const fetchData = async () => {
            try {
                // console.log("fetching...");
                const response = await fetch(`http://localhost:3000/admin/order?orderId=${orderId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (!response.ok) {
                    const error = await response.json()
                    console.error(error.error);
                    return 
                    // throw new Error(`Error status: ${response.status}`);
                }
                const result = await response.json();
                // console.log(result);
                setData(result);
            } 
            catch (err) {
                console.error(err)
                setError(err);
            }
        };
        fetchData()
    }, [orderId])

    const getStatus = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        // const newStatus = status === "pending" ? "Pending" : 
        //                 status === "accepted" ? "Accepted" :
        //                 status === "dispatched" ? "Dispatched" :
        //                 status === "delivered" ? "Delivered" :
        //                 status === "cancelled" ? "Cancelled" :
        //                 null;
        // console.log(newStatus);
        // return newStatus
    }

    const getNextStatus = (status) => {
        const index = allStatus.indexOf(status)
        if(index === allStatus.length-1){
            return allStatus[1]
        }
        return allStatus[index+1]
    }

    const handleStatus = () => {
        // console.log(getNextStatus(data.status));
        // console.log(orderId);
        
        dispatch(updateOrderStatus(parseInt(orderId), getNextStatus(data.status)))
        // window.location.href = `/admin/order/${orderId}`
        // window.location.reload();

        setData(prev => ({...prev, status: getNextStatus(data.status)}))
    }
    const handleCancel = () => {
        dispatch(updateOrderStatus(parseInt(orderId), "cancelled"))
        setData(prev => ({...prev, status: "cancelled"}))
        // window.location.href = `/admin/order/${orderId}`
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }
    if (!data) {
        return <div>Loading...</div>;
    }

    return (
        <Box sx={{ py: 1.5, px: 4, bgcolor: "#EEEEEE", minHeight: "91vh" }}>
            <Typography sx={{p: 1}}>Order ID: {orderId}</Typography>
            <Card sx={{p: 1}}>
                <Box>
                    <Typography>Order Status</Typography>
                </Box>
                <Box sx={{display: "flex", justifyContent: "space-between"}}>
                    <Typography sx={{fontSize: 30}}>{getStatus(data.status)}</Typography>
                    {
                        data.status === "delivered"?
                        null
                        :
                        data.status === "cancelled"?
                        <Button variant='contained' onClick={handleStatus}>Mark as {getNextStatus(data.status)}</Button>
                        :
                        <Box>
                            <Button variant='contained' onClick={handleCancel} sx={{mr: 1}} color='error'>Cancel Order</Button>
                            <Button variant='contained' onClick={handleStatus}>Mark as {getNextStatus(data.status)}</Button>
                        </Box>
                    }
                </Box>
            </Card>
            <Box sx={{display: "flex", alignItems: "flex-start"}}>
                {
                <Card sx={{bgcolor: "white", width: "60%", my: 2}} >
                    <Typography sx={{ p: 1, fontSize: "16px", bgcolor: "#1976D2", color: "white"}}>ORDER SUMMARY</Typography>
                    {data.products.map(item => (
                        <Card key={item.product_id} sx={{display: "flex",bgcolor: "#EEEEEE", my: 2, mx: 3}} >
                            <CardMedia
                                component="img"
                                sx={{ maxWidth: 150, minHeight: 150}}
                                image={getImageUrl(item.thumbnail)}
                                alt="Product Image"
                            />
                            <Box sx={{display: "flex", pl: 2, flexDirection: "column", justifyContent: "center"}}>
                                <Typography variant='h6'>{item.title}</Typography>
                                <Typography sx={{fontSize: 13}}>Brand: {item.brand}</Typography>
                                <Box sx={{display: "inline-flex", alignItems: "center"}}>
                                        <StarIcon sx={{color: "#FF8C00", fontSize: 20}}></StarIcon>
                                        <Typography sx={{fontSize: 14, pt: 0.3, pr: 0.2}}>
                                            {item.rating}
                                        </Typography>
                                    </Box>
                                <Typography sx={{py: 1, fontSize: 20}} >{item.quantity} x ${item.price}</Typography>
                            </Box>
                            <Box sx={{ml: "auto", display: "flex", flexDirection: "column", justifyContent: "center", pr: 5}} >
                                {/* <Typography>Quantity: {item.quantity}</Typography> */}
                                <Typography fontSize={26} fontWeight={400} color='primary'>${item.quantity * item.price}</Typography>
                            </Box>
                        </Card>
                    ))}
                    <Box sx={{textAlign: "right", pb: 2, px: 3, pr: 7}}>
                        {/* <Typography>Order Number: {ordersState.length - index}</Typography> */}
                        <Typography fontSize={16} fontWeight={500}>ORDER TOTAL: <Typography variant='span' color='success' fontSize={26} fontWeight={500}>${data.total}</Typography> </Typography>
                    </Box>
                </Card>
                }
                <Card sx={{bgcolor: "white", width: "40%", my: 2, ml: 3}}>
                    <Typography sx={{ p: 1, fontSize: "16px", bgcolor: "#1976D2", color: "white"}}>SHIPPING DETAILS</Typography>
                    <CardContent>
                        <Box sx={{display: "flex"}}>
                            <Box>
                                <HomeIcon color='primary' sx={{fontSize: 30, mr: 1.5, mt: 0.5}}></HomeIcon>
                            </Box>
                            <Box>
                                <Typography fontSize={18} fontWeight={500}>{data.first_name} {data.last_name}</Typography>
                                <Typography>{data.addLine1},</Typography>
                                <Typography>{data.addLine2},</Typography>
                                <Typography>{data.city}, {data.state} - {data.pincode}</Typography>
                            </Box>
                        </Box>
                        <Box sx={{display: "flex", mt:1, alignItems: "center"}}>
                            <PhoneAndroidIcon color='primary' sx={{fontSize: 30, mr: 1.5}}></PhoneAndroidIcon>
                            <Typography fontSize={18} fontWeight={500}>{data.number}</Typography>
                        </Box>
                        <Box sx={{display: "flex", mt:1.5, alignItems: "center"}}>
                            <EmailIcon color='primary' sx={{fontSize: 30, mr: 1.5}}></EmailIcon>
                            <Typography fontSize={16} fontWeight={500}>{data.email}</Typography>
                        </Box>

                    </CardContent>
                </Card>
            </Box>
        </Box>
    )
}

export default AdminOrderPage
