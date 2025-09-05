// import { Box, Button } from '@mui/material'
// import { useSelector } from 'react-redux';

// function UserReferrals() {

//     const userState = useSelector(state => state.userReducer)

//     const generateReferral = async () => {
//         try {
//             const res = await fetch("http://localhost:3000/referral/generate", {
//                 method: "POST",
//                 headers: {
//                     Authorization: `Bearer ${userState.token}`,
//                 },
//             });
//             if(!res.ok){
//                 const error = await res.json()
//                 return console.error("Could not generate referral:", error.error);
//             }
//         }
//         catch (err) {
//             console.error("Generating referral failed:", err.message);
//         }
//     }

//     return (
//         <Box>
//             <Button onClick={() => generateReferral()}>Generate Referral Link</Button>
//         </Box>
//     )
// }

// export default UserReferrals


import { useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Modal,
    TextField,
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";

function UserReferrals() {
    const userState = useSelector(state => state.userReducer)
    const [open, setOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [sending, setSending] = useState(false)

    // Mock data – replace with API fetch
    const referralSummary = {
        totalReferrals: 5,
        totalRewards: 250, // could be wallet credits, points, etc
    };

    const referralHistory = [
        {
            refereeName: "John Doe",
            refereeEmail: "john@example.com",
            accepted: true,
            rewardStatus: "credited",
            date: "2025-08-25",
        },
        {
            refereeName: "Jane Smith",
            refereeEmail: "jane@example.com",
            accepted: true,
            rewardStatus: "pending",
            date: "2025-08-26",
        },
    ];

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
            if (response.ok) {
                console.log("Successfully sent invitation");
                return
            }
            const error = await response.json()
            console.error(error.error);
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
        // <Box p={3}>
        <Box sx={{bgcolor: "#EEEEEE", minHeight: `calc(100vh - 64px)`, p: 3}}>
        {/* Referral Summary */}
            <Grid container spacing={2}>
                <Grid size={{xs: 12, md: 4}}>
                    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                        <CardContent>
                            <Typography variant="h6">Total Referrals</Typography>
                            <Typography variant="h4">{referralSummary.totalReferrals}</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{xs: 12, md: 4}}>
                    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                        <CardContent>
                            <Typography variant="h6">Total Rewards</Typography>
                            <Typography variant="h4">${referralSummary.totalRewards}</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{xs: 12, md: 4}}>
                    <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
                        <CardContent sx={{display: "flex", justifyContent: "space-between", alignItems: "center", height: "100%"}}>
                            {/* <Box sx={{display: "flex", justifyContent: "space-between", height: "100%"}}> */}
                                <Box sx={{display: "flex", flexDirection: "column"}}>
                                    <Typography variant="h6">
                                        CODE
                                    </Typography>
                                    <Typography variant="h6">
                                        MYCODE
                                    </Typography>
                                </Box>
                                <Box>
                                    <Button variant="contained" onClick={() => setOpen(true)}>
                                        Invite A Friend
                                    </Button>
                                </Box>
                            {/* </Box> */}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Referral History */}
            <Box mt={4}>
                <Typography variant="h6" gutterBottom>
                    Referral History
                </Typography>
                <Paper sx={{ borderRadius: 3, boxShadow: 3 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Friend</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Reward</TableCell>
                                <TableCell>Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {referralHistory.map((row, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>{row.refereeName}</TableCell>
                                    <TableCell>{row.refereeEmail}</TableCell>
                                    <TableCell>
                                        {row.accepted ? "Accepted" : "Not Accepted"}
                                    </TableCell>
                                    <TableCell>{row.rewardStatus}</TableCell>
                                    <TableCell>{row.date}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            </Box>

            {/* Invite Modal */}
            {/* <Modal open={open} onClose={() => setOpen(false)}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 400,
                        bgcolor: "background.paper",
                        p: 4,
                        borderRadius: 3,
                        boxShadow: 24,
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        Invite a Friend
                    </Typography>
                    <TextField
                        fullWidth
                        label="Friend's Email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Friend's Email"
                        {...register("email", { required: "Email is required" })}
                        autoFocus
                        margin="none"
                        fullWidth
                        autoComplete='off'
                        slotProps={{htmlInput: { maxLength: 150 }}}
                        error={!!errors.reason}
                        helperText={errors.reason?.message}
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleInviteSubmit}
                    >
                        Send Invite
                    </Button>
                </Box>
            </Modal> */}

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
                            // margin="none"
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