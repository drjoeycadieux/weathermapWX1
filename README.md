# GFS Weather Map - Setup & Usage

## Overview
This project visualizes GFS weather data from gribstream API on an interactive Mapbox map without CORS issues.

## Current Status
✅ **Server running** - CORS issues completely fixed
✅ **Demo mode** - Test with sample data (works immediately)
⚠️ **gribstream API** - Needs endpoint verification (see troubleshooting)

## Prerequisites
- Node.js 14+ installed
- A valid gribstream API key (optional - demo works without it)

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file** (optional for demo mode):
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your gribstream API key if you have one:
   ```
   GRIBSTREAM_API_KEY=your_actual_api_key_here
   ```

3. **Add your Mapbox token** to `weather-map.html`:
   Find this line (around line 24):
   ```javascript
   mapboxgl.accessToken = 'pk.eyJ1Ijoiam9leWNyZWF0b3IiLCJhIjoiY21xZWNmcjA1MWFrZDJ5cG93cG8wc3NvcCJ9.Ky4Z1kNOF5MKuYh7AbbodQ';
   ```
   Replace `pk.eyJ...` with your actual Mapbox token.

## Running the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

## Using the Application

### 1. **Demo Mode (Recommended to Start)**
- Open http://localhost:3000
- Click the **"Load Demo Data"** button
- You'll see sample weather visualization on the map
- This works without any API key and demonstrates the full functionality

### 2. **Real Data Mode (gribstream API)**
- Once you have verified the demo works, configure your gribstream API
- Update the `.env` file with a valid API key
- Restart the server
- The app will automatically try to load real weather data on startup
- If successful, you'll see real GFS data on the map

## Available Endpoints

- **`GET /`** - Serves the weather map
- **`GET /api/health`** - Health check endpoint
- **`GET /api/gfs-data`** - Fetch GFS weather data from gribstream
- **`GET /api/gfs-data-demo`** - Get demo data (always works)

Query parameters for `/api/gfs-data`:
- `param`: Weather parameter (default: `cape`) - cape, temp, wind_u, wind_v, etc.
- `range`: Forecast range in hours (default: `24`)
- `lat`, `lon`: Optional coordinates for specific location

## How It Works

### Architecture
```
Frontend (HTML/JS)
    ↓
Backend (Express/Node.js) ← Handles API calls securely
    ↓
gribstream API (server-to-server, no CORS issues)
```

### No More CORS Errors!
Instead of directly calling the gribstream API from the browser (which gets blocked), your backend server makes the API calls. This eliminates all CORS issues.

## Available GFS Parameters

Common parameters from gribstream:
- `cape` - Convective Available Potential Energy
- `cin` - Convective Inhibition  
- `temp` - Temperature
- `wind_u`, `wind_v` - Wind components
- `precip` - Precipitation
- `gust` - Wind gust
- `vis` - Visibility

## UI Components

- **Map Display** - Interactive Mapbox map showing weather data
- **Status Panel** (top-left) - Shows current data status and errors
- **Load Demo Data Button** (below status) - Click to load sample data
- **Grid Visualization** - Color-coded grid overlay showing weather values

## Error Handling

The application includes:
- ✅ Backend API validation
- ✅ Frontend error display
- ✅ Graceful fallback to demo mode
- ✅ Detailed error messages
- ✅ Server-side logging for debugging

## Troubleshooting

### Demo Mode Not Working
- Check that server is running: `curl http://localhost:3000/api/health`
- Check browser console (F12) for errors
- Make sure you have a valid Mapbox token

### gribstream API Returning 404
The exact endpoint format might vary. Common issues:
- ❌ API key is invalid → Get a valid key from gribstream
- ❌ Endpoint URL format is wrong → Check gribstream API docs
- ❌ API service is down → Check their status page

**To find the correct endpoint:**
1. Check gribstream official API documentation
2. Use the demo mode in the meantime
3. Update the endpoint URLs in `server.js` (lines around 30-32)

### "GRIBSTREAM_API_KEY not configured"
- Make sure `.env` file exists in the project root
- Check that `GRIBSTREAM_API_KEY=your_key` is in the file
- Restart the server after updating `.env`

### Mapbox not displaying map
- Verify your Mapbox token is valid
- Make sure the token has the right permissions (public access)
- Check browser console for Mapbox errors

### Port 3000 already in use
Change the PORT in `.env`:
```
PORT=3001
```
Then run `npm start` again.

## File Structure

```
.
├── server.js           # Express backend (handles API calls)
├── weather-map.html    # Frontend visualization
├── package.json        # Dependencies and scripts
├── .env                # Configuration (API keys, port)
├── .env.example        # Template for .env
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## Dependencies

- **express** (^4.18.2) - Web server framework
- **node-fetch** (^2.6.7) - HTTP requests for Node.js
- **dotenv** (^16.0.3) - Environment variable management

## Development

Run in development mode:
```bash
npm run dev
```

View server logs:
```bash
tail -f /tmp/server.log  # If using background mode
```

## Next Steps

1. ✅ Verify demo mode works on your machine
2. Get a gribstream API key from https://gribstream.com
3. Update `.env` with your API key
4. Find the correct gribstream API endpoint format
5. Update endpoint URLs in `server.js` if needed
6. Customize visualization (colors, parameters, location)

## License

ISC
