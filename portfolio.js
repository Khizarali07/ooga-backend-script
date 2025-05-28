const solTrackerSDK = require("./sdks/sol-tracker-sdk");
const axios = require("axios");
const fs = require("fs");
console.log("Fetching Data");

const SOL_ADDRESS = "So11111111111111111111111111111111111111112";

async function getSolTokenPrice(
  mintAddress = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
) {
  try {
    const solAddress = "So11111111111111111111111111111111111111112";
    const response = await axios.get(
      `https://api.jup.ag/price/v2?ids=${solAddress}&vsToken=${mintAddress}`
    );
    if (!response.data) {
      return {
        data: 0,
        error: true,
        message: "Error fetching token price",
      };
    }

    const price = response?.data?.data[solAddress]?.price || 0;
    return {
      data: price,
      error: false,
      message: "Token price fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching token price: ", error);
    return {
      data: 0,
      error: true,
      message: error?.message || "Error fetching token price",
    };
  }
}

const getData = async (timeframe = "all") => {
  const data = {
    analytics: {
      winRate: 0,
      performancePercentage: 0,
      performanceSolValue: 0,
      performanceUsdValue: 0,
      totalTransactions: 0,
      totalBuyTransactions: 0,
      totalSellTransactions: 0,
      walletSolBalance: 0,
      walletUsdBalance: 0,
      totalTokenSolBalance: 0,
      totalTokenUsdBalance: 0,
      bestToken: "",
      bestTokenUsd: 0,
    },
    chart: [],
    activity: [],
    holdings: [],
  };

  let result = null;
  let trades = [];
  let tokenPnls = [];
  let holdingTokens = [];

  const walletAddress = "J2MyY1GLnob2QTM7cfpdpp3JxoBwXkopVfiJA9njtmpT";
  // const walletAddress = "Bm1MhY7sM6VNFcXEfQHkCk4QiRmyMH6kywFZg5jNKLrs"

  result = await solTrackerSDK.wallet.getWalletTokens(walletAddress);
  if (result.data) {
    holdingTokens = result.data;
  }

  result = await solTrackerSDK.wallet.getWalletTrades(walletAddress);
  if (result.data) {
    trades = result.data.trades;
  }

  result = await solTrackerSDK.pnl.getWalletPnL(walletAddress);
  if (result.data) {
    tokenPnls = result.data;
  }

  // fs.writeFileSync("holdings.json", JSON.stringify(holdingTokens.data));
  fs.writeFileSync("trades.json", JSON.stringify(trades));
  // fs.writeFileSync("pnl.json", JSON.stringify(pnl.data));
  // fs.writeFileSync("holdingsData.json", JSON.stringify(holdingsData));

  let solToUsdValue = 0;
  let usdToSolValue = 0;
  result = await getSolTokenPrice();
  if (result.data) {
    solToUsdValue = result.data;
    usdToSolValue = 1 / result.data;
  }
  // activity
  let buyTradescount = 0;
  let sellTradesCount = 0;

  for (let i = 0; i < trades.length; i++) {
    const trade = trades[i];
    const type = trade.from.address === SOL_ADDRESS ? "buy" : "sell";
    const token = type === "buy" ? trade.to : trade.from;
    const quoteToken = type === "buy" ? trade.from : trade.to;

    if (type === "buy") {
      buyTradescount++;
    } else {
      sellTradesCount++;
    }

    let pnl = "--";
    let remaining = token?.amount;

    if (type === "sell") {
      const buyTrade = trades.find(
        (t) => t.to.address === token.address && t.from.address === SOL_ADDRESS
      );

      if (buyTrade) {
        remaining = buyTrade?.to.amount - token?.amount;
        pnl = {
          usd: trade?.volume.usd - buyTrade?.volume.usd,
          sol: trade?.volume.sol - buyTrade?.volume.sol,
        };
      }
    }

    // holdings
    if (type === "buy") {
      console.log(token.address);
      console.log(pnl);
      let tokenPnl = tokenPnls.tokens[token.address];
      console.log(tokenPnl);
      if (tokenPnl) {
        data.holdings.push({
          token: token.token,
          invested: {
            usd: tokenPnl?.total_invested,
            sol: tokenPnl?.total_invested * usdToSolValue,
            amount: tokenPnl?.held,
            txns: tokenPnl?.buy_transactions,
          },
          sold: {
            usd: tokenPnl?.sold_usd,
            sol: tokenPnl?.sold * usdToSolValue,
            amount: tokenPnl?.sold,
            txns: tokenPnl?.sell_transactions,
          },
          pnlUsd: tokenPnl?.total,
          pnlSol: tokenPnl?.total * usdToSolValue,
          remaining: {
            amount: tokenPnl?.held - tokenPnl?.sold,
            usd: (tokenPnl?.held - tokenPnl?.sold) * token?.priceUsd,
            sol:
              (tokenPnl?.held - tokenPnl?.sold) *
              token?.priceUsd *
              usdToSolValue,
          },
        });
      }
    }

    data.activity.push({
      age: trade.time,
      type: type,
      token: token.token,
      amount: token?.amount,
      priceSol: quoteToken?.amount,
      priceUsd: token?.priceUsd,
      marketCap: "--",
      pnl: pnl,
      remaining: remaining,
    });
  }

  // analytics

  data.analytics.winRate = tokenPnls.summary.winPercentage;
  data.analytics.performancePercentage = tokenPnls.summary.total;
  data.analytics.performanceSolValue = tokenPnls.summary.total;
  data.analytics.performanceUsdValue = tokenPnls.summary.total * solToUsdValue;

  data.analytics.totalTransactions = data.activity.length;
  data.analytics.totalBuyTransactions = buyTradescount;
  data.analytics.totalSellTransactions = sellTradesCount;

  data.analytics.walletSolBalance = 0;
  data.analytics.walletUsdBalance = 0;

  data.analytics.totalTokenSolBalance = holdingTokens.totalSol;
  data.analytics.totalTokenUsdBalance = holdingTokens.total;

  const bestToken = data.activity.sort((a, b) => b.pnl.usd - a.pnl.usd)[0];

  data.analytics.bestToken = bestToken?.token?.name;
  data.analytics.bestTokenUsd = bestToken?.pnl?.usd;

  // create chart data from activity, group trades by timeframe, which is either 1H, 1D, 1W, 1M
  // return in format array {date: '10-10-2023', pnl: 123}

  data.chart = data.activity.reduce((acc, trade) => {
    const date = new Date(trade.age);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const pnl = trade?.pnl?.usd || 0;
    const existing = acc.find(
      (item) => item.date === `${day}-${month}-${year}`
    );
    if (existing) {
      existing.pnl += pnl;
    } else {
      acc.push({ date: `${day}-${month}-${year}`, pnl: pnl });
    }
    return acc;
  }, []);

  console.log(data.chart);

  fs.writeFileSync("portfolio.json", JSON.stringify(data));
};

getData();
