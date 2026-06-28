# GFS Weather Map - NOAA Real-Time Weather Visualization

## Overview
Interactive weather map using NOAA's free GFS (Global Forecast System) API. Displays real-time temperature, wind, and forecast data with **zero CORS issues** and **no API key required**.

## Current Status
✅ **Server running** - Express backend at `http://localhost:3000`  
✅ **NOAA Integration** - Real weather data for USA locations  
✅ **Demo Mode** - Always works, shows sample data  
✅ **Location Selection** - 6 preset US cities + custom coordinates  
✅ **CORS Fixed** - Backend handles all API calls securely  

## Features
- 🗺️ **Interactive Mapbox GL visualization**
- 🌡️ **Real-time temperature data** (NOAA GFS for USA)
- 📊 **Color-coded grid overlay** (blue=cold, red=hot)
- 📍 **Location selector** with preset cities
- 🔧 **Custom location support** (enter any lat/lon)
- 📡 **Demo mode** for any location (always available)
- 🚀 **No authentication required** (NOAA is free)

## Quick Start

### Installation
```bash
npm install
npm start
```

Server will start at `http://localhost:3000`

### Open in Browser
- **Full URL**: http://localhost:3000/weather-map.html
- Or just open your browser and navigate to `http://localhost:3000`

## How to Use

### 1. **Select a Location**
- Choose from preset US cities (New York, Chicago, Atlanta, Seattle, Albuquerque)
- Or select Montreal for demo mode
- Or choose "Custom Location..." to enter any latitude/longitude

### 2. **Load Real Weather**
- Click **"📡 Load Real Weather"** for NOAA data (USA only)
- Map will zoom to selected location
- Real temperature forecast displays on map

### 3. **Load Demo Data**
- Click **"📊 Load Demo Data"** anytime
- Works for any location (including outside USA)
- Shows sample weather patterns

## Available Endpoints

```
GET /                           # Serves weather-map.html
GET /weather-map.html           # Main weather visualization
GET /api/health                 # Health check
GET /api/gfs-data              # Real NOAA weather data
  ?lat=40.71&lon=-74.01        # New York example
GET /api/gfs-data-demo         # Sample weather data
```

## Data Sources

### NOAA API (Real Data - USA Only)
- **Coverage**: United States only (lat 25-48, lon -65 to -125)
- **Data**: Temperature, wind direction, wind speed, forecasts
- **Authentication**: None (public API)
- **Cost**: Free
- **Rate limit**: Reasonable for development

### Demo Data (Everywhere)
- **Coverage**: Works anywhere
- **Data**: Sample CAPE-like values for visualization testing
- **Perfect for**: Testing, development, non-US locations

## Location Examples

### Working Locations (Real NOAA Data)
- **New York**: 40.71°N, 74.01°W
- **Chicago**: 41.88°N, 87.63°W
- **Atlanta**: 33.75°N, 84.39°W
- **Seattle**: 47.61°N, 122.33°W
- **Albuquerque**: 35.09°N, 106.65°W

### Demo-Only Locations
- **Montreal**: 45.5°N, 73.5°W (outside NOAA coverage)
- **Toronto**: 43.65°N, 79.38°W (outside NOAA coverage)
- **Any custom non-US location**: Use demo mode

## Color Scale

The visualization uses temperature-based coloring:
```
🔵 Blue      → Cold (< 40°F)
🟦 Light Blue → Cool (40-55°F)
🟩 Green     → Mild (55-70°F)
🟨 Yellow    → Warm (70-85°F)
🟧 Orange    → Hot (85-100°F)
🔴 Red       → Very Hot (> 100°F)
```

## Architecture

```
Browser (weather-map.html)
    ↓ (fetch requests)
Express Backend (server.js)
    ↓ (server-to-server)
NOAA Weather.gov API
    ↓ (real weather data)
Display on Map
```

**No CORS issues** because:
- Frontend only talks to backend (same origin)
- Backend makes API calls (server-to-server, unrestricted)
- NOAA API only checks User-Agent, not origin

## File Structure

```
/workspaces/weathermapWX1/
├── server.js              # Express backend with NOAA integration
├── weather-map.html       # Main visualization (interactive)
├── index.html             # Alternative dashboard
├── package.json           # Dependencies
├── .env                   # Config (created on first run)
├── .env.example           # Config template
├── .gitignore             # Git ignore rules
├── README.md              # This file
└── /node_modules/         # Dependencies (auto-generated)
```

## Dependencies

- **express** (^4.18.2) - Web server
- **node-fetch** (^2.6.7) - HTTP requests for Node.js
- **dotenv** (^16.0.3) - Environment variables

## Configuration

### .env File
Located at project root (auto-created from .env.example):
```bash
PORT=3000                    # Server port
NODE_ENV=development         # development or production
GRIBSTREAM_API_KEY=unused    # Not needed for NOAA
```

Change port if 3000 is in use:
```bash
# .env
PORT=3001
```

## API Response Examples

### Real NOAA Data (USA)
```json
{
  "model": "NOAA GFS",
  "location": "40.71,-74.01",
  "timestamp": "2026-06-28T23:00:20.952Z",
  "unit": "Fahrenheit",
  "data": [
    {
      "period": 0,
      "name": "Tonight",
      "temperature": 68,
      "windSpeed": "1 to 8 mph",
      "windDirection": "E",
      "value": 68,
      "lat": 40.71,
      "lon": -74.01
    }
  ]
}
```

### Demo Data
```json
{
  "model": "GFS",
  "parameter": "CAPE",
  "units": "J/kg",
  "timestamp": "2026-06-28T23:00:15.290Z",
  "data": [
    {
      "lat": 45.5,
      "lon": -73.5,
      "value": 1200
    }
  ]
}
```

## Troubleshooting

### "Error: HTTP error! status: 404"
- **Cause**: Using a non-US location with "Load Real Weather"
- **Solution**: Use a US city from the preset list or click "Load Demo Data"
- **Alternative**: Use custom location with demo mode

### Server Won't Start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill the process (if needed)
kill -9 <PID>

# Start server with different port
PORT=3001 npm start
```

### Map Not Displaying
- Check browser console (F12) for JavaScript errors
- Verify Mapbox token is valid in weather-map.html
- Ensure JavaScript is enabled in browser

### No Data Appearing on Map
- Click "Load Demo Data" to test visualization works
- Confirm location is in USA for real NOAA data
- Check Network tab (F12) for API errors

## Development

### View Logs
```bash
# If running in background
tail -f /tmp/server.log

# Or check server console output directly
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:3000/api/health

# Demo data
curl http://localhost:3000/api/gfs-data-demo

# New York real weather
curl "http://localhost:3000/api/gfs-data?lat=40.71&lon=-74.01"

# Montreal (shows demo data since outside USA)
curl "http://localhost:3000/api/gfs-data?lat=45.5&lon=-73.5"
```

## Advanced: Custom Weather Providers

To add other weather APIs:
1. Update `server.js` with new endpoint
2. Transform response to match data format
3. Add new button/endpoint to HTML

## License

ISC
