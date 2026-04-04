import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'; // ✅ Import


// ✅ Map styles
const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '12px',
  marginTop: '1rem'
};

const mapOptions = {
  zoomControl: true,
  streetViewControl: false, 
  mapTypeControl: false,
  fullscreenControl: true,
};

// ✅ Map Component with loading state and error handling
function WeatherMap({ lat, lng }) {
  const [mapError, setMapError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const center = {
    lat: lat || 28.6139,
    lng: lng || 77.2090
  };

  // Fallback component if map fails to load
  if (mapError) {
    return (
      <div style={{
        ...mapContainerStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        border: '2px dashed #ccc'
      }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
          <h3>Map Not Available</h3>
          <p>Unable to load Google Maps</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <LoadScript 
        googleMapsApiKey="AIzaSyBTybWKwaNehs2fniMHJnFxzJJNwmfR_r4"
        onError={() => setMapError(true)}
        onLoad={() => setIsLoaded(true)}
      >
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={10}
            center={center}
            options={mapOptions}
          >
            <Marker position={center} />
          </GoogleMap>
        ) : (
          <div style={{
            ...mapContainerStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f0f0f0'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '16px' }}>🌍</div>
              <p>Loading map...</p>
            </div>
          </div>
        )}
      </LoadScript>
      
      {/* Debug info */}
      <div style={{ 
        marginTop: '8px', 
        fontSize: '12px', 
        color: '#666',
        padding: '8px',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px'
      }}>
        Coordinates: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
      </div>
    </div>
  );
}
// Detail Card Component
function DetailCard({ label, value, icon, color = "from-indigo-400 to-purple-600" }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.08, rotateY: 5 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 200 }}
      className={`detail-card bg-gradient-to-br ${color}`}
    >
      <div className="detail-icon">{icon}</div>
      <div className="detail-label">{label}</div>
      <div className="detail-value">{value}</div>
    </motion.div>
  );
}

export default function InfoBox({ info, forecast = [] }) {
  const [currentTime, setCurrentTime] = useState("");
  const [alarmTime, setAlarmTime] = useState("");
  const [alarmActive, setAlarmActive] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setCurrentTime(formattedTime);

      if (alarmActive && alarmTime === formattedTime) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
        
        alert("⏰ Alarm ringing! Time for your activity 🎉");
        setAlarmActive(false);
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [alarmTime, alarmActive]);

  const weatherIcons = {
    clear: "☀️", clouds: "☁️", rain: "🌧️", drizzle: "🌦️",
    thunderstorm: "⛈️", snow: "❄️", mist: "🌫️", fog: "🌁", default: "🌍"
  };

  const getActivitySuggestion = () => {
    const weather = info.weather?.toLowerCase();
    const temp = info.temp;
    
    if (weather === "rain" || weather === "thunderstorm") {
      return "☂️ Perfect time for indoor activities!";
    } else if (weather === "clear" && temp > 20) {
      return "🌞 Great weather for outdoor activities!";
    } else if (weather === "snow") {
      return "⛄ Snow day! Time for winter fun!";
    } else if (temp < 10) {
      return "🧥 Bundle up! It's chilly outside.";
    } else {
      return "🌤️ Nice weather for a stroll!";
    }
  };

  function getActivityByTime() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 6) return "🧘 Meditation Time";
    if (hour >= 6 && hour < 9) return "🥣 Breakfast Time";
    if (hour >= 12 && hour < 14) return "🍱 Lunch Time";
    if (hour >= 17 && hour < 19) return "🚶 Evening Walk";
    if (hour >= 19 && hour < 21) return "🍽 Dinner Time";
    if (hour >= 21 && hour < 23) return "🎬 Entertainment Time";
    if (hour >= 23 || hour < 5) return "💤 Sleeping Time";
    return "✨ Relax / Free Time";
  }

  function getPlantationAdvice(weather) {
    if (!weather) {
      return {
        advice: "🌱 General Care: Water plants regularly.",
        plants: ["Rose 🌹", "Tulsi 🌿", "Aloe Vera 🌵"],
      };
    }

    const w = weather.toLowerCase();

    if (w.includes("rain")) {
      return {
        advice: "🌧 Good rain — No watering needed.",
        plants: ["Rice 🌾", "Lotus 🌸", "Water Lily 🌺"],
      };
    }
    if (w.includes("clear")) {
      return {
        advice: "☀️ Sunny — Water plants in the evening.",
        plants: ["Aloe Vera 🌵", "Tulsi 🌿", "Sunflower 🌻"],
      };
    }
    if (w.includes("cloud")) {
      return {
        advice: "☁️ Cloudy — Light watering advised.",
        plants: ["Spinach 🥬", "Mint 🌱", "Coriander 🌿"],
      };
    }
    if (w.includes("snow")) {
      return {
        advice: "❄️ Protect plants from freezing.",
        plants: ["Pine 🌲", "Juniper 🌿", "Evergreen 🌳"],
      };
    }
    if (w.includes("mist") || w.includes("fog") || w.includes("haze")) {
      return {
        advice: "🌫 Humid weather — Avoid overwatering.",
        plants: ["Fern 🍃", "Bamboo 🎍", "Money Plant 🪴"],
      };
    }

    return {
      advice: "🌱 Keep plants healthy and hydrated!",
      plants: ["Rose 🌹", "Jasmine 🌼", "Hibiscus 🌺"],
    };
  }

  const icon = weatherIcons[info.weather?.toLowerCase()] || weatherIcons.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="InfoBox"
    >
      {/* Header */}
      <div className="info-header">
        <motion.h2 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="info-city"
        >
          {icon} {info.city}
        </motion.h2>
        <p className="info-time">{currentTime} | {info.weatherDesc}</p>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="activity-suggestion"
        >
          {getActivitySuggestion()}
        </motion.p>
      </div>

      {/* Main Temperature */}
      <div className="temperature-section">
        <motion.div 
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="main-temperature"
        >
          {Math.round(info.temp)}°C
        </motion.div>
        <p className="feels-like">Feels like {Math.round(info.feelsLike)}°C</p>
      </div>

      {/* Weather Details Grid */}
      <div className="details-grid">
        <DetailCard label="Min Temp" value={`${Math.round(info.tempMin)}°C`} icon="🌡️" color="from-blue-400 to-blue-600" />
        <DetailCard label="Max Temp" value={`${Math.round(info.tempMax)}°C`} icon="🔥" color="from-red-400 to-red-600" />
        <DetailCard label="Humidity" value={`${info.humidity}%`} icon="💧" color="from-cyan-400 to-cyan-600" />
        <DetailCard label="Pressure" value={`${info.pressure} hPa`} icon="⚖️" color="from-purple-400 to-purple-600" />
        <DetailCard label="Wind" value={`${info.windSpeed} km/h`} icon="🌬️" color="from-green-400 to-green-600" />
        <DetailCard label="Visibility" value={`${info.visibility} km`} icon="👀" color="from-pink-400 to-pink-600" />
        <DetailCard label="Sunrise" value={info.sunrise} icon="🌅" color="from-yellow-400 to-orange-500" />
        <DetailCard label="Sunset" value={info.sunset} icon="🌇" color="from-orange-400 to-red-500" />
      </div>

      {/* Activity Clock */}
      <div className="activity-clock-section">
  <motion.div
    initial={{ scale: 0.5, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 1, ease: "easeOut" }}
    className="activity-clock"
  >
    <div className="clock-inner">
      <div className="clock-time">🕒 Current</div>
      <div 
        className="clock-activity"
        data-activity={getActivityByTime().toLowerCase().replace(/\s+/g, '-')}
      >
        {getActivityByTime()}
      </div>
    </div>
  </motion.div>
