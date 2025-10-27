const { getStore } = require('@netlify/blobs');

// Netlify Blobs - Persistent storage (data never lost!)
const STORE_NAME = 'locations';
const DATA_KEY = 'locations-data';

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Debug logging
  console.log('Function invoked:', event.httpMethod);

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Handle POST - Save location
  if (event.httpMethod === 'POST') {
    try {
      const data = JSON.parse(event.body);
      
      // Validate required fields
      if (!data.latitude || !data.longitude) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing required fields' })
        };
      }

      // Get Netlify Blobs store (with context)
      const store = getStore({
        name: STORE_NAME,
        siteID: context.site?.id || process.env.SITE_ID
      });
      
      console.log('Attempting to read from Netlify Blobs...');
      
      // Read existing data from Blobs
      let locations = [];
      try {
        const existingData = await store.get(DATA_KEY, { type: 'json' });
        if (existingData) {
          locations = existingData;
          console.log('✅ Read', locations.length, 'locations from Blobs');
        } else {
          console.log('ℹ️ No existing data in Blobs, starting fresh');
        }
      } catch (err) {
        console.error('⚠️ Error reading from Blobs:', err.message);
        console.log('Creating new data array');
      }

      // Add new location
      const newLocation = {
        id: Date.now(),
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        timestamp: data.timestamp || Date.now(),
        date: new Date(data.timestamp || Date.now()).toISOString(),
        userAgent: data.userAgent || 'Unknown',
        platform: data.platform || 'Unknown',
        ip: event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'Unknown'
      };

      locations.unshift(newLocation);

      // Keep only last 1000 entries
      if (locations.length > 1000) {
        locations = locations.slice(0, 1000);
      }

      // Save to Netlify Blobs (persistent storage!)
      console.log('Attempting to save to Netlify Blobs...');
      await store.set(DATA_KEY, JSON.stringify(locations));
      console.log('✅ Saved', locations.length, 'locations to Blobs');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Location saved to server',
          id: newLocation.id,
          total: locations.length
        })
      };
    } catch (error) {
      console.error('Error saving location:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to save location' })
      };
    }
  }

  // Handle GET - Retrieve locations
  if (event.httpMethod === 'GET') {
    try {
      console.log('GET request - reading from Blobs...');
      
      const store = getStore({
        name: STORE_NAME,
        siteID: context.site?.id || process.env.SITE_ID
      });
      
      let locations = [];
      
      const existingData = await store.get(DATA_KEY, { type: 'json' });
      if (existingData) {
        locations = existingData;
        console.log('✅ Retrieved', locations.length, 'locations from Blobs');
      } else {
        console.log('ℹ️ No data in Blobs yet');
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          data: locations,
          total: locations.length,
          source: 'netlify-blobs'
        })
      };
    } catch (error) {
      console.error('❌ Error reading locations:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to read locations',
          message: error.message 
        })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};

