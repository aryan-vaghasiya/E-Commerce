import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { parseURLToFilters } from '../utils/searchUtils';

function NoResults({ searchParams, setSearchParams, query, isLoading }) {
    const filters = parseURLToFilters(searchParams);
    
    const hasFilters = 
        filters.priceRange ||
        filters.brands?.length > 0 ||
        filters.rating ||
        filters.inStock;

    const handleClearFilters = () => {
        const newParams = new URLSearchParams();
        newParams.set('query', query || '');
        newParams.set('sort', searchParams.get('sort') || '_score,desc');
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            py: 8,
            px: 2
        }}>
            <SearchOffIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            
            <Typography variant="h5" gutterBottom fontWeight={600}>
                No results found
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                {hasFilters 
                    ? 'No products match your search with the current filters' 
                    : query 
                        ? `We couldn't find any products matching "${query}"`
                        : null
                }
            </Typography>

            {hasFilters && !isLoading &&  (
                <Paper elevation={2} sx={{ p: 3, maxWidth: 500, width: '100%', textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Try modifying or removing your filters to see more results
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={handleClearFilters}
                        startIcon={<RestartAltIcon />}
                        fullWidth
                    >
                        Clear Filters
                    </Button>
                </Paper>
            )}

            {!hasFilters && !isLoading && (
                <Paper elevation={2} sx={{ p: 3, maxWidth: 500, width: '100%' }}>
                    <Stack gap={2}>
                        <Typography variant="body2" color="text.secondary">
                            Suggestions:
                        </Typography>
                        <Box component="ul" sx={{ textAlign: 'left', pl: 3, m: 0 }}>
                            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                                Check your spelling
                            </Typography>
                            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                                Try more general keywords
                            </Typography>
                            <Typography component="li" variant="body2">
                                Try different keywords
                            </Typography>
                        </Box>
                    </Stack>
                </Paper>
            )}
        </Box>
    );
}

export default NoResults;