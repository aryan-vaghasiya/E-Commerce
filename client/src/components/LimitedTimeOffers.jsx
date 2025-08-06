import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import TextField from '@mui/material/TextField'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import dayjs from 'dayjs'
import { Controller, set, useForm } from 'react-hook-form'
import EditNoteIcon from '@mui/icons-material/EditNote';
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import { useState } from 'react'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'

function LimitedTimeOffers({productId}) {

    const token = useSelector(state => state.userReducer.token)
    const { register, handleSubmit, control, getValues, reset, watch, setValue, formState: { errors } } = useForm()
    const [editable, setEditable] = useState(null)
    const [editedTime, setEditedTime] = useState(null)
    const [offers, setOffers] = useState(null)
    const [toggleForm, setToggleForm] = useState(false)

    const base_mrp = offers && offers.length>0 ? offers[0].mrp : 0
    const offer_price = watch("offer_price")

    const calcDiscount = (mrp, price) => {
        if (!mrp || !price || mrp <= 0) return '';
        const discount = ((mrp - price) / mrp) * 100;
        return `${discount.toFixed(2)}`;
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
            // console.log(result);
            setOffers(result)
        }
        catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        getAllOffers()
    }, [])

    const handleEdit = (id) => {
        // console.log(id);
        setEditable(id)
    }

    const handleExtend = async (id) => {
        if(editedTime === null){
            return console.log("the date is unchanged")
        }
        const eDate = dayjs(editedTime).format(`YYYY-MM-DD HH:mm:ss`)
        // console.log(id, eDate);

        const response = await fetch("http://localhost:3000/admin/product/offer/extend", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({offer_id: id, end_time : eDate })
        })

        if (response.ok) {
            setEditable(null)
            // navigate("/admin/products", { replace: true })
        }

    }

    const addNewOffer = async (formData) => {
        // console.log("i ran");
        // console.log(formData);

        let sDate;
        let eDate;

        if (formData.start_time && formData.end_time) {
            sDate = dayjs(formData.start_time).format(`YYYY-MM-DD HH:mm:ss`)
            eDate = dayjs(formData.end_time).format(`YYYY-MM-DD HH:mm:ss`)

            if (!formData.start_time.isBefore(formData.end_time, "minute")) {
                return console.error("End Time cannot be before Start Time");
            }
            if (!dayjs().isBefore(formData.start_time, "minute") || !dayjs().isBefore(formData.end_time, "minute")) {
                return console.error("Start Time or End Time is before current Time");
            }
            formData.start_time = sDate
            formData.end_time = eDate
        }

        // console.log({ ...formData, product_id: productId, offer_discount: calcDiscount(base_mrp, offer_price) });

        const response = await fetch("http://localhost:3000/admin/product/offer/add", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ...formData, product_id: productId, offer_discount: calcDiscount(base_mrp, offer_price) })
        })

        if (response.ok) {
            // navigate("/admin/products", { replace: true })
        }
        
    }

    return (
        <Box>
            {
                offers && offers.length > 0 ?
                <Card sx={{ p: 2, mt: 2}}>
                    <Typography>Limited Time Offers:</Typography>
                {
                offers.map(offer => (
                    <Card key={offer.id} sx={{ p: 1, bgcolor: "#F8F8F8", m: 1, display: "flex", gap: 1, justifyContent: "space-between", maxHeight: 500, overflow: "auto"}}>
                        <TextField label="Offer Selling Price ($)" type='text'
                            value={offer.offer_selling_price || ""}
                            // disabled={offer.is_active === 0 ? true : false}
                            disabled={true}
                        />
                        <TextField label="Discount" type='text'
                            value={`${offer.discount_percentage} %` || ""}
                            disabled={true}
                        />
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker
                                disabled={true}
                                // disablePast
                                value={dayjs(offer.start_time)}
                                // inputRef={field.ref}
                                // onChange={(date) => {
                                //     field.onChange(date);
                                // }}
                            />
                            <DateTimePicker
                                // disablePast
                                // disabled={offer.is_active === 0 ? true : false}
                                disabled={editable === offer.id ? false : true}
                                defaultValue={dayjs(offer.end_time)}
                                // inputRef={field.ref}
                                onChange={(date) => {
                                    // field.onChange(date);
                                    setEditedTime(date)
                                }}
                            />
                        </LocalizationProvider>

                        {/* <IconButton sx={{p: 0}}>
                            <EditNoteIcon sx={{fontSize: 35}}></EditNoteIcon>
                        </IconButton> */}
                        {
                            editable !== offer.id ?
                            <Box sx={{display: "flex", alignItems: "center", px: 1}}>
                                <Button 
                                    disabled={offer.is_active === 0 ? true : false}
                                    variant='outlined' 
                                    onClick={() => handleEdit(offer.id)}
                                >
                                    {offer.is_active === 0 ? "Offer Inactive" : "Extend Offer"}
                                </Button>
                                {/* <Button variant='outlined' onClick={() => handleEdit(offer.id)}>Extend Offer</Button> */}
                            </Box>
                            :
                            <Box sx={{display: "flex", alignItems: "center", gap: 1, px: 1}}>
                                <Button variant='outlined' color='error' 
                                    onClick={() => {
                                        // setValue("end_time", offer.end_time)
                                        // reset("end_time")
                                        setEditable(null)
                                        }}
                                >
                                    Cancel
                                </Button>
                                <Button variant='outlined' onClick={() => handleExtend(offer.id)}>Apply</Button>
                            </Box>
                        }
                    </Card>
                    ))
                }
                <Divider sx={{pt: 1}} variant='middle'></Divider>
                <Box sx={{px: 1, py: 1}}>
                    <Box sx={{display: "flex", justifyContent: 'flex-end'}}>
                        <Button variant='outlined' onClick={() => setToggleForm(prev => !prev)} color={toggleForm ? "error" : "primary"}>{toggleForm ? "Cancel" : "Add Offer"}</Button>
                    </Box>
                    {
                    toggleForm ? 
                    <form onSubmit={handleSubmit(addNewOffer)} noValidate>
                        <Stack spacing={3}>
                        <Box>
                        <TextField label="Offer Selling Price ($)" type='text' {...register("offer_price", {
                                required: {
                                    value: true,
                                    message: "Offer Selling Price is required"
                                },
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
                                {...register("offer_discount", 
                                //     {
                                //     required: {
                                //         value: true,
                                //         message: "Offer Discount (%) is required"
                                //     }
                                // }
                                )}
                                value={calcDiscount(base_mrp, offer_price)}
                                // slotProps={{
                                //     input: {
                                //     readOnly: true,
                                //     },
                                // }}
                                disabled
                                sx={{ width: "40%" }}
                            />
                        </Box>
                        
                        <Box sx={{display: "flex"}}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Controller
                                // sx={{width: "100%"}}
                                control={control}
                                // defaultValue={dayjs()}
                                name="start_time"
                                rules={{ required: "Start Date is required" }}
                                render={({ field, fieldState }) => (
                                    <DateTimePicker
                                        sx={{width: "100%", pr: 1}}
                                        disablePast
                                        // value={field.value}
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
                            <Controller
                                control={control}
                                // defaultValue={dayjs().add(1, 'day')}
                                name="end_time"
                                rules={{ required: "End Date is required" }}
                                render={({ field, fieldState }) => (
                                    <DateTimePicker
                                        sx={{width: "100%"}}
                                        disablePast
                                        // value={field.value}
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
                        </LocalizationProvider>
                        </Box>
                        <Button type='submit' variant='contained'>Submit</Button>
                    </Stack>
                    </form>
                    :
                    null
                    }
                    {/* </Box> */}
                </Box>
                </Card>
            :
            null
            }
        </Box>
    )
}

export default LimitedTimeOffers
