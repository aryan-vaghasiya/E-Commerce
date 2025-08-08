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

    const [page, setPage] = useState(1);

    const { register, handleSubmit, control, getValues, reset, watch, setValue, formState: { errors } } = useForm()
    // const [inputMrp, inputPrice] = watch(["mrp", "price"])

    const base_mrp = watch('base_mrp');
    const base_price = watch('base_price');

    // const offer_mrp = watch('offer_mrp');
    const offer_price = watch('offer_price');

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
            // console.log("fetching...");
            const response = await fetch(`http://localhost:3000/admin/product?productId=${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if (!response.ok) {
                const error = await response.json()
                console.error(error.error);
                return
            }
            const result = await response.json();
            // console.log(result);
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

    const getAllOffers = async () => {
        try {
            const response = await fetch(`http://localhost:3000/admin/product/get-offers?productId=${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            if (!response.ok) {
                const error = await response.json()
                console.error(error.error);
                return
            }
            const result = await response.json();
            console.log(result);

            setOffers(result)
        }
        catch (err) {
            console.error(err)
        }
    }

    const getAllCategories = async () => {
        try {
            const response = await fetch(`http://localhost:3000/admin/product/categories`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })

            if (!response.ok) {
                const error = await response.json()
                return console.error(error.error);
            }
            const categories = await response.json()
            // console.log(categories);
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
        // console.log("Editing");
        // console.log(editedData);

        let sDate;
        let eDate;

        if (editedData.start_time && editedData.end_time) {
            sDate = dayjs(editedData.start_time).format(`YYYY-MM-DD HH:mm:ss`)
            eDate = dayjs(editedData.end_time).format(`YYYY-MM-DD HH:mm:ss`)

            // console.log(sDate);
            // console.log(eDate);
            if (!editedData.start_time.isBefore(editedData.end_time, "minute")) {
                return console.error("End Time cannot be before Start Time");
            }
            if (!dayjs().isBefore(editedData.start_time, "minute") || !dayjs().isBefore(editedData.end_time, "minute")) {
                return console.error("Start Time or End Time is before current Time");
            }
            editedData.start_time = sDate
            editedData.end_time = eDate
        }
        // console.log(sDate);
        // console.log(eDate);
        // console.log(dayjs().isBefore(editedData.start_time, "minute"));

        console.log({ ...editedData, id: data.id, base_discount: calcDiscount(base_mrp, base_price), offer_discount: calcDiscount(base_mrp, offer_price) });



        console.log({ id: data.id, price: parseFloat(parseInt(editedData.price).toFixed(2)), stock: (parseInt(editedData.stock)), ...editedData });


        const response = await fetch("http://localhost:3000/admin/edit-product", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ...editedData, id: data.id, base_discount: calcDiscount(base_mrp, base_price), offer_discount: calcDiscount(base_mrp, offer_price) })
        })

        if (response.ok) {
            // setTimeout(function() {
            //     // console.log("This message appears after 2 seconds.");
            //     navigate("/admin/products", {replace: true})
            // }, 500);
            navigate("/admin/products", { replace: true })
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
        setData(prev => ({ ...prev, images: [...prev.images, ...toDelete] }))
        setToDelete([])
        setEditable(false)
    }

    const updateStatus = async () => {
        const newStatus = productStatus === "active" ? "inactive" : "active"
        setProductStatus(newStatus)

        const res = await fetch(`http://localhost:3000/admin/product/update-status`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ newStatus, productId: data.id })
        })
    }

    const removeRequest = async () => {
        // console.log(toDelete);
        const toDeleteIds = toDelete.map(item => item.id)
        console.log(toDeleteIds);
        const res = await fetch(`http://localhost:3000/admin/product/remove-images`, {
            method: "POST",
            body: JSON.stringify(toDeleteIds),
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        if (res.ok) {
            console.log("Removed Images Successfully");
            setToDelete([])
        }
        else {
            console.log("Couldn't Remove Images");
        }
        setEditable(false)
    }

    const uploadThumbnail = async (event) => {
        const formData = new FormData();
        const file = event.target.files
        formData.append("thumbnail", file[0])
        const localThumbnailPreview = URL.createObjectURL(file[0])
        // console.log(localThumbnailPreview);
        // console.log(formData);

        const res = await fetch(`http://localhost:3000/admin/upload/product-thumbnail/${productId}`, {
            method: "POST",
            body: formData,
            headers: {
                Authorization: `Bearer ${token}`,
                // "Content-Type": "multipart/form-data"
            }
        })

        if (res.ok) {
            console.log("Thumbnail Upload Success");
            // console.log(file[0]);
            setThumbnailPreview({ file, url: localThumbnailPreview })
        }
        else {
            console.log("Couldn't Upload Thumbnail");
        }
    }
    // console.log(thumbnailPreview);

    const handleUpload = async (event) => {
        const formData = new FormData();
        const files = imagePreview.map(item => item.file)
        // console.log(files);
        for (let i = 0; i < files.length; i++) {
            formData.append("images", files[i]);
        }

        const res = await fetch(`http://localhost:3000/admin/upload/product/${productId}`, {
            method: "POST",
            body: formData,
            headers: {
                Authorization: `Bearer ${token}`,
                // "Content-Type": "multipart/form-data"
            }
        })

        if (res.ok) {
            const newImages = await res.json()
            // console.log(newImages);

            setData(prev => ({ ...prev, image: [...prev.image, ...newImages] }))
            console.log("Upload Success");
            // setLocalPreview(prev => [...prev, ...imagePreview]);
            setImagePreview([])
            // setShowUploaded(true)
            setShowPreview(false)
        }
        else {
            console.log("Couldn't Upload");
        }
    }

    return (
        <Box sx={{ py: 1.5, px: 4, bgcolor: "#EEEEEE", minHeight: "91vh" }}>
        {
            data ?
            <TabContext value={page}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList onChange={handlePageChange} aria-label="lab API tabs example">
                    <Tab label="Details" value={1} />
                    <Tab label="Offers" value={2} />
                </TabList>
                </Box>
                <TabPanel value={1} sx={{px: 0}}>
                    {/* <Card sx={{py: 4, px: 2}}> */}
                        <Box sx={{ display: "flex", justifyContent: "space-around" }}>
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                                <Card sx={{}}>
                                    <Typography sx={{ p: 1, fontSize: "16px", bgcolor: "#3B92CA", color: "white" }}>THUMBNAIL</Typography>
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

                                        <Typography sx={{ p: 1, fontSize: "16px", bgcolor: "#3B92CA", color: "white" }}>PRODUCT IMAGES - ({data.image.length})</Typography>
                                        {
                                            data.image.length > 0 ?
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
                                    {
                                        showPreview && imagePreview.length > 0 ?
                                            <Box sx={{ width: 385, height: "auto", py: 1, }}>
                                                <Card sx={{ p: 1 }}>
                                                    <Grid
                                                        container
                                                        spacing={2}
                                                        columns={9}
                                                    >
                                                        {
                                                            imagePreview.map(item => (
                                                                <Grid key={item.url} size={3} sx={{ display: "flex", justifyContent: "center", alignItems: 'center' }}>
                                                                    <Box sx={{ position: "relative" }}>
                                                                        <IconButton
                                                                            onClick={() => handleCancel(item)}
                                                                            sx={{ position: "absolute", top: 0, right: 0 }}>
                                                                            <CancelIcon></CancelIcon>
                                                                        </IconButton>
                                                                        <img src={item.url} style={{ width: 100, objectFit: "contain" }} />
                                                                    </Box>
                                                                </Grid>
                                                            ))
                                                        }
                                                    </Grid>
                                                </Card>
                                            </Box>
                                            :
                                            null
                                    }
                                    <Box sx={{ display: "flex", justifyContent: "space-around", gap: 2, mt: 2 }}>
                                        {
                                            !editable ?
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
                                                :
                                                null
                                        }
                                        {
                                            imagePreview.length > 0 ?
                                                <Button onClick={handleUpload} variant='contained'>Submit</Button>
                                                :
                                                null
                                        }
                                        {
                                            !editable && imagePreview.length === 0 ?
                                                <Button onClick={() => setEditable(true)} variant='contained'>Remove Images</Button>
                                                : null
                                        }
                                        {
                                            editable ?
                                                <Box>
                                                    <Button onClick={revertRemoval} variant='contained' color='error' sx={{ mr: 2 }}>Cancel</Button>
                                                    <Button onClick={removeRequest} variant='contained'>Confirm</Button>
                                                </Box>
                                                : null
                                        }
                                    </Box>
                                </Box>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "flex-start", flexDirection: "column" }}>
                                <Card sx={{ width: "100%", mb: 3 }}>
                                    <Typography sx={{ p: 1, fontSize: "16px", bgcolor: "#3B92CA", color: "white" }}>PRODUCT STATUS</Typography>
                                    <Box sx={{ p: 2 }}>
                                        <Typography color={productStatus === "active" ? 'success' : 'warning'} sx={{ fontSize: 30, fontWeight: 500, pb: 1 }}>{productStatus.toUpperCase()}</Typography>
                                        <Button variant='contained' sx={{ width: "100%" }} onClick={updateStatus}>Mark as {productStatus === "active" ? "Inactive" : "Active"}</Button>
                                    </Box>
                                </Card>
                                <Card sx={{ p: 2 }}>
                                    <form key={data?.id || "loading"} onSubmit={handleSubmit(handleEdit)} noValidate>
                                        <Stack spacing={3} width={{ lg: 600, md: 400 }}>
                                            <Typography>Product Details </Typography>

                                            {/* <Box sx={{ display: "inline-flex" }}> */}
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
                                            {/* </Box> */}

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

                                            {/* <TextField multiline label="Category" type='text' {...register("category", {
                                    required: {
                                        value: true,
                                        message: "Category is required"
                                    },
                                    pattern: {
                                        value: /^.{5,}$/,
                                        message: "Category must be 5 characters or more characters"
                                    }
                                })}
                                    error={!!errors.category}
                                    helperText={errors.category ? errors.category.message : ""}
                                /> */}

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

                                            {/* <Typography variant="h6" gutterBottom>Base Pricing</Typography> */}
                                            <Box sx={{ display: "flex" }}>
                                                {/* <Divider sx={{ mb: 2 }} /> */}

                                                {/* <Stack spacing={2}> */}
                                                <TextField
                                                    label="Base MRP ($)"
                                                    type="text"
                                                    {...register("base_mrp", {
                                                        required: {
                                                            value: true,
                                                            message: "Base MRP is required"
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
                                                    label="Base Selling Price ($)"
                                                    type="text"
                                                    {...register("base_price", {
                                                        required: {
                                                            value: true,
                                                            message: "Base Selling Price is required"
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
                                                    label="Base Discount (%)"
                                                    type='text'
                                                    // {...register("base_discount", {
                                                    //     required: {
                                                    //         value: true,
                                                    //         message: "Base Discount (%) is required"
                                                    //     }
                                                    // })}
                                                    value={calcDiscount(base_mrp, base_price)}
                                                    disabled
                                                />
                                                {/* </Stack> */}
                                            </Box>

                                            {/* {
                                                data.offer_discount ?
                                                    <Box>
                                                        <Typography variant="h6">Current Offer</Typography>
                                                        <Typography>Price: ${data.offer_price}</Typography>
                                                        <Typography>Discount: {data.offer_discount}%</Typography>
                                                        <Typography>Start Time: {dayjs(data.offer_start_time).format('DD/MM/YYYY h:mm:ss A')}</Typography>
                                                        <Typography>End Time: {dayjs(data.offer_end_time).format('DD/MM/YYYY h:mm:ss A')}</Typography>
                                                    </Box>
                                                    :
                                                    null
                                            } */}


                                            {/* <Typography variant="h6" gutterBottom mt={4}>Add Offer Pricing (Optional)</Typography> */}
                                            {/* <Box sx={{ display: "flex" }}> */}

                                                {/* <TextField label="Offer MRP ($)" type='text' {...register("offer_mrp", {
                                                    // required: {
                                                    //     value: true,
                                                    //     message: "Offer MRP is required"
                                                    // },
                                                    pattern: {
                                                        value: /^(0(?!\.00)|[1-9]\d{0,6})\.\d{2}$/,
                                                        message: "Not a valid price format"
                                                    }
                                                })}
                                                    error={!!errors.offer_mrp}
                                                    helperText={errors.offer_mrp ? errors.offer_mrp.message : ""}
                                                    sx={{width: "40%", pr: 1}}
                                                /> */}
                                                {/* <TextField label="Offer Selling Price ($)" type='text' {...register("offer_price", {
                                                    // required: {
                                                    //     value: true,
                                                    //     message: "Offer Selling Price is required"
                                                    // },
                                                    pattern: {
                                                        value: /^(0(?!\.00)|[1-9]\d{0,6})\.\d{2}$/,
                                                        message: "Not a valid price format"
                                                    }
                                                })}
                                                    error={!!errors.offer_price}
                                                    helperText={errors.offer_price ? errors.offer_price.message : ""}
                                                    sx={{ width: "60%", pr: 1 }}
                                                />

                                                <TextField label="Offer Discount (%)" type="text"
                                                    // {...register("offer_discount", {
                                                    //     required: {
                                                    //         value: true,
                                                    //         message: "Offer Discount (%) is required"
                                                    //     }
                                                    // })}
                                                    value={calcDiscount(base_mrp, offer_price)}
                                                    // slotProps={{
                                                    //     input: {
                                                    //     readOnly: true,
                                                    //     },
                                                    // }}
                                                    disabled
                                                    sx={{ width: "40%" }}
                                                >

                                                </TextField>
                                            </Box>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DemoContainer
                                                    components={[
                                                        'DateTimePicker'
                                                    ]}
                                                >
                                                    <DemoItem label="Sale Start">
                                                        <Controller
                                                            control={control}
                                                            // defaultValue={dayjs()}
                                                            name="start_time"
                                                            // rules={{ required: "Start Date is required" }}
                                                            render={({ field }) => (
                                                                <DateTimePicker
                                                                    disablePast
                                                                    // value={field.value}
                                                                    inputRef={field.ref}
                                                                    onChange={(date) => {
                                                                        field.onChange(date);
                                                                    }}
                                                                />
                                                            )}
                                                        />
                                                    </DemoItem>
                                                    <DemoItem label="Sale End">
                                                        <Controller
                                                            control={control}
                                                            // defaultValue={dayjs().add(1, 'day')}
                                                            name="end_time"
                                                            // rules={{ required: "End Date is required" }}
                                                            render={({ field }) => (
                                                                <DateTimePicker
                                                                    disablePast
                                                                    // value={field.value}
                                                                    inputRef={field.ref}
                                                                    onChange={(date) => {
                                                                        field.onChange(date);
                                                                    }}
                                                                />
                                                            )}
                                                        />
                                                    </DemoItem>
                                                </DemoContainer>
                                            </LocalizationProvider> */}

                                            <Button type='submit' variant="contained">Save Changes</Button>
                                        </Stack>
                                    </form>
                                </Card>

                            </Box>
                        </Box>
                    {/* </Card> */}
                </TabPanel>
                <TabPanel value={2} sx={{px: 0}}>
                    <Box>
                        <LimitedTimeOffers mrp={data.mrp} productId={productId}/>
                    </Box>
                </TabPanel>

                    {/* <Box sx={{display: "flex", alignItems: "flex-start", justifyContent: "space-between"}}> */}
                    <Box>
                        
                        {/* {
                            offers && offers.length > 0 ? */}
                                {/* <Card sx={{ p: 2, mt: 2}}> */}
                                    {/* <LimitedTimeOffers offers={offers} productId={productId}/> */}
                        
                                    {/* {
                                        offers.map(offer => (
                                            <Card key={offer.id} sx={{ p: 2 }}>
                                                <TextField label="Offer Selling Price ($)" type='text'
                                                    // {...register("offer_price", {
                                                    //     // required: {
                                                    //     //     value: true,
                                                    //     //     message: "Offer Selling Price is required"
                                                    //     // },
                                                    //     pattern: {
                                                    //         value: /^(0(?!\.00)|[1-9]\d{0,6})\.\d{2}$/,
                                                    //         message: "Not a valid price format"
                                                    //     }
                                                    // })}
                                                    // error={!!errors.offer_price}
                                                    // helperText={errors.offer_price ? errors.offer_price.message : ""}
                                                    // sx={{width: "60%", pr: 1}}
                                                    // defaultValue={null}
                                                    value={offer.offer_selling_price || ""}
                                                />
                                                <TextField label="Discount" type='text'
                                                    value={`${offer.discount_percentage} %` || ""}
                                                />
                                            </Card>
                                        ))
                                    } */}
                                {/* </Card>
                                :
                                null */}
                        {/* } */}
                    </Box>
                    </TabContext>
                    :
                    null
            }
        </Box>
    )
}

export default AdminProductsPage