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

// GFS Weather Data endpoint
app.get('/api/gfs-data', async (req, res) => {
  try {
    const { param = 'cape', lat, lon, range = '24' } = req.query;
    const apiKey = process.env.GRIBSTREAM_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'GRIBSTREAM_API_KEY not configured',
        message: 'Please set the GRIBSTREAM_API_KEY environment variable'
      });
    }

    // Try multiple possible endpoint formats
    const endpoints = [
      `https://api.gribstream.com/api/forecast?params=${param}&hours=${range}`,
      `https://api.gribstream.com/v1/forecast?param=${param}&range=${range}`,
      `https://api.gribstream.com/v2/forecast?parameters=${param}&range=${range}`,
    ];

    let lastError = null;
    let lastUrl = null;

    for (const baseUrl of endpoints) {
      try {
        const url = new URL(baseUrl);
        if (lat && lon) {
          url.searchParams.append('lat', lat);
          url.searchParams.append('lon', lon);
        }
        lastUrl = url.toString();
        
        console.log(`\n[${new Date().toISOString()}] Trying endpoint: ${lastUrl}`);

        const response = await fetch(lastUrl, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'X-API-Key': apiKey,
            'Content-Type': 'application/json',
            'User-Agent': 'GFS-Weather-Map/1.0'
          }
        });

        const contentType = response.headers.get('content-type');
        console.log(`Response status: ${response.status}, Content-Type: ${contentType}`);

        // If we got a successful response, process it
        if (response.ok) {
          let data;
          if (contentType && contentType.includes('application/json')) {
            data = await response.json();
          } else {
            const text = await response.text();
            data = JSON.parse(text);
          }
          
          console.log(`Success! Data keys: ${Object.keys(data).slice(0, 5)}`);
          res.set('Cache-Control', 'public, max-age=3600');
          return res.json(data);
        } else {
          const errorText = await response.text();
          lastError = {
            status: response.status,
            message: errorText.substring(0, 200)
          };
          console.log(`Endpoint failed with status ${response.status}`);
          continue;
        }
      } catch (e) {
        console.log(`Endpoint error: ${e.message}`);
        lastError = e.message;
        continue;
      }
    }

    // If all endpoints failed, return detailed error
    console.error(`All gribstream endpoints failed. Last error: ${JSON.stringify(lastError)}`);
    
    return res.status(503).json({
      error: 'Unable to reach gribstream API',
      message: 'All API endpoints returned errors. Please check your API key and try the demo mode.',
      lastUrl: lastUrl,
      lastError: lastError,
      suggestion: 'Click "Load Demo Data" button to test with sample data'
    });

  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
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
