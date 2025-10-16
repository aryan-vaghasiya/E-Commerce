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

                    <Skeleton
                        variant="rectangular"
                        width={100}
                        height={18}
                        animation="wave"
                        sx={{ borderRadius: 0.5 }}
                    />
                </Box>

                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    flexWrap: { xs: 'wrap', sm: 'nowrap' }
                }}>
                    <Box sx={{ display: 'flex', alignItems: "center", justifyContent: "space-between", gap: 0.75 }}>
                        <Skeleton
                            variant="text"
                            width={90}
                            height={32}
                            animation="wave"
                        />
                        <Skeleton
                            sx={{mt: 0.6}}
                            variant="text"
                            width={50}
                            height={24}
                            animation="wave"
                        />
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        gap: 1,
                        alignItems: 'center'
                    }}>
                        <Skeleton
                            variant="rounded"
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

                        {/* <Skeleton
                            variant="circular"
                            width={31}
                            height={31}
                            animation="wave"
                            sx={{ display: { xs: 'none', md: 'block' } }}
                        /> */}
                    </Box>
                </Box>
            </Box>
        </Card>
    );
}

export default HorizontalProductCardSkeleton;