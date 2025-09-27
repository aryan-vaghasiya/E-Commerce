import React from 'react';
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

// A simple component to create styled sections in the sidebar
const FilterSection = ({ title, children }) => (
    <Box sx={{ py: 2 }}>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        {children}
        <Divider sx={{ mt: 2 }} />
    </Box>
);

function FilterSidebar({activeFilters, applyFilters}) {
    // In a real app, this state would be managed by Redux or component state
    // const [priceRange, setPriceRange] = React.useState([20, 80]);

    const displayMax = 1000;
    const sliderUpperBound = 1010;

    const { register, handleSubmit, control, setValue, reset, watch, resetField, formState: {errors} } = useForm({
        defaultValues: {
            priceRange: [10, 500],
            rating: null
        }
    })

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
        return `$${value}`;
    };

    const applySearchFilters = (formData) => {
        // console.log(formData);
        const [minPrice, maxPrice] = formData.priceRange;
        const filtersToSend = {
            ...formData,
            priceRange: [
                minPrice,
                maxPrice > displayMax ? null : maxPrice
            ]
        }
        applyFilters(filtersToSend)
    }

    return (
        <Box sx={{p: 2}}>
            <form onSubmit={handleSubmit(applySearchFilters)}>
                <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between", py: 1}}>
                    <Typography variant="h5">Filters</Typography>
                    <Button variant='contained' size='small' type='submit'>Apply</Button>
                </Box>
                <Divider />

                <FilterSection title="Price Range">
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
                        <Typography variant="body2">${priceRange[0]}</Typography>
                        {/* <Typography variant="body2">${priceRange[1]}</Typography> */}
                        <Typography variant="body2">{formatValueLabel(priceRange[1])}</Typography>
                    </Box>
                </FilterSection>

                <FilterSection title="Brand">
                    <FormGroup>
                        <FormControlLabel control={<Checkbox />} label="Apple" />
                        <FormControlLabel control={<Checkbox />} label="Sony" />
                        <FormControlLabel control={<Checkbox />} label="Glamour Beauty" />
                    </FormGroup>
                </FilterSection>

                {/* <FilterSection title="Customer Rating">
                    <Box>
                        <FormControlLabel
                            control={<Checkbox />}
                            label={
                                <Box sx={{display: "flex", gap: 1, alignItems:"center"}}>
                                    <Rating name="read-only" value={4} readOnly size='medium'/> 
                                    <Typography variant='body2'> & Up</Typography>
                                </Box>
                            }
                        />
                        <FormControlLabel
                            control={<Checkbox />}
                            label={
                                <Box sx={{display: "flex", gap: 1, alignItems:"center"}}>
                                    <Rating name="read-only" value={3} readOnly size='medium'/> 
                                    <Typography variant='body2'> & Up</Typography>
                                </Box>
                            }
                        />
                    </Box>
                </FilterSection> */}

                <FilterSection>
                    <FormControl component="fieldset" sx={{width: "100%"}}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h6" gutterBottom>Customer Rating</Typography>
                            {/* <FormLabel component="legend" sx={{ typography: 'h6' }}>Customer Rating</FormLabel> */}
                            <Button size="small" variant='outlined' onClick={() => setValue("rating", null)}>Clear</Button>
                        </Box>
                        
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
                    {/* <FormGroup>
                        <FormControlLabel control={<Checkbox defaultChecked />} label="In Stock" />
                    </FormGroup> */}
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