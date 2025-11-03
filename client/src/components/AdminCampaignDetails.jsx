import { Box, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router'
import Split from "react-split";
import { campaignService } from '../api/services/campaignService'
import { templateService } from '../api/services/templateService'
import { useRecipients } from '../hooks/useRecipients'

const statusColors = {
    draft: "default",
    scheduled: "info",
    sending: "warning",
    completed: "success",
    failed: "error",
}

function AdminCampaignDetails() {
    const { campaignId } = useParams()
    const location = useLocation()
    const templateName = location.state
    const [campaign, setCampaign] = useState(null)
    const [template, setTemplate] = useState(null)
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });
    const { recipients, totalRecipients, loading, error } = useRecipients(
        campaignId,
        paginationModel.page + 1,
        paginationModel.pageSize
    );

    useEffect(() => {
        campaignService.getCampaignData(campaignId)
            .then(data => setCampaign(data))
            .catch(err => console.error(err))

        templateService.getTemplateContent(templateName)
            .then(data => setTemplate(data.fileContent))
            .catch(err => console.error(err))
    }, [campaignId]);

    const handlePaginationChange = (newModel) => {
        setPaginationModel(newModel);
    };

    const recipientColumns = [
        { field: 'user_id', headerName: 'User ID', width: 110, align : "right" },
        { field: 'first_name', headerName: 'First Name', width: 150, editable: false },
        { field: 'last_name', headerName: 'Last Name', width: 150, editable: false },
        { field: 'email', headerName: 'Email', width: 180, editable: false },
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
                        {campaign &&
                            <Card sx={{borderRadius: 3, boxShadow: 3, width: "100%"}}>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                        <Typography variant="h6" fontWeight="bold">
                                            {campaign.name}
                                        </Typography>
                                        <Chip
                                            label={
                                                campaign.status.charAt(0).toUpperCase() + 
                                                campaign.status.slice(1).toLowerCase()
                                            }
                                            color={statusColors[campaign.status]}
                                            variant="filled" 
                                        />
                                    </Box>

                                    <Divider sx={{ mb: 2 }} />

                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Template: </strong>
                                        {campaign.template_name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Subject: </strong>
                                        {campaign.subject}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Scheduled At: </strong>
                                        {dayjs(campaign.scheduled_at).format("hh:mm A, D MMMM YYYY")}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Created By: </strong>
                                        {campaign.created_by}
                                    </Typography>

                                    <Divider sx={{ my: 2 }} />

                                    <Stack spacing={1}>
                                        <Typography variant="caption" color="text.secondary">
                                            <strong>Created At: </strong>
                                            {dayjs(campaign.created_at).format("hh:mm A, D MMMM YYYY")}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            <strong>Last Updated: </strong>
                                            {dayjs(campaign.updated_at).format("hh:mm A, D MMMM YYYY")}
                                        </Typography>
                                    </Stack>
                                </CardContent>
                            </Card>
                        }
                        {recipients && totalRecipients &&
                            <DataGrid
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
                        }
                    </Box>
                    <Box sx={{height: `calc(100vh - 64px)`, overflow: 'auto' }}>
                        {template &&
                            <iframe
                                srcDoc={template ? template.replaceAll("{{fName}}", "John").replaceAll("{{lName}}", "Doe") : ''}
                                title="preview"
                                width="100%"
                                height="100%"
                            />
                        }
                    </Box>
                </Split>
            </Box>
        </Box>
    )
}

export default AdminCampaignDetails