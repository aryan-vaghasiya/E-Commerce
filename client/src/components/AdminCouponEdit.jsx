import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router'

function AdminCouponEdit() {

    const { couponId } = useParams()
    const navigate = useNavigate()
    const token = useSelector(state => state.userReducer.token);
    const [originalData, setOriginalData] = useState(null)
    const [editedData, setEditedData] = useState(null)
    const [isActive, setIsActive] = useState(null)
    const [selectedProducts, setSelectedProducts] = useState([])
    const [selectedCategories, setSelectedCategories] = useState([])
    const [options, setOptions] = useState([])
    const [categories, setCategories] = useState([])
    const [query, setQuery] = useState("")
    const [open, setOpen] = useState(false)

    const { register, handleSubmit, control, getValues, reset, watch, setValue, trigger, formState: { errors } } = useForm()

    const discount_on = watch("discount_on")
    const discount_type = watch("discount_type")

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
            if(result.is_active === 1){
                setIsActive(true)
            }
            else{
                setIsActive(false)
            }

            console.log(result);
            setOriginalData(result)
            setEditedData(result)

            reset({
                coupon_name: result.name,
                coupon_code: result.code,
                discount_type: result.discount_type,
                discount_value: result.discount_value,
                discount_limit: result.threshold_amount,
                discount_on: result.applies_to,
                min_cart_value: result.min_cart_value,
                start_time: dayjs(result.start_time),
                end_time: dayjs(result.end_time),
                total_coupons: result.total_coupons ?? "",
                limit_per_user: result.limit_per_user ?? "",
                // for_new_users_only: true
                for_new_users_only: result.for_new_users_only === 1 ? true : false
            });
        }
        catch(err){
            console.error(err.message)
        }
    }

    const fetchCouponProducts = async (page, limit) => {
        // setLoadingProducts(true)
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
            setSelectedProducts(result.products)
            setValue("selected_products", result.products)
            // setTotalProducts(result.totalProducts)
            // setLoadingProducts(false)
        }
        catch(err){
            console.error(err.message)
        }
    }

    const fetchCouponCategories = async () => {
        try{
            const response = await fetch(`http://localhost:3000/admin/coupons/get-categories?couponId=${couponId}`, {
                headers: {
                    Authorization : `Bearer ${token}`
                }
            })

            if(!response.ok){
                const error = await response.json()
                return console.log(error)
            }

            const result = await response.json()
            console.log(result);
            setSelectedCategories(result)
            setValue("selected_categories", result)
            // setTotalProducts(result.totalProducts)
            // setLoadingProducts(false)
        }
        catch(err){
            console.error(err.message)
        }
    }

    const searchProduct = async () => {
        const price = discount_type === "fixed"? getValues("discount_value") : null
        // console.log(price);
        
        try{
            console.log(query);
            
            const response = await fetch(`http://localhost:3000/admin/coupons/search-product?query=${query}&price=${price}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errData = await response.json();
                console.error("Could not fetch Products Data:", errData);
                console.error("Could not fetch Products Data:", errData.error);
                return
            }

            const result = await response.json();
            // console.log(result);
            setOptions(result)
        }
        catch(err){
            console.error(err.message)
        }
    }

    const editCoupon = async (formData) => {
        // if(formData.end_time < dayjs()){
        //     console.error("End date cant be today");
            
        // }
        // console.log(dayjs(formData.end_time) > dayjs(originalData.end_time));

        const sTime = dayjs(formData.start_time).format(`YYYY-MM-DD HH:mm:ss`)
        const eTime = dayjs(formData.end_time).format(`YYYY-MM-DD HH:mm:ss`)

        formData.start_time = sTime
        formData.end_time = eTime
        console.log(formData);

        try{
            const response = await fetch("http://localhost:3000/admin/coupons/edit", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({...formData, id: originalData.id})
            })
    
            if(!response.ok){
                const error = await response.json()
                console.log(error.error);
            }
            if(response.ok){
                navigate("/admin/coupons")
            }
        }
        catch(err){
            console.error(err);
        }
    }

    const handleClickOpen = () => {
        // console.log(productId);
        // setToDelete(productId)
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        // setToDelete(null)
    };

    const deactivateCoupon = async () => {
        console.log("I ran");

        try{
            const response = await fetch("http://localhost:3000/admin/coupons/deactivate", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({couponId: originalData.id})
            })
    
            if(!response.ok){
                const error = await response.json()
                console.log(error.error);
            }
            if(response.ok){
                navigate("/admin/coupons")
            }
        }
        catch(err){
            console.error(err);
        }
    }

    useEffect(() => {
        fetchCoupon()
        fetchCouponProducts(1, 1000)
        fetchCouponCategories()
    },[])

    useEffect(() => {
        const searchDelay = setTimeout(() => {
            if (!query?.length >= 2) return setOptions([])
            searchProduct()
            // console.log(selectedProducts);            
        }, 1000);
        return () => clearTimeout(searchDelay);
    }, [query]);

    return (
        <Box sx={{ py: 1.5, px: 4, bgcolor: "#EEEEEE", minHeight: "91vh" }}>
            {
                // !originalData || !isActive ?
                !originalData ?
                <Typography>Can't edit, coupon is currently active</Typography>
                :
                <Box>
                    <Dialog
                        open={open}
                        onClose={handleClose}
                        // aria-labelledby="alert-dialog-title"
                        // aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">
                        {"Deactivate Coupon ?"}
                        </DialogTitle>
                        <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            This coupon offer will be ended now, and could no longer be edited.
                        </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose} color='error'>No</Button>
                            <Button onClick={deactivateCoupon} autoFocus>Yes</Button>
                        </DialogActions>
                    </Dialog>
                <Card sx={{ display: "flex", justifyContent: "center", p: 2, width: "80%", maxWidth: 750, mx: "auto", py: 7}}>
                    <form key={editedData?.id || "loading"} onSubmit={handleSubmit(editCoupon)} noValidate>
                        <Stack spacing={3} width={{ lg: 600, md: 500, xs: 300}}>
                            <TextField label="Coupon Name" type='text' sx={{ width: "100%", mr: 1 }} {...register("coupon_name", {
                                required: {
                                    value: true,
                                    message: "Coupon Name is required"
                                },
                                pattern: {
                                    value: /^.{5,}$/,
                                    message: "Coupon Name must be 5 or more characters"
                                },
                                })}
                                error={!!errors.coupon_name}
                                helperText={errors.coupon_name ? errors.coupon_name.message : ""}
                                disabled={true}
                            />
                            <TextField label="Coupon Code" type='text' sx={{ width: "100%", mr: 1 }} {...register("coupon_code", {
                                required: {
                                    value: true,
                                    message: "Coupon Code is required"
                                },
                                pattern: {
                                    value: /^.{5,}$/,
                                    message: "Coupon Code must be 5 or more characters"
                                },
                                })}
                                error={!!errors.coupon_code}
                                helperText={errors.coupon_code ? errors.coupon_code.message : ""}
                                disabled={true}
                            />

                            <FormControl fullWidth error={!!errors.discount_type}>
                                <InputLabel id="discount_type">Discount Type</InputLabel>
                                <Controller
                                    name="discount_type"
                                    control={control}
                                    rules={{ required: "Discount Type is required" }}
                                    render={({field}) => (
                                        <Select
                                            {...field}
                                            labelId="discount_type"
                                            label="Discount Type"
                                            value={field.value ?? ""}
                                            disabled={true}
                                        >
                                            <MenuItem value={"percent"}>Percentage</MenuItem>
                                            <MenuItem value={"fixed"}>Fixed Amount</MenuItem>
                                        </Select>
                                    )}
                                />
                                {errors.discount_type && <FormHelperText>{errors.discount_type.message}</FormHelperText>}
                            </FormControl>

                            <TextField label="Discount Value" type='text' sx={{ width: "100%", mr: 1 }} {...register("discount_value", {
                                required: {
                                    value: true,
                                    message: "Discount Value is required"
                                },
                                pattern: {
                                    value: /^[0-9]{0,}$/,
                                    message: "Discount Value must be in digits only"
                                }
                            })}
                                error={!!errors.discount_value}
                                helperText={errors.discount_value ? errors.discount_value.message : ""}
                                onChange={() => setSelectedProducts([])}
                                disabled={true}
                            />
                            <TextField label="Discount Limit ($)" type='text' sx={{ width: "100%", mr: 1 }} {...register("discount_limit", {
                                pattern: {
                                    value: /^[0-9]{0,}$/,
                                    message: "Discount Limit must be in digits only"
                                }
                            })}
                                error={!!errors.discount_limit}
                                helperText={errors.discount_limit ? errors.discount_limit.message : "Leave Empty for no limit"}
                                disabled={true}
                            />

                            <FormControl fullWidth error={!!errors.discount_on}>
                            <InputLabel id="discount_on">Discount On</InputLabel>
                            <Controller
                                name="discount_on"
                                control={control}
                                rules={{ required: "Discount On is required" }}
                                render={({field}) => (
                                    <Select
                                        {...field}
                                        labelId="discount_on"
                                        label="Discount On"
                                        value={field.value ?? ""}
                                        disabled={true}
                                    >
                                        <MenuItem value={"product"}>Individual Product</MenuItem>
                                        <MenuItem value={"all"}>Cart Value</MenuItem>
                                        <MenuItem value={"category"}>Category</MenuItem>
                                    </Select>
                                )}
                            />
                            {errors.discount_on && <FormHelperText>{errors.discount_on.message}</FormHelperText>}
                            </FormControl>

                            {
                                // data && data.applies_to === "product" && discount_on === "product"?
                                discount_on === "product"?
                                <Box>
                                    <Typography sx={{pb: 1.5}}>Select Product(s):</Typography>
                                    <Controller
                                        control={control}
                                        name="selected_products"
                                        // rules={{ required: "At least one product must be selected" }}
                                        rules={{
                                            validate: (value) => (value?.length > 0 ? true : "Select at least one product"),
                                        }}
                                        defaultValue={[]}
                                        render={({ field : {onChange, value} }) => (
                                            <Autocomplete
                                                disabled={true}
                                                multiple
                                                options={options}
                                                getOptionLabel={(option) => option.title || ""}
                                                filterSelectedOptions
                                                onInputChange={(e, newInputValue) => {
                                                    setQuery(newInputValue)
                                                }}
                                                // onInputChange={(event, newInputValue) => setQuery(newInputValue)}
                                                // onChange={(event, value) => setSelectedProducts(value)}
                                                onChange={(event, newValue) => {
                                                    setSelectedProducts(newValue)
                                                    onChange(newValue)
                                                }}
                                                value={selectedProducts}
                                                isOptionEqualToValue={(option, val) => option.id === val.id}
                                                renderValue={() => null}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        // {...field}
                                                        label="Search & Select Products" 
                                                        variant="outlined"
                                                        error={!!errors.selected_products}
                                                        helperText={
                                                            errors.selected_products ? 
                                                            errors.selected_products.message :
                                                            discount_type === "fixed" ? "Products with price more than "+getValues("discount_value") : ""}
                                                    />
                                                )}
                                            />
                                        )}
                                    />
                                    {selectedProducts?.length > 0 && (
                                        <Box sx={{mt: 2}}>
                                        {/* <Box sx={{maxHeight: 100, overflow: "auto", border: 1, mt: 2}}> */}
                                            {selectedProducts.map((product) => (
                                            <Chip
                                                disabled={true}
                                                key={product.id}
                                                label={`id: ${product.id}, Title: ${product.title}`}
                                                onDelete={() => {
                                                    const updated = selectedProducts.filter(p => p.id !== product.id);
                                                    setSelectedProducts(updated);
                                                    setValue('selected_products', updated);
                                                }}
                                                sx={{ m: 0.5 }}
                                            />
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                                :
                                discount_on === "category"?
                                        <Box>
                                            <Controller
                                                control={control}
                                                name="selected_category"
                                                rules={{ required: "Category is required" }}
                                                // rules={{
                                                //     required: "Category is required",
                                                //     validate: (value) => {
                                                //     // Ensure selected value is in the categories list
                                                //     if (!value) return "Category is required";
                                                //     const isValid = categories.some((c) => c.id === value.id);
                                                //     return isValid || "Please select a valid category";
                                                //     }
                                                // }}
                                                defaultValue={[]}
                                                render={({ field: { onChange, value } }) => (
                                                    <Autocomplete
                                                        disabled={true}
                                                        multiple
                                                        // freeSolo
                                                        options={categories}
                                                        // getOptionLabel={(option) =>
                                                        //     typeof option === "string" ? option : option.category || ""
                                                        // }
                                                        getOptionLabel={(option) => option.category || ""}
                                                        filterSelectedOptions
                                                        isOptionEqualToValue={(option, val) => option.id === val.id}
                                                        value={selectedCategories}
                                                        disableClearable
                                                        freeSolo={false}
                                                        renderValue={() => null}
                                                        // onInputChange={(event, newInputValue) => {
                                                        //     onChange({ id: null, category: newInputValue });
                                                        // }}
                                                        onChange={(event, newValue) => {
                                                            setSelectedCategories(newValue)
                                                            // console.log(selectedCategories);
                                                            
                                                            onChange(newValue);
                                                        }}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                label="Search & Select Category"
                                                                variant="outlined"
                                                                // inputProps={{
                                                                //     ...params.inputProps,
                                                                //     readOnly: true,
                                                                // }}
                                                                error={!!errors.category}
                                                                helperText={
                                                                    errors.category
                                                                    ? errors.category.message
                                                                    : "Please select a category from the list"
                                                                }
                                                            />
                                                        )}
                                                    />
                                                )}
                                            />
                                            {selectedCategories?.length > 0 && (
                                                <Box mt={2}>
                                                    {selectedCategories.map((category) => (
                                                    <Chip
                                                        disabled={true}
                                                        key={category.id}
                                                        label={`id: ${category.id}, Title: ${category.category}`}
                                                        onDelete={() => {
                                                            const updated = selectedCategories.filter(p => p.id !== category.id);
                                                            setSelectedCategories(updated);
                                                            setValue('category', updated);
                                                        }}
                                                        sx={{ m: 0.5 }}
                                                    />
                                                    ))}
                                                </Box>
                                            )}
                                        </Box>
                                :
                                null
                            }
                                        

                            <TextField label="Minimum Cart Value ($)" type='text' sx={{ width: "100%", mr: 1 }} {...register("min_cart_value", {
                                    // required: {
                                    //     value: true,
                                    //     message: "Cart Value is required"
                                    // },
                                    pattern: {
                                        value: /^[0-9]+$/,
                                        message: "Cart Value must be in digits only"
                                    },
                                })}
                                error={!!errors.min_cart_value}
                                helperText={errors.min_cart_value ? errors.min_cart_value.message : ""}
                                disabled={true}
                            />

                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DemoContainer
                                components= {[
                                    'DatePicker'
                                    ]}
                                >
                                <DemoItem label="Start date">
                                    <Controller
                                        control={control}
                                        // defaultValue={dayjs().startOf('day')}
                                        name="start_time"
                                        rules={{ required: "Start Date is required" }}
                                        render={({ field }) => (
                                            <DatePicker
                                                readOnly
                                                // disabled={true}
                                                // disablePast
                                                value={field.value}
                                                inputRef={field.ref}
                                                onChange={(date) => {
                                                    field.onChange(date);
                                                }}
                                            />
                                        )}
                                    />
                                </DemoItem>
                                <DemoItem label="End date">
                                    <Controller
                                        control={control}
                                        // defaultValue={dayjs().startOf('day').add(1, 'day')}
                                        name="end_time"
                                        // rules={{ required: "End Date is required" }}
                                        rules={{
                                                validate: (value) => (dayjs(value) >= dayjs() ? true : `Date can't be less than today (> ${dayjs().format("MM/DD/YYYY")})`),
                                            }}
                                        render={({ field, fieldState }) => (
                                            <DatePicker
                                                disablePast
                                                value={field.value}
                                                inputRef={field.ref}
                                                onChange={(date) => {
                                                    field.onChange(date);
                                                }}
                                                slotProps={{
                                                    textField: {
                                                        error: !!fieldState.error,
                                                        helperText: fieldState.error ? fieldState.error.message : null
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                </DemoItem>
                                </DemoContainer>
                            </LocalizationProvider>

                            <TextField label="Total Coupons" type='text' sx={{ width: "100%", mr: 1 }} {...register("total_coupons", {
                                pattern: {
                                    value: /^[0-9]{0,}$/,
                                    message: "Total must be in digits only"
                                },
                                validate: (value) => {
                                    if(value === "") return true
                                    return parseInt(value, 10) >= originalData.times_used + 5
                                        ? true
                                        : `Total Coupons can't be less than Coupons Used (${originalData.times_used}) + 5 (≥ ${originalData.times_used + 5})`;
                                }
                            })}
                                error={!!errors.total_coupons}
                                helperText={errors.total_coupons ? errors.total_coupons.message : "Leave empty for Unlimited"}
                            />

                            <TextField label="Limit per Customer" type='text' sx={{ width: "100%", mr: 1 }} {...register("limit_per_user", {
                                pattern: {
                                    value: /^[0-9]{0,}$/,
                                    message: "Limit must be in digits only"
                                },
                                validate: (value) => {
                                    if(value === "") return true
                                    return parseInt(value, 10) >= originalData.limit_per_user
                                        ? true
                                        : `Limit can only be increased (≥ ${originalData.limit_per_user})`;
                                }
                            })}
                                disabled={true}
                                error={!!errors.limit_per_user}
                                helperText={errors.limit_per_user ? errors.limit_per_user.message : "Leave empty for Unlimited"}
                            />

                            <FormControlLabel
                                control={<Checkbox {...register("for_new_users_only")}
                                checked={watch("for_new_users_only") || false}/>}
                                label="For New Users Only"
                                disabled={true}
                            />

                            <Box sx={{display: "flex",justifyContent: "space-between"}}>
                                {
                                    editedData && editedData.is_active ?
                                    <Button variant="contained" color='error' sx={{width: "100%", mr: 2}} onClick={handleClickOpen}>Deactivate</Button>
                                    :
                                    null
                                }
                                <Button type="submit" variant="contained" sx={{width: "100%"}}>Edit Coupon</Button>
                            </Box>
                        </Stack>
                    </form>
                </Card>
                </Box>
            }
        </Box>
    )
}

export default AdminCouponEdit
