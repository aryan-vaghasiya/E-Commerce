import Box from '@mui/material/Box'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useEffect } from 'react'
import { useSelector } from 'react-redux';
import { useParams } from 'react-router'
import dayjs from 'dayjs';
import Grid from '@mui/material/Grid';
import CardMedia from '@mui/material/CardMedia';
import { getImageUrl } from '../utils/imageUrl';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Paper from '@mui/material/Paper';
import { DataGrid } from '@mui/x-data-grid';
import Stack from '@mui/material/Stack';
import { use } from 'react';

function AdminCouponDetails() {

    const { couponId } = useParams()
    const token = useSelector(state => state.userReducer.token);
    const [data, setData] = useState()
    const [usages, setUsages] = useState([])
    const [totalUsages, setTotalUsages] = useState(0);
    const [loading, setLoading] = useState(false)

    // const [pageSize, setPageSize] = useState(5);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });

    const columns = [
        { field: "id", headerName: "ID", width: 120 },
        { field: "user_id", headerName: "User ID", width: 120 },
        { field: "order_id", headerName: "Order ID", width: 120 },
        { 
            field: "total", 
            headerName: "Cart Value", 
            width: 140,
            renderCell: (params) => `$${params.value}`
        },
        { 
            field: "discount_amount", 
            headerName: "Discount Amount", 
            width: 140,
            renderCell: (params) => `$${params.value}`
        },
        { 
            field: "final_total", 
            headerName: "Final Total", 
            width: 140,
            renderCell: (params) => `$${params.value}`
        },
        { 
            field: "used_at", 
            headerName: "Used At", 
            flex: 1,
            renderCell: (params) => dayjs(params.value).format("DD MMM YYYY, hh:mm A")
        }
    ];

    const fetchUsages = async (page, limit) => {
        setLoading(true)
        try{
            const response = await fetch(`http://localhost:3000/admin/coupons/usages/${couponId}?page=${page}&limit=${limit}`, {
                headers: {
                    Authorization : `Bearer ${token}`
                }
            })

            if(!response.ok){
                const error = await response.json()
                console.log(error);
            }
            const result = await response.json()
            console.log(result);
            setUsages(result.usages)
            setTotalUsages(result.totalUsages)
            setLoading(false)
        }
        catch(err){
            console.error(err.message)
        }
    }

    const fetchCoupon = async () => {
        try{
            const response = await fetch(`http://localhost:3000/admin/coupons/${couponId}`, {
                headers: {
                    Authorization : `Bearer ${token}`
                }
            })

            const result = await response.json()
            console.log(result);
            setData(result)
        }
        catch(err){
            console.error(err.message)
        }
    }

    const handlePaginationChange = (newModel) => {
        // console.log(newModel);
        
        setPaginationModel(newModel);
        fetchUsages(newModel.page + 1, newModel.pageSize);
    };

    useEffect(() => {
        console.log("I ran");
        
        fetchCoupon()
    },[])
    useEffect(() => {
        fetchUsages(paginationModel.page + 1, paginationModel.pageSize);
    },[paginationModel])

    return (
        <Box sx={{ py: 1.5, px: 4, bgcolor: "#EEEEEE", minHeight: "91vh" }}>
            {
                data ?
                <Box>
                    <Stack spacing={3}>
                        <Card>
                        <CardContent>
                            <Box sx={{display: "flex", justifyContent: "space-between"}}>
                                <Box>
                                    <Typography variant="h5" sx={{ mb: 1 }}>{data.name}</Typography>
                                    <Box sx={{display: "flex"}}>
                                        <Chip label={`Code: ${data.code}`} color="primary" sx={{ mr: 1, fontSize: 16 }} />
                                        <Chip label={data.is_active ? "Active" : "Inactive"} color={data.is_active ? "success" : "error"} sx={{fontSize: 14}}/>
                                    </Box>
                                </Box>
                                {
                                    data.usages.length > 0 ?
                                    <Box sx={{display: "flex", flexDirection: "column", justifyContent: "flex-end"}}>
                                        <Typography color='error' sx={{fontSize: 35}}>

                                            {(data.usages.reduce((accumulator, value) => accumulator + value.discount_amount, 0)).toFixed(2)}

                                            <Typography component={'span'} sx={{fontSize: 24}}>$</Typography>
                                        </Typography>
                                        <Typography sx={{ml: "auto"}}>Total Discounts</Typography>
                                    </Box>
                                    :
                                    null
                                }
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Typography>
                                <Typography component={'span'} sx={{fontWeight: 700}}>Discount: </Typography>
                                {data.discount_type === "percent" ? `${data.discount_value}%` : `$${data.discount_value}`}
                                {data.threshold_amount ? ` (upto $${data.threshold_amount})` : null}
                            </Typography>
                            <Typography>
                                <Typography component={'span'} sx={{fontWeight: 700}}>Applicable on: </Typography>
                                {data.applies_to === "all" ? `Cart` : `Product(s)`}
                            </Typography>
                            <Typography>
                                <Typography component={'span'} sx={{fontWeight: 700}}>Min. Cart Value: </Typography>
                                {data.min_cart_value ?? "No minimum value needed"}
                            </Typography>
                            <Typography>
                                <Typography component={'span'} sx={{fontWeight: 700}}>Limit per user: </Typography>
                                {data.limit_per_user ?? "Unlimited"}
                            </Typography>
                            <Typography>
                                <Typography component={'span'} sx={{fontWeight: 700}}>Total Coupons: </Typography>
                                {data.total_coupons ?? "Unlimited"} 
                                {data.coupons_left ? ` (${data.coupons_left} left)` : null}
                            </Typography>
                            <Typography>
                                <Typography component={'span'} sx={{fontWeight: 700}}>Validity: </Typography> 
                                {dayjs(data.start_time).format("DD MMM YYYY")} - {dayjs(data.end_time).format("DD MMM YYYY")}
                            </Typography>
                        </CardContent>
                        </Card>

                        <Card>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2 }}>Applicable Products</Typography>
                                {data.products.length > 0 ? 
                                    (
                                        <Grid container spacing={2} sx={{maxHeight: 460, overflow: "auto"}}>
                                            {data.products.map((p) => (
                                                <Grid size={{xs:6, sm:4, md:3}} key={p.id}>
                                                    <Card variant="outlined">
                                                        <CardContent>
                                                            <CardMedia
                                                                component="img"
                                                                image={getImageUrl(p.thumbnail)}
                                                                alt="Product Image"
                                                                sx={{ minHeight: 50, objectFit: "contain" }}
                                                            />
                                                        <Typography variant="subtitle1">{p.title}</Typography>
                                                        <Typography variant="body2" color="text.secondary" 
                                                            sx={{display: "flex", justifyContent: "space-between"}}>
                                                            Price: 
                                                            <Typography component={"span"}>
                                                                ${(p.price).toFixed(2)}
                                                            </Typography>
                                                        </Typography>
                                                        <Typography variant="body2" color="error" 
                                                            sx={{pb: 0.3, display: "flex", justifyContent: "space-between"}}>
                                                            Discount: 
                                                            <Typography component={"span"}>
                                                                -${(p.coupon_discount_amount).toFixed(2)}
                                                            </Typography>
                                                        </Typography>
                                                        <Divider variant='fullWidth'></Divider>
                                                        <Typography variant="body2" color="success" 
                                                            sx={{pt: 0.3, display: "flex", justifyContent: "space-between"}}>
                                                            Final Price: 
                                                            <Typography component={"span"}>
                                                                ${(p.final_price).toFixed(2)}
                                                            </Typography>
                                                        </Typography>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    ) 
                                    : 
                                    (
                                        <Typography>No products attached to this coupon.</Typography>
                                    )
                                }
                        </CardContent>
                    </Card>

                    {/* <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>Coupon Usages</Typography>
                        {data.usages.length > 0 ? (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>User ID</TableCell>
                                        <TableCell>Order ID</TableCell>
                                        <TableCell>Total</TableCell>
                                        <TableCell>Discount</TableCell>
                                        <TableCell>Final Total</TableCell>
                                        <TableCell>Used At</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.usages.map((u, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{u.user_id}</TableCell>
                                            <TableCell>{u.order_id}</TableCell>
                                            <TableCell>₹{u.total}</TableCell>
                                            <TableCell>₹{u.discount_amount}</TableCell>
                                            <TableCell>₹{u.final_total}</TableCell>
                                            <TableCell>{dayjs(u.used_at).format("DD MMM YYYY, HH:mm")}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        ) 
                        : 
                        (
                        <Typography>No usage records found.</Typography>
                        )}
                    </CardContent>
                    </Card> */}

                        <Card>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Coupon Usages
                                </Typography>
                                {data.usages.length > 0 ? (
                                    <Box sx={{ maxHeight: 400, width: "100%" }}>
                                        {/* <DataGrid
                                            rows={data.usages.map((usage, index) => ({
                                                id: index + 1,
                                                ...usage
                                            }))}
                                            columns={columns}
                                            pageSize={pageSize}
                                            onPageSizeChange={(newSize) => setPageSize(newSize)}
                                            rowsPerPageOptions={[5, 10, 20]}
                                            pagination
                                            disableRowSelectionOnClick
                                        /> */}
                                        <DataGrid
                                            sx={{ maxHeight: 400, maxWidth: "100%", mr: 1.5}}
                                            rows={usages}
                                            // rows={
                                            //     usages.map((usage, index) => ({
                                            //         id: index + 1,
                                            //         ...usage
                                            //     }))}
                                            columns={columns}
                                            rowCount={totalUsages}
                                            // onRowClick={handleRowClick}
                                            pagination
                                            paginationMode="server"
                                            paginationModel={paginationModel}
                                            onPaginationModelChange={handlePaginationChange}
                                            loading={loading}
                                            rowHeight={58}
                                            pageSizeOptions={[5, 8, 10, 20]}
                                            // checkboxSelection
                                            disableRowSelectionOnClick
                                        />
                                    </Box>
                                    ) 
                                    : 
                                    (
                                    <Typography>No usage records found.</Typography>
                                    )
                                }
                            </CardContent>
                        </Card>
                    </Stack>
                </Box>
                :
                <Box>
                    <Typography>Could not fetch coupon data</Typography>
                </Box>
            }
        </Box>
    )
}

export default AdminCouponDetails
