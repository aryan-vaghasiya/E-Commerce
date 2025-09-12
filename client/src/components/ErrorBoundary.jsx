import React from "react";
import { Box, Typography, Button, Alert, Container } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console or error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Check if this is a small error boundary (inline component)
      const isInline = this.props.inline;
      
      if (isInline) {
        return (
          <Box
            sx={{
              textAlign: "center",
              p: 3,
              bgcolor: "background.paper",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "error.light",
              my: 2,
            }}
          >
            <ErrorOutlineIcon
              sx={{
                fontSize: 32,
                color: "error.main",
                mb: 1,
              }}
            />
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              {this.props.title || "Component Error"}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
              {this.props.message || "This section couldn't load properly."}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={this.handleRetry}
              sx={{ fontSize: "0.75rem" }}
            >
              Retry
            </Button>
          </Box>
        );
      }

      // Full error boundary UI
      return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
          <Box
            sx={{
              textAlign: "center",
              p: 4,
              bgcolor: "background.paper",
              borderRadius: 3,
              boxShadow: 2,
            }}
          >
            <ErrorOutlineIcon
              sx={{
                fontSize: 64,
                color: "error.main",
                mb: 2,
              }}
            />
            <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
              {this.props.title || "Something went wrong"}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {this.props.message || 
                "We're sorry, but something unexpected happened. Please try refreshing the page."}
            </Typography>
            
            {process.env.NODE_ENV === "development" && this.state.error && (
              <Alert severity="error" sx={{ mb: 3, textAlign: "left" }}>
                <Typography variant="body2" component="pre" sx={{ fontSize: "0.75rem" }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </Typography>
              </Alert>
            )}
            
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={this.handleRetry}
              sx={{ mr: 2 }}
            >
              Try Again
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

// Functional component wrapper for easier use
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

export default ErrorBoundary;