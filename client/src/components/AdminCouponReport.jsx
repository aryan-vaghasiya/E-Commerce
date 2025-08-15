import Box from '@mui/material/Box'
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import dayjs from 'dayjs';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DataGrid } from '@mui/x-data-grid';

function AdminCouponReport({couponData}) {

    const { couponId } = useParams()
    const token = useSelector(state => state.userReducer.token)
    const { register, handleSubmit, control, reset, watch, resetField, setValue } = useForm()
    const [report, setReport] = useState(null)
    const [products, setProducts] = useState(null)
    const [categories, setCategories] = useState(null)
    const [users, setUsers] = useState(null)
    const [dates, setDates] = useState(null)

    const timeRange = watch("timeRange")

    const handleReportFilter = async (formData) => {
        console.log(formData);
        let fromTime;
        let toTime;
        if(formData.timeRange === "custom" && !formData.start_time && !formData.end_time){
            console.error("Select a custom date");
            return
        }
        if(formData.timeRange !== "custom" && !formData.start_time && !formData.end_time){
            const todayStart = dayjs().startOf("day")
            fromTime = dayjs(todayStart).subtract(formData.timeRange, "day").format("YYYY-MM-DD HH:mm:ss")
            toTime = dayjs().format("YYYY-MM-DD HH:mm:ss")
        }
        if(formData.timeRange === "custom" && formData.start_time){
            fromTime = dayjs(formData.start_time).format("YYYY-MM-DD HH:mm:ss")
            toTime = formData.end_time ? dayjs(formData.end_time).format("YYYY-MM-DD HH:mm:ss") : dayjs().format("YYYY-MM-DD HH:mm:ss")
        }
        console.log(fromTime, toTime);
        
        fetchCouponReportSummary(couponId, fromTime, toTime)
        fetchCouponReportProducts(couponId, fromTime, toTime)
        fetchCouponReportUsers(couponId, fromTime, toTime)
        fetchCouponReportDates(couponId, fromTime, toTime)
    }

    // const fetchCouponReport = async (coupon_id, days = 0) => {
    const fetchCouponReportSummary = async (coupon_id, from = dayjs().startOf("day").format("YYYY-MM-DD HH:mm:ss"), to = dayjs().format("YYYY-MM-DD HH:mm:ss")) => {
        try{
            const response = await fetch(`http://localhost:3000/admin/coupons/${couponId}/report/summary?from=${from}&to=${to}`, {
                headers: {
                    Authorization : `Bearer ${token}`
                }
            })

            if(!response.ok){
                const error = await response.json()
                return console.log(error)
            }
            const result = await response.json()
            setReport(result)
            console.log(result)
        }
        catch(err){
            console.error(err.message)
        }
    }

    const fetchCouponReportProducts = async (coupon_id, from = dayjs().startOf("day").format("YYYY-MM-DD HH:mm:ss"), to = dayjs().format("YYYY-MM-DD HH:mm:ss")) => {
        try{
            const response = await fetch(`http://localhost:3000/admin/coupons/${couponId}/report/products?from=${from}&to=${to}`, {
                headers: {
                    Authorization : `Bearer ${token}`
                }
            })

            if(!response.ok){
                const error = await response.json()
                return console.log(error)
            }
            const result = await response.json()
            setProducts(result.products)
            setCategories(result.categories)
            console.log(result)
        }
        catch(err){
            console.error(err.message)
        }
    }

    const fetchCouponReportUsers = async (coupon_id, from = dayjs().startOf("day").format("YYYY-MM-DD HH:mm:ss"), to = dayjs().format("YYYY-MM-DD HH:mm:ss")) => {
        try{
            const response = await fetch(`http://localhost:3000/admin/coupons/${couponId}/report/users?from=${from}&to=${to}`, {
                headers: {
                    Authorization : `Bearer ${token}`
                }
            })

            if(!response.ok){
                const error = await response.json()
                return console.log(error)
            }
            const result = await response.json()
            setUsers(result)
            console.log(result)
        }
        catch(err){
            console.error(err.message)
        }
    }

    const fetchCouponReportDates = async (coupon_id, from = dayjs().startOf("day").format("YYYY-MM-DD HH:mm:ss"), to = dayjs().format("YYYY-MM-DD HH:mm:ss")) => {
        try{
            const response = await fetch(`http://localhost:3000/admin/coupons/${couponId}/report/dates?from=${from}&to=${to}`, {
                headers: {
                    Authorization : `Bearer ${token}`
                }
            })

            if(!response.ok){
                const error = await response.json()
                return console.log(error)
            }
            const result = await response.json()
            setDates(result)
            console.log(result)
        }
        catch(err){
            console.error(err.message)
        }
    }

    useEffect(() => {
        fetchCouponReportSummary(couponId)
        fetchCouponReportProducts(couponId)
        fetchCouponReportUsers(couponId)
        fetchCouponReportDates(couponId)
    }, [])

    const productColumns = [
        { field: "id", headerName: "Product ID", width: 120, align: "center", },
        { 
            field: "title", 
            headerName: "Name", 
            width: 240,
            align: "left",
        },
        { 
            field: "total_quantity", 
            headerName: "Units Sold", 
            width: 120,
            align: "center",
        },
        { 
            field: "total_product_discount", 
            headerName: "Discounts Given", 
            width: 140,
            renderCell: (params) => (
                <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
                    <Typography color='error'>${(params.value).toFixed(2)}</Typography>
                </Box>
            )
        },
        { 
            field: "total_purchase_price", 
            headerName: "Total Sales", 
            width: 140,
            renderCell: (params) => (
                <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
                    <Typography color='success'>${(params.value).toFixed(2)}</Typography>
                </Box>
            )
        }
    ]

    const categoryColumns = [
        { field: "id", headerName: "Category ID", width: 120, align: "center", },
        { 
            field: "category", 
            headerName: "Category", 
            width: 240,
            align: "left",
        },
        { 
            field: "total_quantity", 
            headerName: "Units Sold", 
            width: 120,
            align: "center",
        },
        { 
            field: "total_product_discount", 
            headerName: "Discounts Given", 
            width: 140,
            renderCell: (params) => (
                <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
                    <Typography color='error'>${(params.value).toFixed(2)}</Typography>
                </Box>
            )
        },
        { 
            field: "total_purchase_price", 
            headerName: "Total Sales", 
            width: 140,
            renderCell: (params) => (
                <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
                    <Typography color='success'>${(params.value).toFixed(2)}</Typography>
                </Box>
            )
        }
    ]

    const userColumns = [
        { field: "user_id", headerName: "User ID", width: 120, align: "center", },
        { 
            field: "total_redemptions", 
            headerName: "Times Used", 
            width: 120,
            align: "center",
        },
        { 
            field: "total_discount", 
            headerName: "Total Discount", 
            width: 140,
            renderCell: (params) => (
                <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
                    <Typography color='error'>${(params.value).toFixed(2)}</Typography>
                </Box>
            )
        },
        { 
            field: "total_sales", 
            headerName: "Total Sales", 
            width: 140,
            renderCell: (params) => (
                <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
                    <Typography color='success'>${(params.value).toFixed(2)}</Typography>
                </Box>
            )
        }
    ]

    const dateColumns = [
        { 
            field: "date", 
            headerName: "Date", 
            width: 240,
            renderCell: (params) => (
                <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
                    <Typography>{dayjs(params.value).format("DD MMM YYYY")}</Typography>
                </Box>
            )
        },
        { 
            field: "total_redemptions", 
            headerName: "Times Used", 
            width: 120,
            align: "center",
        },
    ]

    return (
        <Box>
            <Box component="form" onSubmit={handleSubmit(handleReportFilter)} sx={{display: "flex", py: 2, justifyContent: "space-between", alignItems: "center"}}>
                <Box sx={{display: "flex", gap: 1, flexGrow: 1}}>
                <FormControl fullWidth sx={{minWidth: 100, maxWidth: 200}}>
                    <InputLabel id="select-label">Choose an option</InputLabel>
                    <Controller
                        name="timeRange"
                        control={control}
                        defaultValue={0}
                        render={({ field }) => (
                            <Select
                                labelId="select-label"
                                label="Choose an option"
                                {...field}
                                onChange={(newRange) => {
                                    setValue("start_time", null)
                                    setValue("end_time", null)
                                    field.onChange(newRange)
                                }}
                            >
                                <MenuItem value={0}>Today</MenuItem>
                                <MenuItem value={7}>Last 7 Days</MenuItem>
                                <MenuItem value={30}>Last 30 Days</MenuItem>
                                <MenuItem value="custom">Custom</MenuItem>
                                {/* <MenuItem value={999}>Option 3</MenuItem> */}
                            </Select>
                        )}
                    />
                </FormControl>
                {/* <Typography>OR</Typography> */}
                {
                    timeRange === "custom" ?
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Controller
                            control={control}
                            name="start_time"
                            rules={{ required: "Start Time is required" }}
                            render={({ field, fieldState }) => (
                                <DateTimePicker
                                    sx={{maxWidth: 500, minWidth: 250}}
                                    label="From"
                                    disableFuture
                                    value={field.value || null}
                                    inputRef={field.ref}
                                    onChange={(date) => {
                                        // setValue("timeRange", "")
                                        field.onChange(date);
                                    }}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="end_time"
                            rules={{ required: "End Time is required" }}
                            render={({ field, fieldState }) => (
                                <DateTimePicker
                                    sx={{maxWidth: 500, minWidth: 250}}
                                    label="To"
                                    disableFuture
                                    value={field.value || null}
                                    // defaultValue={dayjs()}
                                    inputRef={field.ref}
                                    onChange={(date) => {
                                        // setValue("timeRange", "")
                                        field.onChange(date);
                                    }}
                                />
                            )} 
                        />
                    </LocalizationProvider>
                    :
                    null
                }
                </Box>
                
                <Box>
                <Button type='submit' variant='contained'>Generate</Button>
                </Box>
            </Box>
            <Box>
                {/* <Card sx={{p: 2}}> */}
                <Card sx={{}}>
                    <Box sx={{p: 2, pt: 0}}>
                        <Box sx={{py: 2, display: "flex", flexDirection: "column", gap: 1}}>
                            <Divider flexItem></Divider>
                            <Typography sx={{fontSize: 20, fontWeight: 500}}>Coupon Details</Typography>
                            <Divider flexItem></Divider>
                        </Box>
                        <Typography>
                            <Typography component={'span'} sx={{fontWeight: 700}}>Name: </Typography>
                            {couponData.name}
                        </Typography>
                        <Typography>
                            <Typography component={'span'} sx={{fontWeight: 700}}>Code: </Typography>
                            {couponData.code}
                        </Typography>

                        <Typography>
                            <Typography component={'span'} sx={{fontWeight: 700}}>Discount: </Typography>
                            {couponData.discount_type === "percent" ? `${couponData.discount_value}%` : `$${(couponData.discount_value).toFixed(2)}`}
                            {couponData.threshold_amount ? ` (upto $${couponData.threshold_amount})` : null}
                        </Typography>
                        <Typography>
                            <Typography component={'span'} sx={{fontWeight: 700}}>Applicable on: </Typography>
                            {couponData.applies_to === "all" ? `Cart` : couponData.applies_to === "product" ? `Product(s)` : `Categories`}
                        </Typography>
                        <Typography>
                            <Typography component={'span'} sx={{fontWeight: 700}}>Min. Cart Value: </Typography>
                            {couponData.min_cart_value ? `$${(couponData.min_cart_value).toFixed(2)}` : "No minimum value needed"}
                        </Typography>
                        <Typography>
                            <Typography component={'span'} sx={{fontWeight: 700}}>Limit per user: </Typography>
                            {couponData.limit_per_user ?? "Unlimited"}
                        </Typography>
                        <Typography>
                            <Typography component={'span'} sx={{fontWeight: 700}}>Total Coupons: </Typography>
                            {couponData.total_coupons ?? "Unlimited"} 
                            {couponData.coupons_left ? ` (${couponData.coupons_left} left)` : null}
                        </Typography>
                        <Typography>
                            <Typography component={'span'} sx={{fontWeight: 700}}>Validity: </Typography> 
                            {dayjs(couponData.start_time).format("DD MMM YYYY")} - {dayjs(couponData.end_time).format("DD MMM YYYY")}
                        </Typography>
                    </Box>
                    {
                        report && report.totalUsage > 0?
                        <Box>
                        <Box sx={{p: 2, pt: 0}}>
                            <Box sx={{py: 2, display: "flex", flexDirection: "column", gap: 1}}>
                                <Divider flexItem></Divider>
                                {
                                report.days !== 0 ?
                                    <Typography sx={{fontSize: 20, fontWeight: 500}}>Sales Summary 
                                        <Typography component={"span"}> ({dayjs(report.fromTime).format("DD MMM YYYY, hh:mm A")} - {dayjs(report.toTime).format("DD MMM YYYY, hh:mm A")} )</Typography>
                                    </Typography>
                                :
                                <Typography sx={{fontSize: 20, fontWeight: 500}}>Sales Summary 
                                    <Typography component={"span"}> (Today)</Typography>
                                </Typography>
                                }
                                <Divider flexItem></Divider>
                            </Box>

                            <Typography>
                                <Typography component={'span'} sx={{fontWeight: 700}}>Total Redemptions: </Typography>
                                {report.totalUsage}
                            </Typography>
                            <Typography>
                                <Typography component={'span'} sx={{fontWeight: 700}}>Unique Users: </Typography>
                                {report.totalUniqueUsers}
                            </Typography>
                            <Typography>
                                <Typography component={'span'} sx={{fontWeight: 700}}>Discounts Given: </Typography>
                                {`${(report.totalLoss).toFixed(2)} $`}
                            </Typography>

                            {
                                couponData.applies_to !== "all" ?
                                <Box>
                                    <Typography>
                                        <Typography component={'span'} sx={{fontWeight: 700}}>Total Revenue (Discount-Applicable): </Typography>
                                        {`${(report.totalSales).toFixed(2)} $`}
                                    </Typography>
                                    <Typography>
                                        <Typography component={'span'} sx={{fontWeight: 700}}>Average Order Value (Discount-Applicable): </Typography>
                                        {`${(report.targetedAOV).toFixed(2)} $`}
                                    </Typography>
                                    <Typography>
                                        <Typography component={'span'} sx={{fontWeight: 700}}>Total Revenue (Gross): </Typography>
                                        {`${(report.totalGrossSales).toFixed(2)} $`}
                                    </Typography>
                                    <Typography>
                                        <Typography component={'span'} sx={{fontWeight: 700}}>Average Order Value (Gross): </Typography>
                                        {`${(report.grossAOV).toFixed(2)} $`}
                                    </Typography>
                                </Box>
                                :
                                <Box>
                                    <Typography>
                                        <Typography component={'span'} sx={{fontWeight: 700}}>Total Revenue: </Typography>
                                        {`${(report.totalGrossSales).toFixed(2)} $`}
                                    </Typography>
                                    <Typography>
                                        <Typography component={'span'} sx={{fontWeight: 700}}>Average Order Value: </Typography>
                                        {`${(report.grossAOV).toFixed(2)} $`}
                                    </Typography>
                                </Box>
                            }

                        </Box>
                        {
                            couponData.applies_to !== "all" ?
                            <Box>
                                <Box sx={{p: 2, pt: 0}}>
                                    <Box sx={{py: 2, display: "flex", flexDirection: "column", gap: 1}}>
                                        <Divider flexItem></Divider>
                                        <Typography sx={{fontSize: 20, fontWeight: 500}}>Product-wise Usage</Typography>
                                        <Divider flexItem></Divider>
                                    </Box>
                                    {/* <Box sx={{maxWidth: 1000, mx: "auto", maxHeight: 375, overflow: "auto"}}> */}
                                    <Box sx={{maxWidth: 1000, mx: "auto", overflow: "auto"}}>
                                        <DataGrid
                                            sx={{ maxHeight: 500, maxWidth: "100%", mr: 1.5}}
                                            rows={products.products}
                                            // rows={
                                            //     usages.map((usage, index) => ({
                                            //         id: index + 1,
                                            //         ...usage
                                            //     }))}
                                            columns={productColumns}
                                            // rowCount={products.products.length}
                                            // onRowClick={handleRowClick}
                                            // pagination
                                            // paginationMode="server"
                                            // paginationModel={productsPaginationModel}
                                            // onPaginationModelChange={handleProductPaginationChange}
                                            // loading={loadingProducts}
                                            rowHeight={38}
                                            // pageSizeOptions={[5, 8, 10, 20, 100]}
                                            disableRowSelectionOnClick
                                            slots={{
                                                footer: () => (
                                                    <Box sx={{ fontWeight: 'bold', p: 1, textAlign: 'center', borderTop: 1  }}>
                                                        Total: {products.totalProductsSold} Quantity | 
                                                        ${products.totalProductsDiscounts.toFixed(2)} Discount | 
                                                        ${products.totalProductsSales.toFixed(2)} Sales
                                                    </Box>
                                                )
                                            }}
                                        />
                                        {/* <Table sx={{maxHeight: 50}}>
                                            <TableHead>
                                            <TableRow>
                                                <TableCell align="center" sx={{maxWidth: 70 }}>Product ID</TableCell>
                                                <TableCell align="left">Name</TableCell>
                                                <TableCell align="center">Units Sold</TableCell>
                                                <TableCell align="center">Discounts Given</TableCell>
                                                <TableCell align="center">Total Sales</TableCell>
                                            </TableRow>
                                            </TableHead>
                                            <TableBody>
                                            {products.products.map((row) => (
                                                <TableRow
                                                    key={row.id}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                >
                                                <TableCell align='center'>{row.id}</TableCell>
                                                <TableCell align="left">{row.title}</TableCell>
                                                <TableCell align="center">{row.total_quantity}</TableCell>
                                                <TableCell align="center">${(row.total_product_discount).toFixed(2)}</TableCell>
                                                <TableCell align="center">${(row.total_purchase_price).toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))}
                                                <TableRow>
                                                    <TableCell align='center' sx={{fontWeight: 700}}>Total</TableCell>
                                                    <TableCell align="left" sx={{fontWeight: 700}}></TableCell>
                                                    <TableCell align="center" sx={{fontWeight: 700}}>{products.totalProductsSold}</TableCell>
                                                    <TableCell align="center" sx={{fontWeight: 700}}>${(products.totalProductsDiscounts).toFixed(2)}</TableCell>
                                                    <TableCell align="center" sx={{fontWeight: 700}}>${(products.totalProductsSales).toFixed(2)}</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table> */}
                                    </Box>
                                </Box>
                                <Box sx={{p: 2, pt: 0}}>
                                    <Box sx={{py: 2, display: "flex", flexDirection: "column", gap: 1}}>
                                        <Divider flexItem></Divider>
                                        <Typography sx={{fontSize: 20, fontWeight: 500}}>Category-wise Usage</Typography>
                                        <Divider flexItem></Divider>
                                    </Box>
                                    <Box sx={{maxWidth: 1000, mx: "auto", maxHeight: 375, overflow: "auto"}}>
                                        <DataGrid
                                            sx={{ maxHeight: 500, maxWidth: "100%", mr: 1.5}}
                                            rows={categories.categories}
                                            columns={categoryColumns}
                                            rowHeight={38}
                                            disableRowSelectionOnClick
                                            slots={{
                                                footer: () => (
                                                    <Box sx={{ fontWeight: 'bold', p: 1, textAlign: 'center', borderTop: 1 }}>
                                                        Total: {categories.totalCategoryProductsSold} Quantity | 
                                                        ${categories.totalCategoryProductsDiscounts.toFixed(2)} Discount | 
                                                        ${categories.totalCategoryProductsSales.toFixed(2)} Sales
                                                    </Box>
                                                )
                                            }}
                                        />
                                        {/* <Table sx={{maxHeight: 50}}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="center" sx={{maxWidth: 70 }}>Category ID</TableCell>
                                                    <TableCell align="left">Category</TableCell>
                                                    <TableCell align="center">Products Quantity</TableCell>
                                                    <TableCell align="center">Total Discount</TableCell>
                                                    <TableCell align="center">Total Sales</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {categories.categories.map((row) => (
                                                    <TableRow
                                                        key={row.id}
                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                    >
                                                    <TableCell align='center'>{row.id}</TableCell>
                                                    <TableCell align="left">{row.category}</TableCell>
                                                    <TableCell align="center">{row.total_quantity}</TableCell>
                                                    <TableCell align="center">${(row.total_product_discount).toFixed(2)}</TableCell>
                                                    <TableCell align="center">${(row.total_purchase_price).toFixed(2)}</TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow>
                                                    <TableCell align='center' sx={{fontWeight: 700}}>Total</TableCell>
                                                    <TableCell align="left" sx={{fontWeight: 700}}></TableCell>
                                                    <TableCell align="center" sx={{fontWeight: 700}}>{categories.totalCategoryProductsSold}</TableCell>
                                                    <TableCell align="center" sx={{fontWeight: 700}}>${(categories.totalCategoryProductsDiscounts).toFixed(2)}</TableCell>
                                                    <TableCell align="center" sx={{fontWeight: 700}}>${(categories.totalCategoryProductsSales).toFixed(2)}</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table> */}
                                    </Box>
                                </Box>
                            </Box>
                            :
                            null
                        }
                        <Box sx={{p: 2, pt: 0}}>
                            <Box sx={{py: 2, display: "flex", flexDirection: "column", gap: 1}}>
                                <Divider flexItem></Divider>
                                <Typography sx={{fontSize: 20, fontWeight: 500}}>User-wise Usage</Typography>
                                <Divider flexItem></Divider>
                            </Box>
                            <Box sx={{maxWidth: 1000, mx: "auto", maxHeight: 375, overflow: "auto"}}>
                                <DataGrid
                                    sx={{ maxHeight: 500, maxWidth: "100%", mr: 1.5}}
                                    rows={users.users}
                                    columns={userColumns}
                                    rowHeight={38}
                                    disableRowSelectionOnClick
                                    getRowId={(row) => row.user_id}
                                    slots={{
                                        footer: () => (
                                            <Box sx={{ fontWeight: 'bold', p: 1, textAlign: 'center' }}>
                                                Total: {users.totalUserRedemptions} Redeems | 
                                                ${users.totalUserDiscount.toFixed(2)} Discount | 
                                                ${users.totalUserSales.toFixed(2)} Sales
                                            </Box>
                                        )
                                    }}
                                />
                                {/* <Table sx={{maxHeight: 50}}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center" sx={{maxWidth: 70 }}>User ID</TableCell>
                                            <TableCell align="center">Timed Used</TableCell>
                                            <TableCell align="center">Total Discount</TableCell>
                                            <TableCell align="center">Total Sales</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {users.users.map((row) => (
                                            <TableRow
                                                key={row.user_id}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                            <TableCell align='center'>{row.user_id}</TableCell>
                                            <TableCell align="center">{row.total_redemptions}</TableCell>
                                            <TableCell align="center">${(row.total_discount).toFixed(2)}</TableCell>
                                            <TableCell align="center">${(row.total_sales).toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow>
                                            <TableCell align='center' sx={{fontWeight: 700}}>Total</TableCell>
                                            <TableCell align="center" sx={{fontWeight: 700}}>{users.totalUserRedemptions}</TableCell>
                                            <TableCell align="center" sx={{fontWeight: 700}}>${(users.totalUserDiscount).toFixed(2)}</TableCell>
                                            <TableCell align="center" sx={{fontWeight: 700}}>${(users.totalUserSales).toFixed(2)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table> */}
                            </Box>
                        </Box>
                        <Box sx={{p: 2, pt: 0}}>
                            <Box sx={{py: 2, display: "flex", flexDirection: "column", gap: 1}}>
                                <Divider flexItem></Divider>
                                <Typography sx={{fontSize: 20, fontWeight: 500}}>Date-wise Usage</Typography>
                                <Divider flexItem></Divider>
                            </Box>
                            {/* <Box sx={{maxWidth: 700, mx: "auto", maxHeight: 375, overflow: "auto"}}> */}
                            <Box sx={{maxWidth: 1000, mx: "auto", maxHeight: 375, overflow: "auto"}}>
                                <DataGrid
                                    sx={{ maxHeight: 500, maxWidth: "100%", mr: 1.5}}
                                    rows={dates.dates}
                                    columns={dateColumns}
                                    rowHeight={38}
                                    disableRowSelectionOnClick
                                    // getRowId={(row) => row.internalId}
                                    slots={{
                                        footer: () => (
                                            <Box sx={{ fontWeight: 'bold', p: 1, textAlign: 'center' }}>
                                                Total: {dates.totalDateRedemptions} Redeems
                                            </Box>
                                        )
                                    }}
                                />
                                {/* <Table sx={{maxHeight: 50}}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center" sx={{maxWidth: 70 }}>Date</TableCell>
                                            <TableCell align="center">Timed Used</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {dates.dates.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell align="center">{dayjs(row.date).format("DD MMM YYYY")}</TableCell>
                                                <TableCell align="center">{row.total_redemptions}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow>
                                            <TableCell align='center' sx={{fontWeight: 700}}>Total</TableCell>
                                            <TableCell align="center" sx={{fontWeight: 700}}>{dates.totalDateRedemptions}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table> */}
                            </Box>
                        </Box>
                        </Box>
                        :
                        <Box sx={{p: 2}}>
                            <Typography>This coupon haven't been used in this time range</Typography>
                        </Box>
                    }
                </Card>
            </Box>
        </Box>
    )
}

export default AdminCouponReport
