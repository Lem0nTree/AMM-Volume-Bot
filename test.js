const { ethers } = require("ethers");

const RPC_URL = "https://bsc-dataseed.bnbchain.org";
const PRIV_KEY = "0x2ba52f2e6caf8348870dea6d120b6c6e72ca4750587e54ed1257ef4d422d6b5d";
const ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const WALLET_ADDRESS = "0x6ad0a8F7446FD202778C201EC4a2d8d934cc0D10";
const uniswapABI = require("./ABI/uniswapABI");

// Create provider and wallet instances
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIV_KEY, provider);
const uniswapRouter = new ethers.Contract(ROUTER, uniswapABI, wallet);

// Function to test the swap
const swapExactETHForTokensTest = async () => {
    const amountIn = ethers.parseEther("0.0001"); // 0.01 ETH
    const path = [
      "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      "0x55d398326f99059fF775485246999027B3197955",
      "0x315D6f9D775DaA04Bc9e36100c8A82377846Dbc6"
    ];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

    const amountsOut = await uniswapRouter.getAmountsOut(amountIn, path);
    const expectedAmt = amountsOut[amountsOut.length - 1];
    const slippage = ethers.getBigInt(10); // 10% slippage
    const amountOutMin = expectedAmt - (expectedAmt / slippage);

    console.log("Swapping Tokens...");
    console.log("Amount In:", ethers.formatEther(amountIn));
    console.log("Amount Out Min:", ethers.formatEther(amountOutMin));

    const tx = await uniswapRouter.swapExactETHForTokens(
      amountOutMin,
      path,
      WALLET_ADDRESS,
      deadline,
      { value: amountIn }
    );

    const receipt = await tx.wait();
    if (receipt) {
        console.log("TOKEN SWAP SUCCESSFUL");
        console.log("Transaction Hash:", receipt.hash);
        console.log("Block Number:", receipt.blockNumber);
        console.log("Gas Used:", receipt.gasUsed.toString());
      } else {
        console.log("TOKEN SWAP FAILED");
      }
};

// Run the test function
swapExactETHForTokensTest().catch(console.error);