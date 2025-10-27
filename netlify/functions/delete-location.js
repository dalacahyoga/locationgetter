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

  console.log('Delete function invoked:', event.httpMethod);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'DELETE' || event.httpMethod === 'POST') {
    try {
      const data = JSON.parse(event.body);
      const { id, clearAll } = data;

      // Get Netlify Blobs store (with context)
      const store = getStore({
        name: STORE_NAME,
        siteID: context.site?.id || process.env.SITE_ID
      });
      
      console.log('Reading from Blobs for delete operation...');
      
      // Read existing data from Blobs
      let locations = [];
      const existingData = await store.get(DATA_KEY, { type: 'json' });
      if (existingData) {
        locations = existingData;
        console.log('Current data:', locations.length, 'locations');
      }

      if (clearAll) {
        // Clear all locations
        console.log('Clearing all locations...');
        await store.set(DATA_KEY, JSON.stringify([]));
        console.log('✅ All locations cleared from Blobs');
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'All locations cleared' })
        };
      } else if (id) {
        // Delete specific location
        const beforeCount = locations.length;
        locations = locations.filter(loc => loc.id !== id);
        const afterCount = locations.length;
        
        console.log('Deleting location ID:', id);
        await store.set(DATA_KEY, JSON.stringify(locations));
        console.log('✅ Deleted. Before:', beforeCount, 'After:', afterCount);
        
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
      console.error('❌ Error deleting location:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to delete location',
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

