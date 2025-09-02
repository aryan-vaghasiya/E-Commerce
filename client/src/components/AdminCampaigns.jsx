// import { Box, Button, Card } from "@mui/material"
// import { useNavigate } from "react-router"

// function AdminCampaigns() {

//     const navigate = useNavigate()

//     return (
//         <Box>
//             <Box>
//                 <Card>
//                     <Button onClick={() => navigate("/admin/campaigns/add")}>Add Template</Button>
//                 </Card>
//             </Box>
//             <Box>
//                 <Card>
//                     No campaigns yet.
//                 </Card>
//             </Box>
//         </Box>
//     )
// }

// export default AdminCampaigns


import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    TextField,
    Stack,
    FormControl,
    InputLabel,
    Select,
    FormHelperText,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router"
import { useSelector } from "react-redux";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";

// Fake APIs for now
const fetchCampaigns = async () => {
    return [
        { id: 1, name: "Welcome Campaign", template_id: 2, scheduled_at: "2025-09-01T12:00:00", status: "Scheduled" },
        { id: 2, name: "Sale Reminder", template_id: 1, scheduled_at: "2025-09-05T10:00:00", status: "Draft" },
    ];
};

const fetchTemplates = async () => {
    return [
        { id: 1, name: "Order Status Update" },
        { id: 2, name: "Welcome Email" },
        { id: 3, name: "Sale Announcement" },
    ];
};

