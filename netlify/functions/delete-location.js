// Robust version with fallback to /tmp if Blobs fails
let useBlobs = true;
let blobsModule = null;

try {
  blobsModule = require('@netlify/blobs');
  console.log('✅ @netlify/blobs loaded');
} catch (e) {
  console.warn('⚠️ @netlify/blobs not available:', e.message);
  useBlobs = false;
}

const fs = require('fs');
const DATA_FILE = '/tmp/locations.json';
const STORE_NAME = 'locations';
const DATA_KEY = 'locations-data';

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  console.log('Delete function invoked:', event.httpMethod, '| Using Blobs:', useBlobs);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'DELETE' || event.httpMethod === 'POST') {
    try {
      const data = JSON.parse(event.body);
      const { id, clearAll } = data;

      let locations = [];

      // Try to read from Blobs first
      if (useBlobs && blobsModule) {
        try {
          const store = blobsModule.getStore({
            name: STORE_NAME,
            siteID: context?.site?.id
          });
          
          const existingData = await store.get(DATA_KEY, { type: 'json' });
          if (existingData) {
            locations = existingData;
            console.log('Read', locations.length, 'from Blobs');
          }
        } catch (blobError) {
          console.error('⚠️ Blobs read failed:', blobError.message);
          useBlobs = false;
        }
      }

      // Fallback to /tmp
      if (!useBlobs) {
        try {
          if (fs.existsSync(DATA_FILE)) {
            locations = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            console.log('Read', locations.length, 'from /tmp');
          }
        } catch (fileError) {
          console.error('⚠️ /tmp read failed:', fileError.message);
        }
      }

      if (clearAll) {
        console.log('Clearing all locations...');
        locations = [];
      } else if (id) {
        const beforeCount = locations.length;
        locations = locations.filter(loc => loc.id !== id);
        console.log('Deleted. Before:', beforeCount, 'After:', locations.length);
      } else {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'No id or clearAll specified' })
        };
      }

      // Try to save with Blobs
      if (useBlobs && blobsModule) {
        try {
          const store = blobsModule.getStore({
            name: STORE_NAME,
            siteID: context?.site?.id
          });
          await store.set(DATA_KEY, JSON.stringify(locations));
          console.log('✅ Saved to Blobs');
        } catch (blobError) {
          console.error('⚠️ Blobs save failed:', blobError.message);
          useBlobs = false;
        }
      }

      // Always save to /tmp as backup
      try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(locations, null, 2));
        console.log('📁 Saved to /tmp');
      } catch (fileError) {
        console.error('⚠️ /tmp save failed:', fileError.message);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: clearAll ? 'All locations cleared' : 'Location deleted'
        })
      };
    } catch (error) {
      console.error('❌ Error:', error);
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
