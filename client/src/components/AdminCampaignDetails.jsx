import { Box, Card, CardContent, Chip, Divider, Typography } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation, useParams } from 'react-router'
import Split from "react-split";

function AdminCampaignDetails() {

    const { campaignId } = useParams()
    const location = useLocation()
    const templateName = location.state
    const userState = useSelector(state => state.userReducer)
    const [campaign, setCampaign] = useState(null)
    const [template, setTemplate] = useState(null)
    const [recipients, setRecipients] = useState(null)
    const [totalRecipients, setTotalRecipients] = useState(null)
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });
    const [loading, setLoading] = useState(false)

    const fetchRecipients = async (page, limit) => {
        setLoading(true)
        try {
            const res = await fetch(`http://localhost:3000/admin/campaigns/get-recipients?campaignId=${campaignId}&page=${page}&limit=${limit}`, {
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
            setRecipients(data.recipients)
            setTotalRecipients(data.total)
        }
        catch (err) {
            console.error("Campaigns fetch failed:", err.message);
        }
        finally{
            setLoading(false)
        }
    }

    const fetchTemplateContent = async () => {
        try {
            const res = await fetch(`http://localhost:3000/admin/templates/get?template=${templateName}`, {
                headers: {
                    Authorization: `Bearer ${userState.token}`,
                },
            });
            if(!res.ok){
                const error = await res.json()
                return console.error("Could not fetch template data:", error.error);
            }
            const data = await res.json();
            // console.log(data);
            setTemplate(data.fileContent)
        }
        catch (err) {
            console.error("Template data fetch failed:", err.message);
        }
    }

    const fetchCampaignData = async () => {
        try {
            const res = await fetch(`http://localhost:3000/admin/campaigns/get-data?campaignId=${campaignId}`, {
                headers: {
                    Authorization: `Bearer ${userState.token}`,
                },
            });
            if(!res.ok){
                const error = await res.json()
                return console.error("Could not fetch template data:", error.error);
            }
            const data = await res.json();
            // console.log(data);
            setCampaign(data)
        }
        catch (err) {
            console.error("Template data fetch failed:", err.message);
        }
    }

    const statusColors = {
        draft: "default",
        scheduled: "info",
        sending: "warning",
        completed: "success",
        failed: "error",
    }

    useEffect(() => {
        fetchTemplateContent()
        fetchCampaignData()
    }, [])

    useEffect(() => {
        fetchRecipients(paginationModel.page + 1, paginationModel.pageSize);
    }, [paginationModel]);

    const handlePaginationChange = (newModel) => {
        setPaginationModel(newModel);
        fetchRecipients(newModel.page + 1, newModel.pageSize);
    };

    const recipientColumns = [
        { 
            field: 'user_id', headerName: 'User ID', width: 110, align : "right"
        },
        {
            field: 'first_name',
            headerName: 'First Name',
            width: 150,
            editable: false,
        },
        {
            field: 'last_name',
            headerName: 'Last Name',
            width: 150,
            editable: false,
        },
        {
            field: 'email',
            headerName: 'Email',
            width: 180,
            editable: false,
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 100,
            editable: false,
            renderCell : (params) => <span>{params.value.charAt(0).toUpperCase() + params.value.slice(1).toLowerCase()}</span>
        },
        {
            field: 'sent_at',
            headerName: 'Scheduled Time',
            align: "right",
            width: 150,
            editable: false,
            renderCell : (params) => <span>{dayjs(params.value).format("h:mm:ss A, D MMM")}</span>
        },
        {
            field: 'error',
            headerName: 'Error',
            width: 110,
            editable: false,
            renderCell : (params) => <span>{params.value || "-"}</span>
        },
    ];

    return (
        <Box sx={{bgcolor: "#EEEEEE"}}>
            <Box sx={{
                "& .split": { display: "flex", flexDirection: "row", height: "100%" },
                "& .gutter": {
                    backgroundColor: "#333333",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "50%",
                },
                "& .gutter.gutter-horizontal": {
                    backgroundImage:
                    "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==')",
                    cursor: "col-resize",
                    width: "8px",
                }
            }}>
            <Split
                className="split"
                direction="horizontal"
                sizes={[70, 30]}
                minSize={[250, 250]}
                gutterSize={8}
            >
                <Box sx={{ p: 2, height: `calc(100vh - 64px)`, overflow: 'auto' }}>
                    {campaign ?
                        <Card sx={{borderRadius: 3, boxShadow: 3, width: "100%"}}>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Typography variant="h6" fontWeight="bold">
                                        {campaign.name}
                                    </Typography>
                                    <Chip 
                                        label={campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1).toLowerCase()} 
                                        color={statusColors[campaign.status]}
                                        variant="filled" 
                                    />
                                </Box>

                                <Divider sx={{ mb: 2 }} />

                                <Typography variant="body2" color="text.secondary">
                                    <strong>Template:</strong> {campaign.template_name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Subject:</strong> {campaign.subject}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {/* <strong>Scheduled At:</strong> {dayjs(campaign.scheduled_at).format("YYYY-MM-DD HH:mm")} */}
                                    <strong>Scheduled At:</strong> {dayjs(campaign.scheduled_at).format("hh:mm A, D MMMM YYYY")}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Created By:</strong> {campaign.created_by}
                                </Typography>

                                <Divider sx={{ my: 2 }} />

                                {/* Metadata */}
                                <Typography variant="caption" color="text.secondary">
                                    Created At: {dayjs(campaign.created_at).format("hh:mm A, D MMMM YYYY")}
                                </Typography>
                                <br />
                                <Typography variant="caption" color="text.secondary">
                                    Last Updated: {dayjs(campaign.updated_at).format("hh:mm A, D MMMM YYYY")}
                                </Typography>
                            </CardContent>
                        </Card>
                        :
                        null
                    }
                    {recipients && totalRecipients ?
                        <DataGrid
                            // sx={{ maxHeight: 690, height: "auto", width: "965px", maxWidth: "100%", mx: "auto"}}
                            sx={{ maxHeight: 690, height: "auto", width: "100%", mt: 3}}
                            rows={recipients}
                            columns={recipientColumns}
                            rowCount={totalRecipients}
                            pagination
                            paginationMode="server"
                            paginationModel={paginationModel}
                            onPaginationModelChange={handlePaginationChange}
                            loading={loading}
                            pageSizeOptions={[5, 10, 20]}
                            disableRowSelectionOnClick
                        />
                        :
                        null
                    }
                </Box>
                <Box sx={{height: `calc(100vh - 64px)`, overflow: 'auto' }}>
                    {/* <Box sx={{borderRadius: "8px", height: "100%"}}> */}
                        {template ?
                            <iframe
                                srcDoc={template ? template.replaceAll("{{fName}}", "John").replaceAll("{{lName}}", "Doe") : ''}
                                title="preview"
                                width="100%"
                                height="100%"
                            />
                            :
                            null
                        }
                    {/* </Box> */}
                </Box>
            </Split>
            </Box>
        </Box>
    )
}

export default AdminCampaignDetails
