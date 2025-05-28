const chart = require('./modules/chart');
const price = require('./modules/price');
const token = require('./modules/token');
const wallet = require('./modules/wallet');
const trade = require('./modules/trade');
const pnl = require('./modules/pnl');
const stats = require('./modules/stats');
const trader = require('./modules/trader');
const websocket = require('./modules/websocket');

module.exports = {
  chart,
  price,
  token,
  wallet,
  trade,
  pnl,
  stats,
  trader,
  websocket
};
