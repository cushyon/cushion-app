import { buySolWithUsdc, sellSolForUsdc } from "./drift.service";
import { USDC, SOL } from "../lib/tokens";
import { initDrift } from "@src/utils/init-drift";
import { swapSolForUsdc } from "@src/utils/swap-sol-for-usdc";
import { swapUsdcForSol } from "@src/utils/swap-usdc-for-sol";

export const getAssetData = (asset: string) => {
  if (asset === SOL.address) return SOL;
  if (asset === USDC.address) return USDC;
  throw new Error("Invalid asset");
};

export const rebalanceWithDrift = async (
  asset1: string,
  asset2: string,
  percentageAsset1: number,
  percentageAsset2: number
) => {
  const { driftClient, user } = await initDrift();

  // Get the price of the asset1 and asset2
  const asset1Data = getAssetData(asset1);
  const asset2Data = getAssetData(asset2);

  const oraclePriceAsset1 = driftClient.getOracleDataForSpotMarket(
    asset1Data.marketIndex
  );
  const oraclePriceAsset2 = driftClient.getOracleDataForSpotMarket(
    asset2Data.marketIndex
  );

  const formattedOraclePriceAsset1 = Number(oraclePriceAsset1.price) / 10 ** 6;
  const formattedOraclePriceAsset2 = Number(oraclePriceAsset2.price) / 10 ** 6;

  // Fetch portfolio Assets balance
  const tokenAmountAsset1 = user.getTokenAmount(asset1Data.marketIndex);
  const tokenAmountAsset2 = user.getTokenAmount(asset2Data.marketIndex);

  // Format the token amount in human readable format
  const formattedTokenAmountAsset1 =
    Number(tokenAmountAsset1) / 10 ** asset1Data.decimals;
  const formattedTokenAmountAsset2 =
    Number(tokenAmountAsset2) / 10 ** asset2Data.decimals;

  console.log("formattedTokenAmountAsset1", formattedTokenAmountAsset1);
  console.log("formattedTokenAmountAsset2", formattedTokenAmountAsset2);

  // Calculate the each asset value in USD
  const amountAsset1InUSD =
    formattedTokenAmountAsset1 * formattedOraclePriceAsset1;
  const amountAsset2InUSD =
    formattedTokenAmountAsset2 * formattedOraclePriceAsset2;

  // Calculate the total NAV value in USD
  const totalAmountInUSD = amountAsset1InUSD + amountAsset2InUSD;

  console.log("totalAmountInUSD", totalAmountInUSD);
  console.log("amountAsset1InUSD", amountAsset1InUSD.toString());
  console.log("amountAsset2InUSD", amountAsset2InUSD.toString());

  // Calculate the current percentage of each asset in the portfolio
  const currentPercentageAsset1 = (amountAsset1InUSD / totalAmountInUSD) * 100;
  const currentPercentageAsset2 = (amountAsset2InUSD / totalAmountInUSD) * 100;

  console.log("current percentageAsset1", currentPercentageAsset1);
  console.log("current percentageAsset2", currentPercentageAsset2);

  const tolerance = 1; // 1% tolerance, if variation above 1%, rebalance. Check and add control for min amount possible to swap
  if (Math.abs(currentPercentageAsset1 - percentageAsset1) <= tolerance) {
    console.log("No need to rebalance - within tolerance range");
    return {
      //if no need to rebalance, return success
      status: "success",
      txSig: null,
      currentPercentageAsset1,
      currentPercentageAsset2,
      swapDirection: null,
      amountToSwap: 0,
      amountToSwapInSOL: 0,
      totalAmountInUSD,
    };
  }

  const swapDirection =
    currentPercentageAsset1 > percentageAsset1
      ? "asset1ToAsset2"
      : "asset2ToAsset1";

  console.log("swapDirection", swapDirection);

  const expectedAmountAsset1 = (percentageAsset1 / 100) * totalAmountInUSD;
  const expectedAmountAsset2 = (percentageAsset2 / 100) * totalAmountInUSD;

  console.log("expectedAmountAsset1", expectedAmountAsset1);
  console.log("expectedAmountAsset2", expectedAmountAsset2);

  if (swapDirection === "asset1ToAsset2") {
    const swapResult = await swapSolForUsdc(
      driftClient,
      formattedTokenAmountAsset1,
      formattedOraclePriceAsset1,
      expectedAmountAsset1
    );
    return {
      status: "success",
      txSig: swapResult.txSig,
      currentPercentageAsset1,
      currentPercentageAsset2,
      swapDirection,
      amountToSwap: swapResult.amountToSwap,
      amountToSwapInSOL: swapResult.amountToSwapInSOL,
      totalAmountInUSD,
    };
  } else {
    const swapResult = await swapUsdcForSol(
      driftClient,
      formattedOraclePriceAsset1,
      formattedOraclePriceAsset2,
      formattedTokenAmountAsset2,
      expectedAmountAsset2
    );
    return {
      status: "success",
      txSig: swapResult.txSig,
      currentPercentageAsset1,
      currentPercentageAsset2,
      swapDirection,
      amountToSwap: swapResult.amountToSwap,
      amountToSwapInSOL: swapResult.amountToSwapInSOL,
      totalAmountInUSD,
    };
  }
};
