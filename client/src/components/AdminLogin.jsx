import { useDispatch, useSelector } from 'react-redux'
import { addUser } from '../redux/user/userActions'
import { fetchCart } from '../redux/cart/cartActions'
import { replace, useLocation, useNavigate } from 'react-router'
import { Controller, useController, useForm } from 'react-hook-form'
import { DevTool } from '@hookform/devtools'

import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import userReducer from '../redux/user/userReducer'
import { hideSnack, showSnack } from '../redux/snackbar/snackbarActions'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { fetchOrders } from '../redux/order/orderActions'
import { fetchDetails } from '../redux/checkout/checkoutActions'
import { useState } from 'react'
import { getFullWishlist } from '../redux/wishlist/wishlistActions'
import { fetchDashboard } from '../redux/adminDashboard/dashboardActions'
import { fetchAdminOrders } from '../redux/adminOrders/adminOrderActions'

function AdminLogin() {
    // const [signup, setSignup] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const snackbarState = useSelector((state) => state.snackbarReducer)

    const { register, handleSubmit, control, getValues, formState: { errors } } = useForm({
        defaultValues: {
            username: "",
            password: ""
        }
    })

    // const location = useLocation()
    // const fromPath = location.state

    // const handleSignup = () => {
    //     // setSignup(prev => !prev)
    //     navigate("/signup", {replace: true, state: "/my-orders"})
    // }

    const onSubmitOne = async (data) => {
        // console.log(data)
        // console.log(signup)
        // const request = signup ? "signup" : "login"
        const response = await fetch(`http://localhost:3000/admin/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: data.username,
                password: data.password
            })
        })

        if (response.status === 200) {
            const resData = await response.json()
            // console.log(resData);
            const token = resData.token;
            const decoded = JSON.parse(atob(token.split('.')[1]))
            // console.log(token);
            dispatch(addUser(decoded.username, token, decoded.role))
            // dispatch(fetchAdminOrders(1, 5))
            // dispatch(fetchDashboard(token))
            // dispatch(fetchOrders(token))
            dispatch(fetchCart(token))
            dispatch(fetchDetails(token))
            dispatch(getFullWishlist(token))
            navigate("/admin/dashboard", { replace: true })
        }
        else{
            const error = await response.json()
            console.error(error.error);
            dispatch(showSnack({message: error.error, severity: "warning"}))
        }
    }

    return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "91vh", bgcolor: "#EEEEEE" }}>
            <Snackbar
                open={snackbarState.show}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                autoHideDuration={2000}
                onClose={() => dispatch(hideSnack())}
                sx={{
                    '&.MuiSnackbar-root': { top: '70px' },
                }}
            >
                <Alert onClose={() => dispatch(hideSnack())} severity={snackbarState.severity} variant="filled">
                    {snackbarState.message}
                </Alert>
            </Snackbar>
            <Card sx={{ bgcolor: "white", p: 8, pb: 6 }}>
                <form onSubmit={handleSubmit(onSubmitOne)} noValidate >
                    <Stack spacing={3} width={400} >
                        <TextField label="Username" type='text' {...register("username", {
                            required: {
                                value: true,
                                message: "Username is required"
                            },
                            pattern: {
                                value: /^.{5,20}$/,
                                message: "Must have 5 - 20 characters"
                            }
                        })}
                            error={!!errors.username}
                            helperText={errors.username ? errors.username.message : ""}
                        />
                        <TextField label="Password" type='password' {...register("password", {
                            required: {
                                value: true,
                                message: "Password is required"
                            },
                            pattern: {
                                value: /^(?=.*[A-Za-z])[A-Za-z\d]{5,20}$/,
                                message: "Must be 5-20 characters long"
                            }
                        })}
                            error={!!errors.password}
                            helperText={errors.password ? errors.password.message : ""}
                        />
                        <Button type='submit' variant="contained">Login</Button>
                    </Stack>
                    {/* <Box textAlign='right' sx={{pt: 2, pb: 0}}>
                        <Button onClick={handleSignup} sx={{mt: 1}} variant='text'>Sign Up ?</Button>
                    </Box> */}
                </form>
            </Card>
            <DevTool control={control} />
        </Box>
    )
}

export default AdminLogin