import { Box, Button, Card } from "@mui/material"
import { useNavigate } from "react-router"

function AdminCampaigns() {

    const navigate = useNavigate()

    return (
        <Box>
            <Box>
                <Card>
                    <Button onClick={() => navigate("/admin/campaigns/add")}>Add Template</Button>
                </Card>
            </Box>
            <Box>
                <Card>
                    No campaigns yet.
                </Card>
            </Box>
        </Box>
    )
}

export default AdminCampaigns
