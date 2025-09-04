import { useState, useEffect } from "react";
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
    Divider,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router"
import { useSelector } from "react-redux";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';
import { DataGrid } from "@mui/x-data-grid";


export default function AdminCampaigns() {
    const userState = useSelector(state => state.userReducer)
    const { register, control, handleSubmit, reset, formState: { errors }} = useForm();

    const [open, setOpen] = useState(false);
    const navigate = useNavigate()
    const [allFileNames, setAllFileNames] = useState([]);
    const [activeFileName, setActiveFileName] = useState(null);
    const [activeFileContent, setActiveFileContent] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [totalCampaigns, setTotalCampaigns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });

    const fetchCampaigns = async (page, limit) => {
        setLoading(true)
        try {
            const res = await fetch(`http://localhost:3000/admin/campaigns/get?page=${page}&limit=${limit}`, {
                headers: {
                    Authorization: `Bearer ${userState.token}`,
                },
            });
            if(!res.ok){
                const error = await res.json()
                return console.error("Could not fetch Campaigns:", error.error);
            }
            const data = await res.json();
            // console.log(data);
            setCampaigns(data.campaigns)
            setTotalCampaigns(data.total)
        }
        catch (err) {
            console.error("Campaigns fetch failed:", err.message);
        }
        finally{
            setLoading(false)
        }
    }

    const fetchAllTemplates = async (active = "any") => {
        try {
            const res = await fetch(`http://localhost:3000/admin/templates/get-files?active=${active}`, {
                headers: {
                    Authorization: `Bearer ${userState.token}`,
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
        fetchCampaigns(paginationModel.page + 1, paginationModel.pageSize);
    }, [paginationModel]);

    const handleAddCampaign = async (formData) => {
        // console.log(formData);

        const schedule_time = dayjs(formData.schedule_time).startOf('minute').format(`YYYY-MM-DD HH:mm:ss`)
        console.log(schedule_time);

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
            setOpen(false)
            reset();
            fetchCampaigns()
        }
        catch (err) {
            console.error("Adding new campaign failed:", err.message);
        }
    };

    const handlePaginationChange = (newModel) => {
        setPaginationModel(newModel);
        fetchCampaigns(newModel.page + 1, newModel.pageSize);
    };

    // const fetchTemplateContent = async (event) => {
    //     const template = event.row.template_name
    //     console.log(event.row.template_name);
    //     try {
    //         const res = await fetch(`http://localhost:3000/admin/templates/get?template=${template}`, {
    //             headers: {
    //                 Authorization: `Bearer ${userState.token}`,
    //             },
    //         });
    //         if(!res.ok){
    //             const error = await res.json()
    //             return console.error("Could not fetch template data:", error.error);
    //         }
    //         const data = await res.json();
    //         console.log(data);
    //     }
    //     catch (err) {
    //         console.error("Template data fetch failed:", err.message);
    //     }
    // }

    const campaignColumns = [
        { 
            field: 'id', headerName: 'Campaign ID', width: 110, align : "right"
        },
        {
            field: 'name',
            headerName: 'Campaign Name',
            width: 180,
            editable: false,
        },
        {
            field: 'template_name',
            headerName: 'Template',
            width: 160,
            editable: false,
        },
        {
            field: 'scheduled_at',
            headerName: 'Scheduled Time',
            align: "right",
            width: 130,
            editable: false,
            renderCell : (params) => <span>{dayjs(params.value).format("h:mm A, D MMM")}</span>
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 110,
            editable: false,
            renderCell : (params) => <span>{params.value.charAt(0).toUpperCase() + params.value.slice(1).toLowerCase()}</span>
        },
        {
            field: 'updated_at',
            headerName: 'Last Updated',
            align: "right",
            width: 130,
            editable: false,
            renderCell : (params) => <span>{dayjs(params.value).format("h:mm A, D MMM")}</span>
        },
    ];

    return (
        <Box sx={{ py: 1.5, px: 4, bgcolor: "#EEEEEE", minHeight: "91vh" }}>
            <Box sx={{display : "flex", justifyContent : "space-between", pb: 1}}>
                <Typography variant='h4' component='h1' sx={{fontWeight: "200"}}>Campaigns</Typography>
                <Box sx={{display: "flex", gap: 1, alignItems: "center"}}>
                    <Button variant="contained" 
                        onClick={() =>{ 
                            setOpen(true)
                            fetchAllTemplates()
                        }} 
                        startIcon={<AddIcon/>}
                    >
                        Add Campaign
                    </Button>
                    <Button variant="contained" onClick={() => navigate("/admin/campaigns/templates")} startIcon={<DescriptionIcon/>}>
                        Templates
                    </Button>
                </Box> 
            </Box>
            <Divider sx={{mt: 1, mb: 2}}/>

            {/* Campaign list */}
            {/* <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={2}>
                {campaigns.map((c) => (
                    <Card key={c.id} sx={{ borderRadius: 2, boxShadow: 3 }}>
                        <CardContent>
                            <Typography variant="h6">{c.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Status: {c.status}
                                <Typography component="span">{c.status === "completed" || c.status === "failed" ? ` (${dayjs(c.updated_at).format("hh:mm A, D MMM")})` : null}</Typography>
                            </Typography>
                            <Typography variant="body2">Template: {c.template_name}</Typography>
                            <Typography variant="body2">Scheduled: {dayjs(c.scheduled_at).format("DD MMM YYYY, hh:mm A")}</Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box> */}

            {/* Dialog for new campaign */}
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth slotProps={{paper: {elevation: 5, sx: {minWidth: "80%", minHeight: "80%"}}}}>
                
                <Box sx={{display: "flex", width: "100%", flexGrow: 1, minWidth: "500px"}}>
                    <Box component="form" onSubmit={handleSubmit(handleAddCampaign)} sx={{width: "50%", display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
                        <DialogContent sx={{pt: 2}}>
                        <DialogTitle sx={{px: 0}}>Create Campaign</DialogTitle>
                            <Stack gap={2}>
                                <TextField multiline label="Campaign Name" type='text' sx={{ width: "100%"}} 
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
                                <FormControl fullWidth error={!!errors.template_name}>
                                    <InputLabel id="template_name">Template Name</InputLabel>
                                    <Controller
                                        name="template_name"
                                        control={control}
                                        rules={{ required: "Template Name is required" }}
                                        render={({field}) => (
                                            <Select
                                                {...field}
                                                defaultValue={activeFileName}
                                                labelId="template_name"
                                                label="Template Name"
                                                // value={field.value ?? ""}
                                                value={activeFileName ?? ""}
                                                onChange={(e) => {
                                                    field.onChange(e)
                                                    fetchAllTemplates(e.target.value)
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
                                <TextField multiline label="Subject" type='text' sx={{ width: "100%"}} 
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
                    <Box sx={{mb: 2, mr: 2, pt: 2, width: "50%"}}>
                        {/* <DialogContent> */}
                            {/* <Box sx={{height: "100%", pt: 1}}> */}
                                <iframe
                                    // srcDoc={activeFileContent || ''}
                                    srcDoc={activeFileContent ? activeFileContent.replaceAll("{{fName}}", "John").replaceAll("{{lName}}", "Doe") : ''}
                                    // sandbox="allow-same-origin"
                                    title="preview"
                                    width="100%"
                                    height="100%"
                                    style={{border: "1px solid black", borderRadius: "5px"}}
                                />
                            {/* </Box> */}
                        {/* </DialogContent> */}
                    </Box>
                </Box>
            </Dialog>

            <DataGrid
                sx={{ maxHeight: 690, width: "850px", maxWidth: "100%", mx: "auto"}}
                rows={campaigns}
                columns={campaignColumns}
                rowCount={totalCampaigns}
                pagination
                paginationMode="server"
                paginationModel={paginationModel}
                onPaginationModelChange={handlePaginationChange}
                loading={loading}
                onRowClick={(event) => navigate(`/admin/campaigns/${event.row.id}`, {state: event.row.template_name})}
                // onRowClick={(event) => navigate(`/admin/campaigns/${event.row.id}`)}
                pageSizeOptions={[5, 10, 20]}
                disableRowSelectionOnClick
            />
        </Box>
    );
}
