const axios = require('axios');
const CONFIG = require('../config');

module.exports = {
  request: async function (endpoint, method = 'GET', data = null) {
    try {
      const config = {
        method,
        url: `${CONFIG.BASE_URL}${endpoint}`,
        headers: {
          'x-api-key': CONFIG.SOL_TRACKER_API_KEY
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return {
        data: response.data,
        message: "Data fetched successfully",
        error: null
      };
    } catch (error) {
      console.log(error);
      console.error('Solana Tracker API Error:', error?.response?.data?.message || error.message);
      return {
        data: null,
        message: error?.response?.data?.message || error.message,
        error: error?.response?.data || error
      };
    }
  }
}
