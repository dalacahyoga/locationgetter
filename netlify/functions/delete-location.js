const { getStore } = require('@netlify/blobs');

// Netlify Blobs - Persistent storage
const STORE_NAME = 'locations';
const DATA_KEY = 'locations-data';

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'DELETE' || event.httpMethod === 'POST') {
    try {
      const data = JSON.parse(event.body);
      const { id, clearAll } = data;

      // Get Netlify Blobs store
      const store = getStore(STORE_NAME);
      
      // Read existing data from Blobs
      let locations = [];
      const existingData = await store.get(DATA_KEY, { type: 'json' });
      if (existingData) {
        locations = existingData;
      }

      if (clearAll) {
        // Clear all locations
        await store.set(DATA_KEY, JSON.stringify([]));
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'All locations cleared' })
        };
      } else if (id) {
        // Delete specific location
        locations = locations.filter(loc => loc.id !== id);
        await store.set(DATA_KEY, JSON.stringify(locations));
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Location deleted' })
        };
      }

      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No id or clearAll specified' })
      };
    } catch (error) {
      console.error('Error deleting location:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to delete location' })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};

