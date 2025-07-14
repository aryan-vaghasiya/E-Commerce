import Box from '@mui/material/Box'
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Grid, Stack, width } from '@mui/system';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { getImageUrl } from '../utils/imageUrl';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import IconButton from '@mui/material/IconButton';
import CancelIcon from '@mui/icons-material/Cancel';

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
    const [data, setData] = useState(null);
    const [showUploaded, setShowUploaded] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [editable, setEditable] = useState(false);
    const [toDelete, setToDelete] = useState([]);
    const [error, setError] = useState(null);
    const token = useSelector(state => state.userReducer.token)
    const userDetails = useSelector(state => state.detailsReducer)
    const [imagePreview, setImagePreview] = useState([])
    const [localPreview, setLocalPreview] = useState([])
    const [thumbnailPreview, setThumbnailPreview] = useState(null)

    const { register, handleSubmit, control, getValues, reset, formState: { errors } } = useForm()

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
                // throw new Error(`Error status: ${response.status}`);
            }
            const result = await response.json();
            // console.log(result);
            setData(result);
            reset({
                title: result.title,
                brand: result.brand,
                description: result.description,
                price: result.price,
                stock: result.stock,
            });
        } 
        catch (err) {
            console.error(err)
            setError(err);
        }
    };

    useEffect(() => {
        fetchData()
    }, [])

    const handleEdit = async (editedData) => {
        // console.log(editedData);
        
        // console.log({id: data.id, price: parseFloat(parseInt(editedData.price).toFixed(2)), stock: (parseInt(editedData.stock)), ...editedData});
        
        const response = await fetch("http://localhost:3000/admin/edit-product", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({id: data.id, stock: parseInt(editedData.stock), ...editedData})
        })
    }

    const handleImagePreview = (event) => {
        // setImagePreview(prev => prev.push(URL.createObjectURL(event.target.files)))
        // console.log(URL.createObjectURL(event.target.files[0]));

        const files = event.target.files;
        // console.log(event.target.files);
        
        // const newFilePreviews = event.target.files.map(file => ({file, url: URL.createObjectURL(file)}))
        const newFilePreviews = []

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const objectURL = URL.createObjectURL(file);
            newFilePreviews.push({file, url: objectURL});
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
        console.log(filtered);
        setImagePreview(filtered)
    }

    const markToRemove = (imagePath) => {
        setToDelete(prev => [...prev, imagePath])
        const remove = data.images.filter(item => item !== imagePath)
        // console.log(remove);
        
        setData(prev => ({...prev, images: remove}))
    }

    const revertRemoval = () => {
        setData(prev => ({...prev, images: [...prev.images, ...toDelete]}))
        setToDelete([])
        setEditable(false)
    }

    const removeRequest = async () => {
        // console.log(toDelete);
        
        const res = await fetch(`http://localhost:3000/admin/product/remove-images`, {
            method: "POST",
            body: JSON.stringify(toDelete),
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }})
        if(res.ok){
            console.log("Removed Images Successfully");
        }
        else{
            console.log("Couldn't Remove Images");
        }
        setEditable(false)
    }

    const uploadThumbnail = async (event) => {
        const formData = new FormData();
        const file = event.target.files
        formData.append("thumbnail", file[0])
        const localPreview  = URL.createObjectURL(file[0])
        // console.log(localPreview);
        
        // console.log(formData);

        const res = await fetch(`http://localhost:3000/admin/upload/product-thumbnail/${productId}`, {
            method: "POST",
            body: formData,
            headers: {
                Authorization: `Bearer ${token}`,
                // "Content-Type": "multipart/form-data"
            }
        })

        if(res.ok){
            console.log("Thumbnail Upload Success");
            // console.log(file[0]);
            setThumbnailPreview({file, url: localPreview})
        }
        else{
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

        if(res.ok){
            console.log("Upload Success");
            setLocalPreview(prev => [...prev, ...imagePreview]);
            setImagePreview([])
            setShowUploaded(true)
            setShowPreview(false)
            // const newImages = imagePreview.map(item => item.url)
            // setData(prev => ({...prev, images: [...prev.images, ...newImages]}))
            // console.log({...data, images: [...data.images, ...newImages]});
        }
        else{
            console.log("Couldn't Upload");
        }
        // fetchData()
        // const result = await res.json()
        // console.log(result);
    }

    return (
        <Box sx={{ py: 1.5, px: 4, bgcolor: "#EEEEEE", minHeight: "91vh" }}>
            {
                data?
                // <Box sx={{display: "flex", alignItems: "flex-start", justifyContent: "space-between"}}>
                <Box sx={{display: "flex", justifyContent: "space-around"}}>
                <Box sx={{display: "flex", flexDirection: "column", alignItems: "flex-start"}}>
                    <Card sx={{}}>
                        <Typography sx={{ p: 1, fontSize: "16px", bgcolor: "#3B92CA", color: "white"}}>THUMBNAIL</Typography>
                        <CardMedia
                            component="img"
                            sx={{ width: 385, height: 405, objectFit: "contain"}}
                            image={thumbnailPreview ? thumbnailPreview.url : getImageUrl(data.thumbnail)}
                            alt="Product Image"
                        />
                    </Card>
                    <Button
                        sx={{ml: "auto", mt: 1}}
                        component="label"
                        role={undefined}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<CloudUploadIcon />}
                    >
                        Change THumbnail
                        <VisuallyHiddenInput
                            type="file"
                            // onChange={(event) => console.log(event.target.files)}
                            onChange={uploadThumbnail}
                        />
                    </Button>
                        {/* <Typography>{data.title}</Typography>
                        <Typography>{data.brand}</Typography> */}
                    
                    <Box sx={{mt: 2}}>
                    <Card sx={{bgcolor: "#EEEEEE"}}>

                    <Typography sx={{ p: 1, fontSize: "16px", bgcolor: "#3B92CA", color: "white"}}>PRODUCT IMAGES - ({data.images.length + localPreview.length})</Typography>
                    {
                        data.images.length>0 ?
                        <ImageList sx={{ width: 385, maxHeight: 405, height: "auto", p: 1}} cols={2} rowHeight={"auto"} gap={5}>
                            {
                                data.images.map((item, index) => (
                                    <ImageListItem key={index}>
                                    <Paper elevation={3}>
                                    {
                                        editable?
                                        <IconButton 
                                            // onClick={() => setToDelete(prev => [...prev, item])}
                                            onClick={() => markToRemove(item)}
                                            sx={{position: "absolute", top: 0, right: 0}}>
                                            <CancelIcon></CancelIcon>
                                        </IconButton>
                                        :
                                        null
                                    }
                                    <img
                                        // srcSet={`${item}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                                        // src={`${item}?w=164&h=164&fit=crop&auto=format`}
                                        src={getImageUrl(item)}
                                        alt={item}
                                        style={{height: "100%", width: "100%", objectFit: "cover"}}
                                        loading="lazy"
                                    />
                                    </Paper>
                                    </ImageListItem>
                                ))
                            }
                            {
                            showUploaded?
                                    localPreview.map((item, index) => (
                                    <ImageListItem key={index} >
                                    <Paper elevation={3}>
                                    <img
                                        // srcSet={`${item}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                                        // src={`${item}?w=164&h=164&fit=crop&auto=format`}
                                        src={item.url}
                                        alt={item}
                                        style={{height: "100%", width: "100%", objectFit: "cover"}}
                                        loading="lazy"
                                    />
                                    </Paper>
                                    </ImageListItem>
                                    ))
                                :
                                null
                            }
                        </ImageList>
                        :
                        <Box sx={{width: 385, height: 50}}>
                            <Typography >No Images for this Product</Typography>
                        </Box>
                        
                        // <Card>
                        // <Typography sx={{ p: 1, fontSize: "16px", bgcolor: "#3B92CA", color: "white"}}>PRODUCT IMAGES</Typography>
                        // <Box sx={{position: "relative"}}>
                        // {
                        //     editable?
                        //     <IconButton 
                        //         // onClick={() => setToDelete(prev => [...prev, item])}
                        //         onClick={() => markToRemove(data.images[0])}
                        //         sx={{position: "absolute", top: 10, right: 10}}>
                        //         <CancelIcon></CancelIcon>
                        //     </IconButton>
                        //     :
                        //     null
                        // }
                        // <CardMedia
                        //     component="img"
                        //     sx={{ width: 385, height: 405, objectFit: "contain"}}
                        //     image={getImageUrl(data.images)}
                        //     alt="Product Image"
                        // />
                        // </Box>
                        // </Card>
                    }
                    </Card>
                    {
                        showPreview && imagePreview.length >0?
                        <Box sx={{ width: 385, height: "auto", py: 1,}}>
                            <Card sx={{p: 1}}>
                            <Grid 
                                container
                                spacing={2}
                                columns={9}
                            >
                                {
                                    imagePreview.map(item => (
                                        <Grid key={item.url} size={3} sx={{display: "flex", justifyContent: "center", alignItems: 'center' }}>
                                            <Box sx={{position: "relative"}}>
                                            <IconButton 
                                                onClick={() => handleCancel(item)}
                                                sx={{position: "absolute", top: 0, right: 0}}>
                                                <CancelIcon></CancelIcon>
                                            </IconButton>
                                            <img src={item.url} style={{width: 100, objectFit: "contain"}}/>
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
                    <Box sx={{display: "flex", justifyContent: "space-around", gap: 2, mt: 2}}>
                    {
                        !editable?
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
                                // onChange={(event) => console.log(event.target.files)}
                                onChange={handleImagePreview}
                                multiple
                            />
                        </Button>
                        :
                        null
                    }
                    {
                        imagePreview.length > 0?
                        <Button onClick={handleUpload} variant='contained'>Submit</Button>
                        :
                        null
                    }
                    {
                        !editable && imagePreview.length === 0?
                        <Button onClick={() => setEditable(true)} variant='contained'>Remove Images</Button>
                        :null
                    }
                    {
                        editable?
                        <Box>
                            {/* <Button onClick={() => setEditable(false)} variant='contained' color='error'>Cancel</Button> */}
                            <Button onClick={revertRemoval} variant='contained' color='error' sx={{mr: 2}}>Cancel</Button>
                            <Button onClick={removeRequest} variant='contained'>Confirm</Button>
                        </Box>
                        :null
                    }
                    </Box>
                    </Box>
                </Box>
                    <Box sx={{ display: "flex", alignItems: "flex-start", bgcolor: "#EEEEEE" }}>
                    <Card sx={{p: 2}}>
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

                                <TextField label="Price (in $)" type='text' {...register("price", {
                                    required: {
                                        value: true,
                                        message: "Price is required"
                                    },
                                    pattern: {
                                        value: /^(0(?!\.00)|[1-9]\d{0,6})\.\d{2}$/,
                                        message: "Not a valid price format"
                                    }
                                })}
                                    error={!!errors.price}
                                    helperText={errors.price ? errors.price.message : ""}
                                />

                                <Box sx={{ display: "inline-flex" }}>
                                    <TextField label="Stock" type='text' sx={{ width: "100%" }} {...register("stock", {
                                        required: {
                                            value: true,
                                            message: "Price is required"
                                        },
                                        pattern: {
                                            value: /^[0-9]{0,}$/,
                                            message: "Must have and 5 characters or more"
                                        }
                                    })}
                                        error={!!errors.stock}
                                        helperText={errors.stock ? errors.stock.message : ""}
                                    />
                                </Box>
                                <Button type='submit' variant="contained">Edit Product</Button>
                            </Stack>
                        </form>
                    </Card>
                    </Box>
                </Box>
                :
                null
            }
        </Box>
    )
}

export default AdminProductsPage
