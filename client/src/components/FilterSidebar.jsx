// import { useEffect, useRef, useState } from 'react';
// import {
//     Box, Typography, Slider, FormGroup, FormControlLabel,
//     Checkbox, Rating, Divider, Button, FormControl,
//     RadioGroup, Radio, Accordion, AccordionSummary, 
//     AccordionDetails,
//     Chip
// } from '@mui/material';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import { Controller, useForm } from 'react-hook-form';
// import { useSelector } from 'react-redux';
// import { useSearchParams } from 'react-router';
// import { parseURLToFilters } from '../utils/searchUtils';
// import StarIcon from '@mui/icons-material/Star';

// const FilterSection = ({ title, children, actionName, actionFunction, isDirty, useAccordion = false, defaultExpanded = true, onAccordionChange }) => {
//     if (useAccordion) {
//         return (
//             <Box>
//             <Accordion 
//                 defaultExpanded={defaultExpanded} 
//                 disableGutters
//                 elevation={0}
//                 onChange={onAccordionChange}
//                 sx={{
//                     bgcolor: 'inherit',
//                     '&:before': { display: 'none' },
//                     '&.Mui-expanded': { margin: 0 }
//                 }}
//             >
//                 <AccordionSummary 
//                     expandIcon={<ExpandMoreIcon />}
//                     sx={{ px: 0, minHeight: 48 }}
//                 >
//                     <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 1 }}>
//                         <Typography variant="h6" fontSize={16}>{title}</Typography>
//                         {actionFunction && isDirty && (
//                         <Box
//                             onClick={(e) => {
//                                 e.stopPropagation();
//                                 actionFunction();
//                             }}
//                             sx={{ 
//                                 display: 'flex', 
//                                 alignItems: 'center',
//                                 cursor: 'pointer',
//                                 mr: 1,
//                                 border: "1px solid",
//                                 borderColor: "rgba(25, 118, 210, 0.5)",
//                                 borderRadius: 1,
//                                 px: 1.2,
//                                 py: 0.3
//                             }}
//                         >
//                             <Typography 
//                                 variant="button" 
//                                 fontSize={13}
//                                 sx={{ 
//                                     color: 'primary.main',
//                                     textTransform: 'uppercase',
//                                     fontWeight: 500,
//                                     // '&:hover': { textDecoration: 'underline' }
//                                 }}
//                             >
//                                 {actionName}
//                                 {/* Reset */}
//                             </Typography>
//                         </Box>
//                         )}
//                     </Box>
//                 </AccordionSummary>
//                 <AccordionDetails sx={{ px: 0, pb: 2 }}>
//                     {children}
//                 </AccordionDetails>
//             </Accordion>
//             <Divider sx={{ mt: 0.3 }} />
//             </Box>
//         );
//     }

//     return (
//         // <Box sx={{ pb: 2 }}>
//         <Box>
//             <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
//                 <Typography variant="h6" fontSize={16} gutterBottom>{title}</Typography>
//                 {actionFunction && isDirty &&
//                     <Button variant='outlined' size='small' onClick={actionFunction}>{actionName}</Button>
//                 }
//             </Box>
//             {children}
//             <Divider sx={{ mt: 2 }} />
//         </Box>
//     );
// };


// function FilterSidebar({ applyFilters }) {
//     const [searchParams, setSearchParams] = useSearchParams();
//     const { brands } = useSelector((state) => state.searchReducer);
//     const [showClearAll, setShowClearAll] = useState(false);
//     const [showAllBrands, setShowAllBrands] = useState(false);
//     const filters = parseURLToFilters(searchParams);

//     const isUpdatingFromURL = useRef(false);

//     const { handleSubmit, control, setValue, reset, watch, getValues } = useForm({
//         values: filters
//     });
//     const watchAllFields = watch();
//     const priceRange = watch("priceRange");

//     const displayMax = 1000;
//     const sliderUpperBound = 1010;
//     const ratingOptions = [4, 3];
//     const minDistance = 20;
//     const initialBrandCount = 5;
//     const defaultFilters = {
//         priceRange: [0, 1010],
//         brands: [],
//         rating: null,
//         inStock: false,
//     };

