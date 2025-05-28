const SOL_TRACKER_WRAPPER = require('../utils/wrapper');

/**
 * Get token information by token address
 * @param {string} tokenAddress - Token address to get information for
 * @returns {Promise<Object>} Token information
 */
async function getTokenInfo(tokenAddress) {
  return SOL_TRACKER_WRAPPER.request(`/tokens/${tokenAddress}`);
}

/**
 * Get token information by pool address
 * @param {string} poolAddress - Pool address to get token information for
 * @returns {Promise<Object>} Token information
 */
async function getTokenByPool(poolAddress) {
  return SOL_TRACKER_WRAPPER.request(`/tokens/by-pool/${poolAddress}`);
}

/**
 * Get top 100 token holders
 * @param {string} tokenAddress - Token address to get holders for
 * @returns {Promise<Object>} List of token holders
 */
async function getTokenHolders(tokenAddress) {
  return SOL_TRACKER_WRAPPER.request(`/tokens/${tokenAddress}/holders`);
}

/**
 * Get top 20 token holders
 * @param {string} tokenAddress - Token address to get top holders for
 * @returns {Promise<Object>} List of top token holders
 */
async function getTokenTopHolders(tokenAddress) {
  return SOL_TRACKER_WRAPPER.request(`/tokens/${tokenAddress}/holders/top`);
}

/**
 * Get token's all-time high price information
 * @param {string} tokenAddress - Token address to get ATH for
 * @returns {Promise<Object>} All-time high price information
 */
async function getTokenATH(tokenAddress) {
  return SOL_TRACKER_WRAPPER.request(`/tokens/${tokenAddress}/ath`);
}

/**
 * Get tokens created by wallet address
 * @param {string} walletAddress - Wallet address to get deployed tokens for
 * @returns {Promise<Object>} List of tokens created by the wallet
 */
async function getTokensByDeployer(walletAddress) {
  return SOL_TRACKER_WRAPPER.request(`/deployer/${walletAddress}`);
}

/**
 * Advanced token search with comprehensive filtering options
 * @param {Object} params - Search parameters
 * @param {string} params.query - Search term for token symbol, name, or address
 * @param {number} [params.page=1] - Page number for pagination
 * @param {number} [params.limit=100] - Number of results per page (max 100)
 * @param {string} [params.sortBy='createdAt'] - Field to sort by
 * @param {string} [params.sortOrder='desc'] - Sort order: 'asc' or 'desc'
 * @param {boolean} [params.showAllPools=false] - Return all pools for a token if enabled
 * @returns {Promise<Object>} Search results with pagination
 */
async function searchTokens(params = {}) {
  if (!params.query) {
    throw new Error('Query parameter is required for token search');
  }
  return SOL_TRACKER_WRAPPER.request('/search', { params });
}

/**
 * Get latest tokens with pagination
 * @param {Object} [params] - Query parameters
 * @param {number} [params.page=1] - Page number (1-10)
 * @returns {Promise<Object>} List of latest tokens
 */
async function getLatestTokens(params = {}) {
  return SOL_TRACKER_WRAPPER.request('/tokens/latest', { params });
}

/**
 * Get information for multiple tokens
 * @param {string[]} tokens - Array of token addresses (max 20)
 * @returns {Promise<Object>} Multiple tokens information
 * @throws {Error} If tokens array is empty or exceeds 20 tokens
 */
async function getMultipleTokens(tokens) {
  if (!Array.isArray(tokens) || tokens.length === 0) {
    throw new Error('Tokens array is required and must not be empty');
  }
  if (tokens.length > 20) {
    throw new Error('Maximum 20 tokens allowed per request');
  }
  return SOL_TRACKER_WRAPPER.post('/tokens/multi', { tokens });
}

/**
 * Available timeframes for trending and volume endpoints
 * @type {Object}
 */
const TIMEFRAMES = {
  FIVE_MIN: '5m',
  FIFTEEN_MIN: '15m',
  THIRTY_MIN: '30m',
  ONE_HOUR: '1h',
  TWO_HOUR: '2h',
  THREE_HOUR: '3h',
  FOUR_HOUR: '4h',
  FIVE_HOUR: '5h',
  SIX_HOUR: '6h',
  TWELVE_HOUR: '12h',
  TWENTY_FOUR_HOUR: '24h'
};

/**
 * Get trending tokens based on transaction volume
 * @param {Object} [params] - Query parameters
 * @param {string} [params.timeframe='1h'] - Timeframe for trending calculation
 * @returns {Promise<Object>} List of trending tokens
 */
async function getTrendingTokens(params = {}) {
  const { timeframe = '1h' } = params;
  if (timeframe) {
    return SOL_TRACKER_WRAPPER.request(`/tokens/trending/${timeframe}`);
  }
  return SOL_TRACKER_WRAPPER.request('/tokens/trending');
}

/**
 * Get tokens sorted by volume within a timeframe
 * @param {Object} [params] - Query parameters
 * @param {string} [params.timeframe] - Timeframe for volume calculation
 * @returns {Promise<Object>} List of tokens sorted by volume
 */
async function getTokensByVolume(params = {}) {
  const { timeframe } = params;
  if (timeframe) {
    return SOL_TRACKER_WRAPPER.request(`/tokens/volume/${timeframe}`);
  }
  return SOL_TRACKER_WRAPPER.request('/tokens/volume');
}

/**
 * Get overview information for multiple tokens
 * @returns {Promise<Object>} Overview information for multiple tokens
 */
async function getTokensOverview() {
  return SOL_TRACKER_WRAPPER.request('/tokens/multi/all');
}

/**
 * Get graduated tokens
 * @returns {Promise<Object>} List of graduated tokens
 */
async function getGraduatedTokens() {
  return SOL_TRACKER_WRAPPER.request('/tokens/multi/graduated');
}

module.exports = {
  getTokenInfo,
  getTokenByPool,
  getTokenHolders,
  getTokenTopHolders,
  getTokenATH,
  getTokensByDeployer,
  searchTokens,
  getLatestTokens,
  getMultipleTokens,
  getTrendingTokens,
  getTokensByVolume,
  getTokensOverview,
  getGraduatedTokens,
  TIMEFRAMES
};