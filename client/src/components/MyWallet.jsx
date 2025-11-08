import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { use, useState } from 'react'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import AddIcon from '@mui/icons-material/Add';
import PaidIcon from '@mui/icons-material/Paid';
import IconButton from '@mui/material/IconButton'
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Modal from '@mui/material/Modal'
import { useForm } from 'react-hook-form'
import TextField from '@mui/material/TextField'
import TableContainer from '@mui/material/TableContainer'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'
import dayjs from 'dayjs'
import Paper from '@mui/material/Paper'
import { userService } from '../api/services/userService'
const API_URL = import.meta.env.VITE_API_SERVER;

const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    borderRadius: "12px",
    boxShadow: 24,
    p: 4,
};

function MyWallet() {

    const userState = useSelector(state => state.userReducer)
    const [wallet, setWallet] = useState(null)
    const [visibleBalance, setVisibleBalance] = useState(false)
    const [addModal, setAddModal] = useState(false);
    const [withdrawModal, setWithdrawModal] = useState(false);
    const [transactions, setTransactions] = useState([])

    // const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const { register: registerAdd, handleSubmit: handleSubmitAdd, reset: resetAdd, formState: { errors: errorsAdd } } = useForm();
    const { register: registerWithdraw, handleSubmit: handleSubmitWithdraw, reset: resetWithdraw, formState: { errors: errorsWithdraw } } = useForm();

    const handleOpenAddModal = () =>{
        setAddModal(true)
    }
    const handleCloseAddModal = () => {
        setAddModal(false);
        resetAdd();
    };

    const handleOpenWithdrawModal = () =>{
        setWithdrawModal(true)
    }
    const handleCloseWithdrawModal = () => {
        setWithdrawModal(false);
        resetWithdraw();
    };

    const getTransactionType = (type) => {
        const transactionType = type === "DEPOSIT" ? "Wallet Deposit" : type === "WITHDRAWAL" ? "Wallet Withdrawal" : type === "PAYMENT" ? "Order Payment" : type === "REFUND" ? "Refund" : type === "CASHBACK" ? "Cashback" : type === "REFERRAL_REWARD" ? "Referral Reward" : null
        return transactionType
    }

    const handleAddFunds = async (data) => {
        console.log(data);

        try{
            // const response = await fetch(`${API_URL}/wallet/add-funds`, {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json",
            //         Authorization : `Bearer ${userState.token}`
            //     },
            //     body: JSON.stringify({amount: data.amount})
            // })
            // if(!response.ok){
            //     const error = await response.json()
            //     return console.log(error)
            // }

            const addFunds = await userService.addFundsToWallet(data.amount);
            setWallet(prev => ({...prev, balance: prev.balance + parseFloat(data.amount)}))

            const newTransactions = [
                {
                    amount: parseFloat(data.amount),
                    created_at: dayjs(),
                    transaction: "CREDIT",
                    type: "DEPOSIT",
                    description: "wallet_topup/self"
                },
            ...transactions];

            if(newTransactions.length > 10){
                newTransactions.pop();
            }
            
            setTransactions(newTransactions);
        }
        catch(err){
            console.error(err.message)
        }
        finally{
            handleCloseAddModal();
        }
    };

    const handleWithdrawFunds = async (data) => {
        console.log(data);

        try{
            // const response = await fetch(`${API_URL}/wallet/withdraw-funds`, {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json",
            //         Authorization : `Bearer ${userState.token}`
            //     },
            //     body: JSON.stringify({amount: data.amount})
            // })
            // if(!response.ok){
            //     const error = await response.json()
            //     return console.log(error)
            // }

            const withdrawFunds = await userService.withdrawFundsFromWallet(data.amount);
            setWallet(prev => ({...prev, balance: prev.balance - parseFloat(data.amount)}));

            const newTransactions = [{amount: parseFloat(data.amount), created_at: dayjs(), transaction: "DEBIT", type: "WITHDRAWAL", description: "wallet_withdrawal/self"}, ...transactions];
            if(newTransactions.length > 10){
                newTransactions.pop();
            }
            setTransactions(newTransactions);
        }
        catch(err){
            console.error(err.message)
        }
        handleCloseWithdrawModal();
    };

    const fetchWallet = async () => {
        try{
            // const response = await fetch(`${API_URL}/wallet/get-wallet`, {
            //     headers: {
            //         Authorization : `Bearer ${userState.token}`
            //     }
            // })

            // if(!response.ok){
            //     const error = await response.json()
            //     return console.log(error)
            // }
            // const result = await response.json()

            const result = await userService.getWalletData();
            setWallet(result)
        }
        catch(err){
            console.error(err.message)
        }
    }

    const fetchWalletTransactions = async () => {
        try{
            // const response = await fetch(`${API_URL}/wallet/get-transactions`, {
            //     headers: {
            //         Authorization : `Bearer ${userState.token}`
            //     }
            // })
            // if(!response.ok){
            //     const error = await response.json()
            //     return console.log(error)
            // }
            // const result = await response.json()

            const result = await userService.getWalletTransactions();
            setTransactions(result)
        }
        catch(err){
            console.error(err.message)
        }
    }

    useEffect(() => {
        fetchWallet()
        fetchWalletTransactions()
    },[])

    return (
        <Box sx={{ py: 1.5, px: 4, bgcolor: "#EEEEEE", minHeight: "91vh" }}>
            <Modal open={addModal} onClose={handleCloseAddModal}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" component="h2" sx={{mb: 2}} >
                        Add Money to Wallet
                    </Typography>
                    <form onSubmit={handleSubmitAdd(handleAddFunds)} noValidate>
                        <TextField
                            autoComplete='off'
                            fullWidth
                            type="number"
                            label="Amount ($)"
                            variant="outlined"
                            sx={{ mb: 2 }}
                            {...registerAdd
                                ("amount", {
                                    required: "Amount is required",
                                    pattern: {
                                        value: /^\d+(\.\d{1,2})?$/,
                                        message: "Enter a valid amount"
                                    },
                                    min: { value: 1, message: "Minimum $1" },
                                })
                            }
                            error={!!errorsAdd.amount}
                            helperText={errorsAdd.amount?.message}
                        />

                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                            <Button onClick={handleCloseAddModal} variant='contained' color='error'>Cancel</Button>
                            <Button type="submit" variant="contained">Add Money</Button>
                        </Box>
                    </form>
                </Box>
            </Modal>
            <Modal open={withdrawModal} onClose={handleCloseWithdrawModal}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" component="h2" sx={{mb: 2}} >
                        Withdraw Money from Wallet
                    </Typography>
                    <form onSubmit={handleSubmitWithdraw(handleWithdrawFunds)} noValidate>
                        <TextField
                            autoComplete='off'
                            fullWidth
                            type="number"
                            label="Amount ($)"
                            variant="outlined"
                            sx={{ mb: 2 }}
                            {...registerWithdraw
                                ("amount", {
                                    required: "Amount is required",
                                    pattern: {
                                        value: /^\d+(\.\d{1,2})?$/,
                                        message: "Enter a valid amount"
                                    },
                                    max: { 
                                        value: wallet?.balance || 0, 
                                        message: `Maximum $${wallet?.balance || 0}`
                                    },
                                    // max: { value: wallet && wallet.balance, message: `Maximum $${wallet && wallet.balance}` },
                                    min: { value: 1, message: `Minimum $1` },
                                })
                            }
                            error={!!errorsWithdraw.amount}
                            helperText={errorsWithdraw.amount?.message}
                        />

                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                            <Button onClick={handleCloseWithdrawModal} variant='contained' color='error'>Cancel</Button>
                            <Button type="submit" variant="contained">Withdraw Money</Button>
                        </Box>
                    </form>
                </Box>
            </Modal>
            {wallet ?
            <>
                <Card sx={{borderRadius: 3, mb: 2}}>
                    <CardContent>
                        <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                            <Box sx={{display: "flex", gap: 2}}>
                                <Box sx={{display: "flex", flexDirection: "column", alignItems: 'flex-end'}}>
                                    <Typography color='primary' sx={{fontSize: 35}}>
                                        {visibleBalance ? (wallet.balance).toFixed(2) : `x.xx`}
                                        <Typography component={'span'} sx={{fontSize: 24}}>$</Typography>
                                        <IconButton onClick={() => setVisibleBalance(prev => !prev)} sx={{mx: 0.5}}>{visibleBalance ? <VisibilityIcon fontSize={'small'}/> : <VisibilityOffIcon fontSize={'small'}/>}</IconButton>
                                    </Typography>
                                    <Typography sx={{mr: "auto"}}>Wallet Balance</Typography>
                                </Box>
                            </Box>
                            <Box sx={{display: "flex", gap: 2, justifyContent: "center", alignItems: "center"}}>
                                <Button variant='contained' startIcon={<AddIcon/>} onClick={handleOpenAddModal}>Add Funds</Button>
                                <Button variant='contained' startIcon={<PaidIcon/>} onClick={handleOpenWithdrawModal}>Withdraw Funds</Button>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
                <Card sx={{borderRadius: 3}}>
                    <CardContent>
                        <Typography>{transactions.length > 0 ? "Last 10 Transactions" : "No Transactions"}</Typography>
                        <TableContainer component={Paper} sx={{ minWidth: "400px", maxWidth: "700px", my: 2}} elevation={3}>
                            <Table sx={{ tableLayout: "fixed", width: "100%" }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center" sx={{ width: "20%", bgcolor: "#F0F0F0" }}>Type</TableCell>
                                        <TableCell align="center" sx={{ width: "35%", bgcolor: "#F0F0F0" }}>Description</TableCell>
                                        <TableCell align="center" sx={{ width: "25%", bgcolor: "#F0F0F0" }}>Time</TableCell>
                                        <TableCell align="center" sx={{ width: "20%", bgcolor: "#F0F0F0" }}>Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {transactions.map((row, index) => (
                                        <TableRow
                                            key={index}
                                            sx={{ 
                                                "& td, & th": {borderRight: "1px solid rgba(224, 224, 224, 1)"},
                                                "& td:last-of-type" : {borderRight: 0},
                                                '&:last-child td, &:last-child th': { borderBottom: 0 } 
                                            }}
                                        >
                                            <TableCell align='left' sx={{overflowWrap: "anywhere"}}>{getTransactionType(row.type)}</TableCell>
                                            <TableCell align='left' 
                                                sx={{
                                                        // wordWrap: "break-word",
                                                        overflowWrap: "anywhere"
                                                    }}
                                            >
                                                {row.description || "-"}
                                            </TableCell>
                                            <TableCell sx={{textAlign: 'right', overflowWrap: "anywhere"}}>
                                                {dayjs(row.created_at).format("DD-MM-YYYY, hh:mm A")} {row.last_name}
                                            </TableCell>
                                            <TableCell sx={{textAlign: 'right', overflowWrap: "anywhere"}}>
                                                <Box sx={{display: "flex", justifyContent: "flex-end", alignItems: "center", height: "100%"}}>
                                                    <Typography color={row.transaction === "CREDIT" ? 'success' : 'error'}>{row.transaction === "CREDIT" ? '+' : '-'}{(row.amount).toFixed(2)}$</Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </>
            : null}
        </Box>
    )
}

export default MyWallet
