import React, { useState, useEffect } from 'react'
import { Box, Container, Typography, Paper, Card, CardContent, Button, Divider, Chip, Stack, Grid, Avatar, List, ListItem, ListItemAvatar, ListItemText, Stepper, Step, StepLabel, useTheme, useMediaQuery, IconButton, CardMedia } from '@mui/material'
import { ArrowBack, Download, Person, Phone, LocationOn, Email, LocalShipping, CheckCircle, Cancel, Pending, Receipt } from '@mui/icons-material'
import { useLocation, useNavigate, useParams } from 'react-router'
import { useSelector } from 'react-redux'
import { getImageUrl } from '../utils/imageUrl'
import dayjs from 'dayjs'
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'
import OrderInvoice from './OrderInvoice'
import InvoicePreview from './InvoicePreview'

const MyOrderPage = () => {
    const theme = useTheme()
    const navigate = useNavigate()
    const { orderId } = useParams()
    const {state} = useLocation()
    const userState = useSelector(state => state.userReducer)

    // console.log(state);

    const isMobile = useMediaQuery(theme.breakpoints.down('md'))
    const [orderData, setOrderData] = useState(null)
    const [loading, setLoading] = useState(true)

    const steps = ["Order Placed", "Order Accepted", "Order Dispatched", "Order Delivered"]
    const cancelledSteps = ["Order Placed", "Order Cancelled"]
    const allStatus = ["pending", "accepted", "dispatched", "delivered"]

    const getCurrentStatus = (status) => {
        const index = allStatus.indexOf(status)
        return status === "delivered"? index+1 : status !== "cancelled" ? index : null
    }

        const isStepFailed = (step) => {
        return step === 1;
    };

    const fetchOrder = async () => {
        // setLoading(true)
        try {
            const res = await fetch(`http://localhost:3000/orders/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${userState.token}`,
                },
            });
            if(!res.ok){
                const error = await res.json();
                return console.error("Could not fetch Orders:", error.error)
            }
            const order = await res.json();
            console.log(order);
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
        // setTimeout(() => {
        //     // setLoading(true)
        //     setOrderData({
        //         id: orderId || 'ORD-2024-001',
        //         status: 'dispatched',
        //         orderDate: '2024-09-15T10:30:00Z',
        //         expectedDelivery: '2024-09-18T18:00:00Z',
        //         totalAmount: 299.97,
        //         subtotal: 249.98,
        //         discount: 25.00,
        //         shipping: 0.00,
        //         tax: 24.99,
        //         finalTotal: 274.97,
        //         paymentMethod: 'Credit Card',
        //         trackingNumber: 'TRK123456789',
        //         user: {
        //             name: 'John Doe',
        //             email: 'john.doe@example.com',
        //             phone: '+1 (555) 123-4567',
        //             address: {
        //                 street: '123 Main Street, Apt 4B',
        //                 city: 'New York',
        //                 state: 'NY',
        //                 zipCode: '10001',
        //                 country: 'United States'
        //             }
        //         },
        //         items: [
        //             {
        //                 id: 1,
        //                 name: 'Wireless Bluetooth Headphones',
        //                 image: 'headphones.jpg',
        //                 price: 89.99,
        //                 quantity: 2,
        //                 total: 179.98,
        //                 brand: 'AudioTech',
        //                 rating: 4.5
        //             },
        //             {
        //                 id: 2,
        //                 name: 'Smart Fitness Watch',
        //                 image: 'watch.jpg',
        //                 price: 199.99,
        //                 quantity: 1,
        //                 total: 199.99,
        //                 brand: 'FitPro',
        //                 rating: 4.3
        //             }
        //         ],
        //         timeline: [
        //             { status: 'placed', date: '2024-09-15T10:30:00Z', completed: true },
        //             { status: 'confirmed', date: '2024-09-15T11:15:00Z', completed: true },
        //             { status: 'dispatched', date: '2024-09-16T09:00:00Z', completed: true },
        //             { status: 'delivered', date: null, completed: false }
        //         ]
        //     })

        //     setLoading(false)
        //     // setOrderData(state)
        // }, 1000)

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

    const handleDownloadInvoice = () => {
        // Implement invoice download logic
        console.log('Downloading invoice...')
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton onClick={() => navigate('/my-orders')} sx={{ p: 1 }}>
                            <ArrowBack />
                        </IconButton>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h5" fontWeight="bold" color="primary.main">
                                Order #{orderData.order_id}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
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
                                                        {/* <Avatar
                                                            variant="rounded"
                                                            sx={{ 
                                                                width: 60, 
                                                                height: 60, 
                                                                bgcolor: 'grey.100',
                                                                border: '1px solid',
                                                                borderColor: 'grey.200'
                                                            }}
                                                        >

                                                            <img 
                                                                src={getImageUrl(item.thumbnail)} 
                                                                alt={item.name}
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            />
                                                        </Avatar> */}
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

                                    {orderData.status === "cancelled" ? (
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
                                                },
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
                                            activeStep={getCurrentStatus(orderData.status)} 
                                            alternativeLabel
                                            sx={{
                                                '& .MuiStepLabel-label': {
                                                    fontSize: '0.7rem',
                                                    mt: 0.5
                                                },
                                                '& .MuiStepConnector-line': {
                                                    borderTopWidth: 2
                                                },
                                            }}
                                        >
                                            {steps.map((label) => (
                                                <Step key={label}>
                                                    <StepLabel>{label}</StepLabel>
                                                </Step>
                                            ))}
                                        </Stepper>
                                    )}

                                    {/* <Stepper 
                                        activeStep={orderData.timeline.filter(t => t.completed).length - 1}
                                        orientation={isMobile ? 'vertical' : 'horizontal'}
                                        sx={{ mt: 2 }}
                                    >
                                        {orderData.timeline.map((step, index) => (
                                            <Step key={step.status} completed={step.completed}>
                                                <StepLabel>
                                                    <Typography variant="body2" fontWeight={step.completed ? 600 : 400}>
                                                        {getStatusConfig(step.status).label}
                                                    </Typography>
                                                    {step.date && (
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            {new Date(step.date).toLocaleDateString()} at {new Date(step.date).toLocaleTimeString()}
                                                        </Typography>
                                                    )}
                                                </StepLabel>
                                            </Step>
                                        ))}
                                    </Stepper> */}
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
                                            <Typography variant="body2">${orderData.total.toFixed(2)}</Typography>
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

                                        {/* <Button
                                            variant="contained"
                                            fullWidth
                                            startIcon={<Download />}
                                            onClick={handleDownloadInvoice}
                                            sx={{ mt: 2, borderRadius: 2, textTransform: 'none' }}
                                        >
                                            Download Invoice
                                        </Button> */}

                                        {/* {orderData.status === "delivered" ? */}
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
                                        {/* :
                                        null
                                        } */}

                                    </Stack>
                                </CardContent>
                            </Card>
                        </Stack>
                    </Grid>
                </Grid>
                <InvoicePreview orderData={orderData}/>
            </Container>
        </Box>
    )
}

export default MyOrderPage