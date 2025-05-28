const SOL_TRACKER_WRAPPER = require('../utils/wrapper');

/**
 * Available time intervals for stats
 * @type {Object}
 */
const INTERVALS = {
  ONE_MINUTE: '1m',
  FIVE_MINUTES: '5m',
  FIFTEEN_MINUTES: '15m',
  ONE_HOUR: '1h',
  FOUR_HOURS: '4h',
  TWELVE_HOURS: '12h',
  ONE_DAY: '24h',
  SEVEN_DAYS: '7d',
  THIRTY_DAYS: '30d'
};

/**
 * @typedef {Object} VolumeStats
 * @property {number} buys - Total buy volume in USD
 * @property {number} sells - Total sell volume in USD
 * @property {number} total - Total trading volume in USD
 */

/**
 * @typedef {Object} IntervalStats
 * @property {number} buyers - Number of unique buyers
 * @property {number} sellers - Number of unique sellers
 * @property {VolumeStats} volume - Volume statistics
 * @property {number} transactions - Total number of transactions
 * @property {number} buys - Number of buy transactions
 * @property {number} sells - Number of sell transactions
 * @property {number} wallets - Number of unique wallets
 * @property {number} price - Current price
 * @property {number} priceChangePercentage - Price change percentage
 */

/**
 * @typedef {Object} TokenStats
 * @property {IntervalStats} [1m] - 1-minute interval stats
 * @property {IntervalStats} [5m] - 5-minute interval stats
 * @property {IntervalStats} [15m] - 15-minute interval stats
 * @property {IntervalStats} [1h] - 1-hour interval stats
 * @property {IntervalStats} [4h] - 4-hour interval stats
 * @property {IntervalStats} [12h] - 12-hour interval stats
 * @property {IntervalStats} [24h] - 24-hour interval stats
 * @property {IntervalStats} [7d] - 7-day interval stats
 * @property {IntervalStats} [30d] - 30-day interval stats
 */

/**
 * Get detailed stats for a token across all pools
 * @param {string} token - Token address
 * @returns {Promise<TokenStats>} Token statistics across various time intervals
 * @throws {Error} If token address is not provided
 */
async function getTokenStats(token) {
  if (!token) {
    throw new Error('Token address is required');
  }
  return SOL_TRACKER_WRAPPER.request(`/stats/${token}`);
}

/**
 * Get detailed stats for a specific token-pool pair
 * @param {string} token - Token address
 * @param {string} pool - Pool address
 * @returns {Promise<TokenStats>} Token-pool statistics across various time intervals
 * @throws {Error} If token address or pool address is not provided
 */
async function getPoolStats(token, pool) {
  if (!token || !pool) {
    throw new Error('Token address and pool address are required');
  }
  return SOL_TRACKER_WRAPPER.request(`/stats/${token}/${pool}`);
}

/**
 * Check if a time interval is supported
 * @param {string} interval - Time interval to check
 * @returns {boolean} True if the interval is supported
 */
function isValidInterval(interval) {
  return Object.values(INTERVALS).includes(interval);
}

module.exports = {
  getTokenStats,
  getPoolStats,
  isValidInterval,
  INTERVALS
};
