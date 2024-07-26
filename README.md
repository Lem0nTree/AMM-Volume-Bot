# AMM Volume Bot
![UNISWAP](https://cryptoradar.com/cms/content/images/2022/02/What-is-UNI.png)

This is a simple AMM volumizer bot that automatically trades tokens on decentralized exchanges (DEX) so that price values are registered and available on a regular basis. Most DEX APIs will not update price data if there are no trades happening for more than a day. This bot aims to solve that problem by automatically executing a small trade at regular intervals. Prerequisite is that you will need to have some of your ERC20 tokens in your wallet, and you must first give token approval to the AMM router of the DEX for token spending. Once the bot is operational, it will sell 1 token for the native coin every 12hrs. All values are configurable in the code. :)  

## ENV Variables 
You will need to create a file called *.env* in the root directory, copy the text in *.env.example* and fill in the variables. 
If you want to use the emailer with gmail, then you will need [Google App Passwords](https://support.google.com/accounts/answer/185833?hl=en). 

## How to Run
You could run it on your desktop just using [Node.js](https://github.com/nodejs/node) in your terminal. However, on a production environment, it is recommended to use something like [PM2](https://github.com/Unitech/pm2) to run the processes to ensure robust uptime and management. 
```
npm install
pm2 start index.js -n "VOL"
pm2 save

```
**Donate:** 0xbaee15e7905874ea5e592efee19b2d0082d538b8