</div>


      {/* Plantation Advice */}
      <div className="plantation-section">
        <h3 className="plantation-title">🌿 Plantation Suggestion</h3>
        <p className="plantation-advice">{getPlantationAdvice(info.weather).advice}</p>
        
        <div className="plantation-plants">
          {getPlantationAdvice(info.weather).plants.map((plant, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className={`plant-card plant-card-${idx}`}
            >
              {plant}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Weather Alerts */}
      <div className="alerts-section">
        <h3 className="alerts-title">🚨 Weather Alerts</h3>
        
        {info.alert ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="alert-content"
          >
            <h4 className="alert-event">{info.alert.event}</h4>
            <p className="alert-sender"><strong>By:</strong> {info.alert.sender}</p>
            <p className="alert-time"><strong>From:</strong> {info.alert.start}</p>
            <p className="alert-time"><strong>To:</strong> {info.alert.end}</p>
            <p className="alert-description">{info.alert.desc}</p>
          </motion.div>
        ) : (
          <p className="no-alerts">✅ No active alerts. Weather is safe.</p>
        )}
      </div>

      {/* Forecast Section */}
      {forecast.length > 0 && (
        <div className="forecast-section">
          <h3 className="forecast-title">📅 5-Day Forecast</h3>
          <div className="forecast-grid">
            {forecast.slice(0, 5).map((day, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`forecast-card forecast-card-${idx % 2}`}
              >
                <div className="forecast-date">{day.date}</div>
                <div className="forecast-temp">{Math.round(day.temp)}°C</div>
                <div className="forecast-weather">{day.weather}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Alarm Section */}
      <div className="alarm-section">
        <div className="alarm-header">
          <h3 className="alarm-title">⏰ Set Activity Alarm</h3>
          <button 
            className={`alarm-toggle ${alarmActive ? 'active' : ''}`}
            onClick={() => setAlarmActive(!alarmActive)}
          >
            {alarmActive ? '🔔 Active' : '🔕 Inactive'}
          </button>
        </div>
        
        <div className="alarm-controls">
          <input
            type="time"
            value={alarmTime}
            onChange={(e) => setAlarmTime(e.target.value)}
            className="alarm-input"
          />
          <button 
            className="alarm-set-btn"
            onClick={() => {
              if (alarmTime) {
                setAlarmActive(true);
                alert(`⏰ Alarm set for ${alarmTime}`);
              }
            }}
          >
            Set Alarm
          </button>
        </div>
      </div>

      {/* Simple Footer */}
<div className="simple-footer">
  <h3>🌦️ Need Weather Help?</h3>
  <div className="footer-contacts">
    <div className="contact-person">
      <span>👨‍💻 Sahaj Dubey: </span>
      <a href="mailto:raj@weathervibe.com">dubeysahaj81@gmail.com</a>
      <span> | 📞 +91 7068157931</span>
    </div>
    <div className="contact-person">
      <span>👨‍💻 Priyanshu Yadav: </span>
      <a href="mailto:priya@weathervibe.com">7pypriyanshu7@gmail.com</a>
      <span> | 📞 +91 7267929862</span>
    </div>
  </div>
  <p className="footer-note">24/7 Weather Support Available</p>
</div>
    </motion.div>
  );
}


