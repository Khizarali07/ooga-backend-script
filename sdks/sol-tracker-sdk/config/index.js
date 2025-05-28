require('dotenv').config();

const SOL_TRACKER_API_KEY = process.env.SOL_TRACKER_API_KEY;
const BASE_URL = 'https://data.solanatracker.io';

if (!SOL_TRACKER_API_KEY) {
  throw new Error('SOL_TRACKER_API_KEY is not set');
}

module.exports = {
  BASE_URL,
  SOL_TRACKER_API_KEY
};
