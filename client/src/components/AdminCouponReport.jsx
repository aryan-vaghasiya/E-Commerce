import Box from '@mui/material/Box'
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';

function AdminCouponReport() {

    const { couponId } = useParams()
    const token = useSelector(state => state.userReducer.token)
    const { register, handleSubmit, control, reset, watch, resetField, setValue } = useForm()
    const [filterTime, setFilterTime] = useState()

    const handleReportFilter = async (formData) => {
        console.log(formData);
        fetchCouponReport(couponId, formData.timeRange)
    }

    const handleTimeRangeChange = (event) => {
        setFilterTime(event.target.value)
    }

    const fetchCouponReport = async (coupon_id, days = 0) => {
        try{
            const response = await fetch(`http://localhost:3000/admin/coupons/${couponId}/report?days=${days}`, {
                headers: {
                    Authorization : `Bearer ${token}`
                }
            })

            if(!response.ok){
                const error = await response.json()
                return console.log(error)
            }
            const result = await response.json()
            console.log(result)
        }
        catch(err){
            console.error(err.message)
        }
    }

    useEffect(() => {
        fetchCouponReport(couponId)
    }, [])

    return (
        <Box>
            <Box component="form" onSubmit={handleSubmit(handleReportFilter)}>
                <FormControl fullWidth>
                    <InputLabel id="select-label">Choose an option</InputLabel>
                    <Controller
                        name="timeRange"
                        control={control}
                        defaultValue={0}
                        render={({ field }) => (
                            <Select
                                labelId="select-label"
                                label="Choose an option"
                                {...field}
                            >
                                <MenuItem value={0}>Today</MenuItem>
                                <MenuItem value={7}>Last 7 Days</MenuItem>
                                <MenuItem value={30}>Last 30 Days</MenuItem>
                                {/* <MenuItem value={999}>Option 3</MenuItem> */}
                            </Select>
                        )}
                    />
                </FormControl>
                <Button type='submit'>Submit</Button>
            </Box>
        </Box>
    )
}

export default AdminCouponReport
