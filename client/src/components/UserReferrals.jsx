import { useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    TextField,
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import dayjs from "dayjs"

function UserReferrals() {
    const userState = useSelector(state => state.userReducer)
    const [open, setOpen] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [sending, setSending] = useState(false)
    const [summary, setSummary] = useState(null)
    const [referrals, setReferrals] = useState(null)
    const [invites, setInvites] = useState(null)

    const fetchReferralsSummary = async () => {
        try{
            const response = await fetch(`http://localhost:3000/referral/get-summary`, {
                headers: {
                    Authorization : `Bearer ${userState.token}`
                }
            })

            if(!response.ok){
                const error = await response.json()
                return console.log(error)
            }
            const result = await response.json()
            console.log(result)
            setSummary(result)
        }
        catch(err){
            console.error(err.message)
        }
    }

    const fetchAcceptedReferrals = async () => {
        try{
            const response = await fetch(`http://localhost:3000/referral/get-referrals`, {
                headers: {
                    Authorization : `Bearer ${userState.token}`
                }
            })

            if(!response.ok){
                const error = await response.json()
                return console.log(error)
            }
            const result = await response.json()
            console.log(result)
            setReferrals(result)
        }
        catch(err){
            console.error(err.message)
        }
    }

    const fetchReferralInvitations = async () => {
        try{
            const response = await fetch(`http://localhost:3000/referral/get-invites`, {
                headers: {
                    Authorization : `Bearer ${userState.token}`
                }
            })

            if(!response.ok){
                const error = await response.json()
                return console.log(error)
            }
            const result = await response.json()
            console.log(result)
            setInvites(result)
        }
        catch(err){
            console.error(err.message)
        }
    }

    useEffect(() => {
        fetchReferralsSummary()
        fetchAcceptedReferrals()
        fetchReferralInvitations()
    }, [])

    const handleInviteSubmit = async (formData) => {
        console.log(formData);

        setSending(true)
        try{
            const response = await fetch(`http://localhost:3000/referral/send-invite`, {
                method: "POST",
                headers: {
                    Authorization : `Bearer ${userState.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: formData.email
                })
            })
            if (!response.ok) {
                const error = await response.json()
                return console.error(error.error);
            }
            const invitationId = await response.json()
            setInvites(prev => [{
                id: invitationId, 
                referee_email: formData.email, 
                referral_code: summary.myReferralCode, 
                status: "sent",
                created_at: dayjs(),
                updated_at: dayjs(),
                accepted: false
            }, ...prev])

            return console.log("Successfully sent invitation");
        }
        catch(err){
            console.error(err.error);
        }
        finally{
            setSending(false)
            setOpen(false);
            reset()
        }
    };

    return (
        <Box sx={{bgcolor: "#EEEEEE", minHeight: `calc(100vh - 64px)`, p: 3}}>
            {summary ?
                <Grid container spacing={2}>
                    <Grid size={{xs: 12, md: 4}}>
                        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                            <CardContent sx={{display: "flex", justifyContent: "space-between", alignItems: "center", height: "100%"}}>
                                <Box sx={{display: "flex", flexDirection: "column"}}>
                                    <Typography variant="h6">Total Referrals</Typography>
                                    <Typography variant="h4" color="success" fontWeight={500} >{summary.totalReferrals}</Typography>
                                </Box>
                                <Divider orientation="vertical" flexItem/>
                                <Box>
                                    <Typography variant="h6">Pending Invites</Typography>
                                    <Typography variant="h4" color="error" fontWeight={500}>{summary.pendingInvites}</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{xs: 12, md: 4}}>
                        <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
                            <CardContent sx={{display: "flex", justifyContent: "space-between", alignItems: "center", height: "100%"}}>
                                <Box sx={{display: "flex", flexDirection: "column"}}>
                                    <Typography variant="h6">Total Rewards</Typography>
                                    <Typography variant="h4" color="success" fontWeight={500} fontSize={30}>${(summary.totalRewards).toFixed(2)}</Typography>  
                                </Box>
                                <Divider orientation="vertical" flexItem/>
                                <Box>
                                    <Typography variant="h6">Pending Rewards</Typography>
                                    <Typography variant="h4" color="error" fontWeight={500} fontSize={30}>${(summary.pendingRewards)?.toFixed(2)}</Typography>
                                    {/* <Typography variant="h4" color="error" fontWeight={500} fontSize={30}>${(summary.pendingInvites * 10).toFixed(2)}</Typography> */}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{xs: 12, md: 4}}>
                        <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
                            <CardContent sx={{display: "flex", justifyContent: "space-between", alignItems: "center", height: "100%"}}>
                                <Box sx={{display: "flex", flexDirection: "column"}}>
                                    <Typography>
                                        Referral Code:
                                    </Typography>
                                    <Typography variant="h5" color="primary" fontWeight={500}>
                                        {summary.myReferralCode.toUpperCase()}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Button variant="contained" onClick={() => setOpen(true)}>
                                        Invite A Friend
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
                :
                null
            }

            <Box mt={4}>
                <Typography variant="h6" gutterBottom>
                    Referral History
                </Typography>
                <Card sx={{borderRadius: 3}} elevation={3}>
                    <Table sx={{ tableLayout: "fixed", width: "100%" }}>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">Name</TableCell>
                                <TableCell align="center">Email</TableCell>
                                <TableCell align="center">Status</TableCell>
                                <TableCell align="center">Reward</TableCell>
                                <TableCell align="center">Date</TableCell>
                                <TableCell align="center">Referral Mode</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {referrals?.length > 0 ?
                                referrals.map((row, index) => (
                                    <TableRow
                                        key={index}
                                        sx={{ 
                                            "& td, & th": {borderRight: "1px solid rgba(224, 224, 224, 1)"},
                                            "& td:last-of-type" : {borderRight: 0},
                                            '&:last-child td, &:last-child th': { borderBottom: 0 } 
                                        }}
                                    >
                                        <TableCell align='left' sx={{overflowWrap: "anywhere"}}>
                                            {`${row.first_name} ${row.last_name}`}
                                        </TableCell>
                                        <TableCell align='left' sx={{overflowWrap: "anywhere"}}>
                                            {row.email}
                                        </TableCell>
                                        <TableCell align='left' sx={{overflowWrap: "anywhere"}}>
                                            {row.reward_status.charAt(0).toUpperCase() + row.reward_status.slice(1)}
                                        </TableCell>
                                        <TableCell align='right' sx={{overflowWrap: "anywhere"}}>
                                            ${row.reward_amount?.toFixed(2) || (0).toFixed(2)}
                                        </TableCell>
                                        <TableCell sx={{textAlign: 'right', overflowWrap: "anywhere"}}>
                                            {dayjs(row.updated_at).format("DD MMM YYYY")}
                                        </TableCell>
                                        <TableCell align='left' sx={{overflowWrap: "anywhere"}}>
                                            {row.referral_invite_id ? "Referral Link" : "Referral Code"}
                                        </TableCell>
                                    </TableRow>
                                ))
                                :
                                <TableRow>
                                    <TableCell>
                                        <Typography>No referrals</Typography>
                                    </TableCell>
                                </TableRow>
                            }
                        </TableBody>
                    </Table>
                </Card>
            </Box>

            <Box mt={4}>
                <Typography variant="h6" gutterBottom>
                    Invitation History
                </Typography>
                <Card sx={{borderRadius: 3}} elevation={3}>
                    <Table sx={{ tableLayout: "fixed", width: "100%" }}>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">Sent to</TableCell>
                                <TableCell align="center">Referral</TableCell>
                                <TableCell align="center">Email Status</TableCell>
                                <TableCell align="center">Invitation Status</TableCell>
                                <TableCell align="center">Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {invites?.length > 0 ?
                                invites.map((row, index) => (
                                    <TableRow
                                        key={index}
                                        sx={{ 
                                            "& td, & th": {borderRight: "1px solid rgba(224, 224, 224, 1)"},
                                            "& td:last-of-type" : {borderRight: 0},
                                            '&:last-child td, &:last-child th': { borderBottom: 0 } 
                                        }}
                                    >
                                        <TableCell align='left' sx={{overflowWrap: "anywhere"}}>
                                            {row.referee_email}
                                        </TableCell>
                                        <TableCell align='left' sx={{overflowWrap: "anywhere"}}>
                                            {(row.referral_code).toUpperCase()}
                                        </TableCell>
                                        <TableCell align='left' sx={{overflowWrap: "anywhere"}}>
                                            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                                        </TableCell>
                                        <TableCell align='left' sx={{overflowWrap: "anywhere"}}>
                                            {(row.accepted ? "Accepted" : "Pending")}
                                        </TableCell>
                                        <TableCell sx={{textAlign: 'right', overflowWrap: "anywhere"}}>
                                            {dayjs(row.updated_at).format("DD MMM YYYY")}
                                        </TableCell>
                                    </TableRow>
                                ))
                                :
                                <TableRow>
                                    <TableCell>
                                        <Typography>No Invitations yet</Typography>
                                    </TableCell>
                                </TableRow>
                            }
                        </TableBody>
                    </Table>
                </Card>
            </Box>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
                <DialogTitle>Invite a Friend</DialogTitle>
                <form onSubmit={handleSubmit(handleInviteSubmit)} noValidate>
                    <DialogContent>
                        <TextField
                            label="Friend's Email"
                            {...register("email", 
                                { 
                                    required: {
                                        value: true,
                                        message: "Email is required"
                                    },
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Invalid Email format"
                                    } 
                                }
                            )}
                            autoFocus
                            fullWidth
                            autoComplete='off'
                            error={!!errors.email}
                            helperText={errors.email?.message}
                        />
                    </DialogContent>
                    <DialogActions sx={{py: 2, px: 3}}>
                        <Button onClick={() => setOpen(false)} variant='contained'>Back</Button>
                        <Button type="submit" color="error" variant="contained" disabled={sending}>
                            Send Invite
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
}

export default UserReferrals