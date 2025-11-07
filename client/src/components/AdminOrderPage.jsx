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
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Paper from '@mui/material/Paper';
import dayjs from 'dayjs';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { useForm } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import { orderService } from '../api/services/orderService';
const API_URL = import.meta.env.VITE_API_SERVER;


function AdminOrderPage() {
    const { orderId } = useParams()
    const dispatch = useDispatch()
    // const [data, setData] = useState(null);
    const [order, setOrder] = useState(null);
    const [user, setUser] = useState(null);
    const [payments, setPayments] = useState(null);
    const [products, setProducts] = useState(null);
    const [error, setError] = useState(null);
    const token = useSelector(state => state.userReducer.token)
    const allStatus = ["pending", "accepted", "dispatched", "delivered", "cancelled"]
    const [openDialog, setOpenDialog] = useState(false)
    // const orderParam = useParams()
    // console.log(orderParam);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const fetchData = async () => {
        try {
            // const response = await fetch(`${API_URL}/admin/order?orderId=${orderId}`, {
            //     headers: {
            //         Authorization: `Bearer ${token}`,
            //     }
            // });
            // if (!response.ok) {
            //     const error = await response.json()
            //     console.error(error.error);
            //     return
            //     // throw new Error(`Error status: ${response.status}`);
            // }
            // const result = await response.json();

            const result =  await orderService.getAdminOrderPage(orderId)
            setOrder(result.order)
            setUser(result.user)
            setProducts(result.products)
            setPayments(result.payments)
        } 
        catch (err) {
            console.error(err)
            setError(err);
        }
    };

    useEffect(() => {
        fetchData()
    }, [orderId])

    const getDisplayOrderStatus = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }

    const getDisplayPaymentStatus = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }

    const getNextStatus = (status) => {
        const index = allStatus.indexOf(status)
        // if(index === allStatus.length-1){
        //     return allStatus[1]
        // }
        return allStatus[index+1]
    }

    const handleStatus = () => {
        dispatch(updateOrderStatus(parseInt(orderId), getNextStatus(order.status)))
        setOrder(prev => ({...prev, status: getNextStatus(order.status)}))
    }

    const handleCancel = async (formData) => {
        // dispatch(updateOrderStatus(parseInt(orderId), "cancelled"))

        console.log(formData);
        try{
            // const response = await fetch(`${API_URL}/admin/order-cancel-admin`, {
            //     method: "POST",
            //     headers: {
            //         Authorization: `Bearer ${token}`,
            //         "Content-Type": "application/json"
            //     },
            //     body: JSON.stringify({
            //         orderId,
            //         userId: user.user_id,
            //         reason: formData.reason
            //     })
            // })
            // if(!response.ok){
            //     const error = await adminOrders.json()
            //     console.error("Could not cancel Order:", error.error);
            //     return
            // }

            const cancelOrder = await orderService.cancelOrderAdmin(orderId, user.user_id, formData.reason)
            reset()
            setOpenDialog(false)
            setOrder(prev => ({...prev, status: "cancelled"}))
            fetchData()
            // NEW FETCH TO GET REFUND PAYMENT ENTRY. 
        }
        catch (err){
            // dispatch(adminOrdersFailed(err.message))
            console.error("Could not cancel Order:", err.message);
        }
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }
    if (!order) {
        return <div>Loading...</div>;
    }

    return (
        <Box sx={{ py: 1.5, px: 4, bgcolor: "#EEEEEE", minHeight: "91vh" }}>
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
                <DialogTitle>Cancel Order</DialogTitle>
                <form onSubmit={handleSubmit(handleCancel)} noValidate>
                    <DialogContent sx={{pt: 0}}>
                        <DialogContentText sx={{pb: 2}}>
                            The order amount will be refunded in user's wallet.
                        </DialogContentText>
                        <TextField
                            label="Reason"
                            {...register("reason", { required: "Reason is required" })}
                            autoFocus
                            margin="none"
                            fullWidth
                            autoComplete='off'
                            slotProps={{htmlInput: { maxLength: 150 }}}
                            error={!!errors.reason}
                            helperText={errors.reason?.message}
                        />
                    </DialogContent>
                    <DialogActions sx={{py: 2, px: 3}}>
                        <Button onClick={() => setOpenDialog(false)} variant='contained'>Back</Button>
                        <Button type="submit" color="error" variant="contained">
                            Confirm Cancel
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
            <Card sx={{px: 2, py: 1.5}}>
                <Typography sx={{pb: 1, fontSize: 18}}>Order ID: {orderId}</Typography>
                <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                    <Box sx={{display: "flex", gap: 1, alignItems: "center"}}>
                        <Box>
                            <Typography>Order Status</Typography>
                            <Typography sx={{fontSize: 28}}>{getDisplayOrderStatus(order.status)}</Typography>
                        </Box>
                        {payments?.length > 0 ?
                            <>
                                <Divider orientation='vertical' flexItem variant='middle'/>
                                <Box>
                                    <Typography>Payment Status</Typography>
                                    <Typography sx={{fontSize: 28}}>{getDisplayPaymentStatus(payments[0].status)}</Typography>
                                </Box>
                            </>
                            :
                            null
                        }
                    </Box>
                    {// order.status === "delivered" || order.status === "cancelled" ?
                        !["delivered", "cancelled"].includes(order.status) ?
                        <Box>
                            {payments?.length > 0 && payments[0].status === "paid" ?
                                // <Button variant='contained' onClick={handleCancel} sx={{mr: 1}} color='error'>
                                <Button variant='contained' onClick={() => setOpenDialog(true)} sx={{mr: 1}} color='error'>
                                    Cancel Order
                                </Button>
                                :
                                null
                            }
                            <Button variant='contained' onClick={handleStatus}>
                                Mark as {getNextStatus(order.status)}
                            </Button>
                        </Box>
                        :
                        null
                    }
                </Box>
            </Card>
            <Box sx={{display: "flex", alignItems: "flex-start"}}>
                <Card sx={{bgcolor: "white", width: "60%", my: 2}} >
                    <Typography sx={{ p: 1, fontSize: "16px", bgcolor: "#1976D2", color: "white"}}>
                        ORDER SUMMARY
                    </Typography>
                    {products.map(item => (
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
                            <Box sx={{ml: "auto", display: "flex", flexDirection: "column", justifyContent: "center", pr: 3}}>
                                <Typography fontSize={26} fontWeight={400} color='primary'>
                                    ${item.quantity * item.price}
                                </Typography>
                            </Box>
                        </Card>
                    ))}
                    <Box sx={{textAlign: "right", pb: 2, px: 3}}>
                        {order.discount_amount && order.discount_amount > 0 ?
                            <Box>
                                <Typography fontSize={16} fontWeight={500} sx={{display: "flex", alignItems: "center"}}>
                                    CART TOTAL: 
                                    <Typography variant='span' fontSize={20} fontWeight={500} sx={{ml: "auto"}}>
                                        ${order.final_total}
                                    </Typography> 
                                </Typography>
                                <Typography fontSize={16} fontWeight={500} sx={{display: "flex", alignItems: "center"}}>
                                    COUPON DISCOUNT: 
                                    <Typography color='error' variant='span' fontSize={20} fontWeight={500} sx={{ml: "auto"}}>
                                        -${order.discount_amount}
                                    </Typography> 
                                </Typography>
                                <Divider sx={{my: 0.5}}/>
                                <Typography fontSize={16} fontWeight={500} sx={{display: "flex", alignItems: "center"}}>
                                    ORDER TOTAL: 
                                    <Typography color='success' variant='span' fontSize={20} fontWeight={500} sx={{ml: "auto"}}>
                                        ${order.final_total}
                                    </Typography> 
                                </Typography>
                            </Box>
                            :
                            <Typography fontSize={16} fontWeight={500}>
                                ORDER TOTAL:
                                <Typography variant='span' color='success' fontSize={26} fontWeight={500}>
                                    {` $${order.final_total}`} 
                                </Typography>
                            </Typography>
                        }
                    </Box>
                </Card>

                <Card sx={{bgcolor: "white", width: "40%", my: 2, ml: 3}}>
                    <Typography sx={{ p: 1, fontSize: "16px", bgcolor: "#1976D2", color: "white"}}>SHIPPING DETAILS</Typography>
                    <CardContent>
                        <Box sx={{display: "flex"}}>
                            <Box>
                                <HomeIcon color='primary' sx={{fontSize: 30, mr: 1.5, mt: 0.5}}></HomeIcon>
                            </Box>
                            <Box>
                                <Typography fontSize={18} fontWeight={500}>{user.first_name} {user.last_name}</Typography>
                                <Typography>{user.addLine1},</Typography>
                                <Typography>{user.addLine2},</Typography>
                                <Typography>{user.city}, {user.state} - {user.pincode}</Typography>
                            </Box>
                        </Box>
                        <Box sx={{display: "flex", mt:1, alignItems: "center"}}>
                            <PhoneAndroidIcon color='primary' sx={{fontSize: 30, mr: 1.5}}></PhoneAndroidIcon>
                            <Typography fontSize={18} fontWeight={500}>{user.number}</Typography>
                        </Box>
                        <Box sx={{display: "flex", mt:1.5, alignItems: "center"}}>
                            <EmailIcon color='primary' sx={{fontSize: 30, mr: 1.5}}></EmailIcon>
                            <Typography fontSize={16} fontWeight={500}>{user.email}</Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
            <Box sx={{display: "flex", alignItems: "flex-start"}}>
                <Card sx={{width: "100%"}}>
                    <Typography sx={{ p: 1, fontSize: "16px", bgcolor: "#1976D2", color: "white"}}>PAYMENT DETAILS</Typography>
                    {payments?.length > 0 ?
                        <Box sx={{mx: "auto"}}>
                            <TableContainer component={Paper} elevation={4} sx={{ minWidth: 400, maxWidth: "700px", mt: 1, mb: 2, mx: "auto"}}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center" sx={{ bgcolor: "#E7E7E7" }}>Payment ID</TableCell>
                                            <TableCell align="center" sx={{ bgcolor: "#E7E7E7" }}>Method</TableCell>
                                            <TableCell align="center" sx={{ bgcolor: "#E7E7E7" }}>Status</TableCell>
                                            <TableCell align="center" sx={{ bgcolor: "#E7E7E7" }}>Amount</TableCell>
                                            <TableCell align="center" sx={{ bgcolor: "#E7E7E7" }}>Transaction ID</TableCell>
                                            <TableCell align="center" sx={{ bgcolor: "#E7E7E7" }}>Time</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {payments.map(row => (
                                            <TableRow
                                                key={row.id}
                                                sx={{ 
                                                    "& td": {borderRight: "1px solid rgba(224, 224, 224, 1)"},
                                                    "& td:last-of-type" : {borderRight: 0},
                                                    '&:last-child td': { borderBottom: 0}
                                                }}
                                            >
                                                <TableCell align='right'>{row.id}</TableCell>
                                                <TableCell align="left">{row.method}</TableCell>
                                                <TableCell align="left">{row.status}</TableCell>
                                                <TableCell align="left">${row.amount}</TableCell>
                                                <TableCell align="right">{row.transaction_id}</TableCell>
                                                <TableCell align="right" sx={{borderRight: "5px solid black"}}>{dayjs(row.created_at).format(`DD-MM-YYYY, hh:mm A`)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                        :
                        <Box sx={{p: 2}}>
                            <Typography>No payment details found for this order</Typography>
                        </Box>
                    }
                </Card>
            </Box>
        </Box>
    )
}

export default AdminOrderPage
