const SOL_TRACKER_WRAPPER = require("../utils/wrapper");

/**
 * Get all tokens in a wallet with current value in USD
 * @param {string} owner - Wallet address
 * @returns {Promise<Object>} Wallet token data with full details
 */
async function getWalletTokens(owner) {
  return SOL_TRACKER_WRAPPER.request(`/wallet/${owner}`);
}

/**
 * Get all tokens in a wallet with current value in USD (lightweight version)
 * @param {string} owner - Wallet address
 * @returns {Promise<Object>} Basic wallet token data
 */
async function getWalletTokensBasic(owner) {
  return SOL_TRACKER_WRAPPER.request(`/wallet/${owner}/basic`);
}

/**
 * Get wallet tokens using pagination (250 tokens per page)
 * @param {string} owner - Wallet address
 * @param {number} page - Page number
 * @returns {Promise<Object>} Paginated wallet token data
 */
async function getWalletTokensPaginated(owner, page) {
  return SOL_TRACKER_WRAPPER.request(`/wallet/${owner}/page/${page}`);
}

/**
 * Get the latest trades of a wallet
 * @param {string} owner - Wallet address
 * @param {Object} params - Query parameters
 * @param {string} [params.cursor] - Cursor for pagination
 * @returns {Promise<Object>} Wallet trade history
 */
async function getWalletTrades(owner, params = {}) {
  return SOL_TRACKER_WRAPPER.request(`/wallet/${owner}/trades`, "GET", {
    params,
  });
}

module.exports = {
  getWalletTokens,
  getWalletTokensBasic,
  getWalletTokensPaginated,
  getWalletTrades,
};
