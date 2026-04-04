import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchBox from "./SearchBox";
import InfoBox from "./InfoBox";


export default function WeatherApp() {
  const [info, setInfo] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [backgroundKey, setBackgroundKey] = useState(0);

  const API_KEY = "24958d154e88f7aa5bc50d229001a46e";

  // Add to recent searches
  const addToRecentSearches = useCallback((city) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(c => c !== city);
      return [city, ...filtered].slice(0, 5);
    });
  }, []);

  // Direction converter
  const degToDir = (deg) => {
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return dirs[Math.round(deg / 45) % 8];
  };

  // Enhanced weather fetching function
  const getWeather = async (cityOrCoords) => {
    setLoading(true);
    setError(null);
    setInfo(null);
    setForecast([]);

    try {
      let lat, lon, cityName;

      // Check if it's coordinates or city name
      if (cityOrCoords.includes(',')) {
        [lat, lon] = cityOrCoords.split(',').map(coord => parseFloat(coord.trim()));
        
        // Reverse geocoding to get city name
        const reverseGeoRes = await fetch(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
        );
        const reverseGeo = await reverseGeoRes.json();
        cityName = reverseGeo[0]?.name || "Current Location";
      } else {
        // Geocoding for city name
        const geoRes = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityOrCoords)}&limit=1&appid=${API_KEY}`
        );
        
        if (!geoRes.ok) throw new Error("🚫 Unable to find location");
        
        const geo = await geoRes.json();
        if (!geo[0]) throw new Error("🏙️ City not found! Please check spelling.");
        
        ({ lat, lon, name: cityName } = geo[0]);
      }

      // Current Weather
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      
      if (!weatherRes.ok) throw new Error("🌤️ Weather data unavailable");
      const weather = await weatherRes.json();

      // Enhanced Forecast
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const forecastData = await forecastRes.json();

      const forecastInfo = forecastData.list
        ?.filter((item) => item.dt_txt.includes("12:00:00"))
        ?.map((item) => ({
          date: new Date(item.dt * 1000).toLocaleDateString("en-US", { 
            weekday: "short", 
            month: "short", 
            day: "numeric" 
          }),
          temp: item.main.temp,
          weather: item.weather[0].main,
          desc: item.weather[0].description,
        })) || [];

      const weatherInfo = {
        city: cityName || weather.name || "Unknown",
        temp: weather.main?.temp ?? 0,
        feelsLike: weather.main?.feels_like ?? 0,
        tempMin: weather.main?.temp_min ?? 0,
        tempMax: weather.main?.temp_max ?? 0,
        humidity: weather.main?.humidity ?? 0,
        pressure: weather.main?.pressure ?? 0,
        weather: weather.weather?.[0]?.main ?? "Clear",
        weatherDesc: weather.weather?.[0]?.description ?? "Clear sky",
        windSpeed: weather.wind?.speed ? (weather.wind.speed * 3.6).toFixed(1) : "0",
        windDir: degToDir(weather.wind?.deg || 0),
        visibility: weather.visibility ? (weather.visibility / 1000).toFixed(1) : "N/A",
        cloudiness: weather.clouds?.all ?? 0,
        sunrise: weather.sys?.sunrise 
          ? new Date(weather.sys.sunrise * 1000).toLocaleTimeString("en-US", { 
              hour: "2-digit", minute: "2-digit", hour12: true 
            })
          : "N/A",
        sunset: weather.sys?.sunset
          ? new Date(weather.sys.sunset * 1000).toLocaleTimeString("en-US", { 
              hour: "2-digit", minute: "2-digit", hour12: true 
            })
          : "N/A",
          lat: weather.coord?.lat || 28.6139,    // Delhi default
          lng: weather.coord?.lon || 77.2090  
      };

      setInfo(weatherInfo);
      setForecast(forecastInfo);
      setBackgroundKey(prev => prev + 1);
      
      if (!cityOrCoords.includes(',')) {
        addToRecentSearches(cityName || cityOrCoords);
      }
      
    } catch (e) {
      setError(e.message || "❌ Something went wrong. Please try again.");
      console.error('Weather API Error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced dynamic background
  const getBackground = () => {
    if (!info) {
      return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    }
    
    const weather = info.weather.toLowerCase();
    const temp = info.temp;
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour > 18;
    
    const backgrounds = {
      clear: isNight 
        ? "linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #2c3e50 100%)"
        : "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
      clouds: temp > 15
        ? "linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)"
        : "linear-gradient(135deg, #757f9a 0%, #d7dde8 100%)",
      rain: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)",
      drizzle: "linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)",
      thunderstorm: "linear-gradient(135deg, #141e30 0%, #243b55 100%)",
      snow: "linear-gradient(135deg, #e6f3ff 0%, #b3d9ff 100%)",
      mist: "linear-gradient(135deg, #606c88 0%, #3f4c6b 100%)",
      fog: "linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)",
      haze: "linear-gradient(135deg, #f39c12 0%, #d68910 100%)",
    };
    
    return backgrounds[weather] || "linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%)";
  };

  // Auto-load location weather on first visit
  useEffect(() => {
    if (!info && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          getWeather(`${latitude},${longitude}`);
        },
        (error) => console.log('Geolocation error:', error)
      );
    }
  }, []);

  return (
    <motion.div
      key={backgroundKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="weather-app-container"
      style={{ background: getBackground() }}
    >
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="weather-app-content"
      >
        <div className="glass-container">
          {/* Animated Background Pattern */}
          <div className="bg-pattern">
            <div className="pattern-dot pattern-dot-1"></div>
            <div className="pattern-dot pattern-dot-2"></div>
            <div className="pattern-dot pattern-dot-3"></div>
          </div>

          {/* Header */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="app-header"
          >
            <h1 className="app-title">
              🌦️ WeatherVibe
            </h1>
            <p className="app-subtitle">Your personal weather companion with style</p>
          </motion.div>

          {/* Search Box */}
          <SearchBox 
            onSearch={getWeather} 
            loading={loading} 
            recentSearches={recentSearches}
          />

          {/* Loading State */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="loading-container"
              >
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <div className="spinner-ping"></div>
                </div>
                <h3 className="loading-title">Fetching Weather Data</h3>
                <p className="loading-subtitle">Getting the latest updates...</p>
                <div className="loading-dots">
                  <div className="dot dot-1"></div>
                  <div className="dot dot-2"></div>
                  <div className="dot dot-3"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error State */}
          <AnimatePresence>
            {error && !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                className="error-container"
              >
                <div className="error-card">
                  <div className="error-content">
                    <span className="error-icon">⚠️</span>
                    <div className="error-text">
                      <h3 className="error-title">Oops! Something went wrong</h3>
                      <p className="error-message">{error}</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setError(null)}
                        className="error-button"
                      >
                        Try Again
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Weather Information */}
          <AnimatePresence>
            {info && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="info-container"
              >
                <InfoBox info={info} forecast={forecast} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Welcome Message */}
          {!info && !loading && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="welcome-container"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="welcome-icon"
              >
                🌍
              </motion.div>
              <h2 className="welcome-title">Welcome to WeatherVibe!</h2>
              <p className="welcome-subtitle">
                Search for any city to get started with real-time weather updates and forecasts
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

