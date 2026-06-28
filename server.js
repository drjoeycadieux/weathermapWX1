const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// GFS Weather Data endpoint (NOAA API - US only, or demo data)
app.get('/api/gfs-data', async (req, res) => {
  try {
    const { param = 'cape', lat = 40.71, lon = -74.01, useNoaa = 'true' } = req.query;

    // For locations outside US (like Montreal at 45.5, -73.5), use demo data instead
    if (useNoaa === 'false' || (lat > 48 || lat < 25 || lon > -65 || lon < -125)) {
      console.log(`\n[${new Date().toISOString()}] Location outside NOAA coverage, using demo data`);
      
      // Return demo data for non-US locations
      return res.json({
        model: 'NOAA GFS (Demo for non-US)',
        location: `${lat},${lon}`,
        timestamp: new Date().toISOString(),
        note: 'Using demo data - real NOAA API only covers USA',
        data: [
          { lat: parseFloat(lat), lon: parseFloat(lon), value: 1200, name: 'Location 1' },
          { lat: parseFloat(lat) + 0.1, lon: parseFloat(lon) + 0.1, value: 1500, name: 'Location 2' },
          { lat: parseFloat(lat) - 0.1, lon: parseFloat(lon) - 0.1, value: 800, name: 'Location 3' },
          { lat: parseFloat(lat) + 0.05, lon: parseFloat(lon) - 0.05, value: 2000, name: 'Location 4' }
        ]
      });
    }

    console.log(`\n[${new Date().toISOString()}] Fetching NOAA GFS data: lat=${lat}, lon=${lon}`);

    // NOAA covers USA only: lat 25-48, lon -65 to -125
    const noaaUrl = `https://api.weather.gov/points/${lat},${lon}`;
    
    const response = await fetch(noaaUrl, {
      headers: {
        'User-Agent': '(GFS Weather Map, github.com/drjoeycadieux/weathermapWX1)',
      }
    });

    if (!response.ok) {
      console.error(`NOAA points API error: ${response.status}`);
      
      // If outside coverage, return demo data
      if (response.status === 404) {
        console.log('Location outside NOAA coverage area, returning demo data');
        return res.json({
          model: 'GFS Demo Data',
          location: `${lat},${lon}`,
          timestamp: new Date().toISOString(),
          note: 'NOAA API only covers USA. Showing demo data.',
          data: [
            { lat: parseFloat(lat), lon: parseFloat(lon), value: 1200, name: 'Sample 1' },
            { lat: parseFloat(lat) + 0.1, lon: parseFloat(lon) + 0.1, value: 1500, name: 'Sample 2' },
            { lat: parseFloat(lat) - 0.1, lon: parseFloat(lon) - 0.1, value: 800, name: 'Sample 3' },
            { lat: parseFloat(lat) + 0.05, lon: parseFloat(lon) - 0.05, value: 2000, name: 'Sample 4' }
          ]
        });
      }
      throw new Error(`NOAA API returned ${response.status}`);
    }

    let data = await response.json();
    console.log(`✓ Got points data for ${lat},${lon}`);

    // Get the forecast URL from the points response
    if (data.properties && data.properties.forecast) {
      const forecastUrl = data.properties.forecast;
      console.log(`Fetching forecast from: ${forecastUrl}`);

      const forecastResponse = await fetch(forecastUrl, {
        headers: {
          'User-Agent': '(GFS Weather Map, github.com/drjoeycadieux/weathermapWX1)',
        }
      });

      if (forecastResponse.ok) {
        const forecastData = await forecastResponse.json();
        
        // Transform forecast periods into data points
        if (forecastData.properties && forecastData.properties.periods) {
          const periods = forecastData.properties.periods.slice(0, 6); // Get first 6 periods
          const dataPoints = periods.map((period, index) => ({
            period: index,
            name: period.name,
            temperature: period.temperature,
            windSpeed: period.windSpeed,
            windDirection: period.windDirection,
            shortForecast: period.shortForecast,
            value: period.temperature, // Use temperature for visualization
            lat: parseFloat(lat),
            lon: parseFloat(lon) + (index * 0.05) // Spread points for visualization
          }));

          console.log(`✓ Processed ${dataPoints.length} forecast periods`);
          res.set('Cache-Control', 'public, max-age=1800');
          return res.json({
            model: 'NOAA GFS',
            location: `${lat},${lon}`,
            timestamp: new Date().toISOString(),
            unit: 'Fahrenheit',
            data: dataPoints
          });
        }
      }
    }

    // Fallback with processed data
    res.set('Cache-Control', 'public, max-age=1800');
    res.json({
      model: 'NOAA GFS (Partial)',
      location: `${lat},${lon}`,
      timestamp: new Date().toISOString(),
      data: [{
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        value: 65,
        name: 'Current Location'
      }]
    });

  } catch (error) {
    console.error('Server error:', error.message);
    res.status(503).json({
      error: 'Failed to fetch weather data',
      message: error.message,
      suggestion: 'Try a US location (NOAA API coverage) or use demo mode',
      exampleLocation: 'New York: lat=40.71, lon=-74.01'
    });
  }
});

// Demo endpoint for testing (returns sample data)
app.get('/api/gfs-data-demo', (req, res) => {
  // Return sample GFS data for testing visualization
  const sampleData = {
    model: 'GFS',
    parameter: 'CAPE',
    units: 'J/kg',
    timestamp: new Date().toISOString(),
    data: [
      { lat: 45.5, lon: -73.5, value: 1200 },
      { lat: 45.6, lon: -73.4, value: 1500 },
      { lat: 45.4, lon: -73.6, value: 800 },
      { lat: 45.7, lon: -73.3, value: 2000 }
    ]
  };
  res.json(sampleData);
});

// Route to serve weather-map.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'weather-map.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/gfs-data`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
