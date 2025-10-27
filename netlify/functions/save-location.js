// Robust version with fallback to /tmp if Blobs fails
let useBlobs = true;
let blobsModule = null;

// Try to load Netlify Blobs
try {
  blobsModule = require('@netlify/blobs');
  console.log('✅ @netlify/blobs loaded successfully');
} catch (e) {
  console.warn('⚠️ @netlify/blobs not available, will use /tmp fallback:', e.message);
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
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  console.log('Function invoked:', event.httpMethod, '| Using Blobs:', useBlobs);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Handle GET - Retrieve locations
  if (event.httpMethod === 'GET') {
    try {
      let locations = [];
      let source = 'unknown';

      if (useBlobs && blobsModule) {
        try {
          console.log('Attempting to read from Netlify Blobs...');
          const store = blobsModule.getStore({
            name: STORE_NAME,
            siteID: context?.site?.id
          });
          
          const existingData = await store.get(DATA_KEY, { type: 'json' });
          if (existingData) {
            locations = existingData;
            source = 'netlify-blobs';
            console.log('✅ Retrieved', locations.length, 'locations from Blobs');
          }
        } catch (blobError) {
          console.error('⚠️ Blobs read failed, trying /tmp fallback:', blobError.message);
          useBlobs = false; // Disable for future calls
        }
      }

      // Fallback to /tmp if Blobs failed or not available
      if (!useBlobs || locations.length === 0) {
        try {
          if (fs.existsSync(DATA_FILE)) {
            const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
            locations = JSON.parse(fileContent);
            source = 'tmp-file';
            console.log('📁 Retrieved', locations.length, 'locations from /tmp');
          }
        } catch (fileError) {
          console.error('❌ /tmp read also failed:', fileError.message);
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          data: locations,
          total: locations.length,
          source: source
        })
      };
    } catch (error) {
      console.error('❌ Fatal error in GET:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to read locations',
          message: error.message,
          stack: error.stack
        })
      };
    }
  }

  // Handle POST - Save location
  if (event.httpMethod === 'POST') {
    try {
      const data = JSON.parse(event.body);
      
      if (!data.latitude || !data.longitude) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing required fields' })
        };
      }

      let locations = [];
      let source = 'unknown';

      // Try to read existing data
      if (useBlobs && blobsModule) {
        try {
          console.log('Reading from Blobs before save...');
          const store = blobsModule.getStore({
            name: STORE_NAME,
            siteID: context?.site?.id
          });
          
          const existingData = await store.get(DATA_KEY, { type: 'json' });
          if (existingData) {
            locations = existingData;
            console.log('✅ Read', locations.length, 'existing locations from Blobs');
          }
        } catch (blobError) {
          console.error('⚠️ Blobs read failed:', blobError.message);
          useBlobs = false;
        }
      }

      // Fallback read from /tmp
      if (!useBlobs) {
        try {
          if (fs.existsSync(DATA_FILE)) {
            locations = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            console.log('📁 Read', locations.length, 'existing locations from /tmp');
          }
        } catch (fileError) {
          console.error('⚠️ /tmp read failed:', fileError.message);
        }
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

      if (locations.length > 1000) {
        locations = locations.slice(0, 1000);
      }

      // Try to save with Blobs first
      if (useBlobs && blobsModule) {
        try {
          console.log('Saving to Blobs...');
          const store = blobsModule.getStore({
            name: STORE_NAME,
            siteID: context?.site?.id
          });
          
          await store.set(DATA_KEY, JSON.stringify(locations));
          source = 'netlify-blobs';
          console.log('✅ Saved', locations.length, 'locations to Blobs');
        } catch (blobError) {
          console.error('⚠️ Blobs save failed:', blobError.message);
          useBlobs = false;
        }
      }

      // Fallback save to /tmp (always do this as backup)
      try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(locations, null, 2));
        if (!useBlobs) {
          source = 'tmp-file';
        }
        console.log('📁 Also saved to /tmp as backup');
      } catch (fileError) {
        console.error('⚠️ /tmp save failed:', fileError.message);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Location saved',
          id: newLocation.id,
          total: locations.length,
          source: source
        })
      };
    } catch (error) {
      console.error('❌ Fatal error in POST:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to save location',
          message: error.message,
          stack: error.stack
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

