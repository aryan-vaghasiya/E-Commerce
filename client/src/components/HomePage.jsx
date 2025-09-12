import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, setPageAll } from "../redux/products/productActions";
import { searchProducts, setPageSearch } from "../redux/search/searchActions";
import { hideSnack } from "../redux/snackbar/snackbarActions";
import {
  Box,
  Container,
  Grid,
  Snackbar,
  Alert,
  Pagination,
  Typography,
} from "@mui/material";
import HeroSection from "./HeroSection";
import CategoryGrid from "./CategoryGrid";
import SearchBar from "./SearchBar";
import ProductSection from "./ProductSection";
import ProductCard from "./ProductCard";
import ErrorBoundary from "./ErrorBoundary";
import { createErrorHandler, withRetry } from "../utils/errorHandling";

// Data fetching utilities
const useProductData = () => {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState({ trending: false, recent: false, categories: false });
  const [error, setError] = useState({ trending: null, recent: null, categories: null });
  
  const userState = useSelector((state) => state.userReducer);

  const fetchTrendingProducts = async (limit = 10) => {
    setLoading(prev => ({ ...prev, trending: true }));
    setError(prev => ({ ...prev, trending: null }));
    
    const handleError = createErrorHandler(
      (error) => setError(prev => ({ ...prev, trending: error })),
      () => setLoading(prev => ({ ...prev, trending: false }))
    );
    
    try {
      await withRetry(async () => {
        const res = await fetch(`http://localhost:3000/products/trending?limit=${limit}`, {
          headers: {
            Authorization: `Bearer ${userState.token}`,
          },
        });
        
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Failed to fetch trending products');
        }
        
        const data = await res.json();
        setTrendingProducts(data);
      });
    } catch (err) {
      handleError(err, 'fetchTrendingProducts');
    } finally {
      setLoading(prev => ({ ...prev, trending: false }));
    }
  };

  const fetchRecentProducts = async (limit = 10) => {
    setLoading(prev => ({ ...prev, recent: true }));
    setError(prev => ({ ...prev, recent: null }));
    
    const handleError = createErrorHandler(
      (error) => setError(prev => ({ ...prev, recent: error })),
      () => setLoading(prev => ({ ...prev, recent: false }))
    );
    
    try {
      await withRetry(async () => {
        const res = await fetch(`http://localhost:3000/products/recently-ordered?limit=${limit}`, {
          headers: {
            Authorization: `Bearer ${userState.token}`,
          },
        });
        
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Failed to fetch recent products');
        }
        
        const data = await res.json();
        setRecentProducts(data);
      });
    } catch (err) {
      handleError(err, 'fetchRecentProducts');
    } finally {
      setLoading(prev => ({ ...prev, recent: false }));
    }
  };

  const simulateCategoryLoading = () => {
    setLoading(prev => ({ ...prev, categories: true }));
    // Simulate loading time for categories
    setTimeout(() => {
      setLoading(prev => ({ ...prev, categories: false }));
    }, 800);
  };

  return {
    trendingProducts,
    recentProducts,
    loading,
    error,
    fetchTrendingProducts,
    fetchRecentProducts,
    simulateCategoryLoading,
  };
};

