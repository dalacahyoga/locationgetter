const fs = require('fs');

const DATA_FILE = '/tmp/locations.json';

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

      // Read existing data
      let locations = [];
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
        locations = JSON.parse(fileContent);
      }

      if (clearAll) {
        // Clear all locations
        fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'All locations cleared' })
        };
      } else if (id) {
        // Delete specific location
        locations = locations.filter(loc => loc.id !== id);
        fs.writeFileSync(DATA_FILE, JSON.stringify(locations, null, 2));
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

