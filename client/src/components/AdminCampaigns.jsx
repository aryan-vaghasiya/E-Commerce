import { useState, useEffect } from "react";
import {
    Box,
    Button,
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
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';
import { DataGrid } from "@mui/x-data-grid";
import { campaignService } from "../api/services/campaignService";
import { templateService } from "../api/services/templateService";


export default function AdminCampaigns() {
    const navigate = useNavigate()

    const { register, control, handleSubmit, reset, formState: { errors }} = useForm({
        defaultValues: {
            name: "",
            template_name: "",
            subject: "",
            schedule_time: dayjs()
        }
    });

    const [open, setOpen] = useState(false);
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

    const fetchCampaigns = async(page = 1, limit = 5) => {
        setLoading(true)
        try {
            const data = await campaignService.getCampaignsList(page, limit)
            setCampaigns(data?.campaigns || [])
            setTotalCampaigns(data?.total || 0)
        }
        catch (err) {
            console.error("Campaigns fetch failed:", err.message);
        }
        finally{
            setLoading(false)
        }
    }

    const fetchAllTemplates = async(active = "any") => {
        try {
            const data = await templateService.getTemplatesList(active)

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
            console.error("Template fetch failed:", err.message);
        }
    }

    useEffect(() => {
        fetchCampaigns(paginationModel.page + 1, paginationModel.pageSize);
    }, [paginationModel]);

    const handleAddCampaign = async (formData) => {
        const schedule_time = dayjs(formData.schedule_time).startOf('minute').format(`YYYY-MM-DD HH:mm:ss`)
        console.log(schedule_time);

        try {
            const response = await campaignService.postCampaign({...formData, schedule_time})
            setOpen(false)
            reset();
            fetchCampaigns()
        }
        catch (err) {
            console.error("Adding new campaign failed:", err.message);
        }
    };

    const campaignColumns = [
        { field: 'id', headerName: 'Campaign ID', width: 110, align : "right" },
        { field: 'name', headerName: 'Campaign Name', width: 180, editable: false },
        { field: 'template_name', headerName: 'Template', width: 160, editable: false },
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

            {/* Dialog for new campaign */}
            <Dialog open={open} onClose={() => {setOpen(false); reset();}} fullWidth slotProps={{paper: {elevation: 5, sx: {minWidth: "80%", minHeight: "80%"}}}}>
                
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
                                        minLength: {
                                            value: 5,
                                            message: "Name must be at least 5 characters"
                                        }
                                    })}
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
                                                // defaultValue={activeFileName}
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
                            <Button type="submit" variant="contained">
                                Save
                            </Button>
                        </DialogActions>
                    </Box>
                    <Box sx={{mb: 2, mr: 2, pt: 2, width: "50%"}}>
                        <iframe
                            srcDoc={activeFileContent ? activeFileContent.replaceAll("{{fName}}", "John").replaceAll("{{lName}}", "Doe") : ''}
                            // sandbox="allow-same-origin"
                            title="preview"
                            width="100%"
                            height="100%"
                            style={{border: "1px solid black", borderRadius: "5px"}}
                        />
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
                onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
                loading={loading}
                onRowClick={(event) => navigate(`/admin/campaigns/${event.row.id}`, {state: event.row.template_name})}
                pageSizeOptions={[5, 10, 20]}
                disableRowSelectionOnClick
            />
        </Box>
    );
}