export default function AdminCampaigns() {
    const userState = useSelector(state => state.userReducer)
    const [campaigns, setCampaigns] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate()
    const [allFileNames, setAllFileNames] = useState(null);
    const [activeFileName, setActiveFileName] = useState(null);
    const [activeFileContent, setActiveFileContent] = useState(null);

    const { register, control, handleSubmit, reset, formState: { errors }} = useForm();

    const fetchAllTemplates = async (token, active = "any") => {
        // console.log(active);
        try {
            const res = await fetch(`http://localhost:3000/admin/templates/get-files?active=${active}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if(!res.ok){
                const error = await res.json()
                return console.error("Could not fetch all templates:", error.error);
            }
            const data = await res.json();
            // console.log(data);

            const fileNamesArr = []
            for(let item of data.files){
                fileNamesArr.push(item.name)
                if(item.name === active){
                    setActiveFileName(item.name)
                    setActiveFileContent(item.content)
                }
            }
            setAllFileNames(fileNamesArr)

            if(active === "any"){
                setActiveFileName(data.files[0].name);
                setActiveFileContent(data.files[0].content)
            }
        }
        catch (err) {
            console.error("Basic template fetch failed:", err.message);
        }
    }

    useEffect(() => {
        (async () => {
            setCampaigns(await fetchCampaigns());
            setTemplates(await fetchTemplates());
        })();
        fetchAllTemplates(userState.token)
    }, []);

    const handleAddCampaign = async (formData) => {
        // console.log(formData);

        const schedule_time = dayjs(formData.schedule_time).format(`YYYY-MM-DD HH:mm:ss`)
        // console.log(schedule_time);

        try {
            const res = await fetch("http://localhost:3000/admin/campaigns/add", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${userState.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({...formData, schedule_time})
            });
            if(!res.ok){
                const error = await res.json()
                return console.error("Could not add new campaign:", error.error);
            }

            // const newFile = await res.json()
            // setAllFileNames(prev => [...prev, newFile.name])
            // setActiveFileName(newFile.name)
            // setActiveFileContent(newFile.content)
            // setOriginalFileContent(newFile.content)
            setOpen(false)
            reset(); // Reset form
        }
        catch (err) {
            console.error("Adding new campaign failed:", err.message);
        }

        // const newCampaign = { ...formData, id: Date.now(), status: "Draft" };
        // setCampaigns((prev) => [...prev, newCampaign]);
        // setOpen(false);
        // reset();
    };

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                    <Typography variant="h5">Campaigns</Typography>
                </Box>
                <Box>
                    <Button variant="contained" onClick={() => setOpen(true)}>
                    New Campaign
                    </Button>
                    <Button variant="contained" onClick={() => navigate("/admin/campaigns/add")}>Add Template</Button>
                </Box>
            </Box>

            {/* Campaign list */}
            <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={2}>
                {campaigns.map((c) => (
                    <Card key={c.id} sx={{ borderRadius: 2, boxShadow: 3 }}>
                        <CardContent>
                            <Typography variant="h6">{c.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Status: {c.status}
                            </Typography>
                            <Typography variant="body2">Template ID: {c.template_id}</Typography>
                            <Typography variant="body2">Scheduled: {c.scheduled_at}</Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {/* Dialog for new campaign */}
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
                <DialogTitle>Create Campaign</DialogTitle>
                <Box sx={{display: "flex"}}>
                    <Box>
                        <Box component="form" onSubmit={handleSubmit(handleAddCampaign)} sx={{}}>
                            <DialogContent sx={{pt: 1}}>
                                <Stack gap={2}>
                                    {/* <Controller
                                        name="name"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField {...field} label="Campaign Name" fullWidth margin="normal" />
                                        )}
                                    /> */}
                                    <TextField multiline label="Campaign Name" type='text' sx={{ width: "100%", mr: 1 }} 
                                        {...register("name", {
                                            required: {
                                                value: true,
                                                message: "Name is required"
                                            },
                                            pattern: {
                                                value: /^.{5,}$/,
                                                message: "Name must be 5 or more characters"
                                            },
                                        })}
                                        // defaultValue=""
                                        error={!!errors.name}
                                        helperText={errors.name ? errors.name.message : ""}
                                    />
                                    {/* <Controller
                                        defaultValue=""
                                        name="template_id"
                                        control={control}
                                        required={true}
                                        render={({ field }) => (
                                            <TextField {...field} select label="Template" fullWidth margin="normal">
                                                {templates.map((t) => (
                                                    <MenuItem key={t.id} value={t.name}>
                                                        {t.name}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        )}
                                    /> */}
                                    <FormControl fullWidth error={!!errors.template_name}>
                                        <InputLabel id="template_name">Template Name</InputLabel>
                                        <Controller
                                            name="template_name"
                                            control={control}
                                            rules={{ required: "Template Name is required" }}
                                            
                                            render={({field}) => (
                                                <Select
                                                    {...field}
                                                    labelId="template_name"
                                                    label="Template Name"
                                                    value={field.value ?? ""}
                                                    onChange={(e) => {
                                                        field.onChange(e)
                                                        fetchAllTemplates(userState.token, e.target.value)
                                                    }}
                                                >
                                                    {allFileNames && allFileNames.length > 0 ?
                                                        allFileNames.map((t) => (
                                                            <MenuItem key={t} value={t}>
                                                                {t}
                                                            </MenuItem>
                                                        ))
                                                        :
                                                        <MenuItem disabled>No Templates available</MenuItem>
                                                    }
                                                </Select>
                                            )}
                                        />
                                        {errors.template_name && <FormHelperText>{errors.template_name.message}</FormHelperText>}
                                    </FormControl>
                                    <TextField multiline label="Subject" type='text' sx={{ width: "100%", mr: 1 }} 
                                        {...register("subject", {
                                            required: {
                                                value: true,
                                                message: "Subject is required"
                                            },
                                            pattern: {
                                                value: /^.{5,}$/,
                                                message: "Subject must be 5 or more characters"
                                            },
                                        })}
                                        // defaultValue=""
                                        error={!!errors.subject}
                                        helperText={errors.subject ? errors.subject.message : ""}
                                    />
                                    {/* <Controller
                                        name="scheduled_at"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                type="datetime-local"
                                                label="Schedule At"
                                                fullWidth
                                                margin="normal"
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        )}
                                    /> */}
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <Controller
                                            control={control}
                                            defaultValue={dayjs()}
                                            name="schedule_time"
                                            rules={{ 
                                                required: "Schedule Time is required", 
                                                validate: (value) => dayjs(value).isAfter(dayjs()) || "Schedule must be in the future" }}
                                            render={({ field, fieldState}) => (
                                                <DateTimePicker
                                                    // disablePast
                                                    minDateTime={dayjs()}
                                                    value={field.value}
                                                    inputRef={field.ref}
                                                    onChange={(date) => {
                                                        field.onChange(date);
                                                    }}
                                                    slotProps={{
                                                        textField: {
                                                            error: !!fieldState.error,
                                                            helperText: fieldState.error?.message
                                                        }
                                                    }}
                                                />
                                            )}
                                        />
                                    </LocalizationProvider>
                                </Stack>
                            </DialogContent>
                            <DialogActions sx={{pb: 2, pt: 0, px: 3}}>
                                <Button color="error" onClick={() => setOpen(false)}>Cancel</Button>
                                {/* <Button onClick={handleSubmit(onSubmit)} variant="contained"> */}
                                <Button type="submit" variant="contained">
                                    Save
                                </Button>
                            </DialogActions>
                        </Box>
                    </Box>
                    <Box sx={{mb: 2}}>
                        {/* <DialogContent> */}
                            <Box sx={{height: "100%", pt: 1}}>
                                <iframe
                                    // srcDoc={activeFileContent || ''}
                                    srcDoc={activeFileContent ? activeFileContent.replaceAll("{{fName}}", "John").replaceAll("{{lName}}", "Doe") : ''}
                                    // sandbox="allow-same-origin"
                                    title="preview"
                                    width="100%"
                                    height="100%"
                                    style={{border: "1px solid black", borderRadius: "5px"}}
                                />
                            </Box>
                        {/* </DialogContent> */}
                    </Box>
                </Box>
                
            </Dialog>
        </Box>
    );
}
