import Autocomplete from "@mui/material/Autocomplete"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import FormControl from "@mui/material/FormControl"
import FormHelperText from "@mui/material/FormHelperText"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker"
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import dayjs from "dayjs"
import React, { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useSelector } from "react-redux"
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigate } from "react-router"
import CloseIcon from '@mui/icons-material/Close';
import Chip from "@mui/material/Chip"

function AdminCouponsAdd() {

    const token = useSelector(state => state.userReducer.token);
    const { register, handleSubmit, control, getValues, reset, watch, setValue, trigger, formState: { errors } } = useForm({
        mode: "onChange",
        reValidateMode: "onChange"
    })
    const navigate = useNavigate()

    const [query, setQuery] = useState("");
    const [options, setOptions] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [currentStep, setCurrentStep] = useState(1);

    // const searchQuery = watch('product_query');
    const discount_type = watch("discount_type")
    const discount_value = watch("discount_value")
    const discount_on = watch("discount_on")
    // console.log(end_time);
    const dynamicLabel = discount_type === "percent" ? "Discount Value (%)" : "Discount Value ($)"

    const nextStep = () => {
        setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
    };

    const stepValidationFields = {
        1: ["coupon_name", "coupon_code"],
        2: ["discount_type", "discount_value", "discount_limit"],
        3: ["discount_on", "selected_products", "min_cart_value"],
        4: ["start_time", "end_time", "total_coupons","limit_per_user"],
    };

    const handleStepValidation = async () => {
        const fields = stepValidationFields[currentStep] || [];
        const validated = await trigger(fields);
        if (validated) nextStep();
    };

    const searchProduct = async () => {
        const price = discount_type === "fixed"? getValues("discount_value") : null
        // console.log(price);
        
        try{
            // console.log(query);
            
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

    useEffect(() => {
        const searchDelay = setTimeout(() => {
            if (!query?.length >= 2) return setOptions([])
            searchProduct()
            // console.log(selectedProducts);            
        }, 1000);

        return () => clearTimeout(searchDelay);
    }, [query]);

    const addCoupon = async (couponData) => {

        const sTime = dayjs(couponData.start_time).format(`YYYY-MM-DD HH:mm:ss`)
        const eTime = dayjs(couponData.end_time).format(`YYYY-MM-DD HH:mm:ss`)
        
        // console.log(sTime, eTime);
        couponData.start_time = sTime
        couponData.end_time = eTime
        console.log(couponData);

        const response = await fetch("http://localhost:3000/admin/coupons/add", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(couponData)
        })

        if(!response.ok){
            const error = await response.json()
            console.log(error.error);
            if(error.error === "This Code is already Active"){
                setCurrentStep(1)
            }
        }
        else{
            navigate("/admin/coupons")
        }
    }

    return (
        <Box sx={{ py: 6, px: 4, bgcolor: "#EEEEEE", minHeight: "91vh",}}>
            <Card sx={{ display: "flex", justifyContent: "center", p: 2, width: "80%", maxWidth: 750, mx: "auto", py: 7}}>
                <form onSubmit={handleSubmit(addCoupon)} noValidate>
                    <Stack spacing={3} width={{ lg: 600, md: 500, xs: 300}}>
                        {
                            currentStep === 1?
                            <Box>
                                <Stack spacing={4}>
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
                                />
                                <Box sx={{display: "flex", justifyContent: "space-between"}}>
                                    <Button color="error" onClick={() => navigate("/admin/coupons")} variant="outlined">Cancel</Button>
                                    <Button 
                                        onClick={handleStepValidation} 
                                        endIcon={<NavigateNextIcon/>} 
                                        variant="outlined"
                                    >
                                        Next
                                    </Button>
                                    {/* <Button 
                                        onClick={async() => {
                                                    const validated = await trigger(["coupon_name", "coupon_code"])
                                                    if(!validated) return
                                                    nextStep()
                                                }} 
                                        endIcon={<NavigateNextIcon/>} 
                                        variant="outlined">
                                            Next
                                    </Button> */}
                                </Box>
                                </Stack>
                            </Box>
                            :
                            null
                        }

                        {
                            currentStep === 2?
                            <Box>
                                <Stack spacing={4}>
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
                                            >
                                                <MenuItem value={"percent"}>Percentage</MenuItem>
                                                <MenuItem value={"fixed"}>Fixed Amount</MenuItem>
                                            </Select>
                                        )}
                                    />
                                    {errors.discount_type && <FormHelperText>{errors.discount_type.message}</FormHelperText>}
                                </FormControl>

                                <TextField label={dynamicLabel} type='text' sx={{ width: "100%", mr: 1 }} {...register("discount_value", {
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
                                />

                                {
                                    discount_type === "percent"?
                                    <TextField label="Discount Limit ($)" type='text' sx={{ width: "100%", mr: 1 }} {...register("discount_limit", {
                                        pattern: {
                                            value: /^[0-9]{0,}$/,
                                            message: "Discount Limit must be in digits only"
                                        }
                                    })}
                                        error={!!errors.discount_limit}
                                        helperText={errors.discount_limit ? errors.discount_limit.message : "Leave Empty for no limit"}
                                    />
                                    :
                                    null
                                }
                                <Box sx={{display: "flex", justifyContent: "space-between"}}>
                                    <Button onClick={() => prevStep()} startIcon={<NavigateBeforeIcon/>} variant="outlined">Back</Button>
                                    <Button 
                                        onClick={handleStepValidation} 
                                        endIcon={<NavigateNextIcon/>} 
                                        variant="outlined"
                                    >
                                        Next
                                    </Button>
                                </Box>
                                </Stack>
                            </Box>
                            :
                            null
                        }

                        {
                            currentStep === 3 ?
                            <Box>
                                <Stack spacing={4}>
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
                                        >
                                            <MenuItem value={"product"}>Individual Product</MenuItem>
                                            <MenuItem value={"all"}>Cart Value</MenuItem>
                                        </Select>
                                    )}
                                />
                                {errors.discount_on && <FormHelperText>{errors.discount_on.message}</FormHelperText>}
                                </FormControl>

                                {
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
                                            <Box mt={2}>
                                                {selectedProducts.map((product) => (
                                                <Chip
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
                                    <Box>
                                        <TextField label="Minumum Cart Value ($)" type='text' sx={{ width: "100%", mr: 1 }} {...register("min_cart_value", {
                                            required: {
                                                value: true,
                                                message: "Cart Value is required"
                                            },
                                            pattern: {
                                                value: /^[0-9]+$/,
                                                message: "Cart Value must be in digits only"
                                            },
                                            validate: (value) => {
                                                if (discount_type === "fixed" && parseFloat(value) <= parseFloat(discount_value)) {
                                                    return "Minimum cart value must be greater than the discount amount";
                                                }
                                                return true;
                                            }
                                        })}
                                            error={!!errors.min_cart_value}
                                            helperText={errors.min_cart_value ? errors.min_cart_value.message : ""}
                                        />
                                    </Box>
                                }
                                <Box sx={{display: "flex", justifyContent: "space-between"}}>
                                    <Button onClick={() => prevStep()} startIcon={<NavigateBeforeIcon/>} variant="outlined">Back</Button>
                                    <Button 
                                        onClick={handleStepValidation} 
                                        endIcon={<NavigateNextIcon/>} 
                                        variant="outlined"
                                    >
                                        Next
                                    </Button>                                    
                                </Box>
                                </Stack>
                            </Box>
                            :
                            null
                        }

                        {
                            currentStep === 4 ?
                            <Box>
                                <Stack spacing={4}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer
                                    components= {[
                                        'DatePicker'
                                        ]}
                                    >
                                    <DemoItem label="Start date">
                                        <Controller
                                            control={control}
                                            defaultValue={dayjs().startOf('day')}
                                            name="start_time"
                                            rules={{ required: "Start Date is required" }}
                                            render={({ field }) => (
                                                <DatePicker
                                                    disablePast
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
                                            defaultValue={dayjs().startOf('day').add(1, 'day')}
                                            name="end_time"
                                            rules={{ required: "End Date is required" }}
                                            render={({ field }) => (
                                                <DatePicker
                                                    disablePast
                                                    value={field.value}
                                                    inputRef={field.ref}
                                                    onChange={(date) => {
                                                        field.onChange(date);
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
                                    }
                                })}
                                    error={!!errors.total_coupons}
                                    helperText={errors.total_coupons ? errors.total_coupons.message : "Leave empty for Unlimited"}
                                />

                                <TextField label="Limit per Customer" type='text' sx={{ width: "100%", mr: 1 }} {...register("limit_per_user", {
                                    pattern: {
                                        value: /^[0-9]{0,}$/,
                                        message: "Limit must be in digits only"
                                    }
                                })}
                                    error={!!errors.limit_per_user}
                                    helperText={errors.limit_per_user ? errors.limit_per_user.message : "Leave empty for Unlimited"}
                                />

                                <Box sx={{display: "flex", justifyContent: "space-between"}}>
                                    <Button onClick={() => prevStep()} startIcon={<NavigateBeforeIcon/>} variant="outlined">Back</Button>
                                    <Button type="submit" variant="contained">Add Coupon</Button>
                                </Box>
                                
                                </Stack>
                            </Box>
                            :
                            null
                        }
                    </Stack>
                </form>
            </Card>
        </Box>
    )
}

export default AdminCouponsAdd