//     const isFieldChanged = (current, def) => {
//         if (Array.isArray(current) && Array.isArray(def)) {
//             return current.join() !== def.join();
//         }
//         return current !== def;
//     };

//     const isFormChanged = (formData, defaultValues) => {
//         return Object.keys(defaultValues).some((key) => {
//             const current = formData[key];
//             const original = defaultValues[key];

//             if (Array.isArray(current) && Array.isArray(original)) {
//                 if (current.length !== original.length) return true;
//                 return current.some((v, i) => v !== original[i]);
//             }

//             if (key === 'priceRange') {
//                 const [min1, max1] = current || [];
//                 const [min2, max2] = original || [];
//                 return min1 !== min2 || max1 !== max2;
//             }

//             return current !== original;
//         });
//     };

//     const formatValueLabel = (value) => {
//         if (value > displayMax) {
//             return `$${displayMax}+`;
//         }
//         if (value < 1) {
//             return `Min.`;
//         }
//         return `$${value}`;
//     };

//     const handleResetSubsection = (name, value = null) => {
//         isUpdatingFromURL.current = true;

//         const newParams = new URLSearchParams(searchParams);
//         newParams.delete(name);
//         if (value) {
//             newParams.set(name, value);
//         }
//         setSearchParams(newParams);
//     };

//     const handleClearAll = () => {
//         isUpdatingFromURL.current = true

//         const query = searchParams.get('query');
//         const sort = searchParams.get('sort') || '_score,desc';
//         setSearchParams({ query, priceRange: "0,", sort, page: 1 });
//         setShowAllBrands(false);
//     };

//     const applySearchFilters = (formData) => {
//         let filtersToSend = {};

//         Object.entries(formData).forEach(([key, value]) => {
//             if (Array.isArray(value)) {
//                 if (value.length > 0 && key !== "priceRange") filtersToSend[key] = value;
//                 if (key === "priceRange") {
//                     filtersToSend[key] = [value[0], value[1] > displayMax ? null : value[1]];
//                 }
//             } else if (value) {
//                 filtersToSend[key] = value;
//             }
//         });

//         const currentSort = new URLSearchParams(window.location.search).get("sort") || "_score,desc";
//         applyFilters(filtersToSend, currentSort);
//     };

//     const handleBrandAccordionChange = (event, isExpanded) => {
//         if (!isExpanded) {
//             setShowAllBrands(false);
//         }
//     };

//     useEffect(() => {
//         let timeoutId;
//         const subscription = watch((data, { type }) => {
//             // if (type === 'change') {
//             if (type === 'change' && !isUpdatingFromURL.current) {
//                 if (timeoutId) {
//                     clearTimeout(timeoutId);
//                 }

//                 timeoutId = setTimeout(() => {
//                     // window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
//                     console.log("Effect 2");
                    
//                     handleSubmit(applySearchFilters)();
//                 }, 300);
//             }
//         });

//         return () => {
//             subscription.unsubscribe();
//             if (timeoutId) {
//                 clearTimeout(timeoutId);
//             }
//         };

//         // const subscription = watch((data, { type }) => {
//         //     if (type === 'change') {
//         //         handleSubmit(applySearchFilters)();
//         //     }
//         // });

//         // return () => {
//         //     subscription.unsubscribe();
//         // };

//     }, [watch, handleSubmit]);

//     useEffect(() => {
//         if (isUpdatingFromURL.current) {
//             isUpdatingFromURL.current = false;
//         }
//     }, [filters]);


//     useEffect(() => {
//         const changed = isFormChanged(watchAllFields, defaultFilters);
//         setShowClearAll(changed);
//     }, [watchAllFields]);

//     const visibleBrands = showAllBrands ? brands : brands?.slice(0, initialBrandCount);

