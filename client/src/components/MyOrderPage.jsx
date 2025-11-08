import React, { useState, useEffect } from 'react'
import { Box, Container, Typography, Paper, Card, CardContent, Button, Divider, Chip, Stack, Grid, Avatar, List, ListItem, ListItemAvatar, ListItemText, Stepper, Step, StepLabel, useTheme, useMediaQuery, IconButton, CardMedia } from '@mui/material'
import { ArrowBack, Download, Person, Phone, LocationOn, Email, LocalShipping, CheckCircle, Cancel, Pending, Receipt } from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router'
import { useSelector } from 'react-redux'
import { getImageUrl } from '../utils/imageUrl'
import dayjs from 'dayjs'
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'
import OrderInvoice from './OrderInvoice'
import InvoicePreview from './InvoicePreview'
import { orderService } from '../api/services/orderService'
const API_URL = import.meta.env.VITE_API_SERVER;

const MyOrderPage = () => {
    const theme = useTheme()
    const navigate = useNavigate()
    const { orderId } = useParams()
    const userState = useSelector(state => state.userReducer)

    const isMobile = useMediaQuery(theme.breakpoints.down('md'))
    const [orderData, setOrderData] = useState(null)
    const [loading, setLoading] = useState(true)

    const statusLabels = {
        pending: "Order Placed",
        accepted: "Order Accepted",
        dispatched: "Order Dispatched",
        delivered: "Order Delivered",
        cancelled: "Order Cancelled"
    };

    const fullOrderLifecycle = ["pending", "accepted", "dispatched", "delivered"];

    const statusHistory = orderData?.statuses || [];
    let activeStep = statusHistory.length - 1;
    const isCancelled = statusHistory.some(step => step.status === 'cancelled');

    const historyMap = new Map();
    statusHistory.forEach(item => {
        if (!historyMap.has(item.status)) {
            historyMap.set(item.status, item);
        }
    });
    const lastCompletedStatus = statusHistory.length > 0 ? statusHistory[statusHistory.length - 1].status : '';
    
    orderData?.status !== "cancelled" ? 
    activeStep = fullOrderLifecycle.indexOf(lastCompletedStatus) : null

    const fetchOrder = async () => {
        // setLoading(true)
        try {
            // const res = await fetch(`${API_URL}/orders/${orderId}`, {
            //     headers: {
            //         Authorization: `Bearer ${userState.token}`,
            //     },
            // });
            // if(!res.ok){
            //     const error = await res.json();
            //     return console.error("Could not fetch Orders:", error.error)
            // }
            // const order = await res.json();

            const order = await orderService.getUserOrderPage(orderId)
            setOrderData(order)
        }
        catch (err) {
            console.error("Orders fetch failed:", err.message);
        }
        finally{
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrder()
    }, [orderId])

    const getStatusConfig = (status) => {
        switch(status) {
            case 'pending': 
                return { color: 'warning', icon: <Pending />, label: 'Order Placed' }
            case 'accepted': 
                return { color: 'info', icon: <CheckCircle />, label: 'Confirmed' }
            case 'dispatched': 
                return { color: 'primary', icon: <LocalShipping />, label: 'Dispatched' }
            case 'delivered': 
                return { color: 'success', icon: <CheckCircle />, label: 'Delivered' }
            case 'cancelled': 
                return { color: 'error', icon: <Cancel />, label: 'Cancelled' }
            default: 
                return { color: 'default', icon: <Pending />, label: 'Unknown' }
        }
    }

    if (loading) {
        return (
            <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 3 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={3}>
                        <Grid size={{xs: 12, lg: 8}}>
                            <Paper sx={{ p: 3, mb: 2 }}>
                                <Box sx={{ bgcolor: 'grey.100', height: 200, borderRadius: 2, animate: 'pulse' }} />
                            </Paper>
                        </Grid>
                        <Grid size={{xs: 12, lg: 4}}>
                            <Paper sx={{ p: 3, mb: 2 }}>
                                <Box sx={{ bgcolor: 'grey.100', height: 300, borderRadius: 2, animate: 'pulse' }} />
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        )
    }

    const statusConfig = getStatusConfig(orderData.status)

    return (
        <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 2 }}>
            <Container maxWidth="lg">
                <Paper elevation={2} sx={{ p: 2, mb: 2, borderRadius: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent:"space-between", gap: 2 }}>
                        <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
                            <IconButton onClick={() => navigate('/my-orders')} sx={{ p: 1 }}>
                                <ArrowBack />
                            </IconButton>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h5" fontWeight="bold" color="primary.main">
                                    Order #{orderData.order_id}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: {xs: "flex-start", sm: "center"}, gap: 2, mt: 0.5, flexDirection: {xs: "column", sm: "row"} }}>
                                    <Chip
                                        icon={statusConfig.icon}
                                        label={statusConfig.label}
                                        color={statusConfig.color}
                                        variant="filled"
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                        Placed on {dayjs(orderData.order_date).format("DD MMM, YYYY")}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        {/* <Box>
                            <Button>Cancel</Button>
                            <Button>Reorder</Button>
                        </Box> */}
                    </Box>
                </Paper>

                <Grid container spacing={3}>
                    <Grid size={{xs: 12, md: 8}}>
                        <Stack spacing={2}>
                            <Card elevation={3} sx={{ borderRadius: 3 }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        Order Items ({orderData.items.length})
                                    </Typography>
                                    <List sx={{ p: 0 }}>
                                        {orderData.items.map((item, index) => (
                                            <React.Fragment key={item.id}>
                                                <ListItem sx={{ px: 0, py: 1.5 }}>
                                                    <ListItemAvatar>
                                                        <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden', flexShrink: 0, mr: 1 }}>
                                                            <CardMedia
                                                                component="img"
                                                                sx={{ 
                                                                    width: { xs: 80, sm: 90 },
                                                                    height: { xs: 80, sm: 90 },
                                                                    objectFit: 'contain',
                                                                    bgcolor: 'grey.200',
                                                                    // mr: 1,
                                                                    borderRadius: 2
                                                                }}
                                                                image={getImageUrl(item.thumbnail)}
                                                                alt={item.title}
                                                            />
                                                        </Paper>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        disableTypography
                                                        primary={
                                                            <Typography variant="subtitle2" fontWeight="600">
                                                                {item.title}
                                                            </Typography>
                                                        }
                                                        secondary={
                                                            <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Brand: {item.brand} • Rating: ⭐ {item.rating}
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <Typography variant="body2" color="primary.main" fontWeight="600">
                                                                        ${item.purchase_price} x {item.quantity}
                                                                    </Typography>
                                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                                        ${(item.quantity * item.purchase_price).toFixed(2)}
                                                                    </Typography>
                                                                </Box>
                                                            </Stack>
                                                        }
                                                    />
                                                </ListItem>
                                                {index < orderData.items.length - 1 && <Divider />}
                                            </React.Fragment>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>

                            <Card elevation={3} sx={{ borderRadius: 3 }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Typography variant="h6" fontWeight="bold" sx={{mb: 1.5}}>
                                        Order Progress
                                    </Typography>
                                    
                                    {orderData.trackingNumber && (
                                        <Box sx={{ mb: 2, p: 1.5, bgcolor: 'primary.light', borderRadius: 2 }}>
                                            <Typography variant="body2" color="primary.contrastText">
                                                <strong>Tracking Number:</strong> {orderData.trackingNumber}
                                            </Typography>
                                        </Box>
                                    )}

                                    <Box sx={{pt: 1.5}}>
                                    {isCancelled?
                                        <Stepper activeStep={activeStep} alternativeLabel>
                                            {statusHistory.map((historyItem, index) => {
                                                const labelProps = { error: index === activeStep };

                                                return (
                                                    <Step key={index}>
                                                        <StepLabel {...labelProps} optional={dayjs(historyItem.created_at).format("DD MMM, h:mm A")}>
                                                            {statusLabels[historyItem.status]}
                                                        </StepLabel>
                                                    </Step>
                                                );
                                            })}
                                        </Stepper>
                                        :
                                        <Stepper activeStep={activeStep} alternativeLabel>
                                            {fullOrderLifecycle.map((statusKey) => {
                                                const historyData = historyMap.get(statusKey);

                                                return (
                                                    <Step key={statusKey} completed={historyMap.has(statusKey)}>
                                                        <StepLabel optional={historyData?.created_at ? dayjs(historyData?.created_at).format("DD MMM, h:mm A") : null}>
                                                            {statusLabels[statusKey]}
                                                        </StepLabel>
                                                    </Step>
                                                );
                                            })}
                                        </Stepper>
                                    }
                                    </Box>
                                </CardContent>
                            </Card>
                        </Stack>
                    </Grid>

                    <Grid size={{xs: 12, md: 4}} >
                        <Stack spacing={2}>
                            <Card elevation={3} sx={{ borderRadius: 3 }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Person color="primary" />
                                        Delivery Details
                                    </Typography>

                                    <Stack spacing={2}>
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                Customer Information
                                            </Typography>
                                            <Stack spacing={1}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                    <Typography variant="body2">{`${orderData.user.first_name} ${orderData.user.last_name}`}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                    <Typography variant="body2">{orderData.user.email}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                    <Typography variant="body2">{orderData.user.number}</Typography>
                                                </Box>
                                            </Stack>
                                        </Box>

                                        <Divider />

                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                Delivery Address
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mt: 0.2 }} />
                                                <Box>
                                                    <Typography variant="body2">
                                                        {orderData.user.addLine1}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {orderData.user.addLine2}, {orderData.user.city} - {orderData.user.pincode}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {orderData.user.state}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>

                            <Card elevation={3} sx={{ borderRadius: 3 }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Receipt color="primary" />
                                        Price Details
                                    </Typography>

                                    <Stack spacing={1.5}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2">Subtotal ({orderData.items.length} items)</Typography>
                                            <Typography variant="body2">${orderData.subtotal.toFixed(2)}</Typography>
                                        </Box>

                                        {orderData.discount_amount > 0 && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2">Discount ({(orderData.coupon?.code).toUpperCase()})</Typography>
                                                <Typography variant="body2" color="success.main">
                                                    -${orderData.discount_amount.toFixed(2)}
                                                </Typography>
                                            </Box>
                                        )}

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2">Shipping</Typography>
                                            <Typography variant="body2" color="success.main">
                                                {orderData.shipping ? `$${orderData.shipping?.toFixed(2)}` : 'FREE'}
                                            </Typography>
                                        </Box>

                                        <Divider />
                                        
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="h6" fontWeight="bold">Total Amount</Typography>
                                            <Typography variant="h6" fontWeight="bold" color="primary.main">
                                                ${orderData.final_total.toFixed(2)}
                                            </Typography>
                                        </Box>

                                        {orderData.status === "delivered" ?
                                            <PDFDownloadLink
                                                document={<OrderInvoice orderData={orderData} />}
                                                fileName={`invoice-${orderData.order_id}.pdf`}
                                                style={{ textDecoration: 'none', width: '100%' }}
                                            >
                                                {({ blob, url, loading, error }) => (
                                                    <Button
                                                        variant="contained"
                                                        fullWidth
                                                        startIcon={<Download />}
                                                        disabled={loading}
                                                        sx={{ mt: 2, borderRadius: 2, textTransform: 'none' }}
                                                    >
                                                        {loading ? 'Generating PDF...' : 'Download Invoice'}
                                                    </Button>
                                                )}
                                            </PDFDownloadLink>
                                            :
                                            null
                                        }

                                    </Stack>
                                </CardContent>
                            </Card>
                        </Stack>
                    </Grid>
                </Grid>
                {/* <InvoicePreview orderData={orderData}/> */}
            </Container>
        </Box>
    )
}

export default MyOrderPage