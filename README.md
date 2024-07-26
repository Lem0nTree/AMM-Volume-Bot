# 🤖 AMM Volume Bot

## 📊 Overview

AMM Volume Bot is a simple automated market maker (AMM) volumizer that executes small trades at regular intervals on decentralized exchanges (DEX). This bot helps maintain up-to-date price data for tokens that might not have frequent trades.

## 🌟 Features

- 🔄 Alternates between buying and selling tokens
- ⏱️ Configurable trade intervals
- 💰 Dynamic calculation of trade amounts
- 📈 Supports multiple DEX platforms
- 📧 Email reporting (optional)
- 📱 Telegram reporting (optional)
- 💾 Persistent trade data storage

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
```

### 🔑 Configuration Details:

- `RPC_URL`: The RPC endpoint for the blockchain you're interacting with.
- `USER_ADDRESS` & `USER_PRIVATE_KEY`: Your wallet address and private key.
- `TARGET_TOKEN`, `WETH`, `USDT`, `ROUTER`: Addresses for the tokens and router contract you're trading with.
- `SEND_EMAIL_REPORT` & `SEND_TELEGRAM_REPORT`: Set to `true` or `false` to enable/disable reporting methods.
- Email and Telegram settings: Fill these if you've enabled the respective reporting methods.

## 🚀 Usage

To start the bot, run:

```
node index.js
```

The bot will start executing trades based on your configuration.

## ⚠️ Important Notes

- Ensure you have sufficient token balance and have granted necessary approvals to the router contract.
- Keep your private key secure and never share it publicly.
- This bot is for educational purposes. Use at your own risk in production environments.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check [issues page](https://github.com/YourUsername/AMM-Volume-Bot/issues).

## 👏 Acknowledgements

- Original concept by [AzureKn1ght](https://github.com/AzureKn1ght/AMM-Volume-Bot)
- Built with [ethers.js](https://docs.ethers.io/)
- Scheduling powered by [node-schedule](https://github.com/node-schedule/node-schedule)

---

Happy trading! 🚀📈