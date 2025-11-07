import Box from '@mui/material/Box'
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Grid, Stack } from '@mui/system';
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { replace, useNavigate, useParams } from 'react-router';
import { getImageUrl } from '../utils/imageUrl';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import IconButton from '@mui/material/IconButton';
import CancelIcon from '@mui/icons-material/Cancel';
import dayjs from 'dayjs';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DesktopDateTimePicker, DesktopDateTimePickerLayout } from '@mui/x-date-pickers/DesktopDateTimePicker';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
import LimitedTimeOffers from './LimitedTimeOffers';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import Tab from '@mui/material/Tab';
import TabPanel from '@mui/lab/TabPanel';
import { adminProductService } from '../api/services/adminProductService';
const API_URL = import.meta.env.VITE_API_SERVER;

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

function AdminProductsPage() {
    const { productId } = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [data, setData] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [editable, setEditable] = useState(false);
    const [toDelete, setToDelete] = useState([]);
    const token = useSelector(state => state.userReducer.token)
    const [imagePreview, setImagePreview] = useState([])
    const [thumbnailPreview, setThumbnailPreview] = useState(null)
    const [productStatus, setProductStatus] = useState(null)
    const [categories, setCategories] = useState([])
    const [offers, setOffers] = useState(null)
    const [isSaving, setIsSaving] = useState(false)

    const [page, setPage] = useState(1);

    const { register, handleSubmit, control, getValues, reset, watch, setValue, formState: { errors } } = useForm()
    // const [inputMrp, inputPrice] = watch(["mrp", "price"])

    const base_mrp = watch('base_mrp');
    const base_price = watch('base_price');

    const handlePageChange = (event, newValue) => {
        setPage(newValue);
    };

    const calcDiscount = (mrp, price) => {
        if (!mrp || !price || mrp <= 0) return '';
        const discount = ((mrp - price) / mrp) * 100;
        return `${discount.toFixed(2)}`;
    };

    const fetchData = async () => {
        try {
            // const response = await fetch(`${API_URL}/admin/product?productId=${productId}`, {
            //     headers: {
            //         Authorization: `Bearer ${token}`,
            //     }
            // });
            // if (!response.ok) {
            //     const error = await response.json()
            //     console.error(error.error);
            //     return
            // }
            // const result = await response.json();

            const result = await adminProductService.getProductData(productId);
            setData(result);
            reset({
                title: result.title,
                brand: result.brand,
                description: result.description,
                base_mrp: (result.mrp).toFixed(2),
                // base_mrp: result.mrp,
                // base_price: (result.price).toFixed(2),
                base_price: (result.price).toFixed(2),
                base_discount: result.discount,
                stock: result.stock,
                category: { id: result.cid, category: result.category }
            });
            setProductStatus(result.status)
        }
        catch (err) {
            console.error(err)
        }
    };

    // const getAllOffers = async () => {
    //     try {
    //         const response = await fetch(`${API_URL}admin/product/get-offers?productId=${productId}`, {
    //             headers: {
    //                 Authorization: `Bearer ${token}`,
    //             }
    //         })
    //         if (!response.ok) {
    //             const error = await response.json()
    //             console.error(error.error);
    //             return
    //         }
    //         const result = await response.json();
    //         console.log(result);

    //         setOffers(result)
    //     }
    //     catch (err) {
    //         console.error(err)
    //     }
    // }

    const getAllCategories = async () => {
        try {
            // const response = await fetch(`${API_URL}/admin/product/categories`, {
            //     headers: {
            //         Authorization: `Bearer ${token}`,
            //     }
            // })

            // if (!response.ok) {
            //     const error = await response.json()
            //     return console.error(error.error);
            // }
            // const categories = await response.json()

            const categories = await adminProductService.getAllCategories();
            setCategories(categories)
        }
        catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        fetchData()
        getAllCategories()
        // getAllOffers()
    }, [])

    // useEffect(() => {
    //     // if(inputMrp < inputPrice){
    //     //     return setValue("discount", "MRP < Price !!!")
    //     // }
    //     const percentage = Math.abs((parseFloat((parseFloat(inputPrice)/parseFloat(inputMrp)).toFixed(2)) * 100) - 100)
    //     setValue("discount", percentage || 0)
    // }, [inputMrp, inputPrice])

    const handleEdit = async (editedData) => {
        // const response = await fetch(`${API_URL}/admin/edit-product`, {
        //     method: "POST",
        //     headers: {
        //         Authorization: `Bearer ${token}`,
        //         "Content-Type": "application/json"
        //     },
        //     body: JSON.stringify({ ...editedData, id: data.id, base_discount: calcDiscount(base_mrp, base_price) })
        // })

        // if (response.ok) {
        //     navigate("/admin/products", { replace: true })
        // }
        
        try {
            setIsSaving(true);
            const editProduct = await adminProductService.editProduct({
                ...editedData,
                id: data.id,
                base_discount: calcDiscount(base_mrp, base_price)
            });
            navigate("/admin/products");
        } catch (error) {
            console.error("Error editing product", error);
        } finally {
            setIsSaving(false)
        }
    }

    const handleImagePreview = (event) => {
        const files = event.target.files;
        const newFilePreviews = []

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const objectURL = URL.createObjectURL(file);
            newFilePreviews.push({ file, url: objectURL });
        }
        setImagePreview(prev => [...prev, ...newFilePreviews]);
        setShowPreview(true)
    }
    // console.log(imagePreview);

    const handleCancel = (image) => {
        // console.log(image);
        const filtered = imagePreview.filter(item => {
            return item.url !== image.url
        })
        // console.log(filtered);
        setImagePreview(filtered)
    }

    const markToRemove = (image) => {
        setToDelete(prev => [...prev, image])
        const notRemoved = data.image.filter(item => item.image !== image.image)

        setData(prev => ({ ...prev, image: notRemoved }))
    }

    const revertRemoval = () => {
        setData(prev => ({ ...prev, image: [...prev.image, ...toDelete] }))
        setToDelete([])
        setEditable(false)
    }

    const updateStatus = async () => {
        const newStatus = productStatus === "active" ? "inactive" : "active"

        // const res = await fetch(`${API_URL}/admin/product/update-status`, {
        //     method: "POST",
        //     headers: {
        //         Authorization: `Bearer ${token}`,
        //         "Content-Type": "application/json"
        //     },
        //     body: JSON.stringify({ newStatus, productId: data.id })
        // })
        // if(res.ok){
        //     setProductStatus(newStatus)
        // }

        try {
            const updateStatus = await adminProductService.updateProductStatus(newStatus, data.id);
            setProductStatus(newStatus);
        } catch (error) {
            console.error("Error updating product status", error);
        }
    }

    const removeRequest = async () => {
        const toDeleteIds = toDelete.map(item => item.id)

        // const res = await fetch(`${API_URL}/admin/product/remove-images`, {
        //     method: "POST",
        //     headers: {
        //         Authorization: `Bearer ${token}`,
        //         "Content-Type": "application/json"
        //     },
        //     body: JSON.stringify(toDeleteIds),
        // })
        // if (res.ok) {
        //     console.log("Removed Images Successfully");
        //     setToDelete([])
        // }
        // else {
        //     console.log("Couldn't Remove Images");
        // }
        // setEditable(false)

        try {
            const deleteImage = await adminProductService.deleteProductImages(toDeleteIds);
            setToDelete([]);
        } catch (error) {
            console.error("Error deleting product images", error);
        } finally {
            setEditable(false)
        }
    }

    const uploadThumbnail = async (event) => {
        const formData = new FormData();
        const file = event.target.files
        formData.append("thumbnail", file[0])
        const localThumbnailPreview = URL.createObjectURL(file[0])

        // const res = await fetch(`${API_URL}/admin/upload/product-thumbnail/${productId}`, {
        //     method: "POST",
        //     headers: {
        //         Authorization: `Bearer ${token}`,
        //         // "Content-Type": "multipart/form-data"
        //     },
        //     body: formData,
        // })

        // if (res.ok) {
        //     console.log("Thumbnail Upload Success");
        //     // console.log(file[0]);
        //     setThumbnailPreview({ file, url: localThumbnailPreview })
        // }
        // else {
        //     console.log("Couldn't Upload Thumbnail");
        // }

        try {
            const updateThumbnail = await adminProductService.uploadProductThumbnail(formData, productId);
            setThumbnailPreview({ file, url: localThumbnailPreview });
        } catch (error) {
            console.error("Error updating thumbnail", error);
        }
    }

    const handleUpload = async (event) => {
        const formData = new FormData();
        const files = imagePreview.map(item => item.file)
        // console.log(files);
        for (let i = 0; i < files.length; i++) {
            formData.append("images", files[i]);
        }

        // const res = await fetch(`${API_URL}/admin/upload/product/${productId}`, {
        //     method: "POST",
        //     headers: {
        //         Authorization: `Bearer ${token}`,
        //         // "Content-Type": "multipart/form-data"
        //     },
        //     body: formData,
        // })

        // if (res.ok) {
        //     const newImages = await res.json()
        //     setData(prev => ({ ...prev, image: [...prev.image, ...newImages] }))
        //     console.log("Upload Success");
        //     setImagePreview([])
        //     setShowPreview(false)
        // }
        // else {
        //     console.log("Couldn't Upload");
        // }

        try {
            const newImages = await adminProductService.uploadProductImages(formData, productId);
            setData(prev => ({ ...prev, image: [...prev.image, ...newImages] }));
        } catch (error) {
            console.error("Error uploading images", error);
        } finally {
            setImagePreview([])
            setShowPreview(false)
        }
    }

    return (
        <Box sx={{ py: 1.5, px: 4, bgcolor: "#EEEEEE", minHeight: "91vh" }}>
        {data &&
            <TabContext value={page}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList onChange={handlePageChange} aria-label="lab API tabs example">
                        <Tab label="Details" value={1} />
                        <Tab label="Offers" value={2} />
                    </TabList>
                </Box>
                <TabPanel value={1} sx={{px: 0}}>
                    <Box sx={{ display: "flex", justifyContent: "space-around" }}>
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                            <Card sx={{}}>
                                <Typography 
                                    sx={{ p: 1, fontSize: "16px", bgcolor: "#3B92CA", color: "white" }}>
                                        THUMBNAIL
                                </Typography>
                                <CardMedia
                                    component="img"
                                    sx={{ width: 385, height: 405, objectFit: "contain" }}
                                    image={thumbnailPreview ? thumbnailPreview.url : getImageUrl(data.thumbnail)}
                                    alt="Product Image"
                                />
                            </Card>
                            <Button
                                sx={{ ml: "auto", mt: 1 }}
                                component="label"
                                role={undefined}
                                variant="contained"
                                tabIndex={-1}
                                startIcon={<CloudUploadIcon />}
                            >
                                Change THumbnail
                                <VisuallyHiddenInput
                                    type="file"
                                    onChange={uploadThumbnail}
                                />
                            </Button>

                            <Box sx={{ mt: 2 }}>
                                <Card sx={{ bgcolor: "#F8F8F8" }}>
                                    <Typography 
                                        sx={{ p: 1, fontSize: "16px", bgcolor: "#3B92CA", color: "white" }}>
                                            PRODUCT IMAGES - ({data.image.length})
                                    </Typography>
                                    {data.image.length > 0 ?
                                        <ImageList sx={{ width: 385, maxHeight: 405, height: "auto", p: 1 }} cols={2} rowHeight={"auto"} gap={5}>
                                            {
                                                data.image.map((item, index) => (
                                                    <ImageListItem key={index}>
                                                        <Paper elevation={3}>
                                                            {
                                                                editable ?
                                                                    <IconButton
                                                                        onClick={() => markToRemove(item)}
                                                                        sx={{ position: "absolute", top: 0, right: 0 }}>
                                                                        <CancelIcon></CancelIcon>
                                                                    </IconButton>
                                                                    :
                                                                    null
                                                            }
                                                            <img
                                                                src={getImageUrl(item.image)}
                                                                alt={item.image}
                                                                style={{ height: "100%", width: "100%", objectFit: "cover" }}
                                                                loading="lazy"
                                                            />
                                                        </Paper>
                                                    </ImageListItem>
                                                ))
                                            }
                                        </ImageList>
                                        :
                                        <Box sx={{ width: 385, height: 50 }}>
                                            <Typography >No Images for this Product</Typography>
                                        </Box>
                                    }
                                </Card>
                                {showPreview && imagePreview.length > 0 &&
                                    <Box sx={{ width: 385, height: "auto", py: 1, }}>
                                        <Card sx={{ p: 1 }}>
                                            <Grid
                                                container
                                                spacing={2}
                                                columns={9}
                                            >
                                                {imagePreview.map(item => (
                                                    <Grid key={item.url} size={3} sx={{ display: "flex", justifyContent: "center", alignItems: 'center' }}>
                                                        <Box sx={{ position: "relative" }}>
                                                            <IconButton
                                                                onClick={() => handleCancel(item)}
                                                                sx={{ position: "absolute", top: 0, right: 0 }}
                                                            >
                                                                <CancelIcon></CancelIcon>
                                                            </IconButton>
                                                            <img
                                                                src={item.url} 
                                                                style={{ width: 100, objectFit: "contain" }}
                                                            />
                                                        </Box>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Card>
                                    </Box>
                                }
                                <Box sx={{ display: "flex", justifyContent: "space-around", gap: 2, mt: 2 }}>
                                    {!editable && imagePreview.length === 0 &&
                                            <Button 
                                                onClick={() => setEditable(true)} 
                                                variant='contained'>
                                                    Remove Images
                                            </Button>
                                    }
                                    {!editable &&
                                        <Button
                                            component="label"
                                            role={undefined}
                                            variant="contained"
                                            tabIndex={-1}
                                            startIcon={<CloudUploadIcon />}
                                        >
                                            Upload Images
                                            <VisuallyHiddenInput
                                                type="file"
                                                onChange={handleImagePreview}
                                                multiple
                                            />
                                        </Button>
                                    }
                                    {imagePreview.length > 0 &&
                                        <Button onClick={handleUpload} variant='contained'>Submit</Button>
                                    }
                                    {editable &&
                                        <Box>
                                            <Button onClick={revertRemoval} variant='contained' color='error' sx={{ mr: 2 }}>Cancel</Button>
                                            <Button onClick={removeRequest} variant='contained'>Confirm</Button>
                                        </Box>
                                    }
                                </Box>
                            </Box>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "flex-start", flexDirection: "column" }}>
                            <Card sx={{ width: "100%", mb: 3 }}>
                                <Typography sx={{ p: 1, fontSize: "16px", bgcolor: "#3B92CA", color: "white" }}>
                                    PRODUCT STATUS
                                </Typography>
                                <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <Typography 
                                        color={productStatus === "active" ? 'success' : 'warning'} 
                                        sx={{ fontSize: 30, fontWeight: 500}}
                                    >
                                        {productStatus.toUpperCase()}
                                    </Typography>
                                    <Button variant='contained' onClick={updateStatus}>
                                        Mark as {productStatus === "active" ? "Inactive" : "Active"}
                                    </Button>
                                </Box>
                            </Card>
                            <Card sx={{ p: 2 }}>
                                <form key={data?.id || "loading"} onSubmit={handleSubmit(handleEdit)} noValidate>
                                    <Stack spacing={3} width={{ lg: 600, md: 400 }}>
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

                                        <Controller
                                            control={control}
                                            name="category"
                                            rules={{ required: "Category is required" }}
                                            // defaultValue={null}
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
                                                            error={!!errors.category}
                                                            helperText={
                                                                errors.category
                                                                    ? errors.category.message
                                                                    : "Select an existing or add a new category"
                                                            }
                                                        />
                                                    )}
                                                />
                                            )}
                                        />

                                        <TextField label="Stock" type='text' sx={{ width: "100%" }} {...register("stock", {
                                            required: {
                                                value: true,
                                                message: "Stock is required"
                                            },
                                            pattern: {
                                                value: /^[0-9]{0,}$/,
                                                message: "Stock must be in digits only"
                                            }
                                        })}
                                            error={!!errors.stock}
                                            helperText={errors.stock ? errors.stock.message : ""}
                                        />

                                        <Box sx={{ display: "flex" }}>
                                            <TextField
                                                label="MRP ($)"
                                                type="text"
                                                {...register("base_mrp", {
                                                    required: {
                                                        value: true,
                                                        message: "MRP is required"
                                                    },
                                                    pattern: {
                                                        value: /^(0(?!\.00)|[1-9]\d{0,6})\.\d{2}$/,
                                                        message: "Not a valid price format"
                                                    }
                                                })}
                                                error={!!errors.base_mrp}
                                                helperText={errors.base_mrp ? errors.base_mrp.message : ""}
                                                sx={{ width: "40%", pr: 1 }}
                                            />

                                            <TextField
                                                label="Selling Price ($)"
                                                type="text"
                                                {...register("base_price", {
                                                    required: {
                                                        value: true,
                                                        message: "Selling Price is required"
                                                    },
                                                    pattern: {
                                                        value: /^(0(?!\.00)|[1-9]\d{0,6})\.\d{2}$/,
                                                        message: "Not a valid price format"
                                                    }
                                                })}
                                                error={!!errors.base_price}
                                                helperText={errors.base_price ? errors.base_price.message : ""}
                                                sx={{ width: "40%", pr: 1 }}
                                            />

                                            <TextField
                                                label="Discount (%)"
                                                type='text'
                                                value={calcDiscount(base_mrp, base_price)}
                                                disabled
                                            />
                                        </Box>
                                        <Button type='submit' variant="contained" disabled={isSaving}>Save Changes</Button>
                                    </Stack>
                                </form>
                            </Card>
                        </Box>
                    </Box>
                </TabPanel>
                <TabPanel value={2} sx={{px: 0}}>
                    <Box>
                        <LimitedTimeOffers mrp={data.mrp} productId={productId}/>
                    </Box>
                </TabPanel>
            </TabContext>
        }
        </Box>
    )
}

export default AdminProductsPage