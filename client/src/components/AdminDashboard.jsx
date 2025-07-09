import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import React, { useEffect } from 'react'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import GroupsIcon from '@mui/icons-material/Groups';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import BarChartIcon from '@mui/icons-material/BarChart';
import CategoryIcon from '@mui/icons-material/Category';
import { Link, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDashboard } from '../redux/adminDashboard/dashboardActions'
import Paper from '@mui/material/Paper'
import TableContainer from '@mui/material/TableContainer'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import AssignmentIcon from '@mui/icons-material/Assignment';
import IconButton from '@mui/material/IconButton'


function createData(name, calories, fat, carbs, protein) {
    return { name, calories, fat, carbs, protein };
}


// const rows = [
//     createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
//     createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
//     createData('Eclair', 262, 16.0, 24, 6.0),
//     createData('Cupcake', 305, 3.7, 67, 4.3),
//     createData('Gingerbread', 356, 16.0, 49, 3.9),
// ];


function AdminDashboard() {

    const dashboardState = useSelector(state => state.dashboardReducer)
    const userState = useSelector(state => state.userReducer)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    
    useEffect(() => {
        dispatch(fetchDashboard(userState.token))
    },[])

    // const rows = dashboardState.recentOrders.map(item => item);

    return (
        <Box sx={{ py: 1.5, px: 4, bgcolor: "#EEEEEE", minHeight: "91vh" }}>
            <Typography variant='h4' component='h1' sx={{fontWeight: "200"}}>Dashboard</Typography>
            <Divider sx={{mt: 1, mb: 2}}/>
            {/* <Card>
                <CardContent>
                    Orders
                </CardContent>
            </Card> */}
            <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
            <Grid size={{ xs: 6, md: 3}}>
                <Card>
                    <Typography sx={{ p: 1, fontSize: "16px", bgcolor: "#3B92CA", color: "white"}}>TOTAL ORDERS</Typography>
                    {/* <Divider sx={{mx: 1, mb: 1, color: "#2196f3"}}></Divider> */}
                    <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", p: 1, py: 2, bgcolor: "#2786C5"}}>
                        <ShoppingCartIcon sx={{fontSize: 50, ml: 1, color: "white"}}></ShoppingCartIcon>
                        <Typography variant='h4' sx={{mr: 1, color: "white"}}>{dashboardState.orders}</Typography>
                    </Box>
                    {/* <Divider sx={{mx: 1, mb: 1, color: "#2196f3"}}></Divider> */}
                    <Link to="/admin/sales"><Typography sx={{px: 1, bgcolor: "#1873AE", color: "white"}}>view more...</Typography></Link>
                </Card>
            </Grid>
            <Grid size={{ xs: 6, md: 3}}>
                <Card>
                    <Typography sx={{ p: 1, fontSize: "16px", bgcolor: "#3B92CA", color: "white"}}>TOTAL PRODUCTS</Typography>
                    {/* <Divider sx={{mx: 1, mb: 1, color: "#2196f3"}}></Divider> */}
                    <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", p: 1, py: 2, bgcolor: "#2786C5"}}>
                        {/* <ShoppingCartIcon sx={{fontSize: 50, ml: 1, color: "white"}}></ShoppingCartIcon> */}
                        <CategoryIcon sx={{fontSize: 50, ml: 1, color: "white"}}></CategoryIcon>
                        <Typography variant='h4' sx={{mr: 1, color: "white"}}>{dashboardState.products}</Typography>
                    </Box>
                    {/* <Divider sx={{mx: 1, mb: 1, color: "#2196f3"}}></Divider> */}
                    <Link to="/admin/products"><Typography sx={{px: 1, bgcolor: "#1873AE", color: "white"}}>view more...</Typography></Link>
                </Card>
            </Grid>
            <Grid size={{ xs: 6, md: 3}}>
                <Card>
                    <Typography sx={{ p: 1, fontSize: "16px", bgcolor: "#3B92CA", color: "white"}}>TOTAL SALES</Typography>
                    {/* <Divider sx={{mx: 1, mb: 1, color: "#2196f3"}}></Divider> */}
                    <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", p: 1, py: 2, bgcolor: "#2786C5"}}>
                        <CreditScoreIcon sx={{fontSize: 50, ml: 1, color: "white"}}></CreditScoreIcon>
                        <Typography variant='h4' sx={{mr: 1, color: "white"}}>{dashboardState.sales}<span className='text-2xl'> $</span></Typography>
                    </Box>
                    {/* <Divider sx={{mx: 1, mb: 1, color: "#2196f3"}}></Divider> */}
                    <Link to="/admin/sales"><Typography sx={{px: 1, bgcolor: "#1873AE", color: "white"}}>view more...</Typography></Link>
                </Card>
            </Grid>
            <Grid size={{ xs: 6, md: 3}}>
                <Card>
                    <Typography sx={{ p: 1, fontSize: "16px", bgcolor: "#3B92CA", color: "white"}}>TOTAL CUSTOMERS</Typography>
                    {/* <Divider sx={{mx: 1, mb: 1, color: "#2196f3"}}></Divider> */}
                    <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", p: 1, py: 2, bgcolor: "#2786C5"}}>
                        <GroupsIcon sx={{fontSize: 50, ml: 1, color: "white"}}></GroupsIcon>
                        <Typography variant='h4' sx={{mr: 1, color: "white"}}>{dashboardState.customers}</Typography>
                    </Box>
                    {/* <Divider sx={{mx: 1, mb: 1, color: "#2196f3"}}></Divider> */}
                    <Link to="/admin/users"><Typography sx={{px: 1, bgcolor: "#1873AE", color: "white"}}>view more...</Typography></Link>
                </Card>
            </Grid>
            </Grid>

            <Box sx={{display: "flex"}}>
                <TableContainer component={Paper} sx={{ minWidth: 450, maxWidth: "60%", mt: 4, mb: 2}}>
                <Typography sx={{ p: 1, fontSize: "16px", bgcolor: "#3B92CA", color: "white"}}>RECENT ORDERS</Typography>
                <Table >
                    <TableHead>
                    <TableRow>
                        <TableCell align="right" sx={{maxWidth: 80 }}>Order ID</TableCell>
                        <TableCell align="left">Customer</TableCell>
                        <TableCell align="left">Status</TableCell>
                        <TableCell align="left">Date Added</TableCell>
                        <TableCell align="right">Total</TableCell>
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
                        <TableCell align="left">{row.order_date}</TableCell>
                        <TableCell align="right">${row.total}</TableCell>
                        <TableCell align="center"><IconButton onClick={() => navigate(`/order/${row.id}`)} sx={{p: 0}}><AssignmentIcon></AssignmentIcon></IconButton></TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </TableContainer>
                <Card sx={{minWidth: "40%", mt: 4, mb: 2, ml: 2}}>
                    <Typography sx={{ p: 1, fontSize: "16px", bgcolor: "#3B92CA", color: "white"}}>RECENT ACTIVITIES</Typography>
                </Card>
            </Box>
        </Box>
    )
}

export default AdminDashboard
