import { Box, Button, Container, Grid, Stack, Typography } from "@mui/material";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";

const HeroSection = () => {
  const heroImage =
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1600&auto=format&fit=crop";

  return (
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
          <Grid size={{ xs: 12, md: 7 }}>
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
                Curated picks, trending drops, and essentials you'll love—all in one place.
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
            </Stack>
          </Grid>

          {/* Decorative right column, hidden on small screens */}
          <Grid size={{ xs: 12, md: 5 }} sx={{ display: { xs: "none", md: "block" } }}>
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
  );
};

export default HeroSection;