//     return (
//         <Box sx={{ p: 2, maxWidth: 350, ml: "auto" }}>
//             <Box sx={{ mb: 1.5 }}>
//                 <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
//                     <Typography variant="h6">Filters</Typography>
//                     {showClearAll &&
//                         <Button
//                             variant='contained'
//                             size='small'
//                             onClick={() => {
//                                 reset(defaultFilters);
//                                 handleClearAll();
//                             }}
//                         >
//                             Clear All
//                         </Button>
//                     }
//                 </Box>
//                 {/* <Chip label={getValues("rating")} icon={<StarIcon/>}></Chip> */}
//                 {getValues("rating") &&
//                     <Chip 
//                         label={
//                             <Box sx={{display: "flex", alignItems: "center"}}>
//                                 <Typography>
//                                     {getValues("rating")}
//                                     <StarIcon fontSize={"5"} sx={{mb: 0.4, color: "darkorange"}}/>
//                                     {` & Up`}
//                                 </Typography>
//                             </Box>
//                         }
//                         onDelete={() => {
//                             setValue("rating", null);
//                             handleResetSubsection("rating");
//                         }}
//                     />
//                 }
//                 <Divider orientation="horizontal" variant="fullWidth" sx={{ mt: 1 }} />
//             </Box>

//             <form onSubmit={handleSubmit(applySearchFilters)}>
//                 {/* Price Range - No Accordion */}
//                 <FilterSection
//                     title="Price Range"
//                     actionName="Reset"
//                     actionFunction={() => {
//                         // setValue("priceRange", [0, 1010]);
//                         handleResetSubsection("priceRange", [0, ""]);
//                     }}
//                     isDirty={isFieldChanged(watch("priceRange"), defaultFilters.priceRange)}
//                     useAccordion={false}
//                 >
//                     <Box sx={{ p: 1 }}>
//                         <Controller
//                             name="priceRange"
//                             control={control}
//                             render={({ field: { onChange, value } }) => (
//                                 <Slider
//                                     value={value}
//                                     onChange={(_, newValue, activeThumb) => {
//                                         if (!Array.isArray(newValue)) return;
//                                         if (newValue[1] - newValue[0] < minDistance) {
//                                             if (activeThumb === 0) {
//                                                 const clamped = Math.min(newValue[0], sliderUpperBound - minDistance);
//                                                 onChange([clamped, clamped + minDistance]);
//                                             } else {
//                                                 const clamped = Math.max(newValue[1], minDistance);
//                                                 onChange([clamped - minDistance, clamped]);
//                                             }
//                                         } else {
//                                             onChange(newValue);
//                                         }
//                                     }}
//                                     valueLabelDisplay="auto"
//                                     valueLabelFormat={formatValueLabel}
//                                     step={10}
//                                     min={0}
//                                     max={sliderUpperBound}
//                                     disableSwap
//                                 />
//                             )}
//                         />
//                     </Box>
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                         <Typography variant="body2">{formatValueLabel(priceRange[0])}</Typography>
//                         <Typography variant="body2">{formatValueLabel(priceRange[1])}</Typography>
//                     </Box>
//                 </FilterSection>

//                 {/* Brands - With Accordion and Load More */}
//                 <FilterSection
//                     title="Brands"
//                     actionName="Clear"
//                     actionFunction={() => {
//                         // setValue("brands", []);
//                         handleResetSubsection("brands");
//                         setShowAllBrands(false);
//                     }}
//                     isDirty={isFieldChanged(watch("brands"), defaultFilters.brands)}
//                     useAccordion={true}
//                     defaultExpanded={true}
//                     onAccordionChange={handleBrandAccordionChange}
//                 >
//                     <Controller
//                         name="brands"
//                         control={control}
//                         render={({ field: { onChange, value } }) => (
//                             <>
//                                 <FormGroup>
//                                     {visibleBrands?.map((brand) => (
//                                         <FormControlLabel
//                                             key={brand.key}
//                                             control={
//                                                 <Checkbox
//                                                     checked={value.includes(brand.key)}
//                                                     onChange={(e) =>
//                                                         e.target.checked
//                                                             ? onChange([...value, brand.key])
//                                                             : onChange(value.filter((v) => v !== brand.key))
//                                                     }
//                                                 />
//                                             }
//                                             label={`${brand.key} (${brand.doc_count})`}
//                                         />
//                                     ))}
//                                 </FormGroup>
//                                 {brands?.length > initialBrandCount && !showAllBrands && (
//                                     <Button
//                                         size="small"
//                                         onClick={() => setShowAllBrands(true)}
//                                         sx={{ mt: 1, textTransform: 'none' }}
//                                     >
//                                         Load More ({brands.length - initialBrandCount} more)
//                                     </Button>
//                                 )}
//                                 {showAllBrands && (
//                                     <Button
//                                         size="small"
//                                         onClick={() => setShowAllBrands(false)}
//                                         sx={{ mt: 1, textTransform: 'none' }}
//                                     >
//                                         Show Less
//                                     </Button>
//                                 )}
//                             </>
//                         )}
//                     />
//                 </FilterSection>

