import { Box, Chip, Typography } from "@mui/material";
import { parseURLToFilters } from "../utils/searchUtils"
import StarIcon from '@mui/icons-material/Star';
import { useSearchParams } from "react-router";

function AppliedFilters({searchParams, setSearchParams}) {

    // const [searchParams, setSearchParams] = useSearchParams()
    const filters = parseURLToFilters(searchParams)
    const minPrice = filters.priceRange[0] === 0 ? "Min" : `$${(filters.priceRange[0]).toFixed(2)}`
    const maxPrice = filters.priceRange[1] === 1010 ? "Max" : `$${(filters.priceRange[1]).toFixed(2)}`

    const handleResetSubsection = (name, value = "") => {
        const newParams = new URLSearchParams(searchParams);

        if(name === "brands"){
            const applied = newParams.get("brands").split(",")
            if(applied.length > 1){
                const newBrands = applied.filter(brand => brand !== value)
                newParams.set("brands", newBrands)
            }
            else{
                newParams.delete(name);
            }
        }
        else if(name === "priceRange"){
            newParams.set("priceRange", "0,")
        }
        else{
            newParams.delete(name);
        }
        // setValue(name, defaultFilters[name])
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    return (
        <Box sx={{display: "flex", gap: 0.5}}>
            {!(filters.priceRange[0] === 0 && filters.priceRange[1] === 1010) &&
                <Chip label={`${minPrice} - ${maxPrice}`} color="primary" onDelete={() => handleResetSubsection("priceRange")} />
            }
            {filters.rating &&
                <Chip
                    color="primary"
                    label={
                        <Box sx={{display: "flex", alignItems: "center"}}>
                            <Typography>
                                {filters.rating}
                                <StarIcon fontSize={"5"} sx={{mb: 0.4, color: "darkorange"}}/>
                                {` & Up`}
                            </Typography>
                        </Box>
                    }
                    onDelete={() => {
                        // setValue("rating", null);
                        // handleResetSubsection("rating");
                        handleResetSubsection("rating")
                    }}
                />
            }
            {filters.brands?.length > 0 &&
                filters.brands.map(brand => <Chip key={brand} label={brand} color="primary" onDelete={() => handleResetSubsection("brands", brand)} />)
            }
            {filters.inStock &&
                <Chip label="In Stock" color="primary" onDelete={() => handleResetSubsection("inStock")} />
            }
        </Box>
    )
}

export default AppliedFilters