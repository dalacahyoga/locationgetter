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

      // Get Netlify Blobs store
      const store = getStore(STORE_NAME);
      
      // Read existing data from Blobs
      let locations = [];
      try {
        const existingData = await store.get(DATA_KEY, { type: 'json' });
        if (existingData) {
          locations = existingData;
        }
      } catch (err) {
        console.log('No existing data, creating new');
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
      await store.set(DATA_KEY, JSON.stringify(locations));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Location saved',
          id: newLocation.id
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
      const store = getStore(STORE_NAME);
      let locations = [];
      
      const existingData = await store.get(DATA_KEY, { type: 'json' });
      if (existingData) {
        locations = existingData;
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          data: locations,
          total: locations.length 
        })
      };
    } catch (error) {
      console.error('Error reading locations:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to read locations' })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};

