import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useEffect } from 'react'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import GroupsIcon from '@mui/icons-material/Groups';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import CategoryIcon from '@mui/icons-material/Category';
import { Link, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import Paper from '@mui/material/Paper'
import TableContainer from '@mui/material/TableContainer'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import AssignmentIcon from '@mui/icons-material/Assignment';
import IconButton from '@mui/material/IconButton'
import { useState } from 'react'

function AdminDashboard() {

    // const dashboardState = useSelector(state => state.dashboardReducer)
    const userState = useSelector(state => state.userReducer)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [dashboardState, setDashboardState] = useState(null)

    const getDashboard = async (token) => {
        try {
            const res = await fetch("http://localhost:3000/admin/get-dashboard", {
                headers: {
                    Authorization: `Bearer ${token}`,
                }, 
            });
            if(!res.ok){
                const error = await res.json()
                console.error("Could not fetch Dashboard Data:", error.error);
                return false
            }
            const data = await res.json();
            // console.log(data);
            setDashboardState(data)
        }
        catch (err) {
            console.error("Dashboard fetch failed:", err.message);
        }
    }

    useEffect(() => {
        // dispatch(fetchDashboard(userState.token))
        getDashboard(userState.token)
    },[])

    return (
        <Box sx={{ py: 1.5, px: 4, bgcolor: "#EEEEEE", minHeight: "91vh" }}>
            {dashboardState ?
                <Box>
                    <Typography variant='h4' component='h1' sx={{fontWeight: "200"}}>Dashboard</Typography>
                    <Divider sx={{mt: 1, mb: 2}}/>
                    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                        <Grid size={{ xs: 6, md: 3}}>
                            <Card>
                                <Typography sx={{ p: 1, fontSize: "16px", bgcolor: "#3B92CA", color: "white"}}>
                                    TOTAL ORDERS
                                </Typography>
                                <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", p: 1, py: 2, bgcolor: "#2786C5"}}>
                                    <ShoppingCartIcon sx={{fontSize: 50, ml: 1, color: "white"}}></ShoppingCartIcon>
                                    <Typography variant='h4' sx={{mr: 1, color: "white"}}>{dashboardState.orders}</Typography>
                                </Box>
                                <Link to="/admin/sales">
                                    <Typography sx={{px: 1, bgcolor: "#1873AE", color: "white"}}>view more...</Typography>
                                </Link>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 6, md: 3}}>
                            <Card>
                                <Typography sx={{ p: 1, fontSize: "16px", bgcolor: "#3B92CA", color: "white"}}>
                                    TOTAL PRODUCTS
                                </Typography>
                                <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", p: 1, py: 2, bgcolor: "#2786C5"}}>
                                    <CategoryIcon sx={{fontSize: 50, ml: 1, color: "white"}}></CategoryIcon>
                                    <Typography variant='h4' sx={{mr: 1, color: "white"}}>{dashboardState.products}</Typography>
                                </Box>
                                <Link to="/admin/products">
                                    <Typography sx={{px: 1, bgcolor: "#1873AE", color: "white"}}>view more...</Typography>
                                </Link>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 6, md: 3}}>
                            <Card>
                                <Typography sx={{ p: 1, fontSize: "16px", bgcolor: "#3B92CA", color: "white"}}>
                                    TOTAL SALES
                                </Typography>
                                <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", p: 1, py: 2, bgcolor: "#2786C5"}}>
                                    <CreditScoreIcon sx={{fontSize: 50, ml: 1, color: "white"}}></CreditScoreIcon>
                                    <Typography variant='h4' sx={{mr: 1, color: "white"}}>{dashboardState.sales}<span className='text-2xl'> $</span></Typography>
                                </Box>
                                <Link to="/admin/sales">
                                    <Typography sx={{px: 1, bgcolor: "#1873AE", color: "white"}}>view more...</Typography>
                                </Link>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 6, md: 3}}>
                            <Card>
                                <Typography sx={{ p: 1, fontSize: "16px", bgcolor: "#3B92CA", color: "white"}}>
                                    TOTAL CUSTOMERS
                                </Typography>
                                <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", p: 1, py: 2, bgcolor: "#2786C5"}}>
                                    <GroupsIcon sx={{fontSize: 50, ml: 1, color: "white"}}></GroupsIcon>
                                    <Typography variant='h4' sx={{mr: 1, color: "white"}}>{dashboardState.customers}</Typography>
                                </Box>
                                <Link to="/admin/users">
                                    <Typography sx={{px: 1, bgcolor: "#1873AE", color: "white"}}>view more...</Typography>
                                </Link>
                            </Card>
                        </Grid>
                    </Grid>

                    <Box sx={{display: "flex"}}>
                        <TableContainer component={Paper} sx={{ minWidth: 450, maxWidth: "60%", mt: 4, mb: 2}}>
                            <Typography sx={{ p: 1, fontSize: "16px", bgcolor: "#3B92CA", color: "white"}}>
                                RECENT ORDERS
                            </Typography>
                            <Table >
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center" sx={{maxWidth: 80 }}>Order ID</TableCell>
                                        <TableCell align="center">Customer</TableCell>
                                        <TableCell align="center">Status</TableCell>
                                        <TableCell align="center">Order Date</TableCell>
                                        <TableCell align="center">Total</TableCell>
                                        <TableCell align="center">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {dashboardState.recentOrders.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell align='right'>{row.id}</TableCell>
                                            <TableCell align="left">{row.first_name} {row.last_name}</TableCell>
                                            <TableCell align="left">{row.status}</TableCell>
                                            <TableCell align="right">{row.order_date}</TableCell>
                                            <TableCell align="right">${row.total}</TableCell>
                                            <TableCell align="center">
                                                <IconButton onClick={() => navigate(`/admin/order/${row.id}`)} sx={{p: 0}}>
                                                    <AssignmentIcon></AssignmentIcon>
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                        ))
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Card sx={{minWidth: "40%", mt: 4, mb: 2, ml: 2}}>
                            <Typography sx={{ p: 1, fontSize: "16px", bgcolor: "#3B92CA", color: "white"}}>RECENT ACTIVITIES</Typography>
                        </Card>
                    </Box>
                </Box>
                : 
                null
            }
        </Box>
    )
}

export default AdminDashboard
