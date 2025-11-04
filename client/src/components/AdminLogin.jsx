import { useDispatch, useSelector } from 'react-redux'
import { addUser } from '../redux/user/userActions'
import { fetchCart } from '../redux/cart/cartActions'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { DevTool } from '@hookform/devtools'
import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import { hideSnack, showSnack } from '../redux/snackbar/snackbarActions'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { fetchOrders } from '../redux/order/orderActions'
import { fetchDetails } from '../redux/checkout/checkoutActions'
import { useState } from 'react'
import { getFullWishlist } from '../redux/wishlist/wishlistActions'
import Typography from '@mui/material/Typography'
import { authService } from '../api/services/authService'

const selectSnackbar = (state) => state.snackbarReducer;

function AdminLogin() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const snackbarState = useSelector(selectSnackbar)
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, control, formState: { errors } } = useForm({
        defaultValues: {
            username: "",
            password: ""
        }
    })

    const handleLogin = async (data) => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const response = await authService.adminLogin({
                username: data.username,
                password: data.password
            });
            const token = response.token

            dispatch(addUser(response.username, token, response.role))
            dispatch(fetchCart(token))
            dispatch(fetchOrders(token))
            dispatch(fetchDetails(token))
            dispatch(getFullWishlist(token))
            navigate("/admin/dashboard", { replace: true })
        } catch (err) {
            console.error('Login error:', err);
            dispatch(showSnack({ message: err.message || "Login failed", severity: "error" }));
        } finally {
            setIsSubmitting(false)
        }
    };

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

            <Card sx={{ bgcolor: "white", p: 6, pt: 4 }}>
                <Box textAlign="center" sx={{pb: 3}}>
                    <Typography color='primary' fontSize={22} sx={{fontWeight: 600}}>Admin Login</Typography>
                </Box>
                <form onSubmit={handleSubmit(handleLogin)} noValidate>
                    <Stack spacing={3} width={{ xs: 300, sm: 400 }}>
                        <TextField label="Username" type='text' {...register("username", {
                                required:"Username is required"
                            })}
                            error={!!errors.username}
                            helperText={errors.username?.message || ""}
                            disabled={isSubmitting}
                        />
                        <TextField label="Password" type='password' {...register("password", {
                                required: "Password is required"
                            })}
                            error={!!errors.password}
                            helperText={errors.password?.message || ""}
                            disabled={isSubmitting}
                        />
                        <Button type='submit' variant="contained" disabled={isSubmitting}>
                            {isSubmitting ? "Logging In... " : "Login"}
                        </Button>
                    </Stack>
                </form>
            </Card>
            <DevTool control={control} />
        </Box>
    )
}

export default AdminLogin