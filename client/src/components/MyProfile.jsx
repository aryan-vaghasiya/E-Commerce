import React, { useState } from 'react';
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
    useMediaQuery
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

const ProfilePage = () => {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Dummy user data
    const userData = {
        name: "Aryan Vaghasiya",
        email: "aryan.vaghasiya@example.com",
        phone: "+91 12345 67890",
        location: "Ahmedabad, Gujarat, India",
        joinedDate: "January 2022",
        avatar: "/api/placeholder/120/120",
        isVerified: true,
        membershipTier: "Gold",
        totalOrders: 47,
        totalSpent: 125840,
        wishlistItems: 23,
        reviewsGiven: 15,
        loyaltyPoints: 2840,
        walletBalance: 1250
    };

    const recentOrders = [
        { id: "#ORD-2024-001", date: "2024-09-05", amount: 2499, status: "Delivered" },
        { id: "#ORD-2024-002", date: "2024-09-01", amount: 1299, status: "In Transit" },
        { id: "#ORD-2024-003", date: "2024-08-28", amount: 899, status: "Delivered" }
    ];

    const profileStats = [
        { label: "Total Orders", value: userData.totalOrders, icon: ShoppingBagIcon, color: "primary" },
        { label: "Total Spent", value: `$${userData.totalSpent.toLocaleString()}`, icon: CreditCardIcon, color: "warning" },
        { label: "Wishlist Items", value: userData.wishlistItems, icon: FavoriteIcon, color: "error" },
        { label: "Wallet Balance", value: `$${userData.walletBalance?.toFixed(2)}`, icon: WalletIcon, color: "success" }
    ];

    const quickActions = [
        { label: "My Wallet", icon: WalletIcon, color: "primary" },
        { label: "Order History", icon: ShippingIcon, color: "info" },
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
            case 'Delivered': return 'success';
            case 'In Transit': return 'info';
            case 'Processing': return 'warning';
            case 'Cancelled': return 'error';
            default: return 'default';
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3, bgcolor: "#EEEEEE"}}>
            <Grid container spacing={3}>

                <Grid size={{xs: 12, md: 4}}>
                    <Card elevation={2} sx={{ height: 'fit-content' }}>
                        <CardContent sx={{ textAlign: 'center', p: 3 }}>
                            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                                <Avatar
                                    src={userData.avatar}
                                    sx={{ 
                                        width: { xs: 80, sm: 100 }, 
                                        height: { xs: 80, sm: 100 }, 
                                        mx: 'auto',
                                        border: '4px solid',
                                        borderColor: 'primary.main'
                                    }}
                                >
                                    {userData.name.charAt(0)}
                                </Avatar>
                                {/* {userData.isVerified && (
                                    <VerifiedIcon 
                                        color="primary" 
                                        sx={{
                                            position: 'absolute', 
                                            bottom: 0, 
                                            right: 0,
                                            bgcolor: 'white',
                                            borderRadius: '50%',
                                            fontSize: 24
                                        }}
                                    />
                                )} */}
                            </Box>
                            
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                                {userData.name}
                            </Typography>
                            
                            {/* <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Chip 
                                    label={`${userData.membershipTier} Member`}
                                    color={getMembershipColor(userData.membershipTier)}
                                    size="small"
                                    sx={{ fontWeight: 500 }}
                                />
                                {userData.isVerified && (
                                    <Chip 
                                        label="Verified"
                                        color="success"
                                        size="small"
                                        icon={<VerifiedIcon />}
                                    />
                                )}
                            </Box> */}

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
                                        primary={"username"} 
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
                                                sx: {fontSize: "0.9rem", whiteSpace: "normal"}
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
                                        primary={userData.location}
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
                                        primary={`Joined ${userData.joinedDate}`}
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
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Loyalty Points & Wallet */}
                    {/* <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid size={{xs: 12, sm: 6}}>
                            <Card elevation={1}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <StarIcon color="warning" />
                                        Loyalty Points
                                    </Typography>
                                    <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700, mb: 1 }}>
                                        {userData.loyaltyPoints.toLocaleString()}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        160 points to next tier
                                    </Typography>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={75} 
                                        color="warning"
                                        sx={{ mt: 1, height: 8, borderRadius: 4 }}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{xs: 12, sm: 6}}>
                            <Card elevation={1}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <WalletIcon color="success" />
                                        Wallet Balance
                                    </Typography>
                                    <Typography variant="h4" color="success.main" sx={{ fontWeight: 700, mb: 1 }}>
                                        ${userData.walletBalance.toLocaleString()}
                                    </Typography>
                                    <Button variant="outlined" size="small" color="success">
                                        Add Money
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid> */}

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
                                                        label={order.status} 
                                                        size="small" 
                                                        color={getStatusColor(order.status)}
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, flexWrap: 'wrap', gap: 1 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {order.date}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        ${order.amount.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                            <Button variant="text" color="primary" fullWidth sx={{ mt: 1 }}>
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
                        defaultValue={userData.name}
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
        </Container>
    );
};

export default ProfilePage;
