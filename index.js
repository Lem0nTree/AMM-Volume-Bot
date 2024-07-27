/*
- AMM Volume Bot - 
This is a simple AMM volumizer bot that automatically trades tokens on decentralized exchanges (DEX) so that price values are registered and available on a regular basis. Most DEX APIs will not update price data if there are no trades happening for more than a day. This bot aims to solve that problem by automatically executing a small trade at regular intervals. Prerequisite is that you will need to have some of your ERC20 tokens in your wallet, and you must first give token approval to the AMM router of the DEX for token spending. Once the bot is operational, it will sell tokens for the native coin every X hrs. All values are configurable in the code. :)  
*/

// Import required node modules
const { ethers, JsonRpcProvider } = require("ethers");
const scheduler = require("node-schedule");
const nodemailer = require("nodemailer");
const figlet = require("figlet");
require("dotenv").config();
const fs = require("fs");
const TelegramBot = require('node-telegram-bot-api');


// Import environment variables
const WALLET_ADDRESS = process.env.USER_ADDRESS;
const PRIV_KEY = process.env.USER_PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;
const TOKEN = process.env.TARGET_TOKEN;
const WETH = process.env.WETH;
const ROUTER = process.env.ROUTER;
const USDT = process.env.USDT; 

// Storage obj
var report = [];
var trades = {
  previousTrade: "",
  nextTrade: "",
  count: 0,
};

// Contract ABI (please grant ERC20 approvals)
const uniswapABI = require("./ABI/uniswapABI");
const explorer = "https://bscscan.com/tx/";
const MIN_AMT = 0.01; // est. gas costs
const txdelay = 4; // minutes

// Initiating telegram bot
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_THREAD_ID = process.env.TELEGRAM_THREAD_ID;
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

// Fetch Report Options
const SEND_EMAIL_REPORT = process.env.SEND_EMAIL_REPORT === 'true';
const SEND_TELEGRAM_REPORT = process.env.SEND_TELEGRAM_REPORT === 'true';


// Ethers vars for web3 connections
var wallet, provider, uniswapRouter;

// Main Function
const main = async () => {
  try {
    console.log(
      figlet.textSync("AMMTrade", {
        font: "Standard",
        horizontalLayout: "default",
        verticalLayout: "default",
        width: 80,
        whitespaceBreak: true,
      })
    );
    let tradesExists = false;

    // check if trades file exists
    if (!fs.existsSync("./next.json")) await storeData();

    // get stored values from file
    const storedData = JSON.parse(fs.readFileSync("./next.json"));

    // not first launch, check data
    if ("nextTrade" in storedData) {
      const nextTrade = new Date(storedData.nextTrade);
      trades["count"] = Number(storedData["count"]);
      console.log(`Current Count: ${trades["count"]}`);

      // restore trades schedule
      if (nextTrade > new Date()) {
        console.log("Restored Trade: " + nextTrade);
        scheduler.scheduleJob(nextTrade, AMMTrade);
        tradesExists = true;
      }
    }

    // no previous launch
    if (!tradesExists) {
      AMMTrade();
    }
  } catch (error) {
    console.error(error);
  }
};

// Ethers vars connect
const connect = async () => {
  // new RPC connection
  provider = new ethers.JsonRpcProvider(RPC_URL);
  wallet = new ethers.Wallet(PRIV_KEY, provider);

  // uniswap router contract
  uniswapRouter = new ethers.Contract(ROUTER, uniswapABI, wallet);

  // connection established
  const balance = await provider.getBalance(WALLET_ADDRESS);
  console.log("ETH Balance:" + ethers.formatEther(balance));
  console.log("--> connected\n");
};

// Ethers vars disconnect
const disconnect = () => {
  wallet = null;
  provider = null;
  uniswapRouter = null;
  console.log("-disconnected-\n");
};

