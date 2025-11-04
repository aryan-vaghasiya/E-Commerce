import { DevTool } from '@hookform/devtools'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { addDetails } from '../redux/checkout/checkoutActions'
import { hideSnack, showSnack } from '../redux/snackbar/snackbarActions'
import { addUser } from '../redux/user/userActions'
import { authService } from '../api/services/authService'
import { useState } from 'react'

const selectSnackbar = (state) => state.snackbarReducer;

function Signup() {
    const [searchParams] = useSearchParams();
    const referralCode = searchParams.get("referral");
    const invitationId = searchParams.get("invitationId");
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const snackbarState = useSelector(selectSnackbar)
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hover, setHover] = useState(false);

    const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
        defaultValues: {
            fName: '',
            lName: '',
            email: '',
            username: '',
            password: '',
            confirmPassword: '',
            referral: referralCode?.toUpperCase() || ''
        }
    })

    const passwordValue = watch("password")

    const handleSignup = async (data) => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const response = await authService.signup({
                username: data.username,
                password: data.password,
                fName: data.fName,
                lName: data.lName,
                email: data.email,
                referral: data.referral || null,
                referralMode: invitationId ? invitationId : data.referral ? "manual" : null
            });
            dispatch(addUser(response.username, response.token, response.role));
            dispatch(addDetails(data));
            navigate("/", { replace: true });
        } catch (err) {
            console.error('Signup error:', err);
            dispatch(showSnack({ message: err.message || "Signup failed", severity: "error" }));
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
            <Card sx={{ bgcolor: "white", px: 7, pb: 3, pt: 5,  my: "auto"}}>
                <form onSubmit={handleSubmit(handleSignup)} noValidate>
                    <Stack spacing={2.5} width={{ xs: 300, sm: 400 }}>

                        <Box sx={{ display: "flex", flexDirection: {xs: "column", sm: "row"}, gap: {xs: 2.5, sm: 1} }}>
                            <TextField label="First Name" type='text' sx={{ width: "100%"}} {...register("fName", {
                                    required: {
                                        value: true,
                                        message: "First Name is required"
                                    },
                                    pattern: {
                                        value: /^[A-Za-z]{3,20}$/,
                                        message: "Must have alphabets only (3-20"
                                    },
                                })}
                                error={!!errors.fName}
                                helperText={errors.fName ? errors.fName.message : ""}
                                disabled={isSubmitting}
                            />
                            <TextField label="Last Name" type='text' sx={{ width: "100%" }} {...register("lName", {
                                    pattern: {
                                        value: /^[A-Za-z]{3,20}$/,
                                        message: "Must have alphabets only (3-20)"
                                    }
                                })}
                                error={!!errors.lName}
                                helperText={errors.lName ? errors.lName.message : ""}
                                disabled={isSubmitting}
                            />
                        </Box>

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
                            disabled={isSubmitting}
                        />

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
                            disabled={isSubmitting}
                        />

                        <TextField label="Password" type='password' {...register("password", {
                                required: {
                                    value: true,
                                    message: "Password is required"
                                },
                                pattern: {
                                    value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,20}$/,
                                    message: "Must be alphanumeric and 5-20 characters long"
                                }
                            })}
                            error={!!errors.password}
                            helperText={errors.password ? errors.password.message : ""}
                            disabled={isSubmitting}
                        />
                        
                        <TextField label="Confirm Password" type='password' {...register("confirmPassword", {
                                required: {
                                    value: true,
                                    message: "Password is required"
                                },
                                validate: (value) => value === passwordValue || "Passwords do not match"
                            })}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword ? errors.confirmPassword.message : ""}
                            disabled={isSubmitting}
                        />

                        <TextField label="Referral Code (optional)" type='text' sx={{ width: "100%" }}
                            {...register("referral",
                                {pattern: {
                                    value: /^[A-Za-z0-9]{6}$/,
                                    message: "Must be 6 letters alphanumeric"
                                }}
                            )}
                            error={!!errors.referral}
                            helperText={errors.referral ? errors.referral.message : ""}
                            slotProps={{
                                input: {
                                    readOnly: !!referralCode,
                                },
                            }}
                            disabled={isSubmitting}
                        />

                        <Button
                            type='submit'
                            variant="contained"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Signing up...' : 'Sign Up'}
                        </Button>
                    </Stack>
                </form>
                <Box textAlign="center" sx={{pt: 3}}>
                    <Link 
                        to="/login"
                        style={{ 
                            color: hover ? "black" : "grey", 
                            transition: "color 0.5s", 
                            textDecoration: hover ? "underline" : "none" 
                        }}
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                    >
                        Already have an account? Login
                    </Link>
                </Box>
            </Card>
            <DevTool control={control} />
        </Box>
    )
}

export default Signup