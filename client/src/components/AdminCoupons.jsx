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
import CloseIcon from '@mui/icons-material/Close';
import FilterIcon from '@mui/icons-material/FilterList';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import Modal from '@mui/material/Modal';
import Chip from '@mui/material/Chip';
import { alignItems, getValue, Grid, maxHeight, maxWidth, useMediaQuery, useTheme } from '@mui/system';
import Tooltip from '@mui/material/Tooltip';
import { Dialog, DialogActions, DialogContent, DialogTitle, InputLabel, MenuItem, Select } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

function AdminCoupons() {
    const { register, handleSubmit, control, reset, watch, resetField, setValue, formState: {errors} } = useForm({
        defaultValues: {
            search: "",
            discount_type: "any",
            applies_to: "any",
            is_active: "any",
            start_date: null,
            end_date: null
        }
    });
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
    const [activeFilters, setActiveFilters] = useState({
        search: "",
        discount_type: "any",
        applies_to: "any",
        is_active: "any",
        start_date: null,
        end_date: null
    })
    const [hasFilter, setHasFilter] = useState(false);
    const [open, setOpen] = useState(false);
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    const handleOpen = () => setOpen(true);

    const handleClose = (event, reason) => {
        // if (reason === "backdropClick") {
        //     handleSubmit(handleFilter)();
        // }
        setOpen(false);
    }
    const watchAllFields = watch()

    const discountTypeFixed = watch("discount_type_fixed");
    const discountTypePercentage = watch("discount_type_percentage");
    const applyOnProduct = watch("apply_on_product");
    const applyOnCategory = watch("apply_on_category");
    const applyOnCart = watch("apply_on_cart");
    const statusActive = watch("status_active");
    const statusInactive = watch("status_inactive");

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
        boxShadow: 24,
    };

    const getLabel = (key, value) => {
        switch (key) {
            case "discount_type":
                return `Type: ${value}`;
            case "applies_to":
                return `On: ${value}`;
            case "is_active":
                return `Status: ${value === '1' ? "Active" : "Inactive"}`;
            case "start_date":
                return `From: ${dayjs(value).format("DD MMM, YYYY")}`;
            case "end_date":
                return `To: ${dayjs(value).format("DD MMM, YYYY")}`;
            case "search":
                return `Search: ${value}`;
            default:
                return `${key}: ${value}`;
        }
    };

    const clearFilters = () => {
        reset()
        // handleFilter()
        handleSubmit(handleFilter)()
        setHasFilter(false)
    }

    const fetchCoupons = async (page, limit, filters = {}) => {
        setLoading(true);
        setError(null);
        setHasFilter(Object.values(filters).length > 0 ? true : false)

        try {
            const params = new URLSearchParams({page, limit, ...filters})
            // console.log(Object.fromEntries(params));
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

            const result = await response.json()
            setCoupons(result.coupons)
            setTotalCoupons(result.total)
            handleClose()
        } catch (err) {
            console.error(err.message)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    };

    const handleFilter = (data = {}) => {
        // console.log(data);
        setActiveFilters(data)
        const params = new URLSearchParams();

        if (data.search) params.set("search", data.search.trim());

        if (data.discount_type && data.discount_type !== "any"){
            params.set("discount_type", data.discount_type)
        }

        if (data.applies_to && data.applies_to !== "any"){
            params.set("applies_to", data.applies_to)
        }

        if (data.is_active !== "any"){
            params.set("is_active", data.is_active)
        }

        if (data.start_date) params.set("start_date", dayjs(data.start_date).format("YYYY-MM-DD"));
        if (data.end_date) params.set("end_date", dayjs(data.end_date).format("YYYY-MM-DD"));

        fetchCoupons(paginationModel.page + 1, paginationModel.pageSize, Object.fromEntries(params))
    }

    const handleRowClick = (event) => {
        navigate(`/admin/coupons/${event.row.id}`)
    }

    useEffect(() => {
        handleFilter(activeFilters)
    }, [paginationModel]);

    const handlePaginationChange = (newModel) => {
        setPaginationModel(newModel)
        fetchCoupons(newModel.page + 1, newModel.pageSize)
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
        {
            field: 'times_used',
            headerName: 'Coupons Used',
            width: 110,
            editable: false,
            align: "center"
        },
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
        {
            field: 'edit',
            headerName: 'Edit Product',
            width: 110,
            renderCell : (params) => 
            <Tooltip title={params.row.is_active ? "Edit Coupon" : "Inactive, can't edit"}>
            <span>
            <IconButton 
                disabled={!params.row.is_active}
                onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/admin/coupons/${params.id}/edit`)
                }} sx={{p: 0}}
            >
                <EditNoteIcon sx={{fontSize: 35}}></EditNoteIcon>
            </IconButton>
            </span>
            </Tooltip>,
            align: "center"
        }
    ];

    return (
        <Box sx={{ py: 1.5, px: 4, bgcolor: "#EEEEEE", minHeight: "91vh" }}>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                fullScreen={isMobile}
                slotProps={{
                    paper:{
                        sx: {
                            borderRadius: isMobile ? 0 : 3,
                            m: isMobile ? 1 : 2,
                            maxHeight: '90vh',
                            height: "auto"
                        }
                    }
                }}
            >
                <DialogTitle sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    pb: 1,
                    px: { xs: 2, sm: 3 }
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FilterIcon color="primary" />
                        <Typography variant="h6">Filter Coupons</Typography>
                    </Box>
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <Divider />
                <Box component="form" onSubmit={handleSubmit(handleFilter)}>
                    {/* Content */}
                    <DialogContent sx={{ 
                        px: { xs: 2, sm: 3 },
                        py: { xs: 2, sm: 3 }
                    }}>

                        <Stack spacing={3}>
                            <TextField
                                label="Search Coupon (name or code)"
                                variant="outlined"
                                {...register("search")}
                                fullWidth
                            />

                            <Controller
                                name="discount_type"
                                control={control}
                                // defaultValue={"any"}
                                render={({ field }) => (
                                    <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                                        <InputLabel>Discount Type</InputLabel>
                                        <Select {...field} label="Discount Type">
                                            <MenuItem value="fixed">Fixed Amount</MenuItem>
                                            <MenuItem value="percent">Percentage</MenuItem>
                                            <MenuItem value="any">All</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}
                            />

                            <Controller
                                name="applies_to"
                                control={control}
                                // defaultValue={"any"}
                                render={({ field }) => (
                                    <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                                        <InputLabel>Applies on</InputLabel>
                                        <Select {...field} label="Applies on" >
                                            <MenuItem value="all">Cart</MenuItem>
                                            <MenuItem value="product">Products</MenuItem>
                                            <MenuItem value="category">Categories</MenuItem>
                                            <MenuItem value="any">All</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}
                            />

                            <Controller
                                name="is_active"
                                control={control}
                                // defaultValue={"any"}
                                render={({ field }) => (
                                    <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                                        <InputLabel>Coupon Status</InputLabel>
                                        <Select {...field} label="Coupon Status">
                                            <MenuItem value={1}>Active</MenuItem>
                                            <MenuItem value={0}>Inactive</MenuItem>
                                            <MenuItem value="any">All</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}
                            />

                            <Grid container spacing={2}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <Grid size={{xs: 12, md: 6}}>
                                    <Controller
                                        name="start_date"
                                        control={control}
                                        // defaultValue={null}
                                        render={({ field }) => (
                                            <DatePicker
                                                {...field}
                                                label="Start Date"
                                                maxDate={dayjs()}   
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                        size: isMobile ? 'small' : 'medium',
                                                        error: !!errors.start_date,
                                                        helperText: errors.start_date?.message
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid size={{xs: 12, md: 6}}>
                                    <Controller
                                        name="end_date"
                                        control={control}
                                        // defaultValue={null}
                                        // rules={{
                                        //     required: dateOption === 'custom' ? 'End date is required' : false,
                                        //     validate: validateDateRange,
                                        //     min: startDate || dayjs().subtract(10, 'year')
                                        // }}
                                        render={({ field }) => (
                                            <DatePicker
                                                {...field}
                                                label="End Date"
                                                maxDate={dayjs()}
                                                // minDate={startDate}
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                        size: isMobile ? 'small' : 'medium',
                                                        error: !!errors.end_date,
                                                        helperText: errors.end_date?.message
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>
                            </LocalizationProvider>
                            </Grid>
                        </Stack>    
                    </DialogContent>
                    <Divider />
                    <DialogActions sx={{ 
                        p: { xs: 2, sm: 3 },
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 1
                    }}>
                        <Button 
                            onClick={() => reset()}
                            color="primary"
                            variant='outlined'
                            fullWidth={isMobile}
                        >
                            Reset Filters
                        </Button>
                        <Button 
                            type="submit"
                            variant="contained"
                            fullWidth={isMobile}
                            startIcon={<FilterIcon />}
                        >
                            Apply Filters
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            <Modal
                // open={open}
                open={false}
                // onClose={handleClose}
                onClose={false}
            >
                <Box sx={style}>
                    <Card sx={{width: "auto"}}>
                        <Typography sx={{ p: 1, fontSize: "16px", bgcolor: "#3B92CA", color: "white"}}>FILTER COUPONS</Typography>
                        <Box sx={{p: 2}}>
                            <Box component="form" onSubmit={handleSubmit(handleFilter)} sx={{display: "flex", justifyContent: "center"}}>
                                <Stack spacing={2} width={{ lg: 500}}>
                                    <TextField
                                        label="Search Coupon (name or code)"
                                        variant="outlined"
                                        {...register("search")}
                                        fullWidth
                                    />

                                    {/* <FormControl component="fieldset">
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
                                    </FormControl> */}

                                    <Controller
                                        name="discount_type"
                                        control={control}
                                        // defaultValue={"any"}
                                        render={({ field }) => (
                                            <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                                                <InputLabel>Discount Type</InputLabel>
                                                <Select {...field} label="Discount Type">
                                                    <MenuItem value="fixed">Fixed Amount</MenuItem>
                                                    <MenuItem value="percent">Percentage</MenuItem>
                                                    <MenuItem value="any">All</MenuItem>
                                                </Select>
                                            </FormControl>
                                        )}
                                    />

                                    {/* <FormControl component="fieldset">
                                        <FormLabel component="legend">Applies On</FormLabel>
                                        <FormGroup>
                                            <FormControlLabel
                                                control={<Checkbox {...register("apply_on_product")} checked={!!applyOnProduct}/>}
                                                label="Product"
                                            />
                                            <FormControlLabel
                                                control={<Checkbox {...register("apply_on_category")} checked={!!applyOnCategory}/>}
                                                label="Category"
                                            />
                                            <FormControlLabel
                                                control={<Checkbox {...register("apply_on_cart")} checked={!!applyOnCart}/>}
                                                label="Cart"
                                            />
                                        </FormGroup>
                                    </FormControl> */}

                                    <Controller
                                        name="applies_to"
                                        control={control}
                                        // defaultValue={"any"}
                                        render={({ field }) => (
                                            <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                                                <InputLabel>Applies on</InputLabel>
                                                <Select {...field} label="Applies on" >
                                                    <MenuItem value="all">Cart</MenuItem>
                                                    <MenuItem value="product">Products</MenuItem>
                                                    <MenuItem value="category">Categories</MenuItem>
                                                    <MenuItem value="any">All</MenuItem>
                                                </Select>
                                            </FormControl>
                                        )}
                                    />

                                    {/* <FormControl component="fieldset">
                                        <FormLabel component="legend">Status</FormLabel>
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
                                    </FormControl> */}

                                    <Controller
                                        name="is_active"
                                        control={control}
                                        // defaultValue={"any"}
                                        render={({ field }) => (
                                            <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                                                <InputLabel>Coupon Status</InputLabel>
                                                <Select {...field} label="Coupon Status">
                                                    <MenuItem value={1}>Active</MenuItem>
                                                    <MenuItem value={0}>Inactive</MenuItem>
                                                    <MenuItem value="any">All</MenuItem>
                                                </Select>
                                            </FormControl>
                                        )}
                                    />

                                    {/* <Box sx={{display: "flex", justifyContent: "space-between"}}>
                                        <FormGroup row sx={{width: "100%"}}>
                                            <Controller
                                                name="start_date"
                                                control={control}
                                                defaultValue=""
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
                                                defaultValue=""
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
                                    </Box> */}

                                    <Grid container spacing={2}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <Grid size={{xs: 12, md: 6}}>
                                            <Controller
                                                name="start_date"
                                                control={control}
                                                // defaultValue={null}
                                                // rules={{
                                                //     required: dateOption === 'custom' ? 'Start date is required' : false,
                                                //     // validate: validateDateRange,
                                                // }}
                                                render={({ field }) => (
                                                    <DatePicker
                                                        {...field}
                                                        label="Start Date"
                                                        maxDate={dayjs()}   
                                                        slotProps={{
                                                            textField: {
                                                                fullWidth: true,
                                                                size: isMobile ? 'small' : 'medium',
                                                                error: !!errors.start_date,
                                                                helperText: errors.start_date?.message
                                                            }
                                                        }}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid size={{xs: 12, md: 6}}>
                                            <Controller
                                                name="end_date"
                                                control={control}
                                                // defaultValue={null}
                                                // rules={{
                                                //     required: dateOption === 'custom' ? 'End date is required' : false,
                                                //     validate: validateDateRange,
                                                //     min: startDate || dayjs().subtract(10, 'year')
                                                // }}
                                                render={({ field }) => (
                                                    <DatePicker
                                                        {...field}
                                                        label="End Date"
                                                        maxDate={dayjs()}
                                                        // minDate={startDate}
                                                        slotProps={{
                                                            textField: {
                                                                fullWidth: true,
                                                                size: isMobile ? 'small' : 'medium',
                                                                error: !!errors.end_date,
                                                                helperText: errors.end_date?.message
                                                            }
                                                        }}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                    </LocalizationProvider>
                                    </Grid>

                                    <Box sx={{display : "flex", justifyContent: "flex-end"}}>
                                        <Button variant="outlined" color="primary" onClick={() => reset()} sx={{mr: 1}}>
                                            Clear All
                                        </Button>
                                        <Button type="submit" variant="contained" color="primary">
                                            Apply Filters
                                        </Button>
                                    </Box>
                                </Stack>
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
                {hasFilter ?
                    <Box sx={{display: "flex", justifyContent: "space-between", width: "100%", alignItems: "flex-start"}}>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                            {Object.entries(activeFilters).map(([key, value]) => {
                                if (value === undefined || value === null || value === "" || value === "any") return null;
                                return (
                                    <Chip
                                        key={key}
                                        label={getLabel(key, value)}
                                        onDelete={() => {
                                            // setValue(key, "")
                                            resetField(key)
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