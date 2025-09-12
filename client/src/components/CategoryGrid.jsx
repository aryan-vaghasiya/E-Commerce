import { Box, Card, CardContent, Grid, Typography, useTheme, Skeleton, Alert, Button } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router";

const CategoryGrid = ({ categories = [], loading = false, error = null, onRetry }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Default categories if none provided
  const defaultCategories = [
    {
      id: 1,
      name: "Electronics",
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
      icon: "💻",
      productCount: 150,
      slug: "electronics"
    },
    {
      id: 2,
      name: "Fashion",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop",
      icon: "👗",
      productCount: 200,
      slug: "fashion"
    },
    {
      id: 3,
      name: "Home & Garden",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
      icon: "🏠",
      productCount: 120,
      slug: "home"
    },
    {
      id: 4,
      name: "Sports",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
      icon: "⚽",
      productCount: 80,
      slug: "sports"
    }
  ];

  const categoriesToShow = categories.length > 0 ? categories : defaultCategories;

  const handleCategoryClick = (category) => {
    // Navigate to products page with category filter
    navigate(`/products?category=${category.slug}`);
  };

  // Loading state
  if (loading) {
    return (
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
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ my: { xs: 4, md: 6 } }}>
        <Typography
          variant="h4"
          fontWeight={700}
          textAlign="center"
          sx={{ mb: 1 }}
        >
          Shop by Category
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 4 }}
        >
          Discover products across our most popular categories
        </Typography>
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

  return (
    <Box sx={{ my: { xs: 4, md: 6 } }}>
      <Typography
        variant="h4"
        fontWeight={700}
        textAlign="center"
        sx={{ mb: 1 }}
      >
        Shop by Category
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        textAlign="center"
        sx={{ mb: 4 }}
      >
        Discover products across our most popular categories
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {categoriesToShow.map((category) => (
          <Grid key={category.id} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              onClick={() => handleCategoryClick(category)}
              sx={{
                cursor: "pointer",
                height: "100%",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: theme.shadows[8],
                  "& .category-image": {
                    transform: "scale(1.05)",
                  },
                },
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  height: 200,
                  overflow: "hidden",
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.1)), url(${category.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <Box
                  className="category-image"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url(${category.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    transition: "transform 0.3s ease",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    fontSize: "2rem",
                    background: "rgba(255,255,255,0.9)",
                    borderRadius: "50%",
                    width: 56,
                    height: 56,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: theme.shadows[2],
                  }}
                >
                  {category.icon}
                </Box>
              </Box>
              
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{ mb: 1 }}
                >
                  {category.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {category.productCount} products
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CategoryGrid;