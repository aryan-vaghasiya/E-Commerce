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
import { useDispatch, useSelector } from 'react-redux'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { hideSnack, showSnack } from '../redux/snackbar/snackbarActions'
const API_URL = import.meta.env.VITE_API_SERVER;


function LimitedTimeOffers({productId, mrp}) {

    const token = useSelector(state => state.userReducer.token)
    const snackbarState = useSelector((state) => state.snackbarReducer)
    const dispatch = useDispatch()
    const { register, handleSubmit, control, getValues, reset, watch, setValue, formState: { errors } } = useForm()
    const [editable, setEditable] = useState(null)
    const [editedStartTime, setEditedStartTime] = useState(null)
    const [editedEndTime, setEditedEndTime] = useState(null)
    const [offers, setOffers] = useState(null)
    const [toggleForm, setToggleForm] = useState(false)
    const [toggleEditing, setToggleEditing] = useState(false)
    const [openEndDialog, setOpenEndDialog] = useState(false)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [toEnd, setToEnd] = useState({id: null, index: null})
    const [toDelete, setToDelete] = useState({id: null, index: null})

    // const base_mrp = offers && offers.length>0 ? offers[0].mrp : 0
    const base_mrp = mrp
    const offer_price = watch("offer_price")
    const discountError = parseFloat(offer_price) > parseFloat(base_mrp);

    const calcDiscount = (mrp, price) => {
        if (!mrp || !price || mrp <= 0) return '';
        const discount = ((mrp - price) / mrp) * 100;
        return `${discount.toFixed(2)}`;
    }

    const handleCloseEndDialog = () => {
        setOpenEndDialog(false)
        setToEnd({id: null, index: null})
    }
    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false)
        setToDelete({id: null, index: null})
    }

    const getAllOffers = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/product/get-offers?productId=${productId}`, {
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
            setEditable(0)
            // setEditable(result.length - 1)
        }
        catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        getAllOffers()
    }, [])

    const handleEdit = () => {
        setToggleEditing(true)
        setToggleForm(false)
    }

    const handleEndNow = async (offerId, index) => {
        const response = await fetch(`${API_URL}/admin/product/offer/end`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({offer_id : offerId})
        })

        if (response.ok) {
            dispatch(showSnack({message: "Offer Ended", severity: "success"}))
            const newOffers = [...offers];
            if (newOffers[index]?.id === offerId) {
                newOffers[index] = {...newOffers[index], end_time: dayjs(), is_active: 0}
            }
            setOffers(newOffers);
            setOpenEndDialog(false)

            // let newOffers = offers
            // if(newOffers[index].id === offerId){
            //     newOffers[index].end_time = dayjs()
            //     newOffers[index].is_active = 0
            // }
            // console.log(newOffers);
            // setOffers(newOffers)
        }
    }

    const handleDelete = async (offerId, index) => {
        if(dayjs(offers[index].start_time) < dayjs()){
            return console.log("Cannot delete, offer already started, End now instead")
        }
        const response = await fetch(`${API_URL}/admin/product/offer/delete`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({offer_id : offerId})
        })

        if (response.ok) {
            dispatch(showSnack({message: "Offer Deleted", severity: "success"}))
            const newOffers = offers.filter(item => item.id !== offerId)
            // const newOffers = offers
            // newOffers.splice(index, 1)

            setOffers(newOffers)
            setOpenDeleteDialog(false)
        }
    }

    const handleExtend = async (id, index) => {        
        if(editedEndTime === null && editedStartTime === null){
            dispatch(showSnack({message: "There was no change in time", severity: "warning"}))
            return console.log("the date is unchanged")
        }
        if(editedStartTime){
            const prevStartDate = dayjs(offers[index].start_time);
            const prevOfferEndDate = dayjs(offers[index + 1]?.end_time);

            // console.log(prevOfferEndDate);
            if( editedStartTime < prevStartDate){
                dispatch(showSnack({message: "Start time can't be extended backwards", severity: "warning"}))
                return console.log("cant go backwards")
            }
            if(prevOfferEndDate && editedStartTime < prevOfferEndDate){
                dispatch(showSnack({message: "Start time can't be before previous offer's end time", severity: "warning"}))
                return console.log("cant go backwards")
            }

            let currentOfferEndDate;
            if(editedEndTime){
                currentOfferEndDate = editedEndTime
            }
            else{
                currentOfferEndDate = dayjs(offers[index].end_time)
            }

            if(editedStartTime > currentOfferEndDate){
                dispatch(showSnack({message: "Start time can't be more than End time", severity: "warning"}))
                return console.log("start date cant be more than end date")
            }
        }
        if(editedEndTime){
            const prevStartDate = dayjs(offers[index].start_time)
            if( editedEndTime < prevStartDate){
                dispatch(showSnack({message: "End time can't be before Start time", severity: "warning"}))
                return console.log("End time cant be less than start time")
            }
        }

        const sDate = editedStartTime ? dayjs(editedStartTime).format(`YYYY-MM-DD HH:mm:ss`) : null
        const eDate = editedEndTime ? dayjs(editedEndTime).format(`YYYY-MM-DD HH:mm:ss`) : null
        // console.log(id, sDate, eDate);

        const response = await fetch(`${API_URL}/admin/product/offer/extend`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({offer_id: id, start_time : sDate, end_time : eDate })
        })

        if (response.ok) {
            // const newOffers = offers.map(item => {
            //     if(item.id === id){
            //         item.end_time = editedEndTime
            //         editedStartTime ? item.start_time = editedStartTime : null
            //         return item
            //     }
            //     else{
            //         return item
            //     }
            // })

            // let newOffers = offers
            // if(newOffers[index].id === id){
            //     newOffers[index].end_time = editedEndTime
            //     editedStartTime ? newOffers[index].start_time = editedStartTime : null
            //     if(newOffers[index].start_time < dayjs() < newOffers[index].end_time){
            //         newOffers[index].is_active = 1
            //     }
            // }
            // setOffers(newOffers)

            dispatch(showSnack({message: "Offer Extended", severity: "success"}))
            let newOffers = [...offers];
            newOffers[index] = {
                ...newOffers[index],
                end_time: editedEndTime,
                start_time: editedStartTime || newOffers[index].start_time,
                is_active: dayjs().isBetween(editedStartTime || newOffers[index].start_time, editedEndTime) ? 1 : 0
            }
            setOffers(newOffers);
            setToggleEditing(false)
        }
    }

    const addNewOffer = async (formData) => {
        // console.log(formData);

        let sDate;
        let eDate;

        if (formData.start_time && formData.end_time) {
            sDate = dayjs(formData.start_time).format(`YYYY-MM-DD HH:mm:ss`)
            eDate = dayjs(formData.end_time).format(`YYYY-MM-DD HH:mm:ss`)

            if (!formData.start_time.isBefore(formData.end_time, "minute")) {
                dispatch(showSnack({message: "End time can't be before Start time", severity: "warning"}))
                return console.error("End time cannot be before Start time");
            }
            if (!dayjs().isBefore(formData.start_time, "minute") || !dayjs().isBefore(formData.end_time, "minute")) {
                // console.log("i ran 1");
                dispatch(showSnack({message: "Start time or End time is before current time", severity: "warning"}))
                return console.error("Start time or End time is before current time");
            }
            if (dayjs(formData.start_time).isBefore(offers[0]?.end_time, "minute")) {
                // console.log("i ran 2");
                dispatch(showSnack({message: "Start time cant be before previous offers Tnd time", severity: "warning"}))
                return console.error("Start time cant be before previous offers Tnd time");
            }
            formData.start_time = sDate
            formData.end_time = eDate
        }

        // console.log({ ...formData, product_id: productId, offer_discount: calcDiscount(base_mrp, offer_price) });

        const response = await fetch(`${API_URL}/admin/product/offer/add`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ...formData, product_id: productId, offer_discount: calcDiscount(base_mrp, offer_price) })
        })

        if (response.ok) {
            const newOffers = await response.json()
            // console.log(newOffers);
            setOffers(newOffers)
            setToggleForm(false)
            // navigate("/admin/products", { replace: true })
        }
    }

    return (
        <Box>
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
            <Dialog
                open={openEndDialog}
                onClose={handleCloseEndDialog}
                // aria-labelledby="alert-dialog-title"
                // aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    End offer now ?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        This limited time offer will be ended now, click Yes if you want to proceed further.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                <Button onClick={handleCloseEndDialog} color='error'>No</Button>
                <Button onClick={() => handleEndNow(toEnd.id, toEnd.index)} autoFocus>Yes</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openDeleteDialog}
                onClose={handleCloseDeleteDialog}
                // aria-labelledby="alert-dialog-title"
                // aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Delete offer ?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        This limited time offer will be permanently deleted, click Yes if you want to proceed further.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                <Button onClick={handleCloseDeleteDialog} color='error'>No</Button>
                <Button onClick={() => handleDelete(toDelete.id, toDelete.index)} autoFocus>Yes</Button>
                </DialogActions>
            </Dialog>
            {/* {
                offers && offers.length > 0 ? */}
                <Card sx={{ p: 2, mt: 2}}>
                    <Box sx={{px: 1, py: 1}}>
                    <Box sx={{display: "flex", justifyContent: 'space-between', alignItems: "center", mb: 1}}>
                        <Typography sx={{fontSize: 16}}>Limited Time Offers:</Typography>
                        <Button variant='outlined' sx={{}} onClick={() => setToggleForm(prev => !prev)} color={toggleForm ? "error" : "primary"}>{toggleForm ? "Cancel" : "Add Offer"}</Button>
                    </Box>
                    <Divider sx={{pt: 1}}></Divider>
                    {
                    toggleForm ?
                    <Box sx={{mt: 2}}>
                    <Typography sx={{pb: 1}}>Add new offer: </Typography>
                    <form onSubmit={handleSubmit(addNewOffer)} noValidate>
                        {/* <Stack spacing={3}> */}
                        <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}> 
                            <Box sx={{display: "flex", gap: 1}}>
                            <TextField label="Selling Price ($)" type='text' {...register("offer_price", {
                                    required: {
                                        value: true,
                                        message: "Offer Selling Price is required"
                                    },
                                    pattern: {
                                        value: /^(0(?!\.00)|[1-9]\d{0,6})\.\d{2}$/,
                                        message: "Not a valid price format"
                                    },
                                    validate: (value) =>
                                        parseFloat(value) <= base_mrp
                                            ? true
                                            : `Offer price cannot be greater than MRP (${base_mrp})`
                                })}
                                    error={!!errors.offer_price}
                                    helperText={errors.offer_price ? errors.offer_price.message : ""}
                                    // sx={{ maxWidth: 400}}
                                />

                                <TextField label="Discount (%)" type="text"
                                    {...register("offer_discount", 
                                    )}
                                    value={calcDiscount(base_mrp, offer_price)}
                                    disabled
                                    // sx={{ maxWidth: 400 }}
                                    error={discountError}
                                    helperText={discountError ? `Discount is negative. Price can't be greater than MRP` : ""}
                                />
                            
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <Controller
                                    control={control}
                                    name="start_time"
                                    rules={{ required: "Start Date is required" }}
                                    render={({ field, fieldState }) => (
                                        <DateTimePicker
                                            sx={{maxWidth: 500, pr: 1}}
                                            label="Start Time"
                                            disablePast
                                            minDateTime={dayjs(offers[0]?.end_time)}
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
                                            sx={{maxWidth: 500}}
                                            label="End Time"
                                            disablePast
                                            minDateTime={dayjs(offers[0]?.end_time)}
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
                            </Box >
                                <Button type='submit' variant='contained'>Submit</Button>
                            </Box>
                        {/* </Stack> */}
                        </form>
                        <Divider sx={{mt: 3}}></Divider>
                        </Box>
                        :
                        null
                        }
                        {/* </Box> */}
                    </Box>
                <Typography sx={{pl: 1, pt: 1, pb: 2}}>Offer History: </Typography>
                <Box sx={{maxHeight: 440, overflow: "auto"}}>
                {
                offers && offers.length > 0 ? offers.map((offer, index) => (
                    <Card key={offer.id} sx={{mb: 2, borderRadius: 3, width: "98%", mx: "auto", bgcolor: "#F0F0F0"}} elevation={3}>
                        <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", p: 2}}>
                            <Box sx={{maxWidth: "80%"}}>
                                <Typography sx={{pb: 1}}>
                                    <Typography component={'span'} sx={{fontWeight: 700}}>Price: </Typography>
                                    {` $${(offer.offer_selling_price).toFixed(2)} (${(offer.discount_percentage).toFixed(2)}% off)` }</Typography>
                                <Typography>
                                    <Typography component={'span'} sx={{fontWeight: 700}}>Validity: </Typography>
                                    {` ${ dayjs(offer.start_time).format(`DD MMM YYYY, hh:mm A`)} - ${ dayjs(offer.end_time).format(`DD MMM YYYY, hh:mm A`)}`}
                                </Typography>
                            </Box>
                            <Box sx={{display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1}}>
                                <Chip label={dayjs().isBetween(offer.start_time, offer.end_time) ? "Active" : "Inactive"} color={dayjs().isBetween(offer.start_time, offer.end_time)  ? "success" : "error"} sx={{fontSize: 12}}/>
                                {/* <Chip label={offer.is_active ? "Active" : "Inactive"} color={offer.is_active ? "success" : "error"} sx={{fontSize: 12}}/> */}
                                {/* {
                                    editable === index ?
                                    <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                                        {
                                            // dayjs(offer.end_time) > dayjs() && dayjs(offer.start_time) < dayjs() ?
                                            // <Button variant='outlined' color='error' onClick={() => handleEndNow(offer.id, index)}>End Now</Button>
                                            // : 
                                            dayjs(offer.end_time) > dayjs() && dayjs(offer.start_time) > dayjs() ?
                                            <Button variant='outlined' color='error' onClick={() => handleDelete(offer.id, index)}>Delete Offer</Button>
                                            :
                                            null
                                        }
                                        
                                        {
                                            toggleEditing && editable === index? 
                                            <Box>
                                                <Button variant='outlined' color='error' 
                                                    onClick={() => {
                                                        // setValue("end_time", offer.end_time)
                                                        // reset("end_time")
                                                        // setEditable(null)
                                                        setToggleEditing(false)
                                                        }}
                                                >
                                                    Cancel
                                                </Button>
                                            </Box>
                                            : 
                                            editable === index ?
                                            <Box sx={{display: "flex", gap: 1}}>
                                                <Button onClick={handleEdit} variant='outlined'>Edit</Button>
                                                {
                                                offer.is_active ?
                                                    <Button variant='outlined' color='error' onClick={() => handleEndNow(offer.id, index)}>End Now</Button>
                                                :
                                                null
                                                }
                                            </Box>
                                            :
                                            null
                                        }
                                    </Box>
                                    :
                                    null
                                } */}

                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    {
                                    dayjs(offer.start_time).isAfter(dayjs()) ?
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            // onClick={() => handleDelete(offer.id, index)}
                                            onClick={() => {
                                                setOpenDeleteDialog(true)
                                                setToDelete({id: offer.id, index})
                                            }}
                                        >
                                            Delete Offer
                                        </Button>
                                    :
                                    null
                                    }

                                    {
                                    // offer.is_active ?
                                    dayjs().isBetween(offer.start_time, offer.end_time) ?
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => {
                                                setToEnd({id: offer.id, index})
                                                setOpenEndDialog(true)
                                            }}
                                            // onClick={() => handleEndNow(offer.id, index)}
                                        >
                                            End Now
                                        </Button>
                                    :
                                    null
                                    }

                                    {
                                    editable === index ? 
                                        toggleEditing ? 
                                        <Button variant="outlined" color="error" onClick={() => setToggleEditing(false)}>
                                            Cancel
                                        </Button>
                                        :
                                        <Button onClick={handleEdit} variant="outlined">
                                            Edit
                                        </Button>
                                    : 
                                    null
                                    }
                                </Box>
                            </Box>
                        </Box>
                        {
                            editable === index && toggleEditing?
                            <Box>
                                <Divider variant='middle'></Divider>
                                <Box sx={{p: 2}}>
                                    <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                                        <Box>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DateTimePicker
                                                    sx={{m:1, ml: 0}}
                                                    label={"Start Time"}
                                                    disabled={dayjs(offer.start_time) < dayjs()}
                                                    disablePast
                                                    defaultValue={dayjs(offer.start_time)}
                                                    minDateTime={dayjs(offer.start_time)}
                                                    onChange={(date) => setEditedStartTime(date)}
                                                />
                                                <DateTimePicker
                                                    sx={{my: 1}}
                                                    label={"End Time"}
                                                    disablePast
                                                    defaultValue={dayjs(offer.end_time)}
                                                    minDateTime={dayjs(offer.start_time)}
                                                    onChange={(date) => setEditedEndTime(date)}
                                                />
                                            </LocalizationProvider>
                                        </Box>

                                        <Button variant='contained' onClick={() => handleExtend(offer.id, index)} sx={{ml: 1}}>
                                            Apply
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                            :
                            null
                        }
                    </Card>
                    // <Card key={offer.id} sx={{ p: 1, bgcolor: "#F8F8F8", m: 1, display: "flex", gap: 1, justifyContent: "space-between", maxHeight: 500, overflow: "auto"}}>
                    //     <TextField label="Offer Selling Price ($)" type='text'
                    //         value={offer.offer_selling_price || ""}
                    //         // disabled={offer.is_active === 0 ? true : false}
                    //         disabled={true}
                    //     />
                    //     <TextField label="Discount" type='text'
                    //         value={`${offer.discount_percentage} %` || ""}
                    //         disabled={true}
                    //     />
                    //     <LocalizationProvider dateAdapter={AdapterDayjs}>
                    //         <DateTimePicker
                    //             disabled={true}
                    //             // disablePast
                    //             value={dayjs(offer.start_time)}
                    //             // inputRef={field.ref}
                    //             // onChange={(date) => {
                    //             //     field.onChange(date);
                    //             // }}
                    //         />
                    //         <DateTimePicker
                    //             // disablePast
                    //             // disabled={offer.is_active === 0 ? true : false}
                    //             disabled={editable === offer.id ? false : true}
                    //             defaultValue={dayjs(offer.end_time)}
                    //             // inputRef={field.ref}
                    //             onChange={(date) => {
                    //                 // field.onChange(date);
                    //                 setEditedTime(date)
                    //             }}
                    //         />
                    //     </LocalizationProvider>

                    //     {/* <IconButton sx={{p: 0}}>
                    //         <EditNoteIcon sx={{fontSize: 35}}></EditNoteIcon>
                    //     </IconButton> */}
                    //     {
                    //         editable !== offer.id ?
                    //         <Box sx={{display: "flex", alignItems: "center", px: 1}}>
                    //             <Button 
                    //                 disabled={offer.is_active === 0 ? true : false}
                    //                 variant='outlined' 
                    //                 onClick={() => handleEdit(offer.id)}
                    //             >
                    //                 {offer.is_active === 0 ? "Offer Inactive" : "Extend Offer"}
                    //             </Button>
                    //             {/* <Button variant='outlined' onClick={() => handleEdit(offer.id)}>Extend Offer</Button> */}
                    //         </Box>
                    //         :
                    //         <Box sx={{display: "flex", alignItems: "center", gap: 1, px: 1}}>
                    //             <Button variant='outlined' color='error' 
                    //                 onClick={() => {
                    //                     // setValue("end_time", offer.end_time)
                    //                     // reset("end_time")
                    //                     setEditable(null)
                    //                     }}
                    //             >
                    //                 Cancel
                    //             </Button>
                    //             <Button variant='outlined' onClick={() => handleExtend(offer.id)}>Apply</Button>
                    //         </Box>
                    //     }
                    // </Card>
                    ))
                    :
                    <Typography sx={{pl: 1, py: 1}}>This product never had limited time offers</Typography>
                }
                </Box>
                </Card>
            {/* :
            null
            } */}
        </Box>
    )
}

export default LimitedTimeOffers
