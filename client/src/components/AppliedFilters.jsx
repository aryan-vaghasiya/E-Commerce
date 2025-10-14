// import { Box, Chip, Typography } from "@mui/material";
// import { parseURLToFilters } from "../utils/searchUtils"
// import StarIcon from '@mui/icons-material/Star';

// function AppliedFilters({searchParams, setSearchParams}) {

//     const filters = parseURLToFilters(searchParams)
//     const minPrice = filters.priceRange[0] === 0 ? "Min" : `$${(filters.priceRange[0]).toFixed(2)}`
//     const maxPrice = filters.priceRange[1] === 1010 ? "Max" : `$${(filters.priceRange[1]).toFixed(2)}`

//     const handleResetSubsection = (name, value = "") => {
//         const newParams = new URLSearchParams(searchParams);

//         if(name === "brands"){
//             const applied = newParams.get("brands").split(",")
//             if(applied.length > 1){
//                 const newBrands = applied.filter(brand => brand !== value)
//                 newParams.set("brands", newBrands)
//             }
//             else{
//                 newParams.delete(name);
//             }
//         }
//         else if(name === "priceRange"){
//             newParams.set("priceRange", "0,")
//         }
//         else{
//             newParams.delete(name);
//         }
//         // setValue(name, defaultFilters[name])
//         newParams.set('page', '1');
//         setSearchParams(newParams);
//     };

//     return (
//         <Box sx={{display: "flex", gap: 0.5}}>
//             {!(filters.priceRange[0] === 0 && filters.priceRange[1] === 1010) &&
//                 <Chip label={`${minPrice} - ${maxPrice}`} color="primary" onDelete={() => handleResetSubsection("priceRange")} />
//             }
//             {filters.rating &&
//                 <Chip
//                     color="primary"
//                     label={
//                         <Box sx={{display: "flex", alignItems: "center"}}>
//                             <Typography>
//                                 {filters.rating}
//                                 <StarIcon fontSize={"5"} sx={{mb: 0.4, color: "darkorange"}}/>
//                                 {` & Up`}
//                             </Typography>
//                         </Box>
//                     }
//                     onDelete={() => {
//                         // setValue("rating", null);
//                         // handleResetSubsection("rating");
//                         handleResetSubsection("rating")
//                     }}
//                 />
//             }
//             {filters.brands?.length > 0 &&
//                 filters.brands.map(brand => <Chip key={brand} label={brand} color="primary" onDelete={() => handleResetSubsection("brands", brand)} />)
//             }
//             {filters.inStock &&
//                 <Chip label="In Stock" color="primary" onDelete={() => handleResetSubsection("inStock")} />
//             }
//         </Box>
//     )
// }

// export default AppliedFilters





import { Box, Button, Chip, Typography } from "@mui/material";
import { parseURLToFilters } from "../utils/searchUtils";
import StarIcon from '@mui/icons-material/Star';
import { useRef, useState, useEffect } from 'react';

