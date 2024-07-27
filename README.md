# 🤖 AMM Volume Bot

## 📊 Overview

AMM Volume Bot is a simple automated market maker (AMM) volumizer that executes small trades at regular intervals on decentralized exchanges (DEX). This bot helps maintain up-to-date price data for tokens that might not have frequent trades.

## 🌟 Features

- 🔄 Alternates between buying and selling tokens
- ⏱️ Configurable trade intervals
- 💰 Dynamic calculation of trade amounts using Gaussian distribution
- 📈 Supports multiple DEX platforms
- 📧 Email reporting (optional)
- 📱 Telegram reporting (optional)
- 💾 Persistent trade data storage
- 🎯 Configurable strategy bias for long-term token accumulation or ETH profit

## 🛠️ Installation

1. Clone the repository:
   ```
   git clone https://github.com/YourUsername/AMM-Volume-Bot.git
   ```

2. Navigate to the project directory:
   ```
   cd AMM-Volume-Bot
   ```

3. Install dependencies:
   ```
   npm install
   ```

## ⚙️ Configuration

Create a `.env` file in the root directory of the project and configure it with your settings:

```env
# ========
# = NODE =
# ========
RPC_URL="Your_RPC_URL"

# =========
# = WALLET =
# =========
USER_ADDRESS="Your_Wallet_Address"
USER_PRIVATE_KEY="Your_Private_Key"

# =========
# = DEX =
# =========
TARGET_TOKEN="Token_Address"
WETH="Wrapped_ETH_Address"
USDT="USDT_Address"
ROUTER="Router_Contract_Address"

# =========
# = OPTIONS =
# =========
SEND_EMAIL_REPORT=false
SEND_TELEGRAM_REPORT=true

# =========
# = EMAIL =
# =========
RECIPIENT="recipient@example.com"
EMAIL_ADDR="your_email@example.com"
EMAIL_PW="your_email_password"

# =========
# = TELEGRAM BOT =
# =========
TELEGRAM_CHAT_ID="Your_Chat_ID"
TELEGRAM_THREAD_ID="Your_Thread_ID"
TELEGRAM_BOT_TOKEN="Your_Bot_Token"

# =========
# = TRADE SETTINGS =
# =========
TX_DELAY_MIN=60
TX_DELAY_MAX=120
MIN_AMT=0.001
BUY_AMT_MEAN=0.01
BUY_AMT_STD_DEV=0.01
STRATEGY_BIAS=0
```

### 🔑 Configuration Details:

- `RPC_URL`: The RPC endpoint for the blockchain you're interacting with.
- `USER_ADDRESS` & `USER_PRIVATE_KEY`: Your wallet address and private key.
- `TARGET_TOKEN`, `WETH`, `USDT`, `ROUTER`: Addresses for the tokens and router contract you're trading with.
- `SEND_EMAIL_REPORT` & `SEND_TELEGRAM_REPORT`: Set to `true` or `false` to enable/disable reporting methods.
- Email and Telegram settings: Fill these if you've enabled the respective reporting methods.
- `TX_DELAY_MIN` & `TX_DELAY_MAX`: Minimum and maximum delay between trades (in minutes).
- `MIN_AMT`: Minimum amount for each trade (in ETH).
- `BUY_AMT_MEAN`: Mean amount for the Gaussian distribution (in ETH).
- `BUY_AMT_STD_DEV`: Standard deviation for the Gaussian distribution (in ETH).
- `STRATEGY_BIAS`: Percentage bias for long-term strategy (-100 to 100, where negative values favor token accumulation and positive values favor ETH profit).

## 🚀 Usage

To start the bot, run:

```
node index.js
```

The bot will start executing trades based on your configuration.

## 📊 Trade Amount Calculation

The bot uses a Gaussian (normal) distribution to determine trade amounts. This provides a more natural variation in trade sizes while still clustering around a defined mean value. The `BUY_AMT_MEAN` and `BUY_AMT_STD_DEV` parameters control this distribution.

## 🎯 Strategy Bias

The `STRATEGY_BIAS` setting allows you to influence the long-term behavior of the bot:
- Positive values (0 to 100) will gradually increase sell amounts and decrease buy amounts, favoring ETH profit.
- Negative values (-100 to 0) will gradually increase buy amounts and decrease sell amounts, favoring token accumulation.
- A value of 0 maintains a neutral strategy.

## ⚠️ Important Notes

- Ensure you have sufficient token balance and have granted necessary approvals to the router contract.
- Keep your private key secure and never share it publicly.
- This bot is for educational purposes. Use at your own risk in production environments.
- The strategy bias feature provides a gradual influence over time. It does not guarantee profits or specific outcomes.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check [issues page](https://github.com/YourUsername/AMM-Volume-Bot/issues).

## 👏 Acknowledgements

- Original concept by [AzureKn1ght](https://github.com/AzureKn1ght/AMM-Volume-Bot)
- Built with [ethers.js](https://docs.ethers.io/)
- Scheduling powered by [node-schedule](https://github.com/node-schedule/node-schedule)
- Gaussian distribution implemented with [gaussian](https://github.com/errcw/gaussian)

---

Happy trading! 🚀📈