import Box from '@mui/material/Box'
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { updateOrderStatus, fetchAdminOrders } from '../redux/adminOrders/adminOrderActions';
import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import AssignmentIcon from '@mui/icons-material/Assignment';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';



function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [totalOrders, setTotalOrders] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const token = useSelector(state => state.userReducer.token);

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [selected, setSelected] = useState({})

    const fetchOrders = async (page, pageSize) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:3000/admin/get-orders?page=${page}&limit=${pageSize}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errData = await response.json();
                console.error("Failed to fetch admin orders", errData.error);
            }

            const result = await response.json();
            // console.log(result);
            setOrders(result.orders);
            setTotalOrders(result.total);
        } 
        catch (err) {
            console.error(err.message)
            setError(err.message);
        } 
        finally {
            setLoading(false);
        }
    };

    const handlePaginationChange = (newModel) => {
        // console.log(newModel);
        setPaginationModel(newModel);
        // dispatch(fetchAdminOrders(newModel.page + 1, newModel.pageSize));
        fetchOrders(newModel.page + 1, newModel.pageSize);
    };

    const handleSelection = (item) => {
        setSelected(item.ids)
    }

    const handleAccept = () => {
        dispatch(updateOrderStatus(selected, "accepted"))
        window.location.href = "/admin/sales"
    }

    useEffect(() => {
        fetchOrders(paginationModel.page + 1, paginationModel.pageSize);
    }, [paginationModel]);

    const columns = [
        { 
            field: 'id', headerName: 'Order ID', width: 90, align : "center"
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
            field: 'status',
            headerName: 'Status',
            width: 110,
            editable: false,
        },
        {
            field: 'order_date',
            headerName: 'Date Added',
            width: 110,
            editable: false,
        },
        {
            field: 'total',
            headerName: 'Total',
            width: 110,
            editable: false,
            renderCell: (params) => <span>${params.value}</span>
        },
        {
            field: 'action',
            headerName: 'Action',
            width: 110,
            renderCell : (params) => <IconButton onClick={() => navigate(`/admin/order/${params.id}`)} sx={{p: 0}}><AssignmentIcon></AssignmentIcon></IconButton>
        }
    ];

    return (
    <Box sx={{ py: 1.5, px: 4, bgcolor: "#EEEEEE", minHeight: "91vh" }}>
        <Typography variant='h4' component='h1' sx={{fontWeight: "200"}}>Orders</Typography>
        <Divider sx={{mt: 1, mb: 2}}/>
        <Box sx={{ height: "auto", display: "flex", alignItems:"center", flexDirection: "column", flexGrow: 1}}>
        {/* <Box sx={{ height: 370 , mx: "auto", textAlign: "center"}}> */}
            <DataGrid
                sx={{maxWidth: 897, maxHeight: 630}}
                rows={orders}
                columns={columns}
                rowCount={totalOrders}
                pagination
                paginationMode="server"
                paginationModel={paginationModel}
                onPaginationModelChange={handlePaginationChange}
                loading={loading}
                // onRowSelectionModelChange={handleSelection}
                pageSizeOptions={[5, 10, 20]}
                // checkboxSelection
                disableRowSelectionOnClick
            />
            <Box sx={{pt: 2}}>
            {
                selected.size > 0?
                <Button disabled={false} variant='contained' onClick={handleAccept}>Accept Orders</Button>
                :
                null
            }
            </Box>
        </Box>
        {error && (
            <Typography color="error" mt={2}>{error}</Typography>
        )}
    </Box>
    )
}

export default AdminOrders