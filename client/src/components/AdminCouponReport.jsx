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
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DataGrid } from '@mui/x-data-grid';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Modal from '@mui/material/Modal';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import Chip from '@mui/material/Chip';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import CouponReportPDF from './CouponReportPDF';
import { Page, Text, View, Document, StyleSheet, pdf, PDFViewer } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { couponService } from '../api/services/couponService';
const API_URL = import.meta.env.VITE_API_SERVER;

function AdminCouponReport({couponData}) {

    const { couponId } = useParams()
    const token = useSelector(state => state.userReducer.token)
    const { register, handleSubmit, control, reset, watch, resetField, setValue } = useForm()
    const [report, setReport] = useState(null)
    const [products, setProducts] = useState(null)
    const [categories, setCategories] = useState(null)
    const [users, setUsers] = useState(null)
    const [dates, setDates] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [chips, setChips] = useState(null)

    const timeRange = watch("timeRange")

    const downloadPDF = () => {
    const reportElement = document.getElementById("report-section");
        html2canvas(reportElement).then(canvas => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save("coupon-report.pdf");
        });
    };

    const generatePDF = async (data) => {
        const blob = await pdf(<CouponReportPDF data={{couponData, report, products, categories, users, dates}}/>).toBlob()
        saveAs(blob, `coupon report ${dayjs().format("DDMMYYHHmmss")}.pdf`)
    }

    const handleReportFilter = async (formData) => {
        console.log(formData);

        setProducts(null)
        setCategories(null)
        setUsers(null)
        setDates(null)
        setChips([])

        let fromTime;
        let toTime;
        setChips([`Timerange: ${formData.timeRange === 0 ? "Today" : formData.timeRange === `custom` ? "custom" : `Last ${formData.timeRange} days`}`])

        if(formData.timeRange === "custom" && !formData.start_time && !formData.end_time){
            console.error("Select a custom date");
            return
        }
        if(formData.timeRange !== "custom" && !formData.start_time && !formData.end_time){
            const todayStart = dayjs().startOf("day")
            fromTime = dayjs(todayStart).subtract(formData.timeRange, "day").format("YYYY-MM-DD HH:mm:ss")
            toTime = dayjs().format("YYYY-MM-DD HH:mm:ss")
        }
        if(formData.timeRange === "custom" && formData.start_time && formData.end_time){
            fromTime = dayjs(formData.start_time).format("YYYY-MM-DD HH:mm:ss")
            toTime = dayjs(formData.end_time).format("YYYY-MM-DD HH:mm:ss")
            setChips(prev => [...prev, `Start: ${formData.start_time}`, `End: ${formData.end_time}`])
        }

        fetchCouponReportSummary(couponId, fromTime, toTime)
        
        if(formData.product && formData.product.enabled){
            fetchCouponReportProducts(couponId, fromTime, toTime, formData.product.topN, formData.product.sortBy, formData.product.orderBy)
        }
        if(formData.category && formData.category.enabled){
            fetchCouponReportCategories(couponId, fromTime, toTime, formData.category.topN, formData.category.sortBy, formData.category.orderBy)
        }
        if(formData.user.enabled){
            fetchCouponReportUsers(couponId, fromTime, toTime, formData.user.topN, formData.user.sortBy, formData.user.orderBy)
        }
        if(formData.date.enabled){
            fetchCouponReportDates(couponId, fromTime, toTime, formData.date.topN, formData.date.sortBy, formData.date.orderBy)
        }

        setModalOpen(false)
    }

    const getSqlToday = () => {
        return dayjs().startOf("day").format("YYYY-MM-DD HH:mm:ss")
    }
    const getSqlNow = () => {
        return dayjs().format("YYYY-MM-DD HH:mm:ss")
    }

    const handleModalClose = (event, reason) => {
        if (reason === "backdropClick") {
            handleSubmit(handleReportFilter)();
        }
        setModalOpen(false);
    }

    const fetchCouponReportSummary = async (coupon_id, from = getSqlToday(), to = getSqlNow()) => {
        try{
            // const response = await fetch(`${API_URL}/admin/coupons/${couponId}/report/summary?from=${from}&to=${to}`, {
            //     headers: {
            //         Authorization : `Bearer ${token}`
            //     }
            // })

            // if(!response.ok){
            //     const error = await response.json()
            //     return console.log(error)
            // }
            // const result = await response.json()

            const result = await couponService.getCouponReportSummary(couponId, from, to)
            setReport(result)
            console.log(result)
        }
        catch(err){
            console.error(err.message)
        }
    }

    const fetchCouponReportProducts = async (coupon_id, from = getSqlToday(), to = getSqlNow(), limit = 10, sortBy = "total_purchase_price", orderBy = "desc") => {

        try{
            const response = await fetch(`${API_URL}/admin/coupons/${couponId}/report/products?from=${from}&to=${to}&limit=${limit}&sortBy=${sortBy}&orderBy=${orderBy}`, {
                headers: {
                    Authorization : `Bearer ${token}`
                }
            })

            if(!response.ok){
                const error = await response.json()
                return console.log(error)
            }
            const result = await response.json()
            setProducts(result)
            console.log(result)
            // setChips(prev => [...prev, `Products`])
            result.products.length > 0 ? setChips(prev => Array.from(new Set([...prev, "Products"]))) : null
        }
        catch(err){
            console.error(err.message)
        }
    }

    const fetchCouponReportCategories = async (coupon_id, from = getSqlToday(), to = getSqlNow(), limit = 10, sortBy = "total_purchase_price", orderBy = "desc") => {
        try{
            const response = await fetch(`${API_URL}/admin/coupons/${couponId}/report/categories?from=${from}&to=${to}&limit=${limit}&sortBy=${sortBy}&orderBy=${orderBy}`, {
                headers: {
                    Authorization : `Bearer ${token}`
                }
            })

            if(!response.ok){
                const error = await response.json()
                return console.log(error)
            }
            const result = await response.json()
            setCategories(result)
            console.log(result)
            // setChips(prev => [...prev, `Categories`])
            result.categories.length > 0 ? setChips(prev => Array.from(new Set([...prev, "Categories"]))) : null
        }
        catch(err){
            console.error(err.message)
        }
    }

    const fetchCouponReportUsers = async (coupon_id, from = getSqlToday(), to = getSqlNow(), limit = 10, sortBy = "total_sales", orderBy = "desc") => {
        try{
            const response = await fetch(`${API_URL}/admin/coupons/${couponId}/report/users?from=${from}&to=${to}&limit=${limit}&sortBy=${sortBy}&orderBy=${orderBy}`, {
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
            // setChips(prev => [...prev, `Users`])
            result.users.length > 0 ? setChips(prev => Array.from(new Set([...prev, "Users"]))) : null
        }
        catch(err){
            console.error(err.message)
        }
    }

    const fetchCouponReportDates = async (coupon_id, from = getSqlToday(), to = getSqlNow(), limit = 10, sortBy = "times_used", orderBy = "desc") => {
        try{
            const response = await fetch(`${API_URL}/admin/coupons/${couponId}/report/dates?from=${from}&to=${to}&limit=${limit}&sortBy=${sortBy}&orderBy=${orderBy}`, {
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
            // setChips(prev => [...prev, `Dates`])
            result.dates.length > 0 ? setChips(prev => Array.from(new Set([...prev, "Dates"]))) : null
        }
        catch(err){
            console.error(err.message)
        }
    }

    useEffect(() => {
        setChips([])
        setChips(["Timerange: Today"])
        fetchCouponReportSummary(couponId)
        fetchCouponReportProducts(couponId)
        fetchCouponReportCategories(couponId)
        fetchCouponReportUsers(couponId)
        fetchCouponReportDates(couponId)
    }, [])

    const productColumns = [
        { field: "id", headerName: "Product ID", width: 120, align: "right", headerAlign: "center"},
        { 
            field: "title", 
            headerName: "Name", 
            width: 240,
            align: "left",
            headerAlign: "center"
        },
        { 
            field: "total_quantity", 
            headerName: "Units Sold", 
            width: 120,
            align: "right",
            headerAlign: "center"
        },
        { 
            field: "total_product_discount", 
            headerName: "Discounts Given", 
            width: 140,
            headerAlign: "center",
            renderCell: (params) => (
                <Box sx={{display: "flex", justifyContent: "flex-end", alignItems: "center", height: "100%"}}>
                    <Typography color='error'>${(params.value).toFixed(2)}</Typography>
                </Box>
            )
        },
        { 
            field: "total_purchase_price", 
            headerName: "Total Sales", 
            width: 140,
            headerAlign: "center",
            renderCell: (params) => (
                <Box sx={{display: "flex", justifyContent: "flex-end", alignItems: "center", height: "100%"}}>
                    <Typography color='success'>${(params.value).toFixed(2)}</Typography>
                </Box>
            )
        }
    ]

    const categoryColumns = [
        { field: "id", headerName: "Category ID", width: 120, align: "right", headerAlign: "center"},
        { 
            field: "category", 
            headerName: "Category", 
            width: 240,
            align: "left",
            headerAlign: "center"
        },
        { 
            field: "total_quantity", 
            headerName: "Units Sold", 
            width: 120,
            align: "right",
            headerAlign: "center"
        },
        { 
            field: "total_product_discount", 
            headerName: "Discounts Given", 
            width: 140,
            headerAlign: "center",
            renderCell: (params) => (
                <Box sx={{display: "flex", justifyContent: "flex-end", alignItems: "center", height: "100%"}}>
                    <Typography color='error'>${(params.value).toFixed(2)}</Typography>
                </Box>
            )
        },
        { 
            field: "total_purchase_price", 
            headerName: "Total Sales", 
            width: 140,
            headerAlign: "center",
            renderCell: (params) => (
                <Box sx={{display: "flex", justifyContent: "flex-end", alignItems: "center", height: "100%"}}>
                    <Typography color='success'>${(params.value).toFixed(2)}</Typography>
                </Box>
            )
        }
    ]

    const userColumns = [
        { field: "user_id", headerName: "User ID", width: 120, align: "right", headerAlign: "center"},
        { 
            field: "total_redeems", 
            headerName: "Times Used", 
            width: 120,
            align: "right",
            headerAlign: "center",
        },
        { 
            field: "total_discount", 
            headerName: "Total Discount", 
            width: 140,
            headerAlign: "center",
            renderCell: (params) => (
                <Box sx={{display: "flex", justifyContent: "flex-end", alignItems: "center", height: "100%"}}>
                    <Typography color='error'>${(params.value).toFixed(2)}</Typography>
                </Box>
            )
        },
        { 
            field: "total_sales", 
            headerName: "Total Sales", 
            width: 140,
            headerAlign: "center",
            renderCell: (params) => (
                <Box sx={{display: "flex", justifyContent: "flex-end", alignItems: "center", height: "100%"}}>
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
            align: "left",
            headerAlign: "center",
            renderCell: (params) => (
                <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
                    <Typography>{dayjs(params.value).format("DD MMM YYYY")}</Typography>
                </Box>
            )
        },
        { 
            field: "total_redeems", 
            headerName: "Times Used", 
            width: 120,
            align: "right",
            headerAlign: "center"
        },
    ]

    const style = {
        position: 'absolute',
        top: '2%',
        left: '50%',
        transform: 'translate(-50%, 0%)',
        maxWidth: "100%",
        maxHeight: 700,
        overflowY: "auto",
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
        boxShadow: 24,
    };

    return (
        <Box>
            <Modal open={modalOpen} onClose={handleModalClose}>
                <Box sx={style}>
                    <Card sx={{width: "auto", p: 2}}>
                    <Box component="form" onSubmit={handleSubmit(handleReportFilter)} sx={{display: "flex", flexDirection: "column", gap: 2, pt: 2}}>
                        <Box sx={{display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", justifyContent: "space-between"}}>
                            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", flex: 1 }}>
                                <FormControl sx={{ minWidth: 180 }} size="small">
                                    <InputLabel id="time-range-label">Choose an option</InputLabel>
                                    <Controller
                                        name="timeRange"
                                        control={control}
                                        defaultValue={0}
                                        render={({ field }) => (
                                            <Select
                                                labelId="time-range-label"
                                                label="Choose an option"
                                                {...field}
                                                onChange={(e) => {
                                                    setValue("start_time", null);
                                                    setValue("end_time", null);
                                                    field.onChange(e);
                                                }}
                                            >
                                            <MenuItem value={0}>Today</MenuItem>
                                            <MenuItem value={7}>Last 7 Days</MenuItem>
                                            <MenuItem value={30}>Last 30 Days</MenuItem>
                                            <MenuItem value="custom">Custom</MenuItem>
                                            </Select>
                                        )}
                                    />
                                </FormControl>

                                {timeRange === "custom" ? 
                                    <Box>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <Controller
                                                control={control}
                                                name="start_time"
                                                rules={{ required: "Start Time is required" }}
                                                render={({ field, fieldState }) => (
                                                <DateTimePicker
                                                    label="From"
                                                    disableFuture
                                                    value={field.value || null}
                                                    onChange={(date) => field.onChange(date)}
                                                    slotProps={{
                                                        textField: {
                                                            size: "small",
                                                            error: !!fieldState.error,
                                                            helperText: fieldState.error?.message
                                                        }
                                                    }}
                                                    sx={{ minWidth: 200, mr: 1, mb: 1 }}
                                                />
                                                )}
                                            />
                                            <Controller
                                                control={control}
                                                name="end_time"
                                                rules={{ required: "End Time is required" }}
                                                render={({ field, fieldState }) => (
                                                <DateTimePicker
                                                    label="To"
                                                    disableFuture
                                                    value={field.value || null}
                                                    onChange={(date) => field.onChange(date)}
                                                    slotProps={{
                                                        textField: {
                                                            size: "small",
                                                            error: !!fieldState.error,
                                                            helperText: fieldState.error?.message
                                                        }
                                                    }}
                                                    sx={{ minWidth: 200 }}
                                                />
                                                )}
                                            />
                                        </LocalizationProvider>
                                    </Box>
                                : null}
                            </Box>
                            <Box>
                                <Button type="submit" variant="contained" size="large">
                                    Generate
                                </Button>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 1 }} orientation='horizontal' flexItem/>
                        <Box sx={{display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, justifyContent: "space-between"}}>
                            {couponData.applies_to !== "all" ?
                                <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                        <Controller
                                            name="product.enabled"
                                            control={control}
                                            defaultValue={true}
                                            render={({ field }) => (
                                                <FormControlLabel
                                                    control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                                                    label={<Typography fontWeight={700}>Product-wise Usage</Typography>}
                                                />
                                            )}
                                        />
                                    </Box>

                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                        <FormControl size="small" sx={{ minWidth: 140 }}>
                                            <InputLabel id="product-topn-label">Top</InputLabel>
                                            <Controller
                                                name="product.topN"
                                                control={control}
                                                defaultValue={10}
                                                render={({ field }) => (
                                                <Select labelId="product-topn-label" label="Top" {...field} disabled={!watch("product.enabled")}>
                                                    <MenuItem value={5}>Top 5</MenuItem>
                                                    <MenuItem value={10}>Top 10</MenuItem>
                                                    <MenuItem value={20}>Top 20</MenuItem>
                                                </Select>
                                                )}
                                            />
                                        </FormControl>

                                        <FormControl size="small" sx={{ minWidth: 140 }}>
                                            <InputLabel id="product-sortby-label">Sort by</InputLabel>
                                            <Controller
                                                name="product.sortBy"
                                                control={control}
                                                defaultValue="total_purchase_price"
                                                render={({ field }) => (
                                                <Select
                                                    labelId="product-sortby-label"
                                                    label="Sort by"
                                                    {...field}
                                                    disabled={!watch("product.enabled")}
                                                >
                                                    <MenuItem value="total_quantity">Units sold</MenuItem>
                                                    <MenuItem value="total_product_discount">Discount amount</MenuItem>
                                                    <MenuItem value="total_purchase_price">Sales</MenuItem>
                                                </Select>
                                                )}
                                            />
                                        </FormControl>

                                        <FormControl size="small" sx={{ minWidth: 140 }}>
                                            <InputLabel id="product-orderby-label">Order by</InputLabel>
                                            <Controller
                                                name="product.orderBy"
                                                control={control}
                                                defaultValue="desc"
                                                render={({ field }) => (
                                                <Select
                                                    labelId="product-orderby-label"
                                                    label="Order by"
                                                    {...field}
                                                    disabled={!watch("product.enabled")}
                                                >
                                                    <MenuItem value="desc">Descending</MenuItem>
                                                    <MenuItem value="asc">Ascending</MenuItem>
                                                </Select>
                                                )}
                                            />
                                        </FormControl>
                                    </Box>
                                </Card>
                            :null
                            }

                            {couponData.applies_to !== "all" ?
                                <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                        <Controller
                                        name="category.enabled"
                                        control={control}
                                        defaultValue={true}
                                        render={({ field }) => (
                                            <FormControlLabel
                                                control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                                                label={<Typography fontWeight={700}>Category-wise Usage</Typography>}
                                            />
                                        )}
                                        />
                                    </Box>
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                        <FormControl size="small" sx={{ minWidth: 140 }}>
                                            <InputLabel id="category-topn-label">Top</InputLabel>
                                            <Controller
                                                name="category.topN"
                                                control={control}
                                                defaultValue={10}
                                                render={({ field }) => (
                                                <Select labelId="category-topn-label" label="Top" {...field} disabled={!watch("category.enabled")}>
                                                    <MenuItem value={5}>Top 5</MenuItem>
                                                    <MenuItem value={10}>Top 10</MenuItem>
                                                    <MenuItem value={20}>Top 20</MenuItem>
                                                </Select>
                                                )}
                                            />
                                        </FormControl>

                                        <FormControl size="small" sx={{ minWidth: 140 }}>
                                            <InputLabel id="category-sortby-label">Sort by</InputLabel>
                                            <Controller
                                                name="category.sortBy"
                                                control={control}
                                                defaultValue="total_purchase_price"
                                                render={({ field }) => (
                                                <Select
                                                    labelId="category-sortby-label"
                                                    label="Sort by"
                                                    {...field}
                                                    disabled={!watch("category.enabled")}
                                                >
                                                    <MenuItem value="total_quantity">Units sold</MenuItem>
                                                    <MenuItem value="total_product_discount">Discount amount</MenuItem>
                                                    <MenuItem value="total_purchase_price">Sales</MenuItem>
                                                </Select>
                                                )}
                                            />
                                        </FormControl>

                                        <FormControl size="small" sx={{ minWidth: 140 }}>
                                            <InputLabel id="category-orderby-label">Order by</InputLabel>
                                            <Controller
                                                name="category.orderBy"
                                                control={control}
                                                defaultValue="desc"
                                                render={({ field }) => (
                                                <Select
                                                    labelId="category-orderby-label"
                                                    label="Order by"
                                                    {...field}
                                                    disabled={!watch("category.enabled")}
                                                >
                                                    <MenuItem value="desc">Descending</MenuItem>
                                                    <MenuItem value="asc">Ascending</MenuItem>
                                                </Select>
                                                )}
                                            />
                                        </FormControl>
                                    </Box>
                                </Card>
                            :null
                            }

                            <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                    <Controller
                                        name="user.enabled"
                                        control={control}
                                        defaultValue={true}
                                        render={({ field }) => (
                                            <FormControlLabel
                                                control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                                                label={<Typography fontWeight={700}>User-wise Usage</Typography>}
                                            />
                                        )}
                                    />
                                </Box>

                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                    <FormControl size="small" sx={{ minWidth: 140 }}>
                                        <InputLabel id="user-topn-label">Top</InputLabel>
                                        <Controller
                                            name="user.topN"
                                            control={control}
                                            defaultValue={10}
                                            render={({ field }) => (
                                            <Select labelId="user-topn-label" label="Top" {...field} disabled={!watch("user.enabled")}>
                                                <MenuItem value={5}>Top 5</MenuItem>
                                                <MenuItem value={10}>Top 10</MenuItem>
                                                <MenuItem value={20}>Top 20</MenuItem>
                                            </Select>
                                            )}
                                        />
                                    </FormControl>

                                    <FormControl size="small" sx={{ minWidth: 140 }}>
                                        <InputLabel id="user-sortby-label">Sort by</InputLabel>
                                        <Controller
                                            name="user.sortBy"
                                            control={control}
                                            defaultValue="total_sales"
                                            render={({ field }) => (
                                            <Select
                                                labelId="user-sortby-label"
                                                label="Sort by"
                                                {...field}
                                                disabled={!watch("user.enabled")}
                                            >
                                                <MenuItem value="total_redeems">Times redeemed</MenuItem>
                                                <MenuItem value="total_discount">Discount amount</MenuItem>
                                                <MenuItem value="total_sales">Sales</MenuItem>
                                            </Select>
                                            )}
                                        />
                                    </FormControl>

                                    <FormControl size="small" sx={{ minWidth: 140 }}>
                                        <InputLabel id="user-orderby-label">Order by</InputLabel>
                                        <Controller
                                            name="user.orderBy"
                                            control={control}
                                            defaultValue="desc"
                                            render={({ field }) => (
                                            <Select
                                                labelId="user-orderby-label"
                                                label="Order by"
                                                {...field}
                                                disabled={!watch("user.enabled")}
                                            >
                                                <MenuItem value="desc">Descending</MenuItem>
                                                <MenuItem value="asc">Ascending</MenuItem>
                                            </Select>
                                            )}
                                        />
                                    </FormControl>
                                </Box>
                            </Card>

                            <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                    <Controller
                                        name="date.enabled"
                                        control={control}
                                        defaultValue={true}
                                        render={({ field }) => (
                                            <FormControlLabel
                                                control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                                                label={<Typography fontWeight={700}>Date-wise Usage</Typography>}
                                            />
                                        )}
                                    />
                                </Box>

                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                    <FormControl size="small" sx={{ minWidth: 140 }}>
                                        <InputLabel id="date-topn-label">Top</InputLabel>
                                        <Controller
                                            name="date.topN"
                                            control={control}
                                            defaultValue={10}
                                            render={({ field }) => (
                                            <Select labelId="date-topn-label" label="Top" {...field} disabled={!watch("date.enabled")}>
                                                <MenuItem value={5}>Top 5</MenuItem>
                                                <MenuItem value={10}>Top 10</MenuItem>
                                                <MenuItem value={20}>Top 20</MenuItem>
                                            </Select>
                                            )}
                                        />
                                    </FormControl>

                                    <FormControl size="small" sx={{ minWidth: 140 }}>
                                        <InputLabel id="date-sortby-label">Sort by</InputLabel>
                                        <Controller
                                            name="date.sortBy"
                                            control={control}
                                            defaultValue="times_used"
                                            render={({ field }) => (
                                            <Select
                                                labelId="date-sortby-label"
                                                label="Sort by"
                                                {...field}
                                                disabled={!watch("date.enabled")}
                                            >
                                                <MenuItem value="times_used">Times used</MenuItem>
                                            </Select>
                                            )}
                                        />
                                    </FormControl>

                                    <FormControl size="small" sx={{ minWidth: 140 }}>
                                        <InputLabel id="date-orderby-label">Order by</InputLabel>
                                        <Controller
                                            name="date.orderBy"
                                            control={control}
                                            defaultValue="desc"
                                            render={({ field }) => (
                                            <Select
                                                labelId="date-orderby-label"
                                                label="Order by"
                                                {...field}
                                                disabled={!watch("date.enabled")}
                                            >
                                                <MenuItem value="desc">Descending</MenuItem>
                                                <MenuItem value="asc">Ascending</MenuItem>
                                            </Select>
                                            )}
                                        />
                                    </FormControl>
                                </Box>
                            </Card>
                        </Box>
                    </Box>
                    </Card>
                </Box>
            </Modal>
            

            <Box>
                <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2}}>
                    {chips && chips.length > 0 ?
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {chips.map((value, index) => {
                                if (!value) return null;
                                return (
                                    <Chip
                                        key={index}
                                        label={value}
                                        color="primary"
                                        variant="outlined"
                                    />
                                )
                            })}
                        </Box>
                    :null
                    }
                    <Box sx={{display: "flex", gap: 1}}>
                        <Button variant='contained' startIcon={<FilterAltIcon/>} onClick={() => setModalOpen(true)}>Filter</Button>
                        {report && report.totalUsage > 0?
                            <Button variant='contained' startIcon={<CloudDownloadIcon/>} onClick={() => generatePDF(users)}>Report PDF</Button>
                        :null
                        }
                    </Box>
                </Box>
                <Card id={"report-section"}>
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
                            <Typography component={'span'} sx={{fontWeight: 700}}>
                                {`Validity: `}
                            </Typography> 
                            {dayjs(couponData.start_time).format("DD MMM YYYY")} - {dayjs(couponData.end_time).format("DD MMM YYYY")}
                        </Typography>
                    </Box>
                    {report && report.totalUsage > 0?
                        <Box>
                            <Box sx={{p: 2, pt: 0}}>
                                <Box sx={{py: 2, display: "flex", flexDirection: "column", gap: 1}}>
                                    <Divider flexItem></Divider>
                                    <Typography sx={{fontSize: 20, fontWeight: 500}}>Coupon Report
                                        <Typography component={"span"}> ({dayjs(report.fromTime).format("DD MMM YYYY, hh:mm A")} - {dayjs(report.toTime).format("DD MMM YYYY, hh:mm A")} )</Typography>
                                    </Typography>
                                    <Divider flexItem></Divider>
                                </Box>

                                <Typography>
                                    <Typography component={'span'} sx={{fontWeight: 700}}>Total Redeems: </Typography>
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

                                {couponData.applies_to !== "all" ?
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
                            {couponData.applies_to !== "all" ?
                                <Box>
                                    {products && products.products.length > 0 ?
                                        <Box sx={{p: 2, pt: 0}}>
                                            <Box sx={{py: 2, display: "flex", flexDirection: "column", gap: 1}}>
                                                <Divider flexItem></Divider>
                                                <Typography sx={{fontSize: 20, fontWeight: 500}}>Product-wise Usage</Typography>
                                                <Divider flexItem></Divider>
                                            </Box>
                                            <Box sx={{maxWidth: 1000, mx: "auto", overflowY: "auto"}}>
                                                <DataGrid
                                                    sx={{ maxHeight: 500, maxWidth: "100%", mr: 1.5}}
                                                    rows={products.products}
                                                    columns={productColumns}
                                                    rowHeight={38}
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
                                            </Box>
                                        </Box>
                                    :null
                                    }
                                    {categories && categories.categories.length > 0 ?
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
                                            </Box>
                                        </Box>
                                    :null
                                    }
                                </Box>
                            :null
                            }
                            {users && users.users.length > 0 ?
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
                                                    <Box sx={{ fontWeight: 'bold', p: 1, textAlign: 'center', borderTop: 1 }}>
                                                        Total: {users.totalUserRedeems} Redeems | 
                                                        ${users.totalUserDiscount.toFixed(2)} Discount | 
                                                        ${users.totalUserSales.toFixed(2)} Sales
                                                    </Box>
                                                )
                                            }}
                                        />
                                    </Box>
                                </Box>
                            :null
                            }
                            {dates && dates.dates.length > 0 ?    
                                <Box sx={{p: 2, pt: 0}}>
                                    <Box sx={{py: 2, display: "flex", flexDirection: "column", gap: 1}}>
                                        <Divider flexItem></Divider>
                                        <Typography sx={{fontSize: 20, fontWeight: 500}}>Date-wise Usage</Typography>
                                        <Divider flexItem></Divider>
                                    </Box>
                                    <Box sx={{maxWidth: 1000, mx: "auto", maxHeight: 375, overflow: "auto"}}>
                                        <DataGrid
                                            sx={{ maxHeight: 500, maxWidth: "100%", mr: 1.5}}
                                            rows={dates.dates}
                                            columns={dateColumns}
                                            rowHeight={38}
                                            disableRowSelectionOnClick
                                            slots={{
                                                footer: () => (
                                                    <Box sx={{ fontWeight: 'bold', p: 1, textAlign: 'center', borderTop: 1}}>
                                                        Total: {dates.totalDateRedeems} Redeems
                                                    </Box>
                                                )
                                            }}
                                        />
                                    </Box>
                                </Box>
                            :null
                            }
                            {/* <div style={{ height: "100vh" }}>
                                <PDFViewer width="100%" height="100%">
                                    <CouponReportPDF data={{couponData, report, products, categories, users, dates}}/>
                                </PDFViewer>
                            </div> */}
                        </Box>
                    :
                        <Box sx={{p: 2}}>
                            <Typography>This coupon haven't been used in this time range</Typography>
                        </Box>
                    }
                </Card>
                {/* <Button onClick={downloadPDF}>Download Report</Button> */}
            </Box>
        </Box>
    )
}

export default AdminCouponReport