//                 {/* Customer Rating - With Accordion */}
                
//                 <FilterSection
//                     title="Customer Rating"
//                     actionName="Clear"
//                     actionFunction={() => {
//                         // setValue("rating", null);
//                         handleResetSubsection("rating");
//                     }}
//                     isDirty={isFieldChanged(watch("rating"), defaultFilters.rating)}
//                     useAccordion={true}
//                     defaultExpanded={true}
//                 >

//                     <FormControl component="fieldset" sx={{ width: "100%" }}>
//                         <Controller
//                             name="rating"
//                             control={control}
//                             render={({ field }) => (
//                                 <RadioGroup {...field} aria-labelledby="rating-filter-group-label">
//                                     {ratingOptions.map((ratingValue) => (
//                                         <FormControlLabel
//                                             key={ratingValue}
//                                             value={ratingValue}
//                                             control={<Radio />}
//                                             label={
//                                                 <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
//                                                     <Rating name="read-only" value={ratingValue} readOnly />
//                                                     <Typography variant='body2'>& Up</Typography>
//                                                 </Box>
//                                             }
//                                         />
//                                     ))}
//                                 </RadioGroup>
//                             )}
//                         />
//                     </FormControl>
//                 </FilterSection>

//                 {/* Availability - With Accordion */}
//                 <FilterSection
//                     title="Availability"
//                     actionName="Clear"
//                     actionFunction={() => {
//                         // setValue("inStock", null);
//                         handleResetSubsection("inStock");
//                     }}
//                     isDirty={isFieldChanged(watch("inStock"), defaultFilters.inStock)}
//                     useAccordion={true}
//                     defaultExpanded={true}
//                 >
//                     <Controller
//                         name="inStock"
//                         control={control}
//                         defaultValue={false}
//                         render={({ field }) => (
//                             <FormControlLabel
//                                 control={
//                                     <Checkbox
//                                         checked={!!field.value}
//                                         onChange={(e) => field.onChange(e.target.checked)}
//                                     />
//                                 }
//                                 label="Exclude Out Of Stock"
//                             />
//                         )}
//                     />
//                 </FilterSection>
//             </form>
//         </Box>
//     );
// }

// export default FilterSidebar;





