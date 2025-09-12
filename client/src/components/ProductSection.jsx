import { useRef, useMemo } from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  IconButton,
  Grid,
  Skeleton,
  useTheme,
  Alert,
} from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import RefreshIcon from "@mui/icons-material/Refresh";
import ProductCard from "./ProductCard";

const ProductSection = ({
  title,
  subtitle,
  products = [],
  loading = false,
  viewAllLink,
  layout = "grid", // 'grid' or 'carousel'
  error = null,
  onViewAll,
  onRetry,
  maxItems = 12,
}) => {
  const ref = useRef(null);
  const theme = useTheme();

  const scrollBy = (delta) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: delta, behavior: "smooth" });
  };

  const sidePadding = useMemo(
    () => ({ xs: theme.spacing(1), sm: theme.spacing(2), md: theme.spacing(2) }),
    [theme]
  );

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else if (viewAllLink) {
      window.location.href = viewAllLink;
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <Box sx={{ my: { xs: 4, md: 6 } }}>
        <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Skeleton variant="text" width={200} height={40} />
            {subtitle && <Skeleton variant="text" width={300} height={24} />}
          </Box>
          <Skeleton variant="rectangular" width={80} height={32} />
        </Stack>

        {layout === "carousel" ? (
          <Box sx={{ display: "flex", gap: 2, overflowX: "hidden", px: sidePadding }}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  minWidth: { xs: 220, sm: 240, md: 260 },
                  flexShrink: 0,
                }}
              >
                <ProductCard loading={true} />
              </Box>
            ))}
          </Box>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
            {Array.from({ length: 8 }).map((_, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <ProductCard loading={true} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ my: { xs: 4, md: 6 } }}>
        <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
        <Alert 
          severity="error" 
          sx={{ borderRadius: 2 }}
          action={
            onRetry && (
              <Button 
                color="inherit" 
                size="small" 
                onClick={onRetry}
                startIcon={<RefreshIcon />}
              >
                Retry
              </Button>
            )
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <Box sx={{ my: { xs: 4, md: 6 } }}>
        <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            px: 2,
            bgcolor: "background.paper",
            borderRadius: 3,
            border: "1px dashed",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            No products available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Check back later for new products in this section.
          </Typography>
        </Box>
      </Box>
    );
  }

  const displayProducts = products.slice(0, maxItems);

  return (
    <Box sx={{ my: { xs: 4, md: 6 } }}>
      {/* Section Header */}
      <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {(viewAllLink || onViewAll) && (
          <Button 
            size="small" 
            color="primary" 
            sx={{ textTransform: "none" }}
            onClick={handleViewAll}
          >
            View all
          </Button>
        )}
      </Stack>

      {/* Products Display */}
      {layout === "carousel" ? (
        <Box sx={{ position: "relative", mb: 0 }}>
          {/* Left scroll button */}
          <IconButton
            aria-label="scroll-left"
            onClick={() => scrollBy(-Math.min(800, window.innerWidth * 0.8))}
            sx={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 2,
              bgcolor: "background.paper",
              boxShadow: 2,
              "&:hover": { bgcolor: "background.paper", boxShadow: 4 },
              display: { xs: "none", sm: "flex" },
            }}
            size="small"
          >
            <ArrowBackIosNewRoundedIcon fontSize="small" />
          </IconButton>

          {/* Scrollable container */}
          <Box
            ref={ref}
            role="region"
            aria-label={title}
            sx={{
              display: "flex",
              gap: 2,
              overflowX: "auto",
              scrollBehavior: "smooth",
              px: sidePadding,
              pb: 1,
              "&::-webkit-scrollbar": { height: 8 },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "divider",
                borderRadius: 8,
              },
              scrollSnapType: "x mandatory",
            }}
          >
            {displayProducts.map((product) => (
              <Box
                key={product.id}
                sx={{
                  minWidth: { xs: 220, sm: 240, md: 260 },
                  flexShrink: 0,
                  scrollSnapAlign: "start",
                }}
              >
                <ProductCard product={product} loading={false} />
              </Box>
            ))}
          </Box>

          {/* Right scroll button */}
          <IconButton
            aria-label="scroll-right"
            onClick={() => scrollBy(Math.min(800, window.innerWidth * 0.8))}
            sx={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 2,
              bgcolor: "background.paper",
              boxShadow: 2,
              "&:hover": { bgcolor: "background.paper", boxShadow: 4 },
              display: { xs: "none", sm: "flex" },
            }}
            size="small"
          >
            <ArrowForwardIosRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {displayProducts.map((product) => (
            <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4 }}>
              <ProductCard product={product} loading={false} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ProductSection;