const HomePage = () => {
  const dispatch = useDispatch();
  const productsState = useSelector((state) => state.productReducer);
  const searchState = useSelector((state) => state.searchReducer);
  const snackbarState = useSelector((state) => state.snackbarReducer);
  
  const {
    trendingProducts,
    recentProducts,
    loading: productDataLoading,
    error: productDataError,
    fetchTrendingProducts,
    fetchRecentProducts,
    simulateCategoryLoading,
  } = useProductData();

  // Pagination and search logic
  const handlePage = (_, value) => {
    if (searchState.query.trim() !== "") {
      dispatch(setPageSearch(value));
    } else {
      dispatch(setPageAll(value));
    }
  };

  const handleSearch = (query) => {
    if (query.trim()) {
      dispatch(searchProducts(query));
    } else {
      dispatch(fetchProducts());
    }
  };

  // Computed values
  const totalPages = searchState.query ? searchState.pages : productsState.pages;
  const currentPage = searchState.query ? searchState.currentPage : productsState.currentPage;
  const productsToShow = searchState.query ? searchState.products : productsState.products;
  const isMainLoading = productsState.isLoading || searchState.isLoading;

  // Category filtering helper
  const getProductsByCategory = (category) =>
    (productsToShow || []).filter((p) => 
      (p.category || "").toLowerCase().includes(category.toLowerCase())
    ).slice(0, 10);

  // Initialize data on mount and page changes
  useEffect(() => {
    if (searchState.query.trim() !== "") {
      dispatch(searchProducts(searchState.query));
    } else {
      dispatch(fetchProducts());
    }
    
    fetchTrendingProducts();
    fetchRecentProducts();
    simulateCategoryLoading();
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [currentPage, dispatch, searchState.query, fetchTrendingProducts, fetchRecentProducts, simulateCategoryLoading]);

  return (
    <ErrorBoundary
      title="Homepage Error"
      message="We're having trouble loading the homepage. Please try refreshing the page."
    >
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
        {/* Hero Section */}
        <ErrorBoundary
          title="Hero Section Error"
          message="Unable to load the hero section."
        >
          <HeroSection />
        </ErrorBoundary>

        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbarState.show}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            autoHideDuration={1000}
            onClose={() => dispatch(hideSnack())}
            sx={{ "&.MuiSnackbar-root": { top: "70px" } }}
          >
            <Alert onClose={() => dispatch(hideSnack())} severity={snackbarState.severity} variant="filled">
              {snackbarState.message}
            </Alert>
          </Snackbar>

          {/* Search Bar */}
          <ErrorBoundary
            title="Search Error"
            message="Search functionality is temporarily unavailable."
          >
            <Box sx={{ mb: { xs: 4, md: 6 } }}>
              <SearchBar
                onSearch={handleSearch}
                placeholder="Search for electronics, apparel, home & more..."
              />
            </Box>
          </ErrorBoundary>

          {/* Category Grid */}
          <ErrorBoundary
            title="Categories Error"
            message="Unable to load product categories."
          >
            <CategoryGrid 
              loading={productDataLoading.categories}
              error={productDataError.categories}
              onRetry={simulateCategoryLoading}
            />
          </ErrorBoundary>

          {/* Product Sections */}
          <ErrorBoundary
            title="Product Sections Error"
            message="Some product sections may not be available right now."
          >
            <ProductSection
              title="🔥 Trending Now"
              subtitle="Most loved by shoppers this week"
              products={trendingProducts}
              loading={productDataLoading.trending}
              error={productDataError.trending}
              onRetry={fetchTrendingProducts}
              layout="carousel"
            />

            <ProductSection
              title="🕒 Recently Ordered"
              subtitle="Popular purchases happening right now"
              products={recentProducts}
              loading={productDataLoading.recent}
              error={productDataError.recent}
              onRetry={fetchRecentProducts}
              layout="carousel"
            />

            <ProductSection
              title="💻 Electronics"
              subtitle="Latest gadgets & accessories"
              products={getProductsByCategory("electronics")}
              loading={isMainLoading}
              layout="carousel"
            />

            <ProductSection
              title="👗 Fashion"
              subtitle="Fresh fits for every day"
              products={getProductsByCategory("fashion")}
              loading={isMainLoading}
              layout="carousel"
            />

            <ProductSection
              title="🏠 Home"
              subtitle="Make your space feel like you"
              products={getProductsByCategory("home")}
              loading={isMainLoading}
              layout="carousel"
            />
          </ErrorBoundary>

          {/* All Products Grid */}
          <ErrorBoundary
            title="Products Grid Error"
            message="Unable to load the main products grid."
          >
            <Box sx={{ mt: { xs: 6, md: 8 } }}>
              <Typography
                variant="h4"
                fontWeight={700}
                textAlign="center"
                sx={{ mb: 1 }}
              >
                Browse All Products
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
                Explore our complete catalog across categories
              </Typography>

              <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                {isMainLoading &&
                  Array.from({ length: 12 }).map((_, index) => (
                    <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <ProductCard loading={true} />
                    </Grid>
                  ))}

                {!isMainLoading &&
                  (productsToShow?.length ? (
                    productsToShow.map((product) => (
                      <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4 }}>
                        <ErrorBoundary
                          title="Product Card Error"
                          message="Unable to display this product."
                          inline={true}
                        >
                          <ProductCard product={product} loading={false} />
                        </ErrorBoundary>
                      </Grid>
                    ))
                  ) : (
                    <Grid size={{ xs: 12 }}>
                      <Box
                        sx={{
                          textAlign: "center",
                          py: 8,
                          px: 2,
                          bgcolor: "background.paper",
                          borderRadius: 3,
                          border: "1px dashed",
                          borderColor: "divider",
                        }}
                      >
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          No products found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Try adjusting your search or filters to find what you're looking for.
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
              </Grid>

              {/* Pagination */}
              {productsToShow?.length > 0 && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePage}
                    color="primary"
                    showFirstButton
                    showLastButton
                    shape="rounded"
                    siblingCount={1}
                    boundaryCount={1}
                  />
                </Box>
              )}
            </Box>
          </ErrorBoundary>
        </Container>

        {/* Footer */}
        <ErrorBoundary
          title="Footer Error"
          message="Footer content is temporarily unavailable."
        >
          <Box sx={{ bgcolor: "grey.900", color: "common.white", py: 6, mt: 4 }}>
            <Container maxWidth="lg">
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                    Cartify
                  </Typography>
                  <Typography variant="body2" sx={{ color: "grey.400" }}>
                    Your destination for quality products and great deals, delivered fast.
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                    Quick Links
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Typography variant="body2" sx={{ color: "grey.400" }}>
                      About Us
                    </Typography>
                    <Typography variant="body2" sx={{ color: "grey.400" }}>
                      Contact
                    </Typography>
                    <Typography variant="body2" sx={{ color: "grey.400" }}>
                      Support
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                    Follow Us
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Typography variant="body2" sx={{ color: "grey.400" }}>
                      Instagram
                    </Typography>
                    <Typography variant="body2" sx={{ color: "grey.400" }}>
                      Facebook
                    </Typography>
                    <Typography variant="body2" sx={{ color: "grey.400" }}>
                      Twitter
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ borderTop: 1, borderColor: "grey.800", mt: 4, pt: 3 }}>
                <Typography variant="body2" align="center" sx={{ color: "grey.500" }}>
                  © {new Date().getFullYear()} Cartify. All rights reserved.
                </Typography>
              </Box>
            </Container>
          </Box>
        </ErrorBoundary>
      </Box>
    </ErrorBoundary>
  );
};

export default HomePage;