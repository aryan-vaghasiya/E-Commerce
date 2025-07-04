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
import { showSnack } from '../redux/snackbar/snackbarActions'

function CheckOut() {
    const cartItems = useSelector(state => state.cartReducer)
    const userDetails = useSelector(state => state.detailsReducer)
    const userState = useSelector(state => state.userReducer)
    const dispatch = useDispatch()
    const navigate = useNavigate()

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

    const handleCheckout = async (data) => {
        // console.log(data)
        // console.log(getValues())
        
        const response = await fetch("http://localhost:3000/checkout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({username: userState.userName, ...data})
        })
        if (response.status === 200){
            const added = dispatch(addOrders(cartItems))
            if(!added){
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
            {/* <div className='pt-16 pb-6 flex justify-center bg-gray-100 font-[Inter] min-h-screen '> */}

            <Card sx={{ bgcolor: "white", p: 5, mr: 3 , mb: "auto"}}>
                <form onSubmit={handleSubmit(handleCheckout)} noValidate>
                    <Stack spacing={3} width={{ lg: 600, md: 400 }} >
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

            <Card sx={{ textAlign: "center", mb: "auto" , maxWidth: "400px", maxHeight: "690px", overflowY: "scroll"}}>
                <Typography sx={{ mt: 3, mb: 1 }}>Order Summary</Typography>
                <Divider variant='middle' flexItem />
                {
                    cartItems.products.map(item =>
                        <Box key={item.id}>
                        <Toolbar sx={{my: 1}} >
                            <Box >
                                <img src={item.thumbnail} alt="Product Image" className='max-w-30' />
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
                                <Typography sx={{ fontSize: 14, display: "flex" }}>Price: <span style={{ marginLeft: "auto" }}>${item.price}</span> </Typography>
                                <Typography sx={{ fontSize: 14, display: "flex" }}>Quantity: <span style={{ marginLeft: "auto" }}>{item.quantity}</span></Typography>
                                <Typography sx={{ fontSize: 14, display: "flex" }}>Total: <span style={{ marginLeft: "auto" }}>${item.priceValue}</span></Typography>
                            </Box>
                        </Toolbar>
                        <Divider variant='middle'/>
                        </Box>
                        
                    )
                }
            </Card>
            <DevTool control={control} />


            {/* <form className=' flex flex-col m-2 w-fit bg-white py-5 px-5 rounded-2xl mx-8 shadow-xl h-150' noValidate>
                <div className='flex flex-col'>
                    <input id='email' type="text" className='bg-gray-200 m-2 w-full mx-auto p-2.5 rounded-xl mb-1' placeholder='Enter your Email'
                        {...register("email",
                            {
                                required: {
                                    value: true,
                                    message: "This field is Required"
                                },
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Enter valid email"
                                }
                            })}
                    />
                    {
                        errors.email ?
                            <p className='text-red-600 text-xs ml-2'> {errors.email.message}</p>
                            :
                            null
                    }
                    <h2 className='m-2 font-bold mt-5 text-center'>Shipping</h2>
                    <div className='inline-flex'>
                        <div>
                            <input type="text" className='bg-gray-200 m-2 w-fit mx-auto p-1.5 rounded-lg mr-3 mb-1' placeholder='First Name'
                                {...register("fName",
                                    {
                                        required: {
                                            value: true,
                                            message: "This field is Required"
                                        },
                                        pattern: {
                                            value: /^.{5,20}$/,
                                            message: "Must have 5 - 20 characters"
                                        }
                                    })}
                            />
                            {
                                errors.fName ?
                                    <p className='text-red-600 text-xs ml-2 w-fit'> {errors.fName.message}</p>
                                    :
                                    null
                            }
                        </div>
                        <div>
                            <input type="text" className='bg-gray-200 m-2 w-fit mx-auto p-1.5 rounded-lg mr-3 mb-1' placeholder='Last Name'
                                {...register("lName",
                                    {
                                        pattern: {
                                            value: /^.{5,20}$/,
                                            message: "Must have 5 - 20 characters"
                                        }
                                    })}
                            />
                            {
                                errors.lName ?
                                    <p className='text-red-600 text-xs ml-2 w-fit'> {errors.lName.message}</p>
                                    :
                                    null
                            }
                        </div>
                    </div>
                    <div>
                        <input type="number" className='bg-gray-200 m-2 w-fit mx-auto p-1.5 rounded-lg mr-3' placeholder='Phone Number'
                            {...register("pNumber",
                                {
                                    required: {
                                        value: true,
                                        message: "This field is Required"
                                    },
                                    pattern: {
                                        value: /^[0-9]{10}$/,
                                        message: "Invalid Mobile Number"
                                    }
                                })}
                        />
                        {
                            errors.pNumber ?
                                <p className='text-red-600 text-xs ml-2 w-fit'> {errors.pNumber.message}</p>
                                :
                                null
                        }
                    </div>
                    <div>
                        <input type="text" className='bg-gray-200 m-2 w-fit mx-auto p-1.5 rounded-lg mr-3' placeholder='Address Line 1'
                            {...register("add1",
                                {
                                    required: {
                                        value: true,
                                        message: "This field is Required"
                                    }
                                })}
                        />
                        {
                            errors.add1 ?
                                <p className='text-red-600 text-xs ml-2 w-fit'> {errors.add1.message}</p>
                                :
                                null
                        }
                    </div>
                    <div>
                        <input type="text" className='bg-gray-200 m-2 w-fit mx-auto p-1.5 rounded-lg mr-3' placeholder='Address Line 2' />
                    </div>
                    <div className='inline-flex'>
                        <div>
                            <input type="text" className='bg-gray-200 m-2 w-fit mx-auto p-1.5 rounded-lg mr-3' placeholder='State'
                                {...register("state",
                                    {
                                        required: {
                                            value: true,
                                            message: "This field is Required"
                                        }
                                    })}
                            />
                            {
                                errors.state ?
                                    <p className='text-red-600 text-xs ml-2 w-fit'> {errors.state.message}</p>
                                    :
                                    null
                            }
                        </div>
                        <div>
                            <input type="text" className='bg-gray-200 m-2 w-fit mx-auto p-1.5 rounded-lg mr-3' placeholder='City'
                                {...register("city",
                                    {
                                        required: {
                                            value: true,
                                            message: "This field is Required"
                                        }
                                    })}
                            />
                            {
                                errors.city ?
                                    <p className='text-red-600 text-xs ml-2 w-fit'> {errors.city.message}</p>
                                    :
                                    null
                            }
                        </div>
                        <div>
                            <input type="number" className='bg-gray-200 m-2 w-fit mx-auto p-1.5 rounded-lg mr-3' placeholder='Pincode'
                                {...register("pincode",
                                    {
                                        required: {
                                            value: true,
                                            message: "This field is Required"
                                        },
                                        pattern: {
                                            value: /^[0-9]{6}$/,
                                            message: "Invalid Pincode"
                                        }
                                    })}
                            />
                            {
                                errors.pincode ?
                                    <p className='text-red-600 text-xs ml-2 w-fit'> {errors.pincode.message}</p>
                                    :
                                    null
                            }
                        </div>
                    </div>
                </div>
                <div className='flex flex-col items-center my-10 h-full justify-around'>
                    <p>Cart Value: $
                        {
                            parseFloat(
                                cartItems.products.reduce((acc, item) => {
                                    return acc + item.priceValue
                                }, 0)
                            ).toFixed(2)
                        }
                    </p>
                    <button onClick={handleSubmit(handleCheckout)} className='m-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 my-1 rounded-2xl active:scale-95'>Place Order</button>
                </div>
            </form> */}
        </Box>
    )
}

export default CheckOut
