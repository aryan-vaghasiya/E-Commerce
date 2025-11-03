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
import { useNavigate, useSearchParams } from 'react-router'
import { addDetails } from '../redux/checkout/checkoutActions'
import { hideSnack, showSnack } from '../redux/snackbar/snackbarActions'
import { addUser } from '../redux/user/userActions'
import { authService } from '../api/services/authService'

function Signup() {
    const [searchParams] = useSearchParams();
    const referralCode = searchParams.get("referral");
    const invitationId = searchParams.get("invitationId");
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const snackbarState = useSelector((state) => state.snackbarReducer)

    const { register, handleSubmit, control, getValues, watch, formState: { errors } } = useForm()

    const passwordValue = watch("password")

    const handleLogin = () => {
        navigate("/login")
    }

    const onSubmitOne = (data) => {
        authService.signup({
            username: data.username,
            password: data.password,
            fName: data.fName,
            lName: data.lName,
            email: data.email,
            referral: data.referral || null,
            referralMode: invitationId ? invitationId : data.referral ? "manual" : null
        })
            .then(data => {
                const decoded = JSON.parse(atob(data?.token.split('.')[1]))
                dispatch(addUser(decoded.username, data.token, "user"))
                dispatch(addDetails(getValues()))
                return navigate("/", {replace: true})
            })
            .catch(err => {
                console.error(err);
                dispatch(showSnack({message: err.message, severity: "warning"}))
            })
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
            <Card sx={{ bgcolor: "white", px: 7, pb: 3, pt: 5,  my: "auto"}}>
                <form onSubmit={handleSubmit(onSubmitOne)} noValidate>
                    <Stack spacing={2.5} width={400}>
                        <Box sx={{ display: "inline-flex" }}>
                            <TextField label="First Name" type='text' sx={{ width: "100%", mr: 1 }} {...register("fName", {
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
                            />
                            <TextField label="Last Name" type='text' sx={{ width: "100%" }} {...register("lName", {
                                pattern: {
                                    value: /^[A-Za-z]{3,20}$/,
                                    message: "Must have alphabets only (3-20)"
                                }
                            })}
                                error={!!errors.lName}
                                helperText={errors.lName ? errors.lName.message : ""}
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
                        />
                        <TextField label="Referral Code (optional)" type='text' sx={{ width: "100%" }} {...register("referral",
                            {
                                pattern: {
                                    value: /^[A-Za-z]{6}$/,
                                    message: "Must be 6 letters alphanumeric"
                                }
                            }
                        )}
                                error={!!errors.referral}
                                helperText={errors.referral ? errors.referral.message : ""}
                                slotProps={{
                                    input: {
                                        readOnly: referralCode,
                                    },
                                }}
                                defaultValue={referralCode ? (referralCode).toUpperCase() : ""}
                        />
                        <Button type='submit' variant="contained">Sign Up</Button>
                    </Stack>
                    <Box textAlign='right' sx={{pt: 2, pb: 0}}>
                        <Button onClick={handleLogin} variant='text'>Login ?</Button>
                    </Box>
                </form>
            </Card>
            <DevTool control={control} />
        </Box>
    )
}

export default Signup