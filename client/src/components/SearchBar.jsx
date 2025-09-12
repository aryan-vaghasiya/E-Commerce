import { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  InputAdornment,
  Chip,
  Stack,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import HistoryIcon from "@mui/icons-material/History";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const SearchBar = ({ 
  onSearch, 
  placeholder = "Search for products...", 
  suggestions = [],
  showHistory = true,
  showTrending = true 
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const searchRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Default trending searches
  const trendingSearches = [
    "iPhone 15",
    "Nike Air Max",
    "Samsung TV",
    "MacBook Pro",
    "Wireless Headphones"
  ];

  // Load search history from localStorage
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    setSearchHistory(history.slice(0, 5)); // Keep only last 5 searches
  }, []);

  // Filter suggestions based on query
  useEffect(() => {
    if (query.trim()) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  }, [query, suggestions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setQuery(value);
    setIsOpen(true);
  };

  const handleSearch = (searchQuery = query) => {
    if (searchQuery.trim()) {
      // Add to search history
      const newHistory = [searchQuery, ...searchHistory.filter(item => item !== searchQuery)].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem("searchHistory", JSON.stringify(newHistory));
      
      // Perform search
      onSearch(searchQuery);
      setIsOpen(false);
      setQuery(searchQuery);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleClearSearch = () => {
    setQuery("");
    setIsOpen(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    } else if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  };

  return (
    <Box ref={searchRef} sx={{ position: "relative", width: "100%" }}>
      <TextField
        fullWidth
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        variant="outlined"
        size={isMobile ? "medium" : "large"}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 3,
            bgcolor: "background.paper",
            "&:hover": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.main",
              },
            },
            "&.Mui-focused": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderWidth: 2,
              },
            },
          },
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: query && (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClearSearch}
                  size="small"
                  aria-label="clear search"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      {/* Search Dropdown */}
      {isOpen && (
        <Paper
          elevation={8}
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1300,
            mt: 1,
            borderRadius: 2,
            maxHeight: 400,
            overflow: "auto",
          }}
        >
          {/* Filtered Suggestions */}
          {filteredSuggestions.length > 0 && (
            <Box>
              <Typography
                variant="caption"
                sx={{ px: 2, py: 1, display: "block", fontWeight: 600, color: "text.secondary" }}
              >
                Suggestions
              </Typography>
              <List dense>
                {filteredSuggestions.map((suggestion, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => handleSuggestionClick(suggestion)}
                    sx={{
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <SearchIcon sx={{ mr: 2, color: "action.active" }} />
                    <ListItemText primary={suggestion} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Search History */}
          {!query && showHistory && searchHistory.length > 0 && (
            <Box>
              <Box sx={{ px: 2, py: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Recent Searches
                </Typography>
                <IconButton size="small" onClick={clearHistory}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Box>
              <List dense>
                {searchHistory.map((item, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => handleSuggestionClick(item)}
                    sx={{
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <HistoryIcon sx={{ mr: 2, color: "action.active" }} />
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Trending Searches */}
          {!query && showTrending && (
            <Box sx={{ p: 2 }}>
              <Typography
                variant="caption"
                sx={{ display: "block", mb: 1, fontWeight: 600, color: "text.secondary" }}
              >
                <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }} />
                Trending
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                {trendingSearches.map((trend, index) => (
                  <Chip
                    key={index}
                    label={trend}
                    size="small"
                    variant="outlined"
                    onClick={() => handleSuggestionClick(trend)}
                    sx={{
                      cursor: "pointer",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Empty State */}
          {query && filteredSuggestions.length === 0 && (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                No suggestions found for "{query}"
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Press Enter to search anyway
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default SearchBar;