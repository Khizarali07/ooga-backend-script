const SOL_TRACKER_WRAPPER = require("../utils/wrapper");

/**
 * @typedef {Object} PnLResponse
 * @property {number} holding - Current token holding amount
 * @property {number} held - Total amount of tokens ever held
 * @property {number} sold - Total amount of tokens sold
 * @property {number} sold_usd - Total USD value of sold tokens
 * @property {number} realized - Realized profit/loss in USD
 * @property {number} unrealized - Unrealized profit/loss in USD
 * @property {number} total - Total profit/loss (realized + unrealized)
 * @property {number} total_sold - Total USD value received from sales
 * @property {number} total_invested - Total USD value invested
 * @property {number} average_buy_amount - Average USD amount per buy
 * @property {number} current_value - Current USD value of holdings
 * @property {number} cost_basis - Average cost basis per token
 * @property {number} first_buy_time - Timestamp of first buy
 * @property {number} last_buy_time - Timestamp of last buy
 * @property {number} last_sell_time - Timestamp of last sell
 * @property {number} last_trade_time - Timestamp of last trade
 * @property {number} buy_transactions - Number of buy transactions
 * @property {number} sell_transactions - Number of sell transactions
 * @property {number} total_transactions - Total number of transactions
 */

/**
 * Get Profit and Loss data for all positions of a wallet
 * @param {string} wallet - Wallet address
 * @param {Object} [params] - Query parameters
 * @param {boolean} [params.showHistoricPnL] - Adds PnL data for 1d, 7d and 30d intervals (BETA)
 * @param {boolean} [params.holdingCheck] - Does an extra check for current holding value in wallet
 * @param {boolean} [params.hideDetails] - Return only summary without data for each token
 * @returns {Promise<Object>} PnL data for all positions
 */
async function getWalletPnL(wallet, params = {}) {
  if (!wallet) {
    throw new Error("Wallet address is required");
  }
  return SOL_TRACKER_WRAPPER.request(`/pnl/${wallet}`, "GET", { params });
}

/**
 * Get Profit and Loss data for a specific token in a wallet
 * @param {string} wallet - Wallet address
 * @param {string} token - Token address
 * @param {Object} [params] - Query parameters
 * @returns {Promise<PnLResponse>} Token-specific PnL data
 */
async function getTokenPnL(wallet, token, params = {}) {
  if (!wallet || !token) {
    throw new Error("Wallet address and token address are required");
  }
  return SOL_TRACKER_WRAPPER.request(`/pnl/${wallet}/${token}`, "GET", {
    params,
  });
}

/**
 * Get first buyers of a token with their PnL data
 * @param {string} token - Token address
 * @returns {Promise<Object>} First 100 buyers with their PnL data
 */
async function getFirstBuyers(token) {
  if (!token) {
    throw new Error("Token address is required");
  }
  return SOL_TRACKER_WRAPPER.request(`/first-buyers/${token}`, "GET");
}

module.exports = {
  getWalletPnL,
  getTokenPnL,
  getFirstBuyers,
};
