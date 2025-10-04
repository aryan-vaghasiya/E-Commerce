import React, { useEffect } from 'react';
import {
    Box, Typography, Slider, FormGroup, FormControlLabel,
    Checkbox, Rating, Divider,
    Button,
    FormControl,
    FormLabel,
    RadioGroup,
    Radio
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router';

const FilterSection = ({ title, children, actionName, actionFunction }) => (
    <Box sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Typography variant="h6" gutterBottom>{title}</Typography>
            {/* <FormLabel component="legend" sx={{ typography: 'h6' }}>Customer Rating</FormLabel> */}
            {actionFunction ?
                <Button variant='outlined' size='small' onClick={actionFunction}>{actionName}</Button>
                :
                null
            }
        </Box>
        {children}
        <Divider sx={{ mt: 2 }} />
    </Box>
);

function FilterSidebar({activeFilters, applyFilters, sort}) {
    const displayMax = 1000;
    const sliderUpperBound = 1010;

    const { products, currentPage, pages, query, brands } = useSelector((state) => state.searchReducer);
    const { register, handleSubmit, control, setValue, reset, watch, resetField, formState: {errors} } = useForm({
        defaultValues: {
            priceRange: [0, 1010],
            rating: null,
            brands: []
        }
    })

    const [searchParams, setSearchParams] = useSearchParams()

    const watchAllFields = watch()
    const hasChanges = JSON.stringify(watchAllFields) !== JSON.stringify(activeFilters);

    const priceRange = watch("priceRange")
    const marks = [
        { value: 0, label: '$0' },
        { value: displayMax, label: `$${displayMax}+` }
    ];
    const ratingOptions = [4, 3];

    const formatValueLabel = (value) => {
        if (value > displayMax) {
            return `$${displayMax}+`;
        }
        if(value < 1){
            return `Min.`
        }
        return `$${value}`;
    };

    const applySearchFilters = (formData) => {
        // console.log(formData);
        let filtersToSend = {}

        Object.entries(formData).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                if (value.length > 0 && key !== "priceRange") filtersToSend[key] = value;
                if(key === "priceRange"){
                    filtersToSend[key] = [value[0], value[1] > displayMax ? null : value[1]]
                }
            } 
            else if (value) {
                filtersToSend[key] = value;
            }
        })

        console.log(filtersToSend)
        applyFilters(filtersToSend, sort)
    }

    useEffect(() => {
        reset()
    }, [query])

    useEffect(() => {
        let timeoutId;
        const subscription = watch((data, { type }) => {
            if (type === 'change') {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                
                timeoutId = setTimeout(() => {
                    handleSubmit(applySearchFilters)();
                }, 1000);
            }
        });

        return () => {
            subscription.unsubscribe();
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [watch, sort]);

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         handleSubmit((data) => {
    //             // Update query params instead of calling API directly
    //             // console.log(data);
    //             Object.entries(data).forEach(([key, value]) => {
    //                 if (!value || (Array.isArray(value) && value.length === 0)) {
    //                     searchParams.delete(key);
    //                 } 
    //                 else {
    //                     searchParams.set(key, Array.isArray(value) ? value.join(",") : value);
    //                 }
    //             });
    //             setSearchParams(searchParams);
    //         })();
    //     }, 500);

    //     return () => clearTimeout(timer);
    // }, [watchAllFields, handleSubmit, setSearchParams, searchParams]);

    return (
        <Box sx={{p: 2, maxWidth: 350, ml: "auto"}}>
            <form onSubmit={handleSubmit(applySearchFilters)}>
                <FilterSection title="Price Range" actionName="Reset" actionFunction={() => resetField("priceRange")}>
                    <Box sx={{p: 1}}>
                        <Controller
                            name="priceRange"
                            control={control}
                            render={({ field }) => (
                                <Slider
                                    {...field}
                                    valueLabelDisplay="auto"
                                    valueLabelFormat={formatValueLabel}
                                    step={10}
                                    min={0}
                                    // max={1000}
                                    max={sliderUpperBound}
                                    // marks={marks}
                                />
                            )}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">{formatValueLabel(priceRange[0])}</Typography>
                        {/* <Typography variant="body2">${priceRange[1]}</Typography> */}
                        <Typography variant="body2">{formatValueLabel(priceRange[1])}</Typography>
                    </Box>
                </FilterSection>

                <FilterSection title="Brand" actionName="Clear" actionFunction={() => resetField("brands")}>
                    <Controller
                        name="brands"
                        control={control}
                        render={({ field }) => {
                            const { value, onChange } = field;

                            const handleCheck = (checked, brandKey) => {
                                if (checked) {
                                // add brand if not already present
                                    onChange([...value, brandKey]);
                                } else {
                                // remove brand
                                    onChange(value.filter((v) => v !== brandKey));
                                }
                            };

                            return (
                                <FormGroup>
                                    {brands?.map((brand) => (
                                        <FormControlLabel
                                            key={brand.key}
                                            control={
                                                <Checkbox
                                                    checked={value.includes(brand.key)}
                                                    onChange={(e) =>
                                                        handleCheck(e.target.checked, brand.key)
                                                    }
                                                />
                                            }
                                            label={`${brand.key} (${brand.doc_count})`}
                                        />
                                    ))}
                                </FormGroup>
                            );
                        }}
                    />
                </FilterSection>

                <FilterSection title="Customer Rating" actionName="Clear" actionFunction={() => setValue("rating", null)}>
                    <FormControl component="fieldset" sx={{width: "100%"}}>
                        <Controller
                            name="rating"
                            control={control}
                            render={({ field }) => (
                                <RadioGroup {...field} aria-labelledby="rating-filter-group-label">
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

                <FilterSection title="Availability">
                    <Controller
                        name="inStock"
                        control={control}
                        defaultValue={false}
                        render={({ field }) => (
                            <FormControlLabel
                                control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                                label="In Stock"
                            />
                        )}
                    />
                </FilterSection>
            </form>
        </Box>
    );
}

export default FilterSidebar;