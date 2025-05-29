const SOL_TRACKER_WRAPPER = require("../utils/wrapper");

const INTERVALS = {
  "1s": "1 SECOND",
  "5s": "5 SECOND",
  "15s": "15 SECOND",
  "1m": "1 MINUTE",
  "3m": "3 MINUTE",
  "5m": "5 MINUTE",
  "15m": "15 MINUTE",
  "30m": "30 MINUTE",
  "1h": "1 HOUR",
  "2h": "2 HOUR",
  "4h": "4 HOUR",
  "6h": "6 HOUR",
  "8h": "8 HOUR",
  "12h": "12 HOUR",
  "1d": "1 DAY",
  "3d": "3 DAY",
  "1w": "1 WEEK",
  "1mn": "1 MONTH",
};

/**
 * Get OLCVH data for a token
 * @param {string} token - Token address or symbol
 * @param {string} pool - Optional pool address
 * @param {Object} params - Query parameters
 * @param {string} params.type - Time interval (e.g., "1m", "1h")
 * @param {number} params.time_from - Start time (Unix timestamp in seconds)
 * @param {number} params.time_to - End time (Unix timestamp in seconds)
 * @param {boolean} params.marketCap - Return market cap data instead of pricing
 * @param {boolean} params.removeOutliers - Enable/disable outlier removal
 * @returns {Promise<Object>} Chart data
 */
async function getChartData(token, pool = null, params = {}) {
  const endpoint = pool ? `/chart/${token}/${pool}` : `/chart/${token}`;

  return SOL_TRACKER_WRAPPER.request(endpoint, "GET", { params });
}

/**
 * Get token holder count data over time
 * @param {string} token - Token address
 * @param {Object} [params] - Query parameters
 * @param {string} [params.type='1d'] - Time interval (e.g., "1s", "1m", "1h", "1d")
 * @param {number} [params.time_from] - Start time (Unix timestamp in seconds)
 * @param {number} [params.time_to] - End time (Unix timestamp in seconds)
 * @returns {Promise<Object>} Holder count data including:
 * - holders: Array of objects containing:
 *   - holders: number (holder count)
 *   - time: number (Unix timestamp)
 */
async function getHoldersChartData(token, params = {}) {
  if (!token) {
    throw new Error("Token address is required");
  }

  // Validate interval if provided
  if (params.type && !isValidInterval(params.type)) {
    throw new Error(
      `Invalid interval. Supported intervals are: ${Object.keys(INTERVALS).join(
        ", "
      )}`
    );
  }

  return SOL_TRACKER_WRAPPER.request(`/holders/chart/${token}`, "GET", {
    params,
  });
}

/**
 * Validates if the provided interval is supported
 * @param {string} interval - Time interval
 * @returns {boolean}
 */
function isValidInterval(interval) {
  return interval in INTERVALS;
}

module.exports = {
  getChartData,
  getHoldersChartData,
  isValidInterval,
  INTERVALS,
};
