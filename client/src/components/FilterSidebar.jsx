import { useEffect, useRef, useState } from 'react';
import {
    Box, Typography, Slider, FormGroup, FormControlLabel,
    Checkbox, Rating, Divider, Button, FormControl,
    RadioGroup, Radio, Accordion, AccordionSummary, 
    AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Controller, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router';
import { parseURLToFilters } from '../utils/searchUtils';

const selectBrands = (state) => state.searchReducer.brands;
const selectPriceRange = (state) => state.searchReducer.priceRange;
const ratingOptions = [4, 3];
const initialBrandCount = 5;

const FilterSection = ({ title, children, actionName, actionFunction, isDirty, useAccordion = false, defaultExpanded = true, onAccordionChange }) => {
    if (useAccordion) {
        return (
            <Box>
            <Accordion 
                defaultExpanded={defaultExpanded}
                disableGutters
                elevation={0}
                onChange={onAccordionChange}
                slotProps={{
                    transition: { unmountOnExit: true }
                }}
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
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1 }}>
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
                                bgcolor: "inherit",
                                px: 1.2,
                                py: 0.3,
                                transition:"all 0.3s ease",
                                '&:hover': { borderColor: "#1976d2", bgcolor: "rgba(25, 118, 210, 0.04)" }
                            }}
                        >
                            <Typography 
                                variant="button" 
                                fontSize={13}
                                sx={{ 
                                    color: 'primary.main',
                                    textTransform: 'uppercase',
                                    fontWeight: 500,
                                }}
                            >
                                {actionName}
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

    const brands = useSelector(selectBrands);
    const apiPriceRange = useSelector(selectPriceRange);

    const [showClearAll, setShowClearAll] = useState(false);
    const [showAllBrands, setShowAllBrands] = useState(false);
    const priceRangeTimeoutRef = useRef(null);
    // const isMountedRef = useRef(true);

    const urlFilters = parseURLToFilters(searchParams)
    const displayMin = Math.floor(apiPriceRange?.min || 0)
    const displayMax = Math.ceil(apiPriceRange?.max || 1000)
    const sliderMax = displayMax + 1;

    const filters = {
        query: urlFilters.query,
        priceRange: urlFilters.priceRange 
            ? [
                urlFilters.priceRange[0] ?? displayMin,
                urlFilters.priceRange[1] ?? sliderMax
            ]
            : [displayMin, sliderMax],
        brands: urlFilters.brands,
        rating: urlFilters.rating,
        inStock: urlFilters.inStock,
    };

    const defaultFilters = {
        priceRange: [displayMin, sliderMax],
        brands: [],
        rating: null,
        inStock: false,
    };

    const { handleSubmit, control, setValue, reset, watch, getValues } = useForm({
        values: filters
    });

    const priceRange = watch("priceRange");
    const brandsValue = watch("brands");
    const ratingValue = watch("rating");
    const inStockValue = watch("inStock");

    const handlePriceRangeChange = (newValue) => {
        if (priceRangeTimeoutRef.current) {
            clearTimeout(priceRangeTimeoutRef.current);
        }

        priceRangeTimeoutRef.current = setTimeout(() => {
            // if (!isMountedRef.current) return;
            const newParams = new URLSearchParams(searchParams);
            const min = newValue[0];
            const max = newValue[1];
            const maxParam = max >= sliderMax ? '' : max;
            
            newParams.set('priceRange', `${min},${maxParam}`);
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
            // return current.length !== def.length || current.some((v, i) => v !== def[i]);
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
        if (value >= sliderMax) {
            return `$${displayMax}+`;
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
        setSearchParams({ query, sort, page: 1 });
        setShowAllBrands(false);
    };

    // const applySearchFilters = (formData) => {
    //     console.log("Applied");
    //     let filtersToSend = {};

    //     Object.entries(formData).forEach(([key, value]) => {
    //         if (Array.isArray(value)) {
    //             if (value.length > 0 && key !== "priceRange") filtersToSend[key] = value;
    //             if (key === "priceRange") {
    //                 filtersToSend[key] = [value[0], value[1] > displayMax ? null : value[1]];
    //             }
    //         } else if (value) {
    //             filtersToSend[key] = value;
    //         }
    //     });

    //     const currentSort = new URLSearchParams(window.location.search).get("sort") || "_score,desc";
    //     applyFilters(filtersToSend, currentSort);
    // };

    const handleBrandAccordionChange = (event, isExpanded) => {
        if (!isExpanded) {
            setShowAllBrands(false);
        }
    };

    useEffect(() => {
        // isMountedRef.current = true;

        return () => {
            // isMountedRef.current = false;
            if (priceRangeTimeoutRef.current) {
                clearTimeout(priceRangeTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const changed = isFormChanged(filters, defaultFilters);
        setShowClearAll(changed);
    }, [filters]);

    const visibleBrands = showAllBrands ? brands : brands?.slice(0, initialBrandCount);

    return (
        <Box sx={{ p: 2, maxWidth: 300, mr: "auto", position: "relative" }}>
            {/* <Box sx={{ opacity: hasNoResults ? 0.5 : 1, pointerEvents: hasNoResults ? 'none' : 'auto'}}> */}
            <Box sx={{}}>
                <Box sx={{ mb: 1.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, mb: 1.5 }}>
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

                {/* <form onSubmit={handleSubmit(applySearchFilters)}> */}
                    <FilterSection
                        title="Price Range"
                        actionName="Reset"
                        actionFunction={() => {
                            handleResetSubsection("priceRange")
                        }}
                        isDirty={isFieldChanged(priceRange, defaultFilters.priceRange)}
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

                                            const minDistance = Math.max(1, Math.floor((sliderMax - displayMin) * 0.1));
                                            let adjustedValue = newValue;

                                            if (newValue[1] - newValue[0] < minDistance) {
                                                if (activeThumb === 0) {
                                                    const clamped = Math.min(newValue[0], sliderMax - minDistance)
                                                    adjustedValue = [clamped, clamped + minDistance]
                                                }
                                                else {
                                                    const clamped = Math.max(newValue[1], displayMin + minDistance)
                                                    adjustedValue = [clamped - minDistance, clamped]
                                                }
                                            }
                                            onChange(adjustedValue)
                                            handlePriceRangeChange(adjustedValue);
                                        }}
                                        valueLabelDisplay="auto"
                                        valueLabelFormat={formatValueLabel}
                                        step={Math.max(1, Math.round((sliderMax - displayMin) / 100))}
                                        min={displayMin}
                                        max={sliderMax}
                                        disableSwap
                                    />
                                )}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">
                                {formatValueLabel(priceRange[0])}
                            </Typography>
                            <Typography variant="body2">
                                {formatValueLabel(priceRange[1])}
                            </Typography>
                        </Box>
                    </FilterSection>

                    {visibleBrands.length > 0?
                        <FilterSection
                            title="Brands"
                            actionName="Clear"
                            actionFunction={() => {
                                handleResetSubsection("brands");
                                setShowAllBrands(false);
                            }}
                            isDirty={isFieldChanged(brandsValue, defaultFilters.brands)}
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
                        :
                        null
                    }

                    <FilterSection
                        title="Customer Rating"
                        actionName="Clear"
                        actionFunction={() => {
                            handleResetSubsection("rating");
                        }}
                        isDirty={isFieldChanged(ratingValue, defaultFilters.rating)}
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
                                                        <Rating name="read-only" value={ratingValue} readOnly size='small' sx={{fontSize: "1.2rem"}} />
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
                            handleResetSubsection("inStock");
                        }}
                        isDirty={isFieldChanged(inStockValue, defaultFilters.inStock)}
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
                {/* </form> */}
            </Box>
        </Box>
    );
}

export default FilterSidebar;