import { useEffect, useState } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Avatar,
    Box,
    Button,
    Divider,
    Chip,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    useTheme,
    useMediaQuery,
    CardActionArea
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    CalendarToday as CalendarIcon,
    ShoppingBag as ShoppingBagIcon,
    Favorite as FavoriteIcon,
    Star as StarIcon,
    Edit as EditIcon,
    Verified as VerifiedIcon,
    CreditCard as CreditCardIcon,
    LocalShipping as ShippingIcon,
    AccountBalanceWallet as WalletIcon,
    Security as SecurityIcon,
    Notifications as NotificationsIcon,
    Help as HelpIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs'
import { useNavigate } from 'react-router';
import { userService } from '../api/services/userService';
const API_URL = import.meta.env.VITE_API_SERVER;

const ProfilePage = () => {
    const navigate = useNavigate()
    const userState = useSelector(state => state.userReducer)
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [recentOrders, setRecentOrders] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const profileStats = userData ? [
        { label: "Total Orders", value: userData.totalOrders, icon: ShoppingBagIcon, color: "primary", link: "/my-orders" },
        { label: "Total Spent", value: `${userData.totalSpent.toLocaleString("en-US", { style: "currency", currency: "USD" })}`, icon: CreditCardIcon, color: "warning", link: "/my-orders"  },
        { label: "Wishlist Items", value: userData.wishlistItems, icon: FavoriteIcon, color: "error", link: "/my-wishlist"  },
        { label: "Wallet Balance", value: `${userData.walletBalance.toLocaleString("en-US", { style: "currency", currency: "USD" })}`, icon: WalletIcon, color: "success", link: "/my-wallet" }
    ] : null

    const quickActions = [
        { label: "My Wallet", icon: WalletIcon, color: "primary", link: "/my-wallet" },
        { label: "Order History", icon: ShippingIcon, color: "info", link: "/my-orders" },
        { label: "Security Settings", icon: SecurityIcon, color: "warning" },
        { label: "Notifications", icon: NotificationsIcon, color: "success" },
        { label: "Help & Support", icon: HelpIcon, color: "secondary" }
    ];

    const handleEditProfile = () => {
        setEditDialogOpen(true);
    };

    const getMembershipColor = (tier) => {
        switch (tier) {
            case 'Gold': return 'warning';
            case 'Silver': return 'default';
            case 'Platinum': return 'secondary';
            default: return 'primary';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'success';
            case 'dispatched': return 'info';
            case 'accepted': return 'info';
            case 'pending': return 'warning';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    };

    const fetchUserDetails = async () => {
        try{
            // const response = await fetch(`${API_URL}/profile/user-details`, {
            //     headers: {
            //         Authorization : `Bearer ${userState.token}`
            //     }
            // })
            // if(!response.ok){
            //     const error = await response.json()
            //     return console.log(error)
            // }
            // const result = await response.json()

            const result = await userService.getUserDetails()
            setUserData(result)
        }
        catch(err){
            console.error(err.message)
        }
    }

    const fetchRecentOrders = async () => {
        try{
            // const response = await fetch(`${API_URL}/profile/recent-orders`, {
            //     headers: {
            //         Authorization : `Bearer ${userState.token}`
            //     }
            // })
            // if(!response.ok){
            //     const error = await response.json()
            //     return console.log(error)
            // }
            // const result = await response.json()

            const result = await userService.getRecentOrdersProfile();
            setRecentOrders(result)
        }
        catch(err){
            console.error(err.message)
        }
    }

    useEffect(() => {
        fetchUserDetails()
        fetchRecentOrders()
    }, [])

    return (
        <Container maxWidth="xl" sx={{ py: 3, bgcolor: "#EEEEEE"}}>
            {userData && recentOrders ?
            <>
            <Grid container spacing={3}>
                <Grid size={{xs: 12, md: 4}}>
                    <Card elevation={2} sx={{ height: 'fit-content' }}>
                        <CardContent sx={{ textAlign: 'center', p: 3 }}>
                            <Box sx={{ mb: 2 }}>
                                <Avatar
                                    // src={userData.avatar}
                                    sx={{ 
                                        width: { xs: 80, sm: 100 }, 
                                        height: { xs: 80, sm: 100 }, 
                                        mx: 'auto',
                                        border: '4px solid',
                                        borderColor: 'primary.main'
                                    }}
                                >
                                    {userData?.first_name.charAt(0).toUpperCase()}
                                </Avatar>
                            </Box>
                            
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                                {`${userData.first_name} ${userData.last_name}`}
                            </Typography>

                            <Button
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={handleEditProfile}
                                fullWidth
                                sx={{ mb: 2 }}
                            >
                                Edit Profile
                            </Button>

                            {/* Contact Information */}
                            <Divider sx={{ my: 2 }} />
                            <List dense>
                                <ListItem>
                                    <ListItemIcon><PersonIcon color="primary" /></ListItemIcon>
                                    <ListItemText 
                                        primary={userData.username} 
                                        slotProps={{
                                            primary: {
                                                sx: {fontSize: "0.9rem"}
                                            }
                                        }}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><EmailIcon color="primary" /></ListItemIcon>
                                    <ListItemText 
                                        primary={userData.email} 
                                        slotProps={{
                                            primary: {
                                                sx: {fontSize: "0.9rem"}
                                            }
                                        }}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><PhoneIcon color="primary" /></ListItemIcon>
                                    <ListItemText 
                                        primary={userData.phone}
                                        slotProps={{
                                            primary: {
                                                sx: {fontSize: "0.9rem"}
                                            }
                                        }}                                    
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><LocationIcon color="primary" /></ListItemIcon>
                                    <ListItemText 
                                        primary={`${userData.addLine1}, ` + `${userData.addLine2}, ` + `${userData.city}, ${userData.state}` + ` - ${userData.pincode}`}
                                        slotProps={{
                                            primary: {
                                                sx: {fontSize: "0.9rem"}
                                            }
                                        }}                                    
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><CalendarIcon color="primary" /></ListItemIcon>
                                    <ListItemText 
                                        primary={`Joined, ${dayjs(userData.joinedDate).format("D MMM YYYY")}`}
                                        slotProps={{
                                            primary: {
                                                sx: {fontSize: "0.9rem"}
                                            }
                                        }}                                    
                                    />
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Main Content */}
                <Grid size={{xs: 12, md: 8}}>
                    {/* Stats Cards */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        {profileStats.map((stat, index) => (
                            <Grid size={{xs: 6, sm: 3}} key={index}>
                                <Card elevation={1} sx={{ height: '100%' }}>
                                    <CardActionArea onClick={() => navigate(stat.link)}>
                                        <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 } }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                                <stat.icon color={stat.color} sx={{ fontSize: { xs: 28, sm: 32 } }} />
                                                <Typography 
                                                    variant="h6" 
                                                    sx={{ 
                                                        fontWeight: 700, 
                                                        fontSize: { xs: '1rem', sm: '1.25rem' } 
                                                    }}
                                                >
                                                    {stat.value}
                                                </Typography>
                                                <Typography 
                                                    variant="caption" 
                                                    color="text.secondary"
                                                    sx={{ textAlign: 'center', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                                >
                                                    {stat.label}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Recent Orders */}
                    <Card elevation={1} sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ShippingIcon color="primary" />
                                Recent Orders
                            </Typography>
                            <List>
                                {recentOrders.map((order, index) => (
                                    <ListItem 
                                        key={order.id}
                                        sx={{ 
                                            bgcolor: index % 2 === 0 ? 'grey.50' : 'transparent',
                                            borderRadius: 1,
                                            mb: 0.5
                                        }}
                                    >
                                        <ListItemText
                                            disableTypography
                                            primary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                        {order.id}
                                                    </Typography>
                                                    <Chip 
                                                        label={order.status.charAt(0).toUpperCase() + order.status.slice(1)} 
                                                        size="small" 
                                                        color={getStatusColor(order.status)}
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, flexWrap: 'wrap', gap: 1 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {dayjs(order.order_date).format("D MMM YYYY")}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {order.final_total.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                            <Button variant="text" color="primary" fullWidth sx={{ mt: 1 }} onClick={() => navigate("/my-orders")}>
                                View All Orders
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card elevation={1}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Quick Actions
                            </Typography>
                            <Grid container spacing={1}>
                                {quickActions.map((action, index) => (
                                    <Grid size={{xs: 6, sm: 4, md: 2.4}} key={index}>
                                        <Paper
                                            onClick={() => navigate(action.link)}
                                            elevation={0}
                                            sx={{
                                                p: 2,
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                bgcolor: 'grey.50',
                                                '&:hover': {
                                                    bgcolor: 'grey.100',
                                                    transform: 'translateY(-2px)'
                                                },
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <action.icon color={action.color} sx={{ fontSize: 28, mb: 1 }} />
                                            <Typography variant="caption" display="block" sx={{ fontWeight: 500 }}>
                                                {action.label}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Edit Profile Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Full Name"
                        fullWidth
                        variant="outlined"
                        defaultValue={userData.first_name}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Email Address"
                        type="email"
                        fullWidth
                        variant="outlined"
                        defaultValue={userData.email}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Phone Number"
                        fullWidth
                        variant="outlined"
                        defaultValue={userData.phone}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Location"
                        fullWidth
                        variant="outlined"
                        defaultValue={userData.location}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => setEditDialogOpen(false)} variant="contained">
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </>
        :
        null}
        </Container>
    )
};

export default ProfilePage;