import { useEffect, useRef, useState } from 'react';
import {
    Box, Typography, Slider, FormGroup, FormControlLabel,
    Checkbox, Rating, Divider, Button, FormControl,
    RadioGroup, Radio, Accordion, AccordionSummary, 
    AccordionDetails, Chip,
    Backdrop,
    CircularProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Controller, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router';
import { parseURLToFilters } from '../utils/searchUtils';
import StarIcon from '@mui/icons-material/Star';

const FilterSection = ({ title, children, actionName, actionFunction, isDirty, useAccordion = false, defaultExpanded = true, onAccordionChange }) => {
    if (useAccordion) {
        return (
            <Box>
            <Accordion 
                defaultExpanded={defaultExpanded} 
                disableGutters
                elevation={0}
                onChange={onAccordionChange}
                sx={{
                    bgcolor: 'inherit',
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': { margin: 0 }
                }}
            >
                <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ px: 0, minHeight: 48 }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 1 }}>
                        <Typography variant="h6" fontSize={16}>{title}</Typography>
                        {actionFunction && isDirty && (
                        <Box
                            onClick={(e) => {
                                e.stopPropagation();
                                actionFunction();
                            }}
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                cursor: 'pointer',
                                mr: 1,
                                border: "1px solid",
                                borderColor: "rgba(25, 118, 210, 0.5)",
                                borderRadius: 1,
                                px: 1.2,
                                py: 0.3
                            }}
                        >
                            <Typography 
                                variant="button" 
                                fontSize={13}
                                sx={{ 
                                    color: 'primary.main',
                                    textTransform: 'uppercase',
                                    fontWeight: 500,
                                    // '&:hover': { textDecoration: 'underline' }
                                }}
                            >
                                {actionName}
                                {/* Reset */}
                            </Typography>
                        </Box>
                        )}
                    </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 0, pb: 2 }}>
                    {children}
                </AccordionDetails>
            </Accordion>
            <Divider sx={{ mt: 0.3 }} />
            </Box>
        );
    }

    return (
        // <Box sx={{ pb: 2 }}>
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Typography variant="h6" fontSize={16} gutterBottom>{title}</Typography>
                {actionFunction && isDirty &&
                    <Button variant='outlined' size='small' onClick={actionFunction}>{actionName}</Button>
                }
            </Box>
            {children}
            <Divider sx={{ mt: 2 }} />
        </Box>
    );
};

