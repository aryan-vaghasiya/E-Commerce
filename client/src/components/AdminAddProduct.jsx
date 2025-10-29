import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CancelIcon from '@mui/icons-material/Cancel';
import IconButton from '@mui/material/IconButton'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormHelperText from '@mui/material/FormHelperText'
import { useEffect } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { hideSnack, showSnack } from '../redux/snackbar/snackbarActions'

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

function AdminAddProduct() {

    const token = useSelector(state => state.userReducer.token)
    const snackbarState = useSelector(state => state.snackbarReducer)
    const { register, handleSubmit, control, trigger, watch, setValue, formState: { errors } } = useForm({})
    const [thumbnailPreview, setThumbnailPreview] = useState(null)
    const [imagesPreview, setImagesPreview] = useState([])
    const navigate = useNavigate()
    const [inputMrp, inputPrice] = watch(["mrp", "price"])
    const [categories, setCategories] = useState([])
    const dispatch = useDispatch()

    const getAllCategories = async () => {
        try{
            const response = await fetch(`http://localhost:3000/admin/product/categories`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
    
            if(!response.ok){
                const error = await response.json()
                return console.error(error.error);
            }
            const categories = await response.json()
            setCategories(categories)
        }
        catch(err){
            console.error(err);
        }
    }

    useEffect(() => {
        const mrp = parseFloat(inputMrp)
        const price = parseFloat(inputPrice)

        // const percentage = ((parseFloat((parseFloat(inputPrice)/parseFloat(inputMrp)).toFixed(2)) * 100) - 100) * -1
        const percentage = ((mrp - price)/mrp) * 100
        setValue("discount", (percentage).toFixed(2) || 0.00)

        // if(mrp && price > mrp){
        //     trigger("price")
        // }
        if(mrp && price){
            trigger("price")
        }
    }, [inputMrp, inputPrice])

    useEffect(() => {
        getAllCategories()
    }, [])

    const submitProduct = async (data) => {
        console.log(data);
        if(!thumbnailPreview){
            dispatch(showSnack({message: "Thumbnail is required", severity: "warning"}))
            console.error("Thumbnail is required");
            return
        }
        if(imagesPreview.length < 1){
            dispatch(showSnack({message: "At least 1 Product Image is required", severity: "warning"}))
            console.error("At least 1 Product Image is required");
            return
        }

        try{
            const res = await fetch(`http://localhost:3000/admin/product/add`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            let productId;
            if(res.ok){
                productId = await res.json()
            }
            else{
                return console.error("Could not add Details")
            }

            const formDataThumb = new FormData()
            const thumbnailFile = thumbnailPreview.file
            formDataThumb.append('thumbnail', thumbnailFile)

            const thumbUpload = await fetch(`http://localhost:3000/admin/upload/product-thumbnail/${productId}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    // "Content-Type": "multipart/form-data"
                },
                body: formDataThumb
            })

            const formDataImages = new FormData()
            const imagesFiles = imagesPreview.map(item => item.file)

            for (let i = 0; i < imagesFiles.length; i++) {
                formDataImages.append("images", imagesFiles[i]);
            }
            const imagesUpload = await fetch(`http://localhost:3000/admin/upload/product/${productId}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    // "Content-Type": "multipart/form-data"
                },
                body: formDataImages
            })
            navigate("/admin/products")
        }
        catch(err){
            console.error(err);
        }
    }

    const handleThumbnailPreview = (event) => {
        const file = event.target.files[0]
        const url = URL.createObjectURL(file)
        
        setThumbnailPreview({file, url})
    }

    const handleImagesPreview = (event) => {
        console.log(imagesPreview);
        
        const files = event.target.files;
        const newFilePreviews = []

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const objectURL = URL.createObjectURL(file);
            newFilePreviews.push({file, url: objectURL});
        }
        console.log(newFilePreviews);
        
        setImagesPreview(prev => [...prev, ...newFilePreviews]);
    }

    const removeImagesPreview = (image) => {
        const filtered = imagesPreview.filter(item => item.url !== image.url)
        setImagesPreview(filtered)
    }

    return (
    <Box sx={{ py: 1.5, px: 4, bgcolor: "#EEEEEE", minHeight: "91vh" }}>
        <Snackbar
            open={snackbarState.show}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            autoHideDuration={2000}
            onClose={() => dispatch(hideSnack())}
            sx={{
                '&.MuiSnackbar-root': { top: '70px' },
            }}
        >
            <Alert onClose={() => dispatch(hideSnack())} severity={snackbarState.severity} variant="filled">
                {snackbarState.message}
            </Alert>
        </Snackbar>
        <Box sx={{ display: "flex", justifyContent: "center"}}>
            <Card sx={{p: 2}}>
                <form onSubmit={handleSubmit(submitProduct)} noValidate>
                    <Stack spacing={3} width={{ md: 600, sm: 400}}>
                        <Typography>Product Details </Typography>

                        <TextField multiline label="Title" type='text' sx={{ width: "100%", mr: 1 }} {...register("title", {
                            required: {
                                value: true,
                                message: "Title is required"
                            },
                            pattern: {
                                value: /^.{5,}$/,
                                message: "Title must be 5 or more characters"
                            },
                        })}
                            error={!!errors.title}
                            helperText={errors.title ? errors.title.message : ""}
                        />

                        <TextField label="Brand" type='text' sx={{ width: "100%" }} {...register("brand", {
                            required: {
                                value: true,
                                message: "Brand is required"
                            }
                        })}
                            error={!!errors.brand}
                            helperText={errors.brand ? errors.brand.message : ""}
                        />

                        <Controller
                            control={control}
                            name="selected_category"
                            rules={{ required: "Category is required" }}
                            defaultValue={null}
                            render={({ field: { onChange, value } }) => (
                                <Autocomplete
                                    freeSolo
                                    options={categories}
                                    getOptionLabel={(option) =>
                                        typeof option === "string" ? option : option.category || ""
                                    }
                                    isOptionEqualToValue={(option, val) => option.id === val.id}
                                    value={value}
                                    onInputChange={(event, newInputValue) => {
                                            onChange({ id: null, category: newInputValue });
                                    }}
                                    onChange={(event, newValue) => {
                                        onChange(newValue);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Search & Select Category"
                                            variant="outlined"
                                            error={!!errors.selected_category}
                                            helperText={
                                                errors.selected_category
                                                ? errors.selected_category.message
                                                : "Select an existing or add a new category"
                                            }
                                        />
                                    )}
                                />
                            )}
                        />

                        <TextField multiline label="Description" type='text' {...register("description", {
                            required: {
                                value: true,
                                message: "Description is required"
                            },
                            pattern: {
                                value: /^.{5,}$/,
                                message: "Description must be 5 characters or more characters"
                            }
                        })}
                            error={!!errors.description}
                            helperText={errors.description ? errors.description.message : ""}
                        />

                        <TextField label="MRP (in $)" type='text' {...register("mrp", {
                            required: {
                                value: true,
                                message: "MRP is required"
                            },
                            pattern: {
                                value: /^(0|[1-9]\d{0,6})(\.\d{1,2})?$/,
                                message: "Not a valid price format (Ex. 10.00)"
                            }
                        })}
                            error={!!errors.mrp}
                            helperText={errors.mrp ? errors.mrp.message : ""}
                        />

                        <Box sx={{display: "flex", gap: 1}}>
                            <TextField label="Selling Price (in $)" type='text' {...register("price", {
                                required: {
                                    value: true,
                                    message: "Price is required"
                                },
                                pattern: {
                                    value: /^(0|[1-9]\d{0,6})(\.\d{1,2})?$/,
                                    message: "Not a valid price format (Ex. 10.00)"
                                },
                                validate: () => {
                                    if(inputMrp && parseFloat(inputPrice) > parseFloat(inputMrp)){
                                        return "Selling price can't be more than MRP"
                                    }
                                    return true
                                }
                            })}
                                error={!!errors.price}
                                helperText={errors.price?.message}
                                sx={{width: "100%"}}
                            />

                            {inputMrp && inputPrice &&
                                <TextField label="Discount (%)" type='text' {...register("discount", {
                                    required: {
                                        value: true,
                                        message: "Discount Percentage is required"
                                    }
                                })}
                                    error={!!errors.discount}
                                    helperText={errors.discount ? errors.discount.message : ""}
                                    disabled
                                />
                            }
                        </Box>

                        <TextField label="Stock" type='text' sx={{ width: "100%" }} {...register("stock", {
                            required: {
                                value: true,
                                message: "Stock is required"
                            },
                            pattern: {
                                value: /^[0-9]{0,}$/,
                                message: "Invalid quantity"
                            }
                        })}
                            error={!!errors.stock}
                            helperText={errors.stock ? errors.stock.message : ""}
                        />

                        <FormControl fullWidth error={!!errors.status}>
                            <InputLabel id="product-status">Status</InputLabel>
                            <Controller
                                name="status"
                                control={control}
                                defaultValue="active"
                                rules={{ required: "Status is required" }}
                                render={({field}) => (
                                    <Select
                                        {...field}
                                        labelId="product-status"
                                        label="Status"
                                        value={field.value ?? ""}
                                    >
                                        <MenuItem value={"active"}>Active</MenuItem>
                                        <MenuItem value={"inactive"}>Inactive</MenuItem>
                                    </Select>
                                )}
                            />
                            {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                        </FormControl>

                        {thumbnailPreview? 
                            <Box sx={{display: "flex"}}>
                            <Card elevation={3} sx={{position: "relative"}}>
                                <Typography sx={{bgcolor: "#3B92CA", color: "white", textAlign: "center"}}>Thumbnail</Typography>
                                <IconButton 
                                    onClick={() => setThumbnailPreview(null)}
                                    sx={{position: "absolute", top: "15%", right: 0}}>
                                    <CancelIcon sx={{fontSize: 20}}></CancelIcon>
                                </IconButton>
                                <img 
                                    src={thumbnailPreview.url}
                                    style={{height: 125, objectFit: "contain"}}
                                    alt="Thumbnail Preview" 
                                />
                            </Card >
                            </Box>
                            :
                            <Button
                                sx={{width: "50%"}}
                                component="label"
                                role={undefined}
                                variant="contained"
                                tabIndex={-1}
                                startIcon={<CloudUploadIcon />}
                            >
                                Upload Thumbnail
                                <VisuallyHiddenInput
                                    type="file"
                                    onChange={handleThumbnailPreview}
                                />
                            </Button>
                        }

                        {imagesPreview.length > 0 &&
                            <Card sx={{bgcolor: "#EEEEEE"}}>
                                <Typography sx={{bgcolor: "#3B92CA", color: "white", textAlign: "left", pl: 2}}>
                                    Product Images
                                </Typography>
                                <ImageList sx={{ width: "100%", maxHeight: 300, height: "auto", p: 1}} cols={3} rowHeight={"auto"} gap={10}>
                                    {imagesPreview.map(item => (
                                        <ImageListItem key={item.url}>
                                            <Card>
                                                <IconButton 
                                                    onClick={() => removeImagesPreview(item)}
                                                    sx={{position: "absolute", top: 0, right: 0}}>
                                                    <CancelIcon sx={{fontSize: 22}}></CancelIcon>
                                                </IconButton>
                                                <img
                                                    src={item.url}
                                                    alt={item.url}
                                                    style={{ objectFit: "cover"}}
                                                    loading="lazy"
                                                />
                                            </Card>
                                        </ImageListItem>
                                    ))}
                                </ImageList>
                            </Card>
                        }
                        <Button
                            sx={{width: "50%"}}
                            component="label"
                            role={undefined}
                            variant="contained"
                            tabIndex={-1}
                            startIcon={<CloudUploadIcon />}
                        >
                            Upload Images
                            <VisuallyHiddenInput
                                type="file"
                                onChange={handleImagesPreview}
                                multiple
                            />
                        </Button>
                        <Button type='submit' variant="contained">Add Product</Button>
                    </Stack>
                </form>
            </Card>
        </Box>
    </Box>
    )
}

export default AdminAddProduct