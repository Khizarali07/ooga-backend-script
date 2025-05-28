const SOL_TRACKER_WRAPPER = require('../utils/wrapper');

/**
 * Common trade query parameters type definition
 * @typedef {Object} TradeQueryParams
 * @property {string} [cursor] - Cursor for pagination
 * @property {boolean} [showMeta] - Add metadata for from and to tokens
 * @property {boolean} [parseJupiter] - Combine all transfers within a Jupiter swap into a single transaction
 * @property {boolean} [hideArb] - Hide arbitrage or other transactions that don't match token parameters
 * @property {string} [sortDirection] - Sort direction: 'DESC' (default) or 'ASC'
 */

/**
 * Get the latest trades for a token across all pools
 * @param {string} tokenAddress - Token address
 * @param {TradeQueryParams} [params] - Query parameters
 * @returns {Promise<Object>} Trade data including:
 * - trades: Array of trade objects
 * - cursor: Pagination cursor for next page
 * - count: Number of trades returned
 */
async function getTokenTrades(tokenAddress, params = {}) {
  if (!tokenAddress) {
    throw new Error('Token address is required');
  }
  return SOL_TRACKER_WRAPPER.request(`/trades/${tokenAddress}`, { params });
}

/**
 * Get the latest trades for a specific token and pool pair
 * @param {string} tokenAddress - Token address
 * @param {string} poolAddress - Pool address
 * @param {TradeQueryParams} [params] - Query parameters
 * @returns {Promise<Object>} Trade data including:
 * - trades: Array of trade objects
 * - cursor: Pagination cursor for next page
 * - count: Number of trades returned
 */
async function getPoolTrades(tokenAddress, poolAddress, params = {}) {
  if (!tokenAddress || !poolAddress) {
    throw new Error('Token address and pool address are required');
  }
  return SOL_TRACKER_WRAPPER.request(`/trades/${tokenAddress}/${poolAddress}`, { params });
}

/**
 * Get the latest trades for a specific token, pool, and wallet address
 * @param {string} tokenAddress - Token address
 * @param {string} poolAddress - Pool address
 * @param {string} owner - Wallet address
 * @param {TradeQueryParams} [params] - Query parameters
 * @returns {Promise<Object>} Trade data including:
 * - trades: Array of trade objects
 * - cursor: Pagination cursor for next page
 * - count: Number of trades returned
 */
async function getPoolTradesByWallet(tokenAddress, poolAddress, owner, params = {}) {
  if (!tokenAddress || !poolAddress || !owner) {
    throw new Error('Token address, pool address, and wallet address are required');
  }
  return SOL_TRACKER_WRAPPER.request(`/trades/${tokenAddress}/${poolAddress}/${owner}`, { params });
}

/**
 * Get the latest trades for a specific token and wallet address
 * @param {string} tokenAddress - Token address
 * @param {string} owner - Wallet address
 * @param {TradeQueryParams} [params] - Query parameters
 * @returns {Promise<Object>} Trade data including:
 * - trades: Array of trade objects
 * - cursor: Pagination cursor for next page
 * - count: Number of trades returned
 */
async function getTokenTradesByWallet(tokenAddress, owner, params = {}) {
  if (!tokenAddress || !owner) {
    throw new Error('Token address and wallet address are required');
  }
  return SOL_TRACKER_WRAPPER.request(`/trades/${tokenAddress}/by-wallet/${owner}`, { params });
}

/**
 * Sort directions for trade queries
 * @type {Object}
 */
const SORT_DIRECTIONS = {
  DESC: 'DESC',
  ASC: 'ASC'
};

module.exports = {
  getTokenTrades,
  getPoolTrades,
  getPoolTradesByWallet,
  getTokenTradesByWallet,
  SORT_DIRECTIONS
};
