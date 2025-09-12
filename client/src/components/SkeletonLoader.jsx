import { Box, Skeleton, Grid, Card, CardContent } from "@mui/material";

// Generic skeleton for product cards
export const ProductCardSkeleton = () => (
  <Card sx={{ height: "100%" }}>
    <Skeleton variant="rectangular" height={200} />
    <CardContent>
      <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
      <Skeleton variant="text" height={20} width="60%" sx={{ mb: 1 }} />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Skeleton variant="text" height={20} width="40%" />
        <Skeleton variant="text" height={20} width="30%" />
      </Box>
      <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
    </CardContent>
  </Card>
);

// Skeleton for product sections
export const ProductSectionSkeleton = ({ layout = "grid", itemCount = 8 }) => (
  <Box sx={{ my: { xs: 4, md: 6 } }}>
    {/* Section header skeleton */}
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
      <Box>
        <Skeleton variant="text" width={200} height={32} />
        <Skeleton variant="text" width={300} height={20} />
      </Box>
      <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
    </Box>

    {/* Content skeleton */}
    {layout === "carousel" ? (
      <Box sx={{ display: "flex", gap: 2, overflowX: "hidden" }}>
        {Array.from({ length: Math.min(itemCount, 5) }).map((_, index) => (
          <Box
            key={index}
            sx={{
              minWidth: { xs: 220, sm: 240, md: 260 },
              flexShrink: 0,
            }}
          >
            <ProductCardSkeleton />
          </Box>
        ))}
      </Box>
    ) : (
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        {Array.from({ length: itemCount }).map((_, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <ProductCardSkeleton />
          </Grid>
        ))}
      </Grid>
    )}
  </Box>
);

// Skeleton for category grid
export const CategoryGridSkeleton = () => (
  <Box sx={{ my: { xs: 4, md: 6 } }}>
    <Box sx={{ textAlign: "center", mb: 4 }}>
      <Skeleton variant="text" width={300} height={40} sx={{ mx: "auto", mb: 1 }} />
      <Skeleton variant="text" width={400} height={24} sx={{ mx: "auto" }} />
    </Box>
    
    <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: "100%" }}>
            <Skeleton variant="rectangular" height={200} />
            <CardContent>
              <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" height={20} width="60%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Box>
);

// Skeleton for search bar
export const SearchBarSkeleton = () => (
  <Box sx={{ mb: { xs: 4, md: 6 } }}>
    <Skeleton 
      variant="rectangular" 
      height={56} 
      sx={{ borderRadius: 3 }} 
    />
  </Box>
);

// Skeleton for hero section
export const HeroSectionSkeleton = () => (
  <Box
    sx={{
      minHeight: { xs: 380, sm: 460, md: 560 },
      bgcolor: "grey.200",
      borderBottomLeftRadius: { xs: 24, md: 40 },
      borderBottomRightRadius: { xs: 24, md: 40 },
      display: "flex",
      alignItems: "center",
      p: 4,
    }}
  >
    <Box sx={{ maxWidth: "50%" }}>
      <Skeleton variant="text" width="80%" height={20} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="100%" height={60} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="90%" height={24} sx={{ mb: 3 }} />
      <Box sx={{ display: "flex", gap: 2 }}>
        <Skeleton variant="rectangular" width={120} height={48} sx={{ borderRadius: 999 }} />
        <Skeleton variant="rectangular" width={120} height={48} sx={{ borderRadius: 999 }} />
      </Box>
    </Box>
  </Box>
);

// Loading state for entire page sections
export const PageSectionSkeleton = ({ height = 200, showHeader = true }) => (
  <Box sx={{ my: { xs: 4, md: 6 } }}>
    {showHeader && (
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="text" width={200} height={32} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={300} height={20} />
      </Box>
    )}
    <Skeleton 
      variant="rectangular" 
      height={height} 
      sx={{ borderRadius: 2 }} 
    />
  </Box>
);

// Loading overlay for components
export const LoadingOverlay = ({ loading, children, height = "auto" }) => {
  if (loading) {
    return (
      <Box 
        sx={{ 
          position: "relative", 
          minHeight: height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.paper",
          borderRadius: 2,
          p: 4
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ mx: "auto", mb: 2 }} />
          <Skeleton variant="text" width={120} height={20} sx={{ mx: "auto" }} />
        </Box>
      </Box>
    );
  }
  return children;
};

export default {
  ProductCardSkeleton,
  ProductSectionSkeleton,
  CategoryGridSkeleton,
  SearchBarSkeleton,
  HeroSectionSkeleton,
  PageSectionSkeleton,
  LoadingOverlay,
};