const SOL_TRACKER_WRAPPER = require('../utils/wrapper');

/**
 * Sort options for top traders
 * @type {Object}
 */
const SORT_OPTIONS = {
  TOTAL: 'total',
  WIN_PERCENTAGE: 'winPercentage'
};

/**
 * @typedef {Object} TopTraderResponse
 * @property {string} wallet - Wallet address
 * @property {number} total - Total profit/loss in USD
 * @property {number} realized - Realized profit/loss in USD
 * @property {number} unrealized - Unrealized profit/loss in USD
 * @property {number} winPercentage - Percentage of profitable trades
 * @property {number} totalTrades - Total number of trades
 * @property {Object[]} [tokens] - Detailed PnL data for each token (if expandPnl is true)
 */

/**
 * Get top traders across all tokens with optional pagination
 * @param {Object} [params] - Query parameters
 * @param {boolean} [params.expandPnl] - Include detailed PnL data for each token
 * @param {string} [params.sortBy] - Sort results by metric ("total" or "winPercentage")
 * @param {number} [page=1] - Page number for pagination
 * @returns {Promise<TopTraderResponse[]>} Array of top traders data
 * @throws {Error} If sortBy parameter is invalid
 */
async function getAllTopTraders(params = {}, page = 1) {
  // Validate sort option if provided
  if (params.sortBy && !Object.values(SORT_OPTIONS).includes(params.sortBy)) {
    throw new Error(`Invalid sortBy parameter. Supported values are: ${Object.values(SORT_OPTIONS).join(', ')}`);
  }

  const endpoint = page > 1 ? `/top-traders/all/${page}` : '/top-traders/all';
  return SOL_TRACKER_WRAPPER.request(endpoint, { params });
}

/**
 * Get top 100 traders for a specific token
 * @param {string} token - Token address
 * @returns {Promise<TopTraderResponse[]>} Array of top traders data for the token
 * @throws {Error} If token address is not provided
 */
async function getTokenTopTraders(token) {
  if (!token) {
    throw new Error('Token address is required');
  }
  return SOL_TRACKER_WRAPPER.request(`/top-traders/${token}`);
}

module.exports = {
  getAllTopTraders,
  getTokenTopTraders,
  SORT_OPTIONS
};
