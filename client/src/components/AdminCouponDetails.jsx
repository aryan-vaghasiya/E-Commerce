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

    const [data, setData] = useState(null)
    const [totalLoss, setTotalLoss] = useState(0);
    const [totalSales, setTotalSales] = useState(0);

    const [usages, setUsages] = useState([])
    const [totalUsages, setTotalUsages] = useState(0);
    const [loadingUsages, setLoadingUsages] = useState(false)

    const [products, setProducts] = useState([])
    const [totalProducts, setTotalProducts] = useState(0);
    const [loadingProducts, setLoadingProducts] = useState(false)

    const [usagesPaginationModel, setUsagesPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });
    const [productsPaginationModel, setProductsPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });


    const usageColumns = [
        { field: "id", headerName: "ID", width: 120 },
        { field: "user_id", headerName: "User ID", width: 120 },
        { field: "order_id", headerName: "Order ID", width: 120 },
        { 
            field: "total", 
            headerName: "Cart Value", 
            width: 140,
            renderCell: (params) => (
                <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
                    <Typography>${(params.value).toFixed(2)}</Typography>
                </Box>
            )
        },
        { 
            field: "discount_amount", 
            headerName: "Discount Amount", 
            width: 140,
            align: "center",
            renderCell: (params) => (
                <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
                    <Typography color='error'>${(params.value).toFixed(2)}</Typography>
                </Box>
            )
        },
        { 
            field: "final_total", 
            headerName: "Final Total", 
            width: 140,
            renderCell: (params) => (
                <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
                    <Typography color='success'>${(params.value).toFixed(2)}</Typography>
                </Box>
            )
        },
        { 
            field: "used_at", 
            headerName: "Used At", 
            flex: 1,
            renderCell: (params) => dayjs(params.value).format("DD MMM YYYY, hh:mm A")
        }
    ];

    const productColumns = [
        {
            field: 'id', headerName: 'Product ID', width: 90, align : "center"
        },
        {
            field: 'title',
            headerName: 'Title',
            width: 350,
            editable: false,
            renderCell: (params) => (
                <Box sx={{display: "flex", alignItems: "center", pt: 0.7}}>
                    <img
                    src={getImageUrl(params.row.thumbnail)}
                    alt="product"
                    style={{
                        height: '50px',
                        width: 'auto',
                        objectFit: 'contain',
                        borderRadius: '4px'
                    }}
                    />
                    <Typography sx={{pl: 1}}>{params.value}</Typography>
                </Box>
            ),
        },
        {
            field: 'price',
            headerName: 'Selling Price',
            width: 110,
            editable: false,
            renderCell: (params) => (
                <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
                    <Typography>${(params.value).toFixed(2)}</Typography>
                </Box>
            )
        },
        {
            field: 'coupon_discount_amount',
            headerName: 'Coupon Discount',
            width: 130,
            editable: false,
            renderCell: (params) => (
                <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
                    <Typography color='error'>${(params.value).toFixed(2)}</Typography>
                </Box>
            )
        },
        {
            field: 'final_price',
            headerName: 'Final Price',
            width: 110,
            editable: false,
            renderCell: (params) => (
                <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
                    <Typography color='success'>${(params.value).toFixed(2)}</Typography>
                </Box>
            )
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 110,
            editable: false,
            align: "center"
        }
    ];

    const fetchCouponUsages = async (page, limit) => {
        setLoadingUsages(true)
        try{
            const response = await fetch(`http://localhost:3000/admin/coupons/usages/${couponId}?page=${page}&limit=${limit}`, {
                headers: {
                    Authorization : `Bearer ${token}`
                }
            })

            if(!response.ok){
                const error = await response.json()
                setLoadingProducts(false)
                return console.log(error)
            }
            const result = await response.json()
            // console.log(result);
            setUsages(result.usages)
            setTotalUsages(result.totalUsages)
            setLoadingUsages(false)
        }
        catch(err){
            console.error(err.message)
        }
    }

    const fetchCouponProducts = async (page, limit) => {
        setLoadingProducts(true)
        try{
            const response = await fetch(`http://localhost:3000/admin/coupons/products/${couponId}?page=${page}&limit=${limit}`, {
                headers: {
                    Authorization : `Bearer ${token}`
                }
            })

            if(!response.ok){
                const error = await response.json()
                setLoadingProducts(false)
                return console.log(error)
            }

            const result = await response.json()
            // console.log(result);
            setProducts(result.products)
            setTotalProducts(result.totalProducts)
            setLoadingProducts(false)
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

            if(!response.ok){
                const error = await response.json()
                return console.log(error);
            }

            const result = await response.json()
            // console.log(result);
            setData(result)
            setTotalLoss(result.totalLoss)
            setTotalSales(result.totalSales)
        }
        catch(err){
            console.error(err.message)
        }
    }

    const handleUsagePaginationChange = (newModel) => {
        // console.log(newModel);
        setUsagesPaginationModel(newModel);
        fetchCouponUsages(newModel.page + 1, newModel.pageSize);
    }
    const handleProductPaginationChange = (newModel) => {
        // console.log(newModel);
        setProductsPaginationModel(newModel);
        fetchCouponProducts(newModel.page + 1, newModel.pageSize);
    }

    useEffect(() => {
        fetchCoupon()
    },[])

    useEffect(() => {
        fetchCouponUsages(usagesPaginationModel.page + 1, usagesPaginationModel.pageSize);
    },[usagesPaginationModel])

    useEffect(() => {
        fetchCouponProducts(productsPaginationModel.page + 1, productsPaginationModel.pageSize);
    },[productsPaginationModel])

    return (
        <Box sx={{ py: 1.5, px: 4, bgcolor: "#EEEEEE", minHeight: "91vh" }}>
            {
                data && usages && products ?
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
                                    totalLoss > 0 && totalSales > 0?
                                    <Box sx={{display: "flex", gap: 2}}>
                                        <Box sx={{display: "flex", flexDirection: "column", justifyContent: "flex-end"}}>
                                            <Typography color='error' sx={{fontSize: 35}}>
                                                {(totalLoss).toFixed(2)}
                                                <Typography component={'span'} sx={{fontSize: 24}}>$</Typography>
                                            </Typography>
                                            <Typography sx={{ml: "auto"}}>Total Discounts</Typography>
                                        </Box>
                                        <Divider variant='middle' orientation='vertical' flexItem/>
                                        <Box sx={{display: "flex", flexDirection: "column", justifyContent: "flex-end"}}>
                                            <Typography color='success' sx={{fontSize: 35}}>
                                                {(totalSales).toFixed(2)}
                                                <Typography component={'span'} sx={{fontSize: 24}}>$</Typography>
                                            </Typography>
                                            <Typography sx={{ml: "auto"}}>Total Sales</Typography>
                                        </Box>
                                    </Box>
                                    :
                                    null
                                }
                                {/* {
                                    totalSales > 0 ?
                                    
                                    :
                                    null
                                } */}
                                
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Typography>
                                <Typography component={'span'} sx={{fontWeight: 700}}>Discount: </Typography>
                                {data.discount_type === "percent" ? `${data.discount_value}%` : `$${(data.discount_value).toFixed(2)}`}
                                {data.threshold_amount ? ` (upto $${data.threshold_amount})` : null}
                            </Typography>
                            <Typography>
                                <Typography component={'span'} sx={{fontWeight: 700}}>Applicable on: </Typography>
                                {data.applies_to === "all" ? `Cart` : `Product(s)`}
                            </Typography>
                            <Typography>
                                <Typography component={'span'} sx={{fontWeight: 700}}>Min. Cart Value: </Typography>
                                {data.min_cart_value ? `$${(data.min_cart_value).toFixed(2)}` : "No minimum value needed"}
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
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Applicable Products
                                </Typography>
                                {products.length > 0 ? (
                                    <Box sx={{ maxHeight: 400, width: "100%" }}>
                                        <DataGrid
                                            sx={{ maxHeight: 400, maxWidth: "100%", mr: 1.5}}
                                            rows={products}
                                            // rows={
                                            //     usages.map((usage, index) => ({
                                            //         id: index + 1,
                                            //         ...usage
                                            //     }))}
                                            columns={productColumns}
                                            rowCount={totalProducts}
                                            // onRowClick={handleRowClick}
                                            pagination
                                            paginationMode="server"
                                            paginationModel={productsPaginationModel}
                                            onPaginationModelChange={handleProductPaginationChange}
                                            loading={loadingProducts}
                                            rowHeight={58}
                                            pageSizeOptions={[5, 8, 10, 20]}
                                            disableRowSelectionOnClick
                                        />
                                    </Box>
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
                    </Card> */}

                        <Card>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Coupon Usages
                                </Typography>
                                {usages.length > 0 ? (
                                    <Box sx={{ maxHeight: 400, width: "100%" }}>
                                        <DataGrid
                                            sx={{ maxHeight: 400, maxWidth: "100%", mr: 1.5}}
                                            rows={usages}
                                            columns={usageColumns}
                                            rowCount={totalUsages}
                                            // onRowClick={handleRowClick}
                                            pagination
                                            paginationMode="server"
                                            paginationModel={usagesPaginationModel}
                                            onPaginationModelChange={handleUsagePaginationChange}
                                            loading={loadingUsages}
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