function AppliedFilters({ searchParams, setSearchParams }) {
    const scrollRef = useRef(null);
    const [showLeftShadow, setShowLeftShadow] = useState(false);
    const [showRightShadow, setShowRightShadow] = useState(false);

    const filters = parseURLToFilters(searchParams);
    const minPrice = filters.priceRange[0] === 0 ? "Min" : `$${filters.priceRange[0].toFixed(2)}`;
    const maxPrice = filters.priceRange[1] === 1010 ? "Max" : `$${filters.priceRange[1].toFixed(2)}`;

    const checkScroll = () => {
        const element = scrollRef.current;
        if (!element) return;

        const { scrollLeft, scrollWidth, clientWidth } = element;
        
        setShowLeftShadow(scrollLeft > 5);
        
        setShowRightShadow(scrollLeft < scrollWidth - clientWidth - 5);
    };

    useEffect(() => {
        const element = scrollRef.current;
        if (!element) return;

        checkScroll();

        element.addEventListener('scroll', checkScroll);
        
        window.addEventListener('resize', checkScroll);

        return () => {
            element.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, [filters]);

    const handleResetSubsection = (name, value = "") => {
        const newParams = new URLSearchParams(searchParams);

        if (name === "brands") {
            const applied = newParams.get("brands").split(",");
            if (applied.length > 1) {
                const newBrands = applied.filter(brand => brand !== value);
                newParams.set("brands", newBrands.join(","));
            } 
            else {
                newParams.delete(name);
            }
        } 
        else if (name === "priceRange") {
            newParams.set("priceRange", "0,");
        } 
        else {
            newParams.delete(name);
        }
        
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    const hasActiveFilters = 
        !(filters.priceRange[0] === 0 && filters.priceRange[1] === 1010) ||
        filters.rating ||
        (filters.brands?.length > 0) ||
        filters.inStock;

    if (!hasActiveFilters) return null;

    return (
        <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 1,
            width: '100%',
            mb: 2
            // pb: {xs: 1, md: 2}
        }}>
            {/* <Typography
                variant="subtitle2"
                sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    pr: 0.5
                }}
            >
                Filters:
            </Typography> */}

            <Typography
                variant="subtitle2"
                sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    pr: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                }}
            >
                Filters
                <Box
                    component="span"
                    sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        borderRadius: '50%',
                        width: 18,
                        height: 18,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 700
                    }}
                >
                    {[
                        !(filters.priceRange[0] === 0 && filters.priceRange[1] === 1010),
                        !!filters.rating,
                        filters.brands?.length || 0,
                        !!filters.inStock
                    ].reduce((count, val) => count + (typeof val === 'number' ? val : val ? 1 : 0), 0)}
                </Box>
            </Typography>

            <Box sx={{ position: 'relative', flex: 1, minWidth: 0 }}>
                <Box
                    sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '30px',
                        background: 'linear-gradient(to right, #EEEEEE 0%, rgba(238, 238, 238, 0) 100%)',
                        zIndex: 1,
                        pointerEvents: 'none',
                        opacity: showLeftShadow ? 1 : 0,
                        transition: 'opacity 0.3s ease'
                    }}
                />

                <Box
                    sx={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: '30px',
                        background: 'linear-gradient(to left, #EEEEEE 0%, rgba(238, 238, 238, 0) 100%)',
                        zIndex: 1,
                        pointerEvents: 'none',
                        opacity: showRightShadow ? 1 : 0,
                        transition: 'opacity 0.3s ease'
                    }}
                />

                <Box
                    ref={scrollRef}
                    sx={{
                        display: 'flex',
                        gap: 0.75,
                        overflowX: 'auto',
                        overflowY: 'hidden',
                        // pb: 0.5,
                        '&::-webkit-scrollbar': {
                            display: 'none'
                        },
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        scrollBehavior: 'smooth',
                        px: { xs: 1, sm: 0 }
                    }}
                >
                    {!(filters.priceRange[0] === 0 && filters.priceRange[1] === 1010) && (
                        <Chip label={`${minPrice} - ${maxPrice}`} color="primary" size="small" onDelete={() => handleResetSubsection("priceRange")} sx={{ flexShrink: 0 }} />
                    )}

                    {filters.rating && (
                        <Chip
                            color="primary"
                            size="small"
                            label={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <Typography variant="body3">{filters.rating}

                                        <StarIcon sx={{ fontSize: 15, color: "darkorange", pb: 0.2 }} />
                                        {` & Up`}
                                    </Typography>
                                </Box>
                            }
                            onDelete={() => handleResetSubsection("rating")}
                            sx={{ flexShrink: 0 }}
                        />
                    )}

                    {filters.brands?.length > 0 && filters.brands.map(brand => (
                        <Chip key={brand} label={brand} color="primary" size="small" onDelete={() => handleResetSubsection("brands", brand)} sx={{ flexShrink: 0 }} />
                    ))}

                    {filters.inStock && (
                        <Chip label="In Stock" color="primary" size="small" onDelete={() => handleResetSubsection("inStock")} sx={{ flexShrink: 0 }} />
                    )}

                    <Chip
                        label="Clear All"
                        variant="outlined"
                        size="small"
                        onClick={() => {
                            const query = searchParams.get('query');
                            const sort = searchParams.get('sort') || '_score,desc';
                            setSearchParams({ query, sort, page: 1 });
                        }}
                        sx={{ flexShrink: 0, borderStyle: 'dashed', fontWeight: 600 }}
                    />
                </Box>
            </Box>

            {/* <Button>
                Filter
            </Button> */}

        </Box>
    );
}

export default AppliedFilters;