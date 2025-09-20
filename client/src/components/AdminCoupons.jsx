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
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import { Controller, useForm } from 'react-hook-form';
import FormControl from '@mui/material/FormControl';
import dayjs from 'dayjs';
import CloseIcon from '@mui/icons-material/Close';
import FilterIcon from '@mui/icons-material/FilterList';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import Chip from '@mui/material/Chip';
import { Grid, useMediaQuery, useTheme } from '@mui/system';
import Tooltip from '@mui/material/Tooltip';
import { Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, InputLabel, MenuItem, Select } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ClearIcon from '@mui/icons-material/Clear';

function AdminCoupons() {
    const { register, handleSubmit, control, reset, watch, resetField, formState: {errors} } = useForm({
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
    const [filterParams, setFilterParams] = useState({});
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    const startDate = watch("start_date")
    const endDate = watch("end_date")

    const handleOpen = () => setOpen(true);

    const handleClose = (event, reason) => {
        setOpen(false);
    }

    const getDisplayFilter = (name) => {
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }

    const getLabel = (key, value) => {
        // console.log(key, value);
        switch (key) {
            case "discount_type":
                return `Discount Type: ${getDisplayFilter(value)}`;
            case "applies_to":
                return `Applies On: ${value === "all" ? "Cart" : getDisplayFilter(value)}`;
            case "is_active":
                return `Coupon Status: ${value ? "Active" : "Inactive"}`;
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

    const buildFilterParams = (data) => {
        const params = new URLSearchParams();

        if (data.search) {
            params.set("search", data.search.trim())
        }

        if (data.discount_type && data.discount_type !== "any"){
            params.set("discount_type", data.discount_type)
        }

        if (data.applies_to && data.applies_to !== "any"){
            params.set("applies_to", data.applies_to)
        }

        if (data.is_active !== "any" && (data.is_active === 1 || data.is_active === 0)){
            params.set("is_active", data.is_active)
        }

        if (data.start_date) {
            params.set("start_date", dayjs(data.start_date).format("YYYY-MM-DD"))
        }

        if (data.end_date) {
            params.set("end_date", dayjs(data.end_date).format("YYYY-MM-DD"))
        }

        return Object.fromEntries(params) 
    };

    const handleFilter = (filters = {}) => {
        console.log(filters);
        setActiveFilters(filters)

        setFilterParams(buildFilterParams(filters))
        // console.log(buildFilterParams(filters));
        setPaginationModel(prev => ({ ...prev, page: 0 }))
    }

    const handleRowClick = (event) => {
        navigate(`/admin/coupons/${event.row.id}`)
    }

    useEffect(() => {
        fetchCoupons(paginationModel.page + 1, paginationModel.pageSize, filterParams)
    }, [paginationModel, filterParams]);

    const handlePaginationChange = (newModel) => {
        setPaginationModel(newModel)
    };

    const validateDateRange = (value) => {
        if (startDate && endDate) {
            const start = dayjs(startDate);
            const end = dayjs(endDate);
            if (end.isBefore(start)) {
                return 'End date cannot be before start date';
            }
        }
        return true
    }

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
                                            rules={{
                                                // required: endDate ? 'Start date is required' : false,
                                            }}
                                            render={({ field }) => (
                                                <Box sx={{ position: 'relative' }}>
                                                    <DatePicker
                                                        {...field}
                                                        label="Start Date"
                                                        maxDate={endDate || dayjs()}
                                                        disableHighlightToday
                                                        slotProps={{
                                                            textField: {
                                                                fullWidth: true,
                                                                size: isMobile ? 'small' : 'medium',
                                                                error: !!errors.start_date,
                                                                helperText: errors.start_date?.message,
                                                                onKeyDown: (e) => {
                                                                    if (e.key !== 'Tab') {
                                                                        e.preventDefault();
                                                                    }
                                                                },
                                                                onPaste: (e) => {
                                                                    e.preventDefault();
                                                                }
                                                            }
                                                        }}
                                                    />
                                                    {field.value && (
                                                        <IconButton
                                                            onClick={() => field.onChange(null)}
                                                            size="small"
                                                            sx={{
                                                                position: 'absolute',
                                                                right: 40,
                                                                top: '50%',
                                                                transform: 'translateY(-50%)',
                                                                zIndex: 1
                                                            }}
                                                        >
                                                            <ClearIcon fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                </Box>
                                            )}
                                        /> 
                                    </Grid>
                                    <Grid size={{xs: 12, md: 6}}>
                                        <Controller
                                            name="end_date"
                                            control={control}
                                            rules={{
                                                // required: startDate ? 'End date is required' : false,
                                                validate: validateDateRange,
                                                min: startDate || dayjs().subtract(10, 'year')
                                            }}
                                            render={({ field }) => (
                                                <Box sx={{ position: 'relative' }}>
                                                    <DatePicker
                                                        {...field}
                                                        label="End Date"
                                                        maxDate={dayjs()}
                                                        minDate={startDate}
                                                        disableHighlightToday
                                                        slotProps={{
                                                            textField: {
                                                                fullWidth: true,
                                                                size: isMobile ? 'small' : 'medium',
                                                                error: !!errors.end_date,
                                                                helperText: errors.end_date?.message,
                                                                onKeyDown: (e) => {
                                                                    if (e.key !== 'Tab') {
                                                                        e.preventDefault();
                                                                    }
                                                                },
                                                                onPaste: (e) => {
                                                                    e.preventDefault();
                                                                }
                                                            }
                                                        }}
                                                    />
                                                    {field.value && (
                                                        <IconButton
                                                            onClick={() => field.onChange(null)}
                                                            size="small"
                                                            sx={{
                                                                position: 'absolute',
                                                                right: 40,
                                                                top: '50%',
                                                                transform: 'translateY(-50%)',
                                                                zIndex: 1
                                                            }}
                                                        >
                                                            <ClearIcon fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                </Box>
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

            <Box sx={{display : "flex", justifyContent : "space-between", pb: 1}}>
                <Typography variant='h4' component='h1' sx={{fontWeight: "200"}}>Coupons</Typography>
                <Box>
                    <Button variant='outlined' onClick={handleOpen} startIcon={<FilterAltIcon/>} sx={{mr: 1, py: 0.7}}>Filter</Button>
                    <Button variant='contained' onClick={() => navigate("/admin/coupons/add")}>Add Coupon</Button>
                </Box> 
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
                                            resetField(key)
                                            handleSubmit(handleFilter)()
                                        }}
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
                disableRowSelectionOnClick
            />
            </Box>
        </Box>
    )
}

export default AdminCoupons