// AMM Trading Function
const AMMTrade = async () => {
  console.log("\n--- AMMTrade Start ---");
  report.push("--- AMMTrade Report ---");
  report.push(`By: ${WALLET_ADDRESS}`);
  try {
    const today = new Date();
    await connect();
    let result;

    // store last traded, increase counter
    trades.previousTrade = today.toString();
    const t = trades["count"];
    trades["count"] = t + 1;

    // buy every 2nd iteration
    const buyTime = t % 2 == 0;

    // execute appropriate action based on condition
    if (buyTime) result = await buyTokensCreateVolume();
    else result = await sellTokensCreateVolume();

    // update on status
    report.push(result);
  } catch (error) {
    report.push("AMMTrade failed!");
    report.push(error);

    // try again later
    console.error(error);
    scheduleNext(new Date());
  }

  // send status update report
  report.push({ ...trades });

 // Send reports based on environment settings
 if (SEND_EMAIL_REPORT) {
  try {
    await sendReport(report); // Email report
    console.log("Email report sent successfully");
  } catch (error) {
    console.error("Failed to send email report:", error);
  }
}

if (SEND_TELEGRAM_REPORT) {
  try {
    await sendTelegramReport(report); // Telegram report
    console.log("Telegram report sent successfully");
  } catch (error) {
    console.error("Failed to send Telegram report:", error);
  }
}
  report = [];

  return disconnect();
};

