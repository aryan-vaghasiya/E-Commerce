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

function AdminCouponReport({couponData}) {

    const { couponId } = useParams()
    const token = useSelector(state => state.userReducer.token)
    const { register, handleSubmit, control, reset, watch, resetField, setValue } = useForm()
    const [report, setReport] = useState(null)

    const handleReportFilter = async (formData) => {
        console.log(formData);
        let fromTime;
        let toTime;
        if(formData.timeRange === "" && !formData.start_time && !formData.end_time){
            console.error("Select at least 1 option");
            return
        }
        if(formData.timeRange !== "" && !formData.start_time && !formData.end_time){
            const todayStart = dayjs().startOf("day")
            fromTime = dayjs(todayStart).subtract(formData.timeRange, "day").format("YYYY-MM-DD HH:mm:ss")
            toTime = dayjs().format("YYYY-MM-DD HH:mm:ss")
        }
        if(formData.timeRange === "" && formData.start_time){
            fromTime = dayjs(formData.start_time).format("YYYY-MM-DD HH:mm:ss")
            toTime = formData.end_time ? dayjs(formData.end_time).format("YYYY-MM-DD HH:mm:ss") : dayjs().format("YYYY-MM-DD HH:mm:ss")
        }
        console.log(fromTime, toTime);
        
        fetchCouponReport(couponId, fromTime, toTime)
    }

    // const fetchCouponReport = async (coupon_id, days = 0) => {
    const fetchCouponReport = async (coupon_id, from = dayjs().startOf("day").format("YYYY-MM-DD HH:mm:ss"), to = dayjs().format("YYYY-MM-DD HH:mm:ss")) => {
        try{
            const response = await fetch(`http://localhost:3000/admin/coupons/${couponId}/report?from=${from}&to=${to}`, {
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

    useEffect(() => {
        fetchCouponReport(couponId)
    }, [])

    return (
        <Box>
            <Box component="form" onSubmit={handleSubmit(handleReportFilter)} sx={{display: "flex", py: 2, alignItems: "center", gap: 2}}>
                <FormControl fullWidth sx={{width: "20%"}}>
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
                                <MenuItem value="">No Option</MenuItem>
                                {/* <MenuItem value={999}>Option 3</MenuItem> */}
                            </Select>
                        )}
                    />
                </FormControl>
                <Typography>OR</Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Controller
                        control={control}
                        name="start_time"
                        // rules={{ required: "Start Time is required" }}
                        render={({ field, fieldState }) => (
                            <DateTimePicker
                                sx={{maxWidth: 500, pr: 1}}
                                label="From"
                                disableFuture
                                value={field.value || null}
                                inputRef={field.ref}
                                onChange={(date) => {
                                    setValue("timeRange", "")
                                    field.onChange(date);
                                }}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="end_time"
                        // rules={{ required: "End Time is required" }}
                        render={({ field, fieldState }) => (
                            <DateTimePicker
                                sx={{maxWidth: 500}}
                                label="To"
                                disableFuture
                                value={field.value || null}
                                // defaultValue={dayjs()}
                                inputRef={field.ref}
                                onChange={(date) => {
                                    setValue("timeRange", "")
                                    field.onChange(date);
                                }}
                            />
                        )} 
                    />
                </LocalizationProvider>
                <Button type='submit' variant='contained'>Submit</Button>
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
                                report.days > 0 ?
                                    // <Typography>Sales Summary ({dayjs(report.fromDate).format("DD-MM-YYYY, hh:mm A")} - Now)</Typography>
                                    <Typography sx={{fontSize: 20, fontWeight: 500}}>Sales Summary ({dayjs(report.fromDate).format("DD MMMM")} onwards)</Typography>
                                :
                                <Typography sx={{fontSize: 20, fontWeight: 500}}>Sales Summary (Today)</Typography>
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
                                    <Box sx={{maxWidth: 1000, mx: "auto", maxHeight: 375, overflow: "auto"}}>
                                        <Table sx={{maxHeight: 50}}>
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
                                            {report.productDetails.products.map((row) => (
                                                <TableRow
                                                    key={row.id}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                >
                                                <TableCell align='center'>{row.id}</TableCell>
                                                <TableCell align="left">{row.title}</TableCell>
                                                <TableCell align="center">{row.total_quantity}</TableCell>
                                                <TableCell align="center">${(row.total_product_discount).toFixed(2)}</TableCell>
                                                <TableCell align="center">${(row.total_purchase_price).toFixed(2)}</TableCell>
                                                {/* <TableCell align="center">
                                                    <IconButton onClick={() => navigate(`/admin/order/${row.id}`)} sx={{p: 0}}>
                                                        <AssignmentIcon></AssignmentIcon>
                                                    </IconButton>
                                                </TableCell> */}
                                                </TableRow>
                                            ))}
                                                <TableRow>
                                                    <TableCell align='center' sx={{fontWeight: 700}}>Total</TableCell>
                                                    <TableCell align="left" sx={{fontWeight: 700}}></TableCell>
                                                    <TableCell align="center" sx={{fontWeight: 700}}>{report.productDetails.totalProductsSold}</TableCell>
                                                    <TableCell align="center" sx={{fontWeight: 700}}>${(report.productDetails.totalProductsDiscounts).toFixed(2)}</TableCell>
                                                    <TableCell align="center" sx={{fontWeight: 700}}>${(report.productDetails.totalProductsSales).toFixed(2)}</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </Box>
                                </Box>
                                <Box sx={{p: 2, pt: 0}}>
                                    <Box sx={{py: 2, display: "flex", flexDirection: "column", gap: 1}}>
                                        <Divider flexItem></Divider>
                                        <Typography sx={{fontSize: 20, fontWeight: 500}}>Category-wise Usage</Typography>
                                        <Divider flexItem></Divider>
                                    </Box>
                                    <Box sx={{maxWidth: 1000, mx: "auto", maxHeight: 375, overflow: "auto"}}>
                                        <Table sx={{maxHeight: 50}}>
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
                                                {report.categoryDetails.categories.map((row) => (
                                                    <TableRow
                                                        key={row.id}
                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                    >
                                                    <TableCell align='center'>{row.id}</TableCell>
                                                    <TableCell align="left">{row.category}</TableCell>
                                                    <TableCell align="center">{row.total_quantity}</TableCell>
                                                    <TableCell align="center">${(row.total_product_discount).toFixed(2)}</TableCell>
                                                    <TableCell align="center">${(row.total_purchase_price).toFixed(2)}</TableCell>
                                                    {/* <TableCell align="center">
                                                        <IconButton onClick={() => navigate(`/admin/order/${row.id}`)} sx={{p: 0}}>
                                                            <AssignmentIcon></AssignmentIcon>
                                                        </IconButton>
                                                    </TableCell> */}
                                                    </TableRow>
                                                ))}
                                                <TableRow>
                                                    <TableCell align='center' sx={{fontWeight: 700}}>Total</TableCell>
                                                    <TableCell align="left" sx={{fontWeight: 700}}></TableCell>
                                                    <TableCell align="center" sx={{fontWeight: 700}}>{report.categoryDetails.totalCategoryProductsSold}</TableCell>
                                                    <TableCell align="center" sx={{fontWeight: 700}}>${(report.categoryDetails.totalCategoryProductsDiscounts).toFixed(2)}</TableCell>
                                                    <TableCell align="center" sx={{fontWeight: 700}}>${(report.categoryDetails.totalCategoryProductsSales).toFixed(2)}</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
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
                                <Table sx={{maxHeight: 50}}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center" sx={{maxWidth: 70 }}>User ID</TableCell>
                                            <TableCell align="center">Timed Used</TableCell>
                                            <TableCell align="center">Total Discount</TableCell>
                                            <TableCell align="center">Total Sales</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {report.userDetails.users.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                            <TableCell align='center'>{row.id}</TableCell>
                                            <TableCell align="center">{row.total_redemptions}</TableCell>
                                            <TableCell align="center">${(row.total_discount).toFixed(2)}</TableCell>
                                            <TableCell align="center">${(row.total_sales).toFixed(2)}</TableCell>
                                            {/* <TableCell align="center">
                                                <IconButton onClick={() => navigate(`/admin/order/${row.id}`)} sx={{p: 0}}>
                                                    <AssignmentIcon></AssignmentIcon>
                                                </IconButton>
                                            </TableCell> */}
                                            </TableRow>
                                        ))}
                                        <TableRow>
                                            <TableCell align='center' sx={{fontWeight: 700}}>Total</TableCell>
                                            <TableCell align="center" sx={{fontWeight: 700}}>{report.userDetails.totalUserRedemptions}</TableCell>
                                            <TableCell align="center" sx={{fontWeight: 700}}>${(report.userDetails.totalUserDiscount).toFixed(2)}</TableCell>
                                            <TableCell align="center" sx={{fontWeight: 700}}>${(report.userDetails.totalUserSales).toFixed(2)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </Box>
                        </Box>
                        <Box sx={{p: 2, pt: 0}}>
                            <Box sx={{py: 2, display: "flex", flexDirection: "column", gap: 1}}>
                                <Divider flexItem></Divider>
                                <Typography sx={{fontSize: 20, fontWeight: 500}}>Date-wise Usage</Typography>
                                <Divider flexItem></Divider>
                            </Box>
                            <Box sx={{maxWidth: 700, mx: "auto", maxHeight: 375, overflow: "auto"}}>
                                <Table sx={{maxHeight: 50}}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center" sx={{maxWidth: 70 }}>Date</TableCell>
                                            <TableCell align="center">Timed Used</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {report.dateDetails.dates.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell align="center">{dayjs(row.date).format("DD MMM YYYY")}</TableCell>
                                                {/* <TableCell align="center">{row.date}</TableCell> */}
                                                <TableCell align="center">{row.total_redemptions}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow>
                                            <TableCell align='center' sx={{fontWeight: 700}}>Total</TableCell>
                                            <TableCell align="center" sx={{fontWeight: 700}}>{report.dateDetails.totalDateRedemptions}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
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
