import Box from '@mui/material/Box'
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { acceptOrders, fetchAdminOrders } from '../redux/adminOrders/adminOrderActions';
import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import AssignmentIcon from '@mui/icons-material/Assignment';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router';



function AdminOrders() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const adminOrdersState = useSelector(state => state.adminOrdersReducer)
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });
    const [selected, setSelected] = useState([])
    // console.log(selected);
    

    const handlePaginationChange = (newModel) => {
        // console.log(newModel);
        
        setPaginationModel(newModel);
        dispatch(fetchAdminOrders(newModel.page + 1, newModel.pageSize));
    };

    const handleAccept = () => {
        dispatch(acceptOrders(selected))
        window.location.href = "/admin/sales"
    }

    useEffect(() => {
        dispatch(fetchAdminOrders(1, 5));
    }, []);
    
    const columns = [
        { 
            field: 'id', headerName: 'Order ID', width: 90 
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
            renderCell : (params) => <IconButton onClick={() => navigate(`/order/${params.row.id}`)} sx={{p: 0}}><AssignmentIcon></AssignmentIcon></IconButton>
        }
    ];

    return (
    <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
            rows={adminOrdersState.orders}
            columns={columns}
            rowCount={adminOrdersState.total}
            pagination
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationChange}
            onRowSelectionModelChange={(item) => setSelected(item.ids)}
            // initialState={{
            // pagination: {
            //     paginationModel: {
            //     pageSize: 5,
            //     },
            // },
            // }}
            pageSizeOptions={[5, 10]}
            checkboxSelection
            disableRowSelectionOnClick
        />
        <Button onClick={handleAccept}>Accept Orders</Button>
    </Box>
    )
}

export default AdminOrders