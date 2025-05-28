const SOL_TRACKER_WRAPPER = require('../utils/wrapper');

/**
 * Get price information for a single token
 * @param {string} token - Token address
 * @param {Object} params - Query parameters
 * @param {boolean} [params.priceChanges] - Include price change percentages
 * @returns {Promise<Object>} Token price information
 */
async function getTokenPrice(token, params = {}) {
  return SOL_TRACKER_WRAPPER.request('/price', {
    params: { token, ...params }
  });
}

/**
 * Get historic price information for a single token
 * @param {string} token - Token address
 * @returns {Promise<Object>} Historic price information
 */
async function getTokenPriceHistory(token) {
  return SOL_TRACKER_WRAPPER.request('/price/history', {
    params: { token }
  });
}

/**
 * Get specific historic price information for a token at a given timestamp
 * @param {string} token - Token address
 * @param {number} timestamp - Target timestamp (unix timestamp)
 * @returns {Promise<Object>} Historic price data at timestamp
 */
async function getTokenPriceByTimeStamp(token, timestamp) {
  return SOL_TRACKER_WRAPPER.request('/price/history/timestamp', {
    params: { token, timestamp }
  });
}

/**
 * Get price information for a single token using POST method
 * @param {string} token - Token address
 * @returns {Promise<Object>} Token price information
 */
async function getTokenPricePost(token) {
  return SOL_TRACKER_WRAPPER.post('/price', { token });
}

/**
 * Get price information for multiple tokens (up to 100)
 * @param {string[]} tokens - Array of token addresses
 * @param {Object} params - Query parameters
 * @param {boolean} [params.priceChanges] - Include price change percentages
 * @returns {Promise<Object>} Multiple tokens price information
 */
async function getMultiTokenPrices(tokens, params = {}) {
  return SOL_TRACKER_WRAPPER.request('/price/multi', {
    params: {
      tokens: tokens.join(','),
      ...params
    }
  });
}

/**
 * Get price information for multiple tokens using POST method
 * @param {string[]} tokens - Array of token addresses
 * @returns {Promise<Object>} Multiple tokens price information
 */
async function getMultiTokenPricesPost(tokens) {
  return SOL_TRACKER_WRAPPER.post('/price/multi', { tokens });
}

module.exports = {
  getTokenPrice,
  getTokenPriceHistory,
  getTokenPriceByTimeStamp,
  getTokenPricePost,
  getMultiTokenPrices,
  getMultiTokenPricesPost
};
