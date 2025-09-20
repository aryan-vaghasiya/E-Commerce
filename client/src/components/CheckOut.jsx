import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { addOrders } from '../redux/order/orderActions'
import { emptyCart } from '../redux/cart/cartActions'
import { useForm } from 'react-hook-form'
import { addDetails } from '../redux/checkout/checkoutActions'
import { DevTool } from '@hookform/devtools'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Toolbar from '@mui/material/Toolbar'
import StarIcon from '@mui/icons-material/Star'
import { hideSnack, showSnack } from '../redux/snackbar/snackbarActions'
import { getImageUrl } from '../utils/imageUrl'
import { useState } from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

function CheckOut() {
    const cartReducer =  useSelector(state => state.cartReducer)
    const userDetails = useSelector(state => state.detailsReducer)
    const snackbarState = useSelector(state => state.snackbarReducer)
    const userState = useSelector(state => state.userReducer)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [couponQuery, setCouponQuery] = useState("")
    const [couponData, setCouponData] = useState(null)
    const [finalTotal, setFinalTotal] = useState(cartReducer.cartValue)
    const [newCart, setNewCart] = useState(null)
    const [isCouponApplied, setIsCouponApplied] = useState(false)
    const cartItems = newCart ? newCart.items : cartReducer.items
    const freeShippingApplicable = (newCart?.cartValue || cartReducer.cartValue) >= 50 ? true : false
    const shippingCharges = freeShippingApplicable ? 0.00 : 4.99


    const { register, handleSubmit, control, getValues, formState: { errors } } = useForm({
        defaultValues: {
            email: userDetails.email,
            fName: userDetails.firstName,
            lName: userDetails.lastName,
            pNumber: userDetails.phoneNumber,
            addLine1: userDetails.addLine1,
            addLine2: userDetails.addLine2,
            state: userDetails.state,
            city: userDetails.city,
            pincode: userDetails.pincode,
        }
    })

    const handleCouponQuery = async () => {
        if(!couponQuery) return

        const response = await fetch("http://localhost:3000/orders/check-coupon", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${userState.token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({code: couponQuery})
        })

        if(!response.ok && couponQuery){
            setIsCouponApplied(false)
            setCouponQuery("")

            const error = await response.json()

            if(response.status === 501){
                console.log(error.error);
                dispatch(showSnack({message: error.error, severity: "warning"}))
            }
            else{
                console.error(error.error);
                dispatch(showSnack({message: "Server error! Please try again", severity: "error"}))
            }
            return
        }

        const couponRes = await response.json()
        console.log(couponRes);

        setCouponData(couponRes.couponData)
        setNewCart(couponRes.newCart)
        setIsCouponApplied(true)
        dispatch(showSnack({message: "Coupon Applied", severity: "success"}))
        // console.log(couponRes)
    }

    const removeCoupon = () => {
        setCouponData(null)
        setNewCart(null)
        setIsCouponApplied(false)
        setCouponQuery("")
    }

    const handleCheckout = async (data) => {
        // console.log(data)

        const response = await fetch("http://localhost:3000/checkout", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${userState.token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({username: userState.userName, ...data})
        })
        if (response.status === 200){
            const added = await dispatch(addOrders(isCouponApplied ? newCart : cartReducer, isCouponApplied ? couponData : {}))
            if(added.error){
                navigate("/cart")
                dispatch(showSnack({message: added.message, severity: "warning"}))
                console.log("Order Failed");
                return
            }
            dispatch(addDetails(getValues()))
            dispatch(emptyCart())
            dispatch(showSnack({message: "Order Confirmed!", severity: "success"}))
            navigate("/order-complete", { replace: true })
        }
    }

    return (
        <Box sx={{ display: { sm: "flex", xs: "block" }, justifyContent: "center", py: 3, bgcolor: "#EEEEEE" }}>
            <Snackbar
                open={snackbarState.show}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                autoHideDuration={5000}
                onClose={() => dispatch(hideSnack())}
                sx={{
                    '&.MuiSnackbar-root': { top: '70px' },
                }}
            >
                <Alert onClose={() => dispatch(hideSnack())} severity={snackbarState.severity} variant="filled">
                    {snackbarState.message}
                </Alert>
            </Snackbar>

            <Card sx={{ bgcolor: "white", p: 5, mr: 3 , mb: "auto"}}>
                <form onSubmit={handleSubmit(handleCheckout)} noValidate>
                    <Stack spacing={3} width={{ md: 500, xs: 350}}>
                        <Typography>Ship To </Typography>

                        <Box sx={{ display: "inline-flex" }}>
                            <TextField label="First Name" type='text' sx={{ width: "100%", mr: 1 }} {...register("fName", {
                                required: {
                                    value: true,
                                    message: "First Name is required"
                                },
                                pattern: {
                                    value: /^.{5,20}$/,
                                    message: "Must have 5 - 20 characters"
                                },
                            })}
                                error={!!errors.fName}
                                helperText={errors.fName ? errors.fName.message : ""}
                            />
                            <TextField label="Last Name" type='text' sx={{ width: "100%" }} {...register("lName", {
                                pattern: {
                                    value: /^.{5,20}$/,
                                    message: "Must have 5 - 20 characters"
                                }
                            })}
                                error={!!errors.lName}
                                helperText={errors.lName ? errors.lName.message : ""}
                            />
                        </Box>

                        <TextField label="Address Line 1" type='text' {...register("addLine1", {
                            required: {
                                value: true,
                                message: "Address is required"
                            },
                            pattern: {
                                value: /^.{5,}$/,
                                message: "Must have and 5 characters or more"
                            }
                        })}
                            error={!!errors.addLine1}
                            helperText={errors.addLine1 ? errors.addLine1.message : ""}
                        />

                        <TextField label="Address Line 2" type='text' {...register("addLine2", {
                            pattern: {
                                value: /^.{5,}$/,
                                message: "Must have and 5 characters or more"
                            }
                        })}
                            error={!!errors.addLine2}
                            helperText={errors.addLine2 ? errors.addLine2.message : ""}
                        />

                        <Box sx={{ display: "inline-flex" }}>
                            <TextField label="State" type='text' sx={{ width: "100%" }} {...register("state", {
                                required: {
                                    value: true,
                                    message: "State is required"
                                }
                            })}
                                error={!!errors.state}
                                helperText={errors.state ? errors.state.message : ""}
                            />
                            <TextField label="City" type='text' sx={{ width: "100%", mx: 1 }} {...register("city", {
                                required: {
                                    value: true,
                                    message: "City is required"
                                }
                            })}
                                error={!!errors.city}
                                helperText={errors.city ? errors.city.message : ""}
                            />
                            <TextField label="Pincode" type='text' sx={{ width: "100%" }} {...register("pincode", {
                                required: {
                                    value: true,
                                    message: "Pincode is required"
                                },
                                pattern: {
                                    value: /^[0-9]{6}$/,
                                    message: "Invalid Pincode"
                                }
                            })}
                                error={!!errors.pincode}
                                helperText={errors.pincode ? errors.pincode.message : ""}
                            />
                        </Box>

                        <Typography>Contact Details </Typography>

                        <TextField label="Mobile Number" type='text' {...register("pNumber", {
                            required: {
                                value: true,
                                message: "Mobile Number is required"
                            },
                            pattern: {
                                value: /^[0-9]{10}$/,
                                message: "Invalid Number"
                            }
                        })}
                            error={!!errors.pNumber}
                            helperText={errors.pNumber ? errors.pNumber.message : ""}
                        />

                        <TextField label="Email" type='email' {...register("email", {
                            required: {
                                value: true,
                                message: "Email is required"
                            },
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Invalid Email"
                            }
                        })}
                            error={!!errors.email}
                            helperText={errors.email ? errors.email.message : ""}
                        />

                        <Button type='submit' variant="contained">Place Order</Button>
                    </Stack>
                </form>
            </Card>

            <Box sx={{width: "400px"}}>
                <Card sx={{ textAlign: "center", mb: "auto" , maxWidth: "100%", maxHeight: "500px", overflowY: "auto"}}>
                    <Typography sx={{ mt: 3, mb: 1 }}>Order Summary</Typography>
                    <Divider variant='middle' flexItem />
                    {cartItems.map(item =>
                        <Box key={item.id}>
                            <Toolbar sx={{my: 1}} >
                                <Box >
                                    <img src={getImageUrl(item.thumbnail)} alt="Product Image" className='max-w-30' />
                                </Box>
                                <Box sx={{ textAlign: "left", width: "100%" }}>

                                    <Typography variant='subtitle1' sx={{ fontWeight: "bold" }}>{item.title}</Typography>
                                    <Typography sx={{ fontSize: 12 }}>Brand: {item.brand}</Typography>
                                    <Box sx={{ display: "inline-flex", alignItems: "center" }}>
                                        <StarIcon sx={{ color: "#FF8C00", fontSize: 20 }}></StarIcon>
                                        <Typography sx={{ fontSize: 14, pt: 0.3, pr: 0.2 }}>
                                            {item.rating}
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ fontSize: 14, display: "flex" }}>{item.quantity} x <span style={{ marginLeft: "auto" }}>${(item.price).toFixed(2)}</span> </Typography>
                                    <Divider variant='fullWidth' sx={{pt: 0.5}}/>
                                    <Typography sx={{ fontSize: 14, display: "flex", pt: 0.5}}><span style={{ marginLeft: "auto" }}>${(item.priceValue).toFixed(2)}</span> </Typography>
                                    {
                                        item.coupon_discount ? 
                                        <Box>
                                            <Typography sx={{ fontSize: 14, display: "flex", pt: 0.5, fontWeight: 500}} color='success'>
                                                Coupon Discount: 
                                                <span style={{ marginLeft: "auto" }}>
                                                    - ${(item.coupon_discount).toFixed(2)}
                                                </span> 
                                            </Typography>
                                            <Divider variant='fullWidth' sx={{pt: 0.5}}/>
                                            <Typography sx={{ fontSize: 14, display: "flex", pt: 0.5}}><span style={{ marginLeft: "auto" }}>${(item.priceValue - item.coupon_discount).toFixed(2)}</span> </Typography>
                                        </Box>
                                        :
                                        null
                                    }
                                </Box>
                            </Toolbar>
                            <Divider variant='middle'/>
                        </Box>
                        )
                    }
                    <Divider variant='middle'/>

                    <Stack gap={0.5} sx={{my: 1}}>
                        <Typography sx={{ fontSize: 14, display: "flex", width: "95%", px: 2, mx: "auto"}}>
                            Sub Total: 
                            <span style={{ marginLeft: "auto" }}>
                                ${isCouponApplied ? (newCart?.newCartValue).toFixed(2) : (cartReducer.cartValue).toFixed(2)}
                            </span>
                        </Typography>
                        {
                            isCouponApplied && couponData.applies_to === "all" ? 
                            <Typography sx={{ fontSize: 14, display: "flex", width: "95%", px: 2, py: 1, mx: "auto", fontWeight: 500}} color='success'>
                                Coupon Discount: 
                                <span style={{ marginLeft: "auto" }}>
                                    - ${(newCart?.discountValue).toFixed(2)}
                                </span>
                            </Typography>
                            :
                            null
                        }
                        <Typography sx={{ fontSize: 14, display: "flex", width: "95%", px: 2, mx: "auto"}}>
                            Shipping: 
                            <span style={{ marginLeft: "auto" }}>
                                {/* {(newCart?.cartValue || cartReducer.cartValue) >= 50 ? `FREE` : `$${shippingCharges}`} */}
                                ${shippingCharges.toFixed(2)}
                            </span>
                        </Typography>
                        <Divider variant='middle'/>
                        <Typography sx={{ fontSize: 14, display: "flex", width: "95%", px: 2, mx: "auto"}}>
                            Order Total: 
                            <span style={{ marginLeft: "auto" }}>
                                ${((newCart?.newCartValue || cartReducer.cartValue) + shippingCharges).toFixed(2)}
                            </span>
                        </Typography>
                    </Stack>
                    {/* {
                        isCouponApplied && couponData.applies_to === "all" ? 
                        <Box>
                            <Typography sx={{ fontSize: 14, display: "flex", width: "95%", px: 2, py: 1, mx: "auto", fontWeight: 500}} color='success'>
                                Coupon Discount: 
                                <span style={{ marginLeft: "auto" }}>
                                    - ${(newCart?.discountValue).toFixed(2)}
                                </span>
                            </Typography>
                            <Divider variant='middle'/>
                            <Typography sx={{ fontSize: 14, display: "flex", width: "95%", px: 2, py: 1, mx: "auto"}}>
                                Order Total: 
                                <span style={{ marginLeft: "auto" }}>
                                    ${(newCart?.newCartValue).toFixed(2)}
                                </span>
                            </Typography>
                        </Box>
                        :
                        null
                    } */}


                    {/* <Typography sx={{ fontSize: 14, display: "flex", width: "95%", px: 2, py: 1, mx: "auto"}}>
                        {isCouponApplied && couponData.applies_to === "all" ? "Sub" : "Order"} Total: 
                        <span style={{ marginLeft: "auto" }}>
                            ${isCouponApplied && couponData.applies_to !== "all" ? (newCart?.newCartValue).toFixed(2) : (cartReducer.cartValue).toFixed(2)}
                        </span>
                    </Typography>
                    {
                        isCouponApplied && couponData.applies_to === "all" ? 
                        <Box>
                            <Typography sx={{ fontSize: 14, display: "flex", width: "95%", px: 2, py: 1, mx: "auto", fontWeight: 500}} color='success'>
                                Coupon Discount: 
                                <span style={{ marginLeft: "auto" }}>
                                    - ${(newCart?.discountValue).toFixed(2)}
                                </span>
                            </Typography>
                            <Divider variant='middle'/>
                            <Typography sx={{ fontSize: 14, display: "flex", width: "95%", px: 2, py: 1, mx: "auto"}}>
                                Order Total: 
                                <span style={{ marginLeft: "auto" }}>
                                    ${(newCart?.newCartValue).toFixed(2)}
                                </span>
                            </Typography>
                        </Box>
                        :
                        null
                    } */}
                </Card>
                <Card sx={{mt: 2}}>
                    <Typography sx={{ p: 1, fontSize: "14px", bgcolor: "#3B92CA", color: "white"}}>APPLY COUPON</Typography>
                    <Box sx={{display: "flex", flexDirection: "column", p: 2}}>
                        <Stack spacing={2}>
                            <TextField
                                slotProps={{htmlInput: { maxLength: 10 }}}
                                disabled={isCouponApplied}
                                label="Coupon Code"
                                value={couponQuery}
                                onChange={(event) => setCouponQuery(event.target.value)}
                            />
                            {
                                isCouponApplied ?
                                <Button variant='contained' onClick={removeCoupon} color='error'>Remove Coupon</Button>
                                :
                                <Button variant='contained' onClick={handleCouponQuery}>Apply</Button>
                            }
                        </Stack>
                    </Box>
                </Card>
            </Box>
            {/* <DevTool control={control} /> */}
        </Box>
    )
}

export default CheckOut
