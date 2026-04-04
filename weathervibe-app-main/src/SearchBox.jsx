import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./SearchBox.css";

export default function SearchBox({ onSearch, loading = false, recentSearches = [] }) {
  const [city, setCity] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  const popularCities = [
    "New York", "London", "Tokyo", "Paris", "Mumbai", "Delhi", 
    "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Sydney",
    "Los Angeles", "Dubai", "Singapore", "Hong Kong", "Berlin",
    "Toronto", "Moscow", "Cairo", "Mexico City"
  ];

  useEffect(() => {
    if (city.length > 0) {
      const filtered = [...new Set([...recentSearches, ...popularCities])]
        .filter(suggestion => 
          suggestion.toLowerCase().includes(city.toLowerCase()) &&
          suggestion.toLowerCase() !== city.toLowerCase()
        )
        .slice(0, 6);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [city, recentSearches]);

  const handleSearch = (searchCity = city) => {
    const trimmedCity = searchCity.trim();
    if (trimmedCity === "") {
      setError("⚠️ Please enter a city name!");
      return;
    }
    setError("");
    setShowSuggestions(false);
    onSearch(trimmedCity);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") setShowSuggestions(false);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onSearch(`${position.coords.latitude},${position.coords.longitude}`);
        },
        () => setError("❌ Unable to get your location")
      );
    } else {
      setError("❌ Geolocation is not supported by this browser");
    }
  };

  return (
    <div className="SearchBox">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="search-container"
      >
        <div className="search-box-wrapper">
          <div className="search-input-container">
            <input
              type="text"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                if (error) setError("");
              }}
              onKeyPress={handleKeyPress}
              onFocus={() => city && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="🌍 Enter city name..."
              disabled={loading}
              className={`search-input ${error ? 'error' : ''} ${loading ? 'loading' : ''}`}
            />

            <motion.button
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
              onClick={() => handleSearch()}
              disabled={loading}
              className={`search-button ${loading ? 'loading' : ''}`}
            >
              {loading ? (
                <div className="button-loading">
                  <div className="button-spinner"></div>
                  <span>Searching...</span>
                </div>
              ) : (
                "🔍 Search"
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={getCurrentLocation}
              disabled={loading}
              className="location-button"
              title="Get current location weather"
            >
              📍
            </motion.button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="error-message"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recent Searches */}
          {recentSearches.length > 0 && !showSuggestions && !city && (
            <div className="recent-searches">
              <div className="recent-title">Recent searches:</div>
              <div className="recent-chips">
                {recentSearches.slice(0, 5).map((recent, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSearch(recent)}
                    className="recent-chip"
                  >
                    🕐 {recent}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="suggestions-dropdown"
            >
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCity(suggestion);
                    handleSearch(suggestion);
                  }}
                  className="suggestion-item"
                >
                  <span className="suggestion-icon">📍</span>
                  <span className="suggestion-text">{suggestion}</span>
                  {recentSearches.includes(suggestion) && (
                    <span className="suggestion-badge">Recent</span>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}