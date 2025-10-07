import { useEffect, useState } from 'react';
import {
    Box, Typography, Slider, FormGroup, FormControlLabel,
    Checkbox, Rating, Divider,
    Button,
    FormControl,
    RadioGroup,
    Radio
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router';

const FilterSection = ({ title, children, actionName, actionFunction, isDirty }) => (
    <Box sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Typography variant="h6" fontSize={16} gutterBottom>{title}</Typography>
            {actionFunction && isDirty?
                <Button variant='outlined' size='small' onClick={actionFunction}>{actionName}</Button>
                :
                null
            }
        </Box>
        {children}
        <Divider sx={{ mt: 2 }} />
    </Box>
);

function FilterSidebar({ applyFilters }) {
    const displayMax = 1000;
    const sliderUpperBound = 1010;
    const [searchParams, setSearchParams] = useSearchParams()
    const [showClearAll, setShowClearAll] = useState(false)

    function parseURLToFilters(searchParams) {
        return {
            query: searchParams.get('query') || '',
            priceRange: searchParams.get('priceRange')?.split(',').map(num => num === "" ? 1010 : parseInt(num)) || [0, 1010],
            brands: searchParams.get('brands')?.split(',') || [],
            rating: searchParams.get('rating') || null,
            inStock: searchParams.get('inStock') === 'true',
        }
    }

    const filters = parseURLToFilters(searchParams)

    const { brands } = useSelector((state) => state.searchReducer);

    const { register, handleSubmit, control, getValues, setValue, reset, watch, resetField, getFieldState, formState: {errors, dirtyFields, isDirty} } = useForm({
        // defaultValues: {
        //     priceRange: [0, 1010],
        //     brands: [],
        //     rating: null,
        //     inStock: false
        // },
        values: filters
    })

    const defaultFilters = {
        priceRange: [0, 1010],
        brands: [],
        rating: null,
        inStock: false,
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

    const watchAllFields = watch()

    const priceRange = watch("priceRange")

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

        const currentSort = new URLSearchParams(window.location.search).get("sort") || "_score,desc";
        applyFilters(filtersToSend, currentSort)
    }

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
    }, [watch]);

    useEffect(() => {
        const changed = isFormChanged(watchAllFields, defaultFilters);
        setShowClearAll(changed);
    }, [watchAllFields]);

    return (
        <Box sx={{p: 2, maxWidth: 350, ml: "auto"}}>
            <Box sx={{mb: 1.5}}>
                <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5}}>
                    <Typography variant="h6">Filters</Typography>
                    {showClearAll &&
                        <Button variant='contained' size='small' onClick={() => {
                                reset(defaultFilters)
                                handleSubmit(applySearchFilters)()
                            }}>
                            Clear All
                        </Button>
                    }
                </Box>
                <Divider orientation="horizontal" variant="fullWidth" sx={{ mt: 1 }}/>
            </Box>
            <form onSubmit={handleSubmit(applySearchFilters)}>
                <FilterSection 
                    title="Price Range" 
                    actionName="Reset" 
                    actionFunction={() => {
                        setValue("priceRange", [0, 1010])
                        handleSubmit(applySearchFilters)()
                    }} 
                    isDirty={isFieldChanged(watch("priceRange"), defaultFilters.priceRange)}
                >
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
                                    max={sliderUpperBound}
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
                    title="Brand" 
                    actionName="Clear" 
                    actionFunction={() => {
                        setValue("brands", [])
                        handleSubmit(applySearchFilters)()
                    }} 
                    isDirty={isFieldChanged(watch("brands"), defaultFilters.brands)}
                > 
                    <Controller
                        name="brands"
                        control={control}
                        render={({ field }) => {
                            const { value, onChange } = field;

                            return (
                                <FormGroup>
                                    {brands?.map((brand) => (
                                        <FormControlLabel
                                            key={brand.key}
                                            control={
                                                <Checkbox
                                                    checked={value.includes(brand.key)}
                                                    onChange={(e) =>
                                                        // handleCheck(e.target.checked, brand.key)
                                                        e.target.checked
                                                            ? onChange([...value, brand.key])
                                                            : onChange(value.filter((v) => v !== brand.key))
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

                <FilterSection 
                    title="Customer Rating" 
                    actionName="Clear" 
                    actionFunction={() => {
                        setValue("rating", null)
                        handleSubmit(applySearchFilters)()
                    }} 
                    isDirty={isFieldChanged(watch("rating"), defaultFilters.rating)}
                >
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

                <FilterSection 
                    title="Availability" 
                    actionName="Clear" 
                    actionFunction={() => {
                        setValue("inStock", null)
                        handleSubmit(applySearchFilters)()
                    }} 
                    isDirty={isFieldChanged(watch("inStock"), defaultFilters.inStock)}
                >
                    <Controller
                        name="inStock"
                        control={control}
                        defaultValue={false}
                        render={({ field }) => (
                            <FormControlLabel
                                control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                                label="Exclude Out Of Stock"
                            />
                        )}
                    />
                </FilterSection>
            </form>
        </Box>
    );
}

export default FilterSidebar;