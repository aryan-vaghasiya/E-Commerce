import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import { fetchAdminProducts } from '../redux/adminProducts/adminProductsActions';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { DataGrid } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { getImageUrl } from '../utils/imageUrl';
import Button from '@mui/material/Button';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
const API_URL = import.meta.env.VITE_API_SERVER;

function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState(null);
    const token = useSelector(state => state.userReducer.token);
    const [toDelete, setToDelete] = useState(null)

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 8,
    });

    const handleClickOpen = (productId) => {
        // console.log(productId);
        setToDelete(productId)
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setToDelete(null)
    };

    const deleteProduct = async () => {
        const productId = toDelete
        console.log(productId);
        handleClose()

        const res = await fetch(`${API_URL}/admin/product/delete`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({productId})
        })

        if(res.ok){
            fetchProducts(paginationModel.page + 1, paginationModel.pageSize)
        }
        else{
            const error = await res.json()
            console.error(error)
        }
    }

    const fetchProducts = async (page, limit) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/admin/get-products?page=${page}&limit=${limit}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errData = await response.json();
                console.error("Could not fetch Products Data:", errData);
                console.error("Could not fetch Products Data:", errData.error);
                return
            }

            const result = await response.json();
            // console.log(result);
            
            const withDiscount = result.products.map(product => ({...product, price: product.offer_discount ? 
                                                            (product.mrp - (product.mrp * product.offer_discount / 100)).toFixed(2) 
                                                            : (product.price).toFixed(2)}))
            // console.log(withDiscount);
            
            // const price = result.offer_discount ? result.price * (1 - result.offer_discount / 100) : result.price
            // setProducts([...result.products, price ]);
            setProducts(withDiscount);
            setTotalProducts(result.total);
        } catch (err) {
            console.error(err.message)
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePaginationChange = (newModel) => {
        // console.log(newModel);
        
        setPaginationModel(newModel);
        // dispatch(fetchAdminOrders(newModel.page + 1, newModel.pageSize));
        fetchProducts(newModel.page + 1, newModel.pageSize);
    };

    useEffect(() => {
        // console.log("fetching...");
        // dispatch(fetchAdminProducts(1, 10));
        fetchProducts(paginationModel.page + 1, paginationModel.pageSize);
    }, [paginationModel]);

    const columns = [
        {
            field: 'id', headerName: 'Product ID', width: 90, align : "center"
        },
        {
            field: 'title',
            headerName: 'Title',
            width: 350,
            editable: false,
            renderCell: (params) => (
                <Box sx={{display: "flex", alignItems: "center", pt: 0.7}}>
                    <img
                    src={getImageUrl(params.row.thumbnail)}
                    alt="product"
                    style={{
                        height: '50px',
                        width: 'auto',
                        objectFit: 'contain',
                        borderRadius: '4px'
                    }}
                    />
                    <Typography sx={{pl: 1}}>{params.value}</Typography>
                </Box>
            ),
        },
        // {
        //     field: 'thumbnail',
        //     headerName: 'Thumbnail',
        //     width: 250,
        //     editable: false,
        //     renderCell: (params) => (
        //         <img
        //         src={params.value}
        //         alt="product"
        //         style={{
        //             width: '50px',
        //             height: 'auto',
        //             objectFit: 'contain',
        //             borderRadius: '4px'
        //         }}
        //         />
        //     ),
        //     align: "center"
        // },
        {
            field: 'brand',
            headerName: 'Brand',
            width: 150,
            editable: false,
        },
        {
            field: 'price',
            headerName: 'Selling Price',
            width: 110,
            editable: false,
            renderCell: (params) => (
                <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
                    <Typography>${params.value}</Typography>
                </Box>
            )
        },
        {
            field: 'stock',
            headerName: 'Stock',
            width: 110,
            editable: false,
            align: "center"
        },
        {
            field: 'last_updated',
            headerName: 'Last Modified',
            width: 110,
            editable: false,
            align: "center"
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 110,
            editable: false,
            align: "center"
        },
        // {
        //     field: 'total',
        //     headerName: 'Total',
        //     width: 110,
        //     editable: false,
        //     renderCell: (params) => <span>${params.value}</span>
        // },
        // {
        //     field: 'delete',
        //     headerName: 'Delete Product',
        //     width: 110,
        //     renderCell : (params) => 
        //     <IconButton onClick={() => handleClickOpen(params.row.id)} sx={{p: 0}}>
        //         <DeleteForeverIcon sx={{fontSize: 30}}></DeleteForeverIcon>
        //     </IconButton>,
        //     align: "center"
        // },
        {
            field: 'edit',
            headerName: 'Edit Product',
            width: 110,
            renderCell : (params) => <IconButton onClick={() => navigate(`/admin/product/${params.id}`)} sx={{p: 0}}><EditNoteIcon sx={{fontSize: 35}}></EditNoteIcon></IconButton>,
            align: "center"
        }
    ];

    return (
        <Box sx={{ py: 1.5, px: 4, bgcolor: "#EEEEEE", minHeight: "91vh" }}>
            <Dialog
                open={open}
                onClose={handleClose}
                // aria-labelledby="alert-dialog-title"
                // aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                {"Permanently Delete Product?"}
                </DialogTitle>
                <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    This product {toDelete} will be permanently deleted, click Yes if you want to Proceed further.
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                <Button onClick={handleClose} color='error'>No</Button>
                <Button onClick={deleteProduct} autoFocus>Yes</Button>
                </DialogActions>
            </Dialog>
            <Box sx={{display : "flex", justifyContent : "space-between", pb: 1}}>
                <Typography variant='h4' component='h1' sx={{fontWeight: "200"}}>Products</Typography>
                <Button variant='contained' onClick={() => navigate("/admin/product/add")}>Add Product</Button>
            </Box>
            
            <Divider sx={{mt: 1, mb: 2}}/>
            <Box sx={{ height: "auto", display: "flex", alignItems:"center", flexDirection: "column"}}>
            {/* <Box sx={{ height: 370 , mx: "auto", textAlign: "center"}}> */}
                <DataGrid
                    sx={{ maxHeight: 630, maxWidth: "100%"}} 
                    // rows={adminOrdersState.orders}
                    // autoHeight={true}
                    rows={products}
                    columns={columns}
                    // rowCount={adminOrdersState.total}
                    rowCount={totalProducts}
                    pagination
                    paginationMode="server"
                    paginationModel={paginationModel}
                    onPaginationModelChange={handlePaginationChange}
                    loading={loading}
                    rowHeight={58}
                    // onRowSelectionModelChange={(item) => setSelected(item.ids)}
                    // onRowSelectionModelChange={handleSelection}
                    // initialState={{
                    // pagination: {
                    //     paginationModel: {
                    //     pageSize: 5,
                    //     },
                    // },
                    // }}
                    pageSizeOptions={[5, 8, 10, 20]}
                    // checkboxSelection
                    disableRowSelectionOnClick
                />
                {/* <Box sx={{ml: "auto"}}> */}

            </Box>
            {error && (
                <Typography color="error" mt={2}>{error}</Typography>
            )}
        </Box>
    )
}

export default AdminProducts
