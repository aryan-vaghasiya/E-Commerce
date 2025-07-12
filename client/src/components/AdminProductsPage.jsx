import Box from '@mui/material/Box'
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Stack, width } from '@mui/system';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { getImageUrl } from '../utils/imageUrl';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

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
    const [error, setError] = useState(null);
    const token = useSelector(state => state.userReducer.token)
    const userDetails = useSelector(state => state.detailsReducer)

    const { register, handleSubmit, control, getValues, reset, formState: { errors } } = useForm()
    // const { register, handleSubmit, control, getValues, reset, formState: { errors } } = useForm({
    //     defaultValues: {
    //         title: data.title,
    //         brand: data.brand,
    //         description: data.description,
    //         price: data.price,
    //         stock: data.stock,
    //     }
    //     defaultValues: {
    //         email: userDetails.email,
    //         fName: userDetails.firstName,
    //         lName: userDetails.lastName,
    //         pNumber: userDetails.phoneNumber,
    //         addLine1: userDetails.addLine1,
    //         addLine2: userDetails.addLine2,
    //         state: userDetails.state,
    //         city: userDetails.city,
    //         pincode: userDetails.pincode,
    //     }
    // })

    useEffect(() => {
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

    const handleUpload = async (event) => {
        const formData = new FormData();
        const files = event.target.files
        for (let i = 0; i < files.length; i++) {
            formData.append("images", files[i]);
        }

        const res = await fetch(`http://localhost:3000/admin/upload/product/${productId}`, {
            method: "POST",
            body: formData,
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        if(res.ok){
            console.log("Upload Success");
        }
        else{
            console.log("Couldn't Upload");
            
        }
        // const result = await res.json()
        // console.log(result);
    }

    return (
        <Box sx={{ py: 1.5, px: 4, bgcolor: "#EEEEEE", minHeight: "91vh" }}>
            {
                data?
                <Box sx={{display: "flex", alignItems: "flex-start", justifyContent: "space-between"}}>
                <Card sx={{}}>
                    <Typography sx={{ p: 1, fontSize: "16px", bgcolor: "#3B92CA", color: "white"}}>THUMBNAIL</Typography>
                    <CardMedia
                        component="img"
                        sx={{ width: 385, height: 405, objectFit: "contain"}}
                        image={getImageUrl(data.thumbnail)}
                        alt="Product Image"
                    />
                    {/* <Typography>{data.title}</Typography>
                    <Typography>{data.brand}</Typography> */}
                </Card>
                <Box sx={{}}>
                {
                    data.images.length > 1?
                    <Card sx={{bgcolor: "#EEEEEE"}}>
                    <Typography sx={{ p: 1, fontSize: "16px", bgcolor: "#3B92CA", color: "white"}}>PRODUCT IMAGES - ({data.images.length})</Typography>
                    <ImageList sx={{ width: 385, height: 405, p: 1}} cols={2} rowHeight={"auto"} gap={5}>
                        {data.images.map((item, index) => (
                            <ImageListItem key={index}>
                            <Paper elevation={3}>
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
                        ))}
                    </ImageList>
                    </Card>
                :
                    <Card sx={{}}>
                    <Typography sx={{ p: 1, fontSize: "16px", bgcolor: "#3B92CA", color: "white"}}>PRODUCT IMAGES</Typography>
                    <CardMedia
                        component="img"
                        sx={{ width: 385, height: 405, objectFit: "contain"}}
                        image={getImageUrl(data.images)}
                        alt="Product Image"
                    />
                    </Card>
                }
                <Button
                    component="label"
                    role={undefined}
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon />}
                >
                    Upload files
                    <VisuallyHiddenInput
                        type="file"
                        // onChange={(event) => console.log(event.target.files)}
                        onChange={handleUpload}
                        multiple
                    />
                </Button>
                </Box>
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "#EEEEEE" }}>
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
