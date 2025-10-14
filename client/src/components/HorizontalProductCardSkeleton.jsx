// import { Box, Skeleton, Paper } from '@mui/material';

// function HorizontalProductCardSkeleton() {
//     return (
//         <Paper sx={{ display: 'flex', p: 2, gap: 2 }}>
//             <Skeleton variant="rectangular" width={200} height={150} />
            
//             <Box sx={{ flex: 1 }}>
//                 <Skeleton variant="text" width="60%" height={30} />
//                 <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
//                 <Skeleton variant="text" width="80%" height={20} sx={{ mt: 1 }} />
//                 <Skeleton variant="rectangular" width={100} height={40} sx={{ mt: 2 }} />
//             </Box>
//         </Paper>
//     );
// }

// export default HorizontalProductCardSkeleton;




import { Card, Box, Skeleton } from '@mui/material';

function HorizontalProductCardSkeleton() {
    return (
        <Card sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            width: '100%',
            height: { xs: 'auto', sm: 200 },
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* <Skeleton
                variant="rounded"
                width={50}
                height={24}
                sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    zIndex: 1
                }}
                animation="wave"
            /> */}

            <Box
                sx={{
                    width: { xs: '100%', sm: 200 },
                    height: { xs: 180, sm: '100%' },
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2,
                    bgcolor: '#fafafa'
                }}
            >
                <Skeleton
                    variant="rectangular"
                    width="100%"
                    height="100%"
                    animation="wave"
                    sx={{ borderRadius: 1 }}
                />
            </Box>

            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minWidth: 0,
                p: { xs: 2, sm: 2 },
                justifyContent: 'space-between'
            }}>
                <Box sx={{ minWidth: 0, mb: { xs: 1.5, sm: 0 } }}>
                    <Skeleton
                        variant="text"
                        width="30%"
                        height={16}
                        animation="wave"
                        sx={{ mb: 0.5 }}
                    />

                    <Skeleton
                        variant="text"
                        width="90%"
                        height={20}
                        animation="wave"
                        sx={{ mb: 0.5 }}
                    />

                    {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}> */}
                        <Skeleton
                            variant="rectangular"
                            width={100}
                            height={18}
                            animation="wave"
                            sx={{ borderRadius: 0.5 }}
                        />
                    {/* </Box> */}
                </Box>

                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    flexWrap: { xs: 'wrap', sm: 'nowrap' }
                }}>
                    <Box sx={{ display: 'flex', alignItems: "flex-end", gap: 0.75 }}>
                        <Skeleton
                            variant="text"
                            width={120}
                            height={32}
                            animation="wave"
                        />
                        {/* <Skeleton
                            variant="text"
                            width={50}
                            height={24}
                            animation="wave"
                        /> */}
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        gap: 1,
                        alignItems: 'center'
                    }}>
                        <Skeleton
                            variant="rounded"
                            // width={{ xs: 50, sm: 80, lg: 90, xl: 100 }}
                            width={110}
                            height={31}
                            animation="wave"
                        />

                        <Skeleton
                            variant="circular"
                            width={31}
                            height={31}
                            animation="wave"
                        />

                        <Skeleton
                            variant="circular"
                            width={31}
                            height={31}
                            animation="wave"
                            sx={{ display: { xs: 'none', md: 'block' } }}
                        />
                    </Box>
                </Box>
            </Box>
        </Card>
    );
}

export default HorizontalProductCardSkeleton;