// AMM Volume Trading Function
const sellTokensCreateVolume = async (tries = 1.0) => {
  try {
    // limit to maximum 3 tries
    if (tries > 3) return false;
    console.log(`Selling Try #${tries}...`);

    // prepare the variables needed for trade
    const path = [TOKEN, USDT, WETH];
    const amt = await getAmt(path);

    console.log(`Amount to sell: ${amt} ${TOKEN}`);

    // Check token balance and allowance
    const tokenABI = [
      'function balanceOf(address) view returns (uint256)',
      'function allowance(address,address) view returns (uint256)',
      'function approve(address spender, uint256 amount) returns (bool)'
    ];

    const tokenContract = new ethers.Contract(TOKEN, tokenABI, wallet);

    const balance = await tokenContract.balanceOf(WALLET_ADDRESS);
    const allowance = await tokenContract.allowance(WALLET_ADDRESS, ROUTER);


    console.log(`Token balance: ${ethers.formatEther(balance)}`);
    console.log(`Router allowance: ${ethers.formatEther(allowance)}`);

    const amountToSell = ethers.parseEther(amt);

    if (balance < amountToSell) {
      throw new Error(`Insufficient token balance. Required: ${ethers.formatEther(amountToSell)}, Available: ${ethers.formatEther(balance)}`);
    }

    if (allowance < amountToSell) {
      console.log("Insufficient allowance, approving router...");
      const approveTx = await tokenContract.approve(ROUTER, ethers.MaxUint256);
      await approveTx.wait();
      console.log("Approval transaction confirmed");
    }


    // execute the swap await result
    const result = await swapExactTokensForETH(amountToSell, path);

    // succeeded
    if (result) {
      // get the remaining balance of the current wallet
      const u = await provider.getBalance(WALLET_ADDRESS);
      trades.previousTrade = new Date().toString();
      const balance = ethers.formatEther(u);
      console.log(`Balance: ${balance} ETH`);
      await scheduleNext(new Date());

      // successful
      return {
        balance: balance,
        success: true,
        trade: result,
      };
    } else {
      throw new Error("Swap failed");
    }
  } catch (error) {
    console.log("Attempt Failed!");
    console.log("Error:", error.message);
    console.log("retrying...");
    console.error(error);

    // fail, increment try count and retry again
    return await sellTokensCreateVolume(++tries);
  }
};
const getAmt = async (path) => {
  const BUY_AMT = MIN_AMT * 5 + MIN_AMT * 2;
  let low = 500;
  let high = 999;
  let lastValidAmount = "999";

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const amt = ethers.parseEther(mid.toString());
    const result = await uniswapRouter.getAmountsOut(amt, path);
    const expectedAmt = result[result.length - 1];
    const amtOut = Number(ethers.formatEther(expectedAmt));

    if (amtOut > BUY_AMT) {
      lastValidAmount = mid.toString();
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  // Add random decimals to the amount
  const dec = getRandomNum(1000000, 9999999);
  return `${lastValidAmount}.${dec}`;
};

// Swaps Function (assumes 18 decimals on input amountIn)
const swapExactTokensForETH = async (amountIn, path) => {
  try {
    const amountInFormatted = ethers.formatEther(amountIn);
    console.log("Swapping Tokens...");
    console.log("Amount In: " + amountInFormatted);

    const amountsOut = await uniswapRouter.getAmountsOut(amountIn, path);
    const expectedAmt = amountsOut[amountsOut.length - 1];
    console.log("Expected Amount Out:", ethers.formatEther(expectedAmt));

    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

    // Calculate slippage
    const slippage = 10n; // 10% slippage
    const amountOutMin = expectedAmt - (expectedAmt / slippage);

    console.log("Amount Out Min: " + ethers.formatEther(amountOutMin));

    const tx = await uniswapRouter.swapExactTokensForETH(
      amountIn,
      amountOutMin,
      path,
      WALLET_ADDRESS,
      deadline,
      { gasLimit: 300000 }
    );

    console.log("Transaction sent. Waiting for confirmation...");
    const receipt = await tx.wait();
    if (receipt && receipt.status === 1) {
      console.log("TOKEN SWAP SUCCESSFUL");
      const transactionHash = receipt.hash;
      const t = explorer + transactionHash;

      return {
        type: "SELL",
        amountIn: amountInFormatted,
        amountOutMin: ethers.formatEther(amountOutMin),
        path: path,
        wallet: WALLET_ADDRESS,
        transaction_url: t,
      };
    } else {
      throw new Error("Transaction failed");
    }
  } catch (error) {
    console.error("SwapExactTokensForETH failed", error);
    throw error;  // Re-throw the error to be caught in the calling function
  }
};

// AMM Volume Trading Function
const buyTokensCreateVolume = async (tries = 1.0) => {
  try {
    // limit to maximum 3 tries
    if (tries > 3) return false;
    console.log(`Buying Try #${tries}...`);
    const BUY_AMT = MIN_AMT * 5;

    // prepare the variables needed for the trade
    const a = ethers.parseEther(BUY_AMT.toString());
    const path = [WETH, USDT, TOKEN];
    // execute the swap transaction and await result
    const result = await swapExactETHForTokens(a, path);

    // succeeded
    if (result) {
      // get the remaining balance of the current wallet
      const u = await provider.getBalance(WALLET_ADDRESS);
      trades.previousTrade = new Date().toString();
      const balance = ethers.formatEther(u);
      console.log(`Balance:${balance} ETH`);
      await scheduleNext(new Date());

      // successful
      const success = {
        balance: balance,
        success: true,
        trade: result,
      };

      return success;
    } else throw new Error();
  } catch (error) {
    console.log("Attempt Failed!");
    console.log("retrying...");
    console.error(error);

    // fail, increment try count and retry again
    return await buyTokensCreateVolume(++tries);
  }
};

// Swaps Function (assumes 18 decimals on input amountIn)
const swapExactETHForTokens = async (amountIn, path) => {
  try {
    const amtInFormatted = ethers.formatEther(amountIn);
    const amountsOut = await uniswapRouter.getAmountsOut(amountIn, path);
    const expectedAmt = amountsOut[amountsOut.length - 1];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

    // Calculate slippage
    const slippage = 10n; // 10% slippage
    const amountOutMin = expectedAmt - (expectedAmt / slippage);

    const overrideOptions = {
      value: amountIn,
    };

    console.log("Swapping Tokens...");
    console.log("Amount In: " + amtInFormatted);
    console.log("Amount Out Min: " + ethers.formatEther(amountOutMin));

    const tx = await uniswapRouter.swapExactETHForTokens(
      amountOutMin,
      path,
      WALLET_ADDRESS,
      deadline,
      overrideOptions
    );

    const receipt = await tx.wait();
    if (receipt) {
      console.log("TOKEN SWAP SUCCESSFUL");
      const transactionHash = receipt.hash;
      const t = explorer + transactionHash;

      return {
        type: "BUY",
        amountIn: amtInFormatted,
        amountOutMin: ethers.formatEther(amountOutMin),
        path: path,
        wallet: WALLET_ADDRESS,
        transaction_url: t,
      };
    }
  } catch (error) {
    console.error("SwapExactETHForTokens failed", error);
    console.error("Transaction data:", {
      amountIn: amtInFormatted,
      amountOutMin: amountOutMin ? ethers.formatEther(amountOutMin) : null,
      path,
      WALLET_ADDRESS,
      deadline,
      overrideOptions,
    });
  }
  return false;
};

// Send Report Function
const sendReport = (report) => {
  const today = todayDate();
  console.log(report);

  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true, // Use SSL/TLS
    auth: {
      user: process.env.EMAIL_ADDR,
      pass: process.env.EMAIL_PW,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_ADDR,
    to: process.env.RECIPIENT,
    subject: "Trade Report: " + today,
    text: JSON.stringify(report, null, 2),
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Email sending failed:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

// Send Telegram Report Function
const sendTelegramReport = async (report) => {
  const today = todayDate();
  
  let message = `🤖 Trade Report: ${today}\n\n`;
  
  if (report.length >= 3) {
    const tradeDetails = report[2];
    if (tradeDetails.trade) {
      message += `Type: ${tradeDetails.trade.type}\n`;
      message += `Amount In: ${tradeDetails.trade.amountIn}\n`;
      message += `Amount Out Min: ${tradeDetails.trade.amountOutMin}\n`;
      message += `Wallet: ${tradeDetails.trade.wallet}\n`;
      message += `Transaction: ${tradeDetails.trade.transaction_url}\n\n`;
    }
    
    message += `Balance: ${tradeDetails.balance} ETH\n`;
    message += `Success: ${tradeDetails.success}\n`;
  }
  
  if (report.length >= 4) {
    const tradeInfo = report[3];
    message += `\nPrevious Trade: ${tradeInfo.previousTrade}\n`;
    message += `Next Trade: ${tradeInfo.nextTrade}\n`;
    message += `Trade Count: ${tradeInfo.count}\n`;
  }

  try {
    const options = {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
    };

    // Add message_thread_id if it's provided in the environment variables
    if (TELEGRAM_THREAD_ID) {
      options.message_thread_id = TELEGRAM_THREAD_ID;
    }

    await bot.sendMessage(options.chat_id, options.text, options);
    console.log('Telegram report sent successfully');
  } catch (error) {
    console.error('Failed to send Telegram report:', error);
    console.error('Error details:', error.response ? error.response.body : error.message);
  }
};


// Current Date Function
const todayDate = () => {
  const today = new Date();
  return today.toLocaleString("en-GB", { timeZone: "Asia/Singapore" });
};

// Job Scheduler Function
const scheduleNext = async (nextDate) => {
  // apply delay
  await delay();

  // set next job to be 12hrs from now
  nextDate.setMinutes(nextDate.getMinutes() + txdelay);
  trades.nextTrade = nextDate.toString();
  console.log("Next Trade: ", nextDate);

  // schedule next restake
  scheduler.scheduleJob(nextDate, AMMTrade);
  storeData();
  return;
};

// Data Storage Function
const storeData = async () => {
  const data = JSON.stringify(trades);
  fs.writeFile("./next.json", data, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Data stored:\n", trades);
    }
  });
};

// Generate random num Function
const getRandomNum = (min, max) => {
  try {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  } catch (error) {
    console.error(error);
  }
  return max;
};

// Random Time Delay Function
const delay = () => {
  const ms = getRandomNum(2971, 4723);
  console.log(`delay(${ms})`);
  return new Promise((resolve) => setTimeout(resolve, ms));
};

main();
