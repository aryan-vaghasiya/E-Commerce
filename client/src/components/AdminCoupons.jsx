import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router'
import EditNoteIcon from '@mui/icons-material/EditNote';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import { Controller, useForm } from 'react-hook-form';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import dayjs from 'dayjs';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import Modal from '@mui/material/Modal';
import Chip from '@mui/material/Chip';
import { alignItems, getValue, maxHeight, maxWidth } from '@mui/system';

function AdminCoupons() {
    const { register, handleSubmit, control, reset, watch, resetField, setValue } = useForm();
    const navigate = useNavigate()

    const token = useSelector(state => state.userReducer.token);
    const [coupons, setCoupons] = useState([]);
    const [activeCoupons, setActiveCoupons] = useState([]);
    const [inactiveCoupons, setInactiveCoupons] = useState([]);
    const [totalCoupons, setTotalCoupons] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [hasFilter, setHasFilter] = useState(false);
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = (event, reason) => {
        if (reason === "backdropClick") {
            handleSubmit(handleFilter)();
        }
        setOpen(false);
    }
    const watchAllFields = watch()

    const discountTypeFixed = watch("discount_type_fixed");
    const discountTypePercentage = watch("discount_type_percentage");
    const applyOnProduct = watch("apply_on_product");
    const applyOnCart = watch("apply_on_cart");
    const statusActive = watch("status_active");
    const statusInactive = watch("status_inactive");
    // console.log(watchAllFields);
    

    const style = {
        position: 'absolute',
        top: '2%',
        left: '50%',
        transform: 'translate(-50%, 0%)',
        maxWidth: 550,
        maxHeight: 720,
        overflowY: "auto",
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
        // bgcolor: 'background.paper',
        // border: '2px solid #000',
        boxShadow: 24,
        // p: 4,
    };

    const getLabel = (key, value) => {
        
        switch (key) {
            case "discount_type_fixed":
                return `Type: Fixed`;
            case "discount_type_percentage":
                return `Type: Percentage`;
            case "apply_on_product":
                return `On: Product`;
            case "apply_on_cart":
                return `On: Cart`;
            case "status_active":
                return "Active";
            case "status_inactive":
                return "Inactive";
            case "start_date":
                return `From: ${value}`;
            case "end_date":
                return `To: ${value}`;
            case "search":
                return `Search: ${value}`;
            default:
                return `${key}: ${value}`;
        }
    };

    const clearFilters = () => {
        reset()
        setHasFilter(false)
        handleFilter()
    }

    const fetchCoupons = async (page, limit, filters = {}) => {
        // console.log(filters);
        setLoading(true);
        setError(null);

        setHasFilter(Object.values(filters).length > 0 ? true : false)

        // if(Object.values(filters).length > 0) {
        //     setHasFilter(true)
        // }
        // else {
        //     setHasFilter(false)
        // }
        try {
            const params = new URLSearchParams({page, limit, ...filters})
            // console.log(params.toString());
            
            // const response = await fetch(`http://localhost:3000/admin/get-coupons?page=${page}&limit=${limit}`, {
            const response = await fetch(`http://localhost:3000/admin/get-coupons?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errData = await response.json();
                console.error("Could not fetch Coupons Data:", errData)
                console.error("Could not fetch Coupons Data:", errData.error)
                return
            }

            handleClose()
            const result = await response.json()
            // console.log(result)
            setCoupons(result.coupons)
            // const activeOnly = result.coupons.filter(coupon => coupon.is_active === 1 )
            // console.log(activeOnly)
            // setActiveCoupons(activeOnly)
            setTotalCoupons(result.total)
        } catch (err) {
            console.error(err.message)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    };

    const handleFilter = (data = {}) => {
        // console.log(data);
        const params = new URLSearchParams();

        if (data.search) params.set("search", data.search);

        if (data.discount_type_fixed && !data.discount_type_percentage)
            params.set("discount_type", "fixed");
        else if (data.discount_type_percentage && !data.discount_type_fixed)
            params.set("discount_type", "percent");

        if (data.apply_on_product && !data.apply_on_cart)
            params.set("apply_on", "product");
        else if (data.apply_on_cart && !data.apply_on_product)
            params.set("apply_on", "all");

        if (data.status_active && !data.status_inactive)
            params.set("is_active", 1);
        else if (data.status_inactive && !data.status_active)
            params.set("is_active", 0);

        if (data.start_date) params.set("start_date", dayjs(data.start_date).format("YYYY-MM-DD"));
        if (data.end_date) params.set("end_date", dayjs(data.end_date).format("YYYY-MM-DD"));

        // console.log(Object.fromEntries(params));
        // console.log(params.toString());

        fetchCoupons(paginationModel.page + 1, paginationModel.pageSize, Object.fromEntries(params))
    }

    const handleRowClick = (event) => {
        console.log(event.row.id);
        navigate(`/admin/coupons/${event.row.id}`)
    }

    useEffect(() => {
        // console.log("fetching...");
        // fetchCoupons(paginationModel.page + 1, paginationModel.pageSize);
        handleFilter(watchAllFields)
    }, [paginationModel]);

    const handlePaginationChange = (newModel) => {
        // console.log(newModel);
        
        setPaginationModel(newModel);
        fetchCoupons(newModel.page + 1, newModel.pageSize);
    };

    const columns = [
        {
            field: 'id', headerName: 'Coupon ID', width: 90, align : "center"
        },
        {
            field: 'name',
            headerName: 'Coupon Name',
            width: 180,
            editable: false,
        },
        {
            field: 'code',
            headerName: 'Coupon Code',
            width: 110,
            editable: false,
        },
        {
            field: 'discount_type',
            headerName: 'Discount Type',
            width: 110,
            editable: false,
        },
        {
            field: 'discount_value',
            headerName: 'Discount Value',
            width: 120,
            editable: false,
            align: "center"
        },
        {
            field: 'start_time',
            headerName: 'Start Date',
            width: 110,
            editable: false,
            align: "center"
        },
        {
            field: 'end_time',
            headerName: 'End Date',
            width: 110,
            editable: false,
            align: "center"
        },
        // {
        //     field: 'created_at',
        //     headerName: 'Created at',
        //     width: 110,
        //     editable: false,
        //     align: "center"
        // },
        {
            field: 'coupons_left',
            headerName: 'Coupons Left',
            width: 110,
            editable: false,
            align: "center",
            renderCell: (params) => (
                <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
                    {
                        params.value?
                        <Typography>{params.value}</Typography>
                        :
                        <Typography>Unlimited</Typography>
                    }
                </Box>
            )
        },
        // {
        //     field: 'times_used',
        //     headerName: 'Coupons Used',
        //     width: 110,
        //     editable: false,
        //     align: "center"
        // },
        {
            field: 'edit',
            headerName: 'Edit Product',
            width: 110,
            renderCell : (params) => <IconButton onClick={() => navigate(`/admin/coupons/${params.id}`)} sx={{p: 0}}><EditNoteIcon sx={{fontSize: 35}}></EditNoteIcon></IconButton>,
            align: "center"
        }
    ];

    return (
        <Box sx={{ py: 1.5, px: 4, bgcolor: "#EEEEEE", minHeight: "91vh" }}>
            <Modal
                open={open}
                onClose={handleClose}
            >
                <Box sx={style}>
                <Card sx={{width: "auto"}}>
                    <Typography sx={{ p: 1, fontSize: "16px", bgcolor: "#3B92CA", color: "white"}}>FILTER COUPONS</Typography>
                    <Box sx={{p: 2}}>
                        
                        {/* <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                            
                            {Object.entries(watchAllFields).map(([key, value]) => {
                            if (!value) return null;
                            return (
                                <Chip
                                    key={key}
                                    label={getLabel(key, value)}
                                    onDelete={() => {
                                        setValue(key, "")
                                        // handleSubmit(handleFilter)()
                                    }}
                                    // deleteIcon={<CloseIcon />}
                                    color="primary"
                                    variant="outlined"
                                />
                            );
                            })}
                        </Box> */}
                    <Box component="form" onSubmit={handleSubmit(handleFilter)} sx={{display: "flex", justifyContent: "center"}}>
                    {/* <form onSubmit={handleSubmit(handleFilter)} noValidate> */}
                        <Stack spacing={2} width={{ lg: 500}}>
                        <TextField
                            label="Search Coupon (name or code)"
                            variant="outlined"
                            {...register("search")}
                            fullWidth
                        />

                        <FormControl component="fieldset">
                            <FormLabel component="legend">Discount Type</FormLabel>
                            <FormGroup >
                                <FormControlLabel
                                    control={<Checkbox {...register("discount_type_fixed")} checked={!!discountTypeFixed}/>}
                                    label="Fixed Amount"
                                />
                                <FormControlLabel
                                    control={<Checkbox {...register("discount_type_percentage")} checked={!!discountTypePercentage}/>}
                                    label="Percentage"
                                />
                            </FormGroup>
                        </FormControl>

                        <FormControl component="fieldset">
                            <FormLabel component="legend">Applies On</FormLabel>
                            <FormGroup>
                                <FormControlLabel
                                    control={<Checkbox {...register("apply_on_product")} checked={!!applyOnProduct}/>}
                                    label="Product"
                                />
                                <FormControlLabel
                                    control={<Checkbox {...register("apply_on_cart")} checked={!!applyOnCart}/>}
                                    label="Cart"
                                />
                            </FormGroup>
                        </FormControl>

                        <FormControl component="fieldset">
                            <FormLabel component="legend">Status</FormLabel>
                            {/* <FormGroup row> */}
                            <FormGroup >
                                <FormControlLabel
                                    control={<Checkbox {...register("status_active")} checked={!!statusActive}/>}
                                    label="Active"
                                />
                                <FormControlLabel
                                    control={<Checkbox {...register("status_inactive")} checked={!!statusInactive}/>}
                                    label="Inactive"
                                />
                            </FormGroup>
                        </FormControl>

                        <Box sx={{display: "flex", justifyContent: "space-between"}}>
                            <FormGroup row sx={{width: "100%"}}>
                                <Controller
                                    name="start_date"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            label="Start Date"
                                            type="date"
                                            // InputLabelProps={{ shrink: true }}
                                            slotProps={{inputLabel: {shrink: true}}}
                                            {...field}
                                            sx={{ mr: 2 , width: "48%"}}
                                            // fullWidth
                                        />
                                    )}
                                />

                                <Controller
                                    name="end_date"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            label="End Date"
                                            type="date"
                                            // InputLabelProps={{ shrink: true }}
                                            slotProps={{inputLabel: {shrink: true}}}
                                            {...field}
                                            sx={{width: "48%"}}
                                            // fullWidth
                                        />
                                    )}
                                />
                            </FormGroup>
                        </Box>

                        <Box sx={{display : "flex", justifyContent: "flex-end"}}>
                        <Button variant="outlined" color="primary" onClick={() => reset()} sx={{mr: 1}}>
                            Clear All
                        </Button>
                        <Button type="submit" variant="contained" color="primary">
                            Apply Filters
                        </Button>
                        </Box>

                        </Stack>
                    {/* </form> */}
                    </Box>
                    </Box>
                </Card>
                </Box>
            </Modal>
            <Box sx={{display : "flex", justifyContent : "space-between", pb: 1}}>
                <Typography variant='h4' component='h1' sx={{fontWeight: "200"}}>Coupons</Typography>
                {/* <Box sx={{ width: "100%", maxWidth: "90%", mb: 2, display: "flex", justifyContent: "flex-end" }}> */}
                <Box>
                    <Button variant='outlined' onClick={handleOpen} startIcon={<FilterAltIcon/>} sx={{mr: 1, py: 0.7}}>Filter</Button>
                    <Button variant='contained' onClick={() => navigate("/admin/coupons/add")}>Add Coupon</Button>
                </Box> 
                {/* </Box> */}
            </Box>
            <Divider sx={{mt: 1, mb: 2}}/>
            <Box sx={{ height: "auto", display: "flex", alignItems:"center", flexDirection: "column"}}>
                {
                    hasFilter ?
                    <Box sx={{display: "flex", justifyContent: "space-between", width: "100%", alignItems: "flex-start"}}>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                            {Object.entries(watchAllFields).map(([key, value]) => {
                                if (!value) return null;
                                return (
                                    <Chip
                                        key={key}
                                        label={getLabel(key, value)}
                                        onDelete={() => {
                                            setValue(key, "")
                                            handleSubmit(handleFilter)()
                                        }}
                                        // deleteIcon={<CloseIcon />}
                                        color="primary"
                                        variant="outlined"
                                    />
                                )
                            })}
                        </Box>
                        <Button variant="outlined" color="primary" onClick={clearFilters} sx={{mr: 1}}>
                            Clear All
                        </Button>
                    </Box>  
                    :
                    null
                }
            {/* <Box sx={{display: "flex", justifyContent: "space-between", width: "100%"}}> */}
            <DataGrid
                sx={{ maxHeight: 690, maxWidth: "100%", mr: 1.5}}
                rows={coupons}
                columns={columns}
                rowCount={totalCoupons}
                onRowClick={handleRowClick}
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
                
            {/* </Box> */}
            </Box>
        </Box>
    )
}

export default AdminCoupons