function FilterSidebar({ applyFilters }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const { brands, isLoading } = useSelector((state) => state.searchReducer);
    const [showClearAll, setShowClearAll] = useState(false);
    const [showAllBrands, setShowAllBrands] = useState(false);
    const filters = parseURLToFilters(searchParams);

    const priceRangeTimeoutRef = useRef(null);

    const { handleSubmit, control, setValue, reset, watch, getValues } = useForm({
        values: filters
    });
    const watchAllFields = watch();
    const priceRange = watch("priceRange");

    const displayMax = 1000;
    const sliderUpperBound = 1010;
    const ratingOptions = [4, 3];
    const minDistance = 20;
    const initialBrandCount = 5;
    const defaultFilters = {
        priceRange: [0, 1010],
        brands: [],
        rating: null,
        inStock: false,
    };

    const handlePriceRangeChange = (newValue) => {
        if (priceRangeTimeoutRef.current) {
            clearTimeout(priceRangeTimeoutRef.current);
        }

        priceRangeTimeoutRef.current = setTimeout(() => {
            const newParams = new URLSearchParams(searchParams);
            const min = newValue[0];
            const max = newValue[1] > displayMax ? '' : newValue[1];
            newParams.set('priceRange', `${min},${max}`);
            newParams.set('page', '1');
            setSearchParams(newParams);
        }, 300);
    };

    const handleBrandsChange = (newBrands) => {
        const newParams = new URLSearchParams(searchParams);
        if (newBrands.length > 0) {
            newParams.set('brands', newBrands.join(','));
        } else {
            newParams.delete('brands');
        }
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    const handleRatingChange = (newRating) => {
        const newParams = new URLSearchParams(searchParams);
        if (newRating) {
            newParams.set('rating', newRating);
        } else {
            newParams.delete('rating');
        }
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    const handleInStockChange = (isChecked) => {
        const newParams = new URLSearchParams(searchParams);
        if (isChecked) {
            newParams.set('inStock', 'true');
        } else {
            newParams.delete('inStock');
        }
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    const isFieldChanged = (current, def) => {
        if (Array.isArray(current) && Array.isArray(def)) {
            return current.join() !== def.join();
        }
        return current !== def;
    };

    const isFormChanged = (formData, defaultValues) => {
        return Object.keys(defaultValues).some((key) => {
            const current = formData[key];
            const original = defaultValues[key];

            if (Array.isArray(current) && Array.isArray(original)) {
                if (current.length !== original.length) return true;
                return current.some((v, i) => v !== original[i]);
            }

            if (key === 'priceRange') {
                const [min1, max1] = current || [];
                const [min2, max2] = original || [];
                return min1 !== min2 || max1 !== max2;
            }

            return current !== original;
        });
    };

    const formatValueLabel = (value) => {
        if (value > displayMax) {
            return `$${displayMax}+`;
        }
        if (value < 1) {
            return `Min.`;
        }
        return `$${value}`;
    };

    const handleResetSubsection = (name) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete(name);
        setValue(name, defaultFilters[name])
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    const handleClearAll = () => {
        const query = searchParams.get('query');
        const sort = searchParams.get('sort') || '_score,desc';
        setSearchParams({ query, priceRange: "0,", sort, page: 1 });
        setShowAllBrands(false);
    };

    const applySearchFilters = (formData) => {
        console.log("Applied");
        let filtersToSend = {};

        Object.entries(formData).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                if (value.length > 0 && key !== "priceRange") filtersToSend[key] = value;
                if (key === "priceRange") {
                    filtersToSend[key] = [value[0], value[1] > displayMax ? null : value[1]];
                }
            } else if (value) {
                filtersToSend[key] = value;
            }
        });

        const currentSort = new URLSearchParams(window.location.search).get("sort") || "_score,desc";
        applyFilters(filtersToSend, currentSort);
    };

    const handleBrandAccordionChange = (event, isExpanded) => {
        if (!isExpanded) {
            setShowAllBrands(false);
        }
    };

    useEffect(() => {
        return () => {
            if (priceRangeTimeoutRef.current) {
                clearTimeout(priceRangeTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const changed = isFormChanged(watchAllFields, defaultFilters);
        setShowClearAll(changed);
    }, [watchAllFields]);

    const visibleBrands = showAllBrands ? brands : brands?.slice(0, initialBrandCount);

    return (
        <Box sx={{ p: 2, maxWidth: 350, ml: "auto", position: "relative" }}>

            {/* <Backdrop
                open={isLoading}
                sx={{
                    position: "absolute",
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    borderRadius: 1
                }}
            >
                <CircularProgress />
            </Backdrop> */}

            <Box sx={{ mb: 1.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                    <Typography variant="h6">Filters</Typography>
                    {showClearAll &&
                        <Button
                            variant='contained'
                            size='small'
                            onClick={() => {
                                reset(defaultFilters);
                                handleClearAll();
                            }}
                        >
                            Clear All
                        </Button>
                    }
                </Box>
                <Divider orientation="horizontal" variant="fullWidth" sx={{ mt: 1 }} />
            </Box>

            <form onSubmit={handleSubmit(applySearchFilters)}>
                <fieldset disabled={isLoading} style={{ border: 'none', padding: 0, margin: 0 }}>
                <FilterSection
                    title="Price Range"
                    actionName="Reset"
                    actionFunction={() => {
                        // setValue("priceRange", [0, 1010]);
                        handleResetSubsection("priceRange", [0, ""]);
                    }}
                    isDirty={isFieldChanged(watch("priceRange"), defaultFilters.priceRange)}
                    useAccordion={false}
                >
                    <Box sx={{ p: 1 }}>
                        <Controller
                            name="priceRange"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <Slider
                                    value={value}
                                    onChange={(_, newValue, activeThumb) => {
                                        if (!Array.isArray(newValue)) return;
                                        if (newValue[1] - newValue[0] < minDistance) {
                                            if (activeThumb === 0) {
                                                const clamped = Math.min(newValue[0], sliderUpperBound - minDistance);
                                                onChange([clamped, clamped + minDistance]);
                                            } 
                                            else {
                                                const clamped = Math.max(newValue[1], minDistance);
                                                onChange([clamped - minDistance, clamped]);
                                            }
                                        } 
                                        else {
                                            onChange(newValue);
                                        }
                                        handlePriceRangeChange(newValue);
                                    }}
                                    valueLabelDisplay="auto"
                                    valueLabelFormat={formatValueLabel}
                                    step={10}
                                    min={0}
                                    max={sliderUpperBound}
                                    disableSwap
                                />
                            )}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">{formatValueLabel(priceRange[0])}</Typography>
                        <Typography variant="body2">{formatValueLabel(priceRange[1])}</Typography>
                    </Box>
                </FilterSection>

                <FilterSection
                    title="Brands"
                    actionName="Clear"
                    actionFunction={() => {
                        // setValue("brands", []);
                        handleResetSubsection("brands");
                        setShowAllBrands(false);
                    }}
                    isDirty={isFieldChanged(watch("brands"), defaultFilters.brands)}
                    useAccordion={true}
                    defaultExpanded={true}
                    onAccordionChange={handleBrandAccordionChange}
                >
                    <Controller
                        name="brands"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <>
                                <FormGroup>
                                    {visibleBrands?.map((brand) => (
                                        <FormControlLabel
                                            key={brand.key}
                                            control={
                                                <Checkbox
                                                    checked={value.includes(brand.key)}
                                                    onChange={(e) => {
                                                        const newBrands = e.target.checked
                                                            ? [...value, brand.key]
                                                            : value.filter((v) => v !== brand.key);
                                                        
                                                        onChange(newBrands);
                                                        handleBrandsChange(newBrands);
                                                    }}
                                                />
                                            }
                                            label={`${brand.key} (${brand.doc_count})`}
                                        />
                                    ))}
                                </FormGroup>
                                {brands?.length > initialBrandCount && !showAllBrands && (
                                    <Button
                                        size="small"
                                        onClick={() => setShowAllBrands(true)}
                                        sx={{ mt: 1, textTransform: 'none' }}
                                    >
                                        Load More ({brands.length - initialBrandCount} more)
                                    </Button>
                                )}
                                {showAllBrands && (
                                    <Button
                                        size="small"
                                        onClick={() => setShowAllBrands(false)}
                                        sx={{ mt: 1, textTransform: 'none' }}
                                    >
                                        Show Less
                                    </Button>
                                )}
                            </>
                        )}
                    />
                </FilterSection>

                <FilterSection
                    title="Customer Rating"
                    actionName="Clear"
                    actionFunction={() => {
                        // setValue("rating", null);
                        handleResetSubsection("rating");
                    }}
                    isDirty={isFieldChanged(watch("rating"), defaultFilters.rating)}
                    useAccordion={true}
                    defaultExpanded={true}
                >

                    <FormControl component="fieldset" sx={{ width: "100%" }}>
                        <Controller
                            name="rating"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <RadioGroup
                                    value={value || ''} 
                                    onChange={(e) => {
                                        const newRating = e.target.value ? Number(e.target.value) : null;
                                        onChange(newRating);
                                        handleRatingChange(newRating);
                                    }}
                                >
                                    {ratingOptions.map((ratingValue) => (
                                        <FormControlLabel
                                            key={ratingValue}
                                            value={ratingValue}
                                            control={<Radio />}
                                            label={
                                                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                                    <Rating name="read-only" value={ratingValue} readOnly />
                                                    <Typography variant='body2'>& Up</Typography>
                                                </Box>
                                            }
                                        />
                                    ))}
                                </RadioGroup>
                            )}
                        />
                    </FormControl>
                </FilterSection>

                <FilterSection
                    title="Availability"
                    actionName="Clear"
                    actionFunction={() => {
                        // setValue("inStock", null);
                        handleResetSubsection("inStock");
                    }}
                    isDirty={isFieldChanged(watch("inStock"), defaultFilters.inStock)}
                    useAccordion={true}
                    defaultExpanded={true}
                >
                    <Controller
                        name="inStock"
                        control={control}
                        defaultValue={false}
                        render={({ field }) => (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={!!field.value}
                                        onChange={(e) => {
                                            const isChecked = e.target.checked
                                            field.onChange(isChecked)
                                            handleInStockChange(isChecked)
                                        }}
                                    />
                                }
                                label="Exclude Out Of Stock"
                            />
                        )}
                    />
                </FilterSection>
                </fieldset>
            </form>
        </Box>
    );
}

export default FilterSidebar;