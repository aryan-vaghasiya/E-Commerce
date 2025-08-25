import { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, setPageAll } from "../redux/products/productActions";
import ProductItem from "./ProductItem";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Snackbar from "@mui/material/Snackbar";
import { hideSnack } from "../redux/snackbar/snackbarActions";
import Alert from "@mui/material/Alert";
import Pagination from "@mui/material/Pagination";
import Typography from "@mui/material/Typography";
import { searchProducts, setPageSearch } from "../redux/search/searchActions";
import {
  Button,
  Container,
  Divider,
  IconButton,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";

// ---- Helper: Smooth scrollable horizontal carousel with buttons ----
const HorizontalScroller = ({ children, ariaLabel }) => {
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

  return (
    <Box sx={{ position: "relative" }}>
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

      <Box
        ref={ref}
        role="region"
        aria-label={ariaLabel}
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
        {children}
      </Box>

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
  );
};

// ---- Reusable Carousel Section ----
const ProductCarousel = ({ title, subtitle, products }) => {
  return (
    <Box sx={{ my: { xs: 4, md: 6 } }}>
      <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        <Button size="small" color="primary" sx={{ textTransform: "none" }}>
          View all
        </Button>
      </Stack>

      <HorizontalScroller ariaLabel={title}>
        {products?.map((product) => (
          <Box
            key={product.id}
            sx={{
              minWidth: { xs: 220, sm: 240, md: 260 },
              flexShrink: 0,
              scrollSnapAlign: "start",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
            }}
          >
            <ProductItem product={product} loading={false} />
          </Box>
        ))}
      </HorizontalScroller>

      <Divider sx={{ mt: 3 }} />
    </Box>
  );
};

const HomePage = () => {
  const productsState = useSelector((state) => state.productReducer);
  const searchState = useSelector((state) => state.searchReducer);
  const snackbarState = useSelector((state) => state.snackbarReducer);
  const dispatch = useDispatch();

  const handlePage = (event, value) => {
    if (searchState.query.trim() !== "") {
      dispatch(setPageSearch(value));
    } else {
      dispatch(setPageAll(value));
    }
  };

  const totalPages = searchState.query ? searchState.pages : productsState.pages;
  const currentPage = searchState.query ? searchState.currentPage : productsState.currentPage;
  const productsToShow = searchState.query ? searchState.products : productsState.products;

  useEffect(() => {
    if (searchState.query.trim() !== "") {
      dispatch(searchProducts(searchState.query));
    } else {
      dispatch(fetchProducts());
    }
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [currentPage, dispatch, searchState.query]);

  // Slicing to create "sections" without changing data logic
  const trendingProducts = productsToShow?.slice(0, 10) || [];
  const recentProducts = productsToShow?.slice(10, 20) || [];
  const byCategory = (cat) =>
    (productsToShow || []).filter((p) => (p.category || "").toLowerCase().includes(cat)).slice(0, 10);

  const electronics = byCategory("electronics");
  const fashion = byCategory("fashion");
  const home = byCategory("home");

  // ---- Hero background image (replace with your own asset if desired) ----
  const heroImage =
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1600&auto=format&fit=crop"; // placeholder

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      {/* HERO */}
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: 380, sm: 460, md: 560 },
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          color: "common.white",
          borderBottomLeftRadius: { xs: 24, md: 40 },
          borderBottomRightRadius: { xs: 24, md: 40 },
          boxShadow: 6,
          backgroundImage: `linear-gradient( to right, rgba(25,25,25,0.75), rgba(25,25,25,0.35) ), url('${heroImage}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <ShoppingBagRoundedIcon sx={{ color: "secondary.main" }} />
                  <Typography variant="overline" sx={{ letterSpacing: 1.2 }}>
                    New Season Arrivals
                  </Typography>
                </Stack>

                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    lineHeight: 1.1,
                    fontSize: { xs: "2rem", sm: "2.5rem", md: "3.25rem" },
                  }}
                >
                  Discover Your Style, Shop the Latest Trends
                </Typography>

                <Typography
                  variant="h6"
                  sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 400, maxWidth: 720 }}
                >
                  Curated picks, trending drops, and essentials you’ll love—all in one place.
                </Typography>

                <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    sx={{ px: 3, py: 1.25, borderRadius: 999 }}
                  >
                    Shop Now
                  </Button>
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="large"
                    sx={{
                      px: 3,
                      py: 1.25,
                      borderRadius: 999,
                      borderColor: "rgba(255,255,255,0.6)",
                      color: "white",
                      "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.06)" },
                    }}
                    startIcon={<StarRoundedIcon />}
                  >
                    Trending
                  </Button>
                </Stack>

                {/* Optional: Search field inside hero (purely visual, not wired) */}
                <Box
                  sx={{
                    mt: 2,
                    bgcolor: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(6px)",
                    p: 1,
                    borderRadius: 2,
                    display: { xs: "none", sm: "block" },
                    maxWidth: 520,
                  }}
                >
                  <TextField
                    fullWidth
                    placeholder="Search for electronics, apparel, home & more"
                    variant="outlined"
                    size="medium"
                    InputProps={{
                      sx: {
                        bgcolor: "rgba(255,255,255,0.1)",
                        color: "white",
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.4)" },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
                      },
                    }}
                  />
                </Box>
              </Stack>
            </Grid>

            {/* Decorative right column, hidden on small screens */}
            <Grid item xs={12} md={5} sx={{ display: { xs: "none", md: "block" } }}>
              <Box
                sx={{
                  height: { md: 360, lg: 420 },
                  borderRadius: 4,
                  bgcolor: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  boxShadow: 8,
                }}
              />
            </Grid>
          </Grid>
        </Container>

        {/* Bottom subtle gradient edge */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 48,
            background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,.25) 100%)",
          }}
        />
      </Box>

      <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 }, pb: { xs: 4, md: 6 } }}>
        {/* SNACKBAR */}
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

        {/* CAROUSELS */}
        {trendingProducts.length > 0 && (
          <ProductCarousel
            title="🔥 Trending Now"
            subtitle="Most loved by shoppers this week"
            products={trendingProducts}
          />
        )}

        {recentProducts.length > 0 && (
          <ProductCarousel
            title="🕒 Recently Ordered"
            subtitle="Popular purchases happening right now"
            products={recentProducts}
          />
        )}

        {electronics.length > 0 && (
          <ProductCarousel title="💻 Electronics" subtitle="Latest gadgets & accessories" products={electronics} />
        )}
        {fashion.length > 0 && (
          <ProductCarousel title="👗 Fashion" subtitle="Fresh fits for every day" products={fashion} />
        )}
        {home.length > 0 && (
          <ProductCarousel title="🏠 Home" subtitle="Make your space feel like you" products={home} />
        )}

        {/* MAIN GRID */}
        <Typography
          variant="h4"
          fontWeight={800}
          textAlign="center"
          mt={{ xs: 4, md: 6 }}
          mb={{ xs: 2, md: 3 }}
        >
          Browse All Products
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
          Explore our complete catalog across categories.
        </Typography>

        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {(productsState.isLoading || searchState.isLoading) &&
            Array.from({ length: 12 }).map((_, index) => (
              <Grid key={index} item xs={12} sm={6} md={4} lg={3}>
                <ProductItem loading={true} />
              </Grid>
            ))}

          {!productsState.isLoading &&
            !searchState.isLoading &&
            (productsToShow?.length ? (
              productsToShow.map((product) => (
                <Grid key={product.id} item xs={12} sm={6} md={4} lg={3} xl={2.4}>
                  <Box
                    sx={{
                      height: "100%",
                      transition: "transform .15s ease, box-shadow .15s ease",
                      "&:hover": { transform: "translateY(-3px)", boxShadow: 4 },
                    }}
                  >
                    <ProductItem product={product} loading={false} />
                  </Box>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
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
                    Try adjusting your search or filters to find what you’re looking for.
                  </Typography>
                </Box>
              </Grid>
            ))}
        </Grid>

        {/* PAGINATION */}
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
      </Container>

      {/* FOOTER */}
      <Box sx={{ bgcolor: "#0b0d0f", color: "#fff", pt: 6, pb: 4, mt: 2 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight={800}>
                MyShop
              </Typography>
              <Typography variant="body2" sx={{ mt: 1.5, color: "rgba(255,255,255,.75)" }}>
                Your destination for quality products and great deals, delivered fast.
              </Typography>
            </Grid>
            <Grid item xs={6} md={4}>
              <Typography variant="subtitle1" fontWeight={700}>
                Quick Links
              </Typography>
              <Stack spacing={1.2} sx={{ mt: 1.5 }}>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,.75)" }}>
                  About Us
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,.75)" }}>
                  Contact
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,.75)" }}>
                  Support
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} md={4}>
              <Typography variant="subtitle1" fontWeight={700}>
                Follow Us
              </Typography>
              <Stack spacing={1.2} sx={{ mt: 1.5 }}>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,.75)" }}>
                  Instagram
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,.75)" }}>
                  Facebook
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,.75)" }}>
                  Twitter
                </Typography>
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,.15)" }} />
          <Typography variant="body2" align="center" sx={{ color: "rgba(255,255,255,.6)" }}>
            © {new Date().getFullYear()} MyShop. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;