import React, { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Box,
    Typography,
    IconButton,
    useTheme,
    useMediaQuery,
    Divider,
    Stack,
    FormHelperText
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { Close as CloseIcon, FilterList as FilterIcon } from '@mui/icons-material'
import dayjs from 'dayjs'

const OrderFilterModal = ({ open, onClose, onApplyFilters, currentFilters = {} }) => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    
    // React Hook Form setup
    const { control, handleSubmit, watch, reset, register, trigger, formState: { errors } } = useForm({
        defaultValues: {
            // orderId: currentFilters.orderId || '',
            dateOption: currentFilters.dateOption || 'last3months',
            startDate: currentFilters.startDate || null,
            endDate: currentFilters.endDate || null,
            status: currentFilters.status || 'All',
            minAmount: currentFilters.minAmount || '',
            maxAmount: currentFilters.maxAmount || '',
            sortBy: currentFilters.sortByDate || 'date',
            orderBy: currentFilters.sortByAmount || 'desc'
        },
        mode: 'onChange'
    })

    // const watchedValues = watch()
    // const { dateOption, startDate, endDate, minAmount, maxAmount, sortBy } = watchedValues
    const watchedValues = watch(["dateOption", "startDate", "endDate", "minAmount", "maxAmount", "sortBy"]);
    const [dateOption, startDate, endDate, minAmount, maxAmount, sortBy] = watchedValues;

    const dateOptions = [
        // { value: '', label: 'Any time' },
        { value: 'last7days', label: 'Last 7 days' },
        { value: 'last3months', label: 'Last 3 months' },
        { value: 'thisYear', label: 'This year' },
        { value: 'custom', label: 'Custom range' }
    ]

    const statusOptions = [
        { value: 'All', label: 'All statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'accepted', label: 'Accepted' },
        { value: 'dispatched', label: 'Dispatched' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' }
    ]

    const validateDateRange = (value) => {
        if (dateOption === 'custom' && startDate && endDate) {
            const start = dayjs(startDate);
            const end = dayjs(endDate);

            // if (start.isAfter(end)) {
            //     return 'Start date cannot be after end date';
            // }

            if (end.isBefore(start)) {
                return 'End date cannot be before start date';
            }

            const diffInMonths = end.diff(start, 'month', true);
            if (diffInMonths > 12) {
                return 'Date range cannot exceed 1 year';
            }
        }
        return true
    }

    const validateMinAmount = (value) => {
        if (value && maxAmount && parseFloat(value) > parseFloat(maxAmount)) {
            return 'Minimum cannot be greater than maximum'
        }
        return true
    }

    const validateMaxAmount = (value) => {
        if (value && minAmount && parseFloat(value) < parseFloat(minAmount)) {
            return 'Maximum cannot be less than minimum'
        }
        return true
    }

    // Form submission
    const onSubmit = (data) => {
        console.log("start",dayjs(data.startDate).format("DD-MM-YYYY HH:mm:ss"));
        console.log("end",dayjs(data.endDate).format("DD-MM-YYYY HH:mm:ss"));
        // Clean up empty values
        console.log(data);
        const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
            if (value !== '' && value !== null) {
                acc[key] = value
            }
            return acc
        }, {})

        console.log(cleanedData);

        onApplyFilters(cleanedData)
        onClose()
    }

    // Clear all filters
    const handleClearAll = () => {
        reset({
            // orderId: '',
            dateOption: 'last3months',
            startDate: null,
            endDate: null,
            status: 'All',
            minAmount: '',
            maxAmount: '',
            sortBy: 'date',
            orderBy: 'desc'
        })
    }

    useEffect(() => {
        if (minAmount) {
            trigger("maxAmount");
        }
    }, [minAmount, trigger]);

    useEffect(() => {
        if (maxAmount) {
            trigger("minAmount");
        }
    }, [maxAmount, trigger]);

    useEffect(() => {
        if (startDate || endDate) {
            trigger("startDate");
            trigger("endDate");
        }
    }, [startDate, endDate, trigger]);

    // useEffect(() => {
    //     if (endDate) {
    //         trigger("startDate");
    //     }
    // }, [endDate, trigger]);

    return (
            <Dialog
                open={open}
                onClose={onClose}
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
                        <Typography variant="h6">Filter Orders</Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <Divider />

                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    {/* Content */}
                    <DialogContent sx={{ 
                        px: { xs: 2, sm: 3 },
                        py: { xs: 2, sm: 3 }
                    }}>
                        <Stack spacing={3}>
                            {/* <Box>
                                <Typography variant="subtitle2" color="text.secondary" sx={{mb: 1}}>
                                    Search Order
                                </Typography>
                                <TextField label="Order ID" type='text' sx={{ width: "100%", mr: 1 }} {...register("orderId", {
                                    pattern: {
                                        value: /^[0-9]{0,}$/,
                                        message: "Invalid Order ID"
                                    },
                                })}
                                    fullWidth
                                    placeholder='Enter Order ID...'
                                    size={isMobile ? 'small' : 'medium'}
                                    error={!!errors.orderId}
                                    helperText={errors.orderId ? errors.orderId.message : ""}
                                />
                            </Box> */}

                            <Box>
                                {/* <Typography variant="subtitle2" color="text.secondary" sx={{mb: 1}}>
                                    Date Range
                                </Typography> */}
                                <Grid container spacing={2}>
                                    <Grid size={{xs: 12}}>
                                        <Controller
                                            name="dateOption"
                                            control={control}
                                            // defaultValue={"last3months"}
                                            render={({ field }) => (
                                                <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                                                    <InputLabel>Date Range</InputLabel>
                                                    <Select 
                                                        {...field} 
                                                        label="Date Range"
                                                        // defaultValue={"last3months"}
                                                    >
                                                        {dateOptions.map((option) => (
                                                            <MenuItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </MenuItem>
                                                        ))}
                                                        {/* <MenuItem value={"last7days"}>Last 7 days</MenuItem>
                                                        <MenuItem value={"last3months"}>Last 3 months</MenuItem>
                                                        <MenuItem value={"thisYear"}>This year</MenuItem>
                                                        <MenuItem value={"custom"}>Custom range</MenuItem> */}
                                                    </Select>
                                                </FormControl>
                                            )}
                                        />
                                    </Grid>

                                    {dateOption === 'custom' && (
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <Grid size={{xs: 12, sm: 6}}>
                                                <Controller
                                                    name="startDate"
                                                    control={control}
                                                    rules={{
                                                        required: dateOption === 'custom' ? 'Start date is required' : false,
                                                        // validate: validateDateRange,
                                                    }}
                                                    render={({ field }) => (
                                                        <DatePicker
                                                            {...field}
                                                            label="Start Date"
                                                            maxDate={dayjs()}
                                                            slotProps={{
                                                                textField: {
                                                                    fullWidth: true,
                                                                    size: isMobile ? 'small' : 'medium',
                                                                    error: !!errors.startDate,
                                                                    helperText: errors.startDate?.message
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </Grid>
                                            <Grid size={{xs: 12, sm: 6}}>
                                                <Controller
                                                    name="endDate"
                                                    control={control}
                                                    rules={{
                                                        required: dateOption === 'custom' ? 'End date is required' : false,
                                                        validate: validateDateRange,
                                                        min: startDate || dayjs().subtract(10, 'year')
                                                    }}
                                                    render={({ field }) => (
                                                        <DatePicker
                                                            {...field}
                                                            label="End Date"
                                                            maxDate={dayjs()}
                                                            minDate={startDate}
                                                            slotProps={{
                                                                textField: {
                                                                    fullWidth: true,
                                                                    size: isMobile ? 'small' : 'medium',
                                                                    error: !!errors.endDate,
                                                                    helperText: errors.endDate?.message
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </Grid>
                                        </LocalizationProvider>
                                    )}
                                </Grid>
                            </Box>

                            <Box>
                                {/* <Typography variant="subtitle2" color="text.secondary" sx={{mb: 1}}>
                                    Order Status
                                </Typography> */}
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                                            <InputLabel>Order Status</InputLabel>
                                            <Select {...field} label="Order Status">
                                                {statusOptions.map((option) => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    )}
                                />
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" sx={{mb: 1}}>
                                    Order Amount ($)
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{xs: 6}}>
                                        <TextField label="Min Amount" type='number' sx={{ width: "100%", mr: 1 }} {...register("minAmount", {
                                            validate: validateMinAmount,
                                            min: { value: 0, message: 'Amount must be positive number' }
                                        })}
                                            slotProps={{
                                                htmlInput: {
                                                    min: 0, 
                                                    step: 0.01
                                                }
                                            }}
                                            fullWidth
                                            size={isMobile ? 'small' : 'medium'}
                                            error={!!errors.minAmount}
                                            helperText={errors.minAmount ? errors.minAmount.message : ""}
                                        />
                                        {/* <Controller
                                            name="minAmount"
                                            control={control}
                                            rules={{
                                                validate: validateMinAmount,
                                                min: { value: 0, message: 'Amount must be positive' }
                                            }}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    fullWidth
                                                    label="Min Amount"
                                                    type="number"
                                                    size={isMobile ? 'small' : 'medium'}
                                                    error={!!errors.minAmount}
                                                    helperText={errors.minAmount?.message}
                                                    // inputProps={{ min: 0, step: 0.01 }}
                                                    slotProps={{
                                                        htmlInput: {
                                                            min: 0, 
                                                            step: 0.01
                                                        }
                                                    }}
                                                />
                                            )}
                                        /> */}
                                    </Grid>
                                    <Grid size={{xs: 6}}>
                                        <TextField label="Max Amount" type='number' sx={{ width: "100%", mr: 1 }} {...register("maxAmount", {
                                            validate: validateMaxAmount,
                                            min: { value: 0, message: 'Amount must be positive number' }
                                        })}
                                            slotProps={{
                                                htmlInput: {
                                                    min: 0, 
                                                    step: 0.01
                                                }
                                            }}
                                            fullWidth
                                            size={isMobile ? 'small' : 'medium'}
                                            error={!!errors.maxAmount}
                                            helperText={errors.maxAmount ? errors.maxAmount.message : ""}
                                        />
                                        {/* <Controller
                                            name="maxAmount"
                                            control={control}
                                            rules={{
                                                validate: validateMaxAmount,
                                                min: { value: 0, message: 'Amount must be positive' }
                                            }}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    fullWidth
                                                    label="Max Amount"
                                                    type="number"
                                                    size={isMobile ? 'small' : 'medium'}
                                                    error={!!errors.maxAmount}
                                                    helperText={errors.maxAmount?.message}
                                                    inputProps={{ min: 0, step: 0.01 }}
                                                />
                                            )}
                                        /> */}
                                    </Grid>
                                </Grid>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" sx={{mb: 1}}>
                                    Sort By
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{xs: 12, sm: 6}}>
                                        <Controller
                                            name="sortBy"
                                            // name="sortByDate"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                                                    <InputLabel>Date</InputLabel>
                                                    <Select {...field} label="Date">
                                                        <MenuItem value="date">Date</MenuItem>
                                                        <MenuItem value="amount">Amount</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={{xs: 12, sm: 6}}>
                                        <Controller
                                            name="orderBy"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                                                    <InputLabel>Amount</InputLabel>
                                                    <Select {...field} label="Amount">
                                                        {/* <MenuItem value="">No sorting</MenuItem> */}
                                                        <MenuItem value="desc">
                                                            {sortBy === "date" ? "Newest First" : "Highest to Lowest"}
                                                        </MenuItem>
                                                        <MenuItem value="asc">
                                                            {sortBy === "date" ? "Oldest First" : "Lowest to Highest"}
                                                        </MenuItem>
                                                    </Select>
                                                </FormControl>
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        </Stack>
                    </DialogContent>

                    <Divider />

                    <DialogActions sx={{ 
                        p: { xs: 2, sm: 3 },
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 1
                    }}>
                        <Button 
                            onClick={handleClearAll}
                            color="primary"
                            variant='outlined'
                            fullWidth={isMobile}
                        >
                            Reset Filters
                        </Button>
                        {/* <Box sx={{ flex: { sm: 1 } }} /> */}
                        {/* <Button 
                            onClick={onClose}
                            color="inherit"
                            fullWidth={isMobile}
                        >
                            Cancel
                        </Button> */}
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
    )
}

export default OrderFilterModal
