import { PublicKey } from "@solana/web3.js";
import {
  buySolWithUsdc,
  createDriftClient,
  initProvider,
  sellSolForUsdc,
} from "./drift.service";
import { initialize } from "@drift-labs/sdk";

export const USDC = {
  address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  marketIndex: 0,
  decimals: 6,
};

export const SOL = {
  address: "So11111111111111111111111111111111111111112",
  marketIndex: 1,
  decimals: 9,
};

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
  // Initialize drift sdk
  const env = "mainnet-beta";
  const sdkConfig = initialize({ env });

  const provider = initProvider();

  const authorityaddy = new PublicKey(
    "FTKm3WgS8K5AkDKL9UZnmD12JdhFnvxvNN1mF6adGXH9"
  );

  const driftClient = await createDriftClient(
    provider,
    authorityaddy,
    "mainnet-beta"
  );

  const user = driftClient.getUser();

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
    const amountExpectedAsset1 = Number(
      expectedAmountAsset1 / Number(formattedOraclePriceAsset1)
    );

    console.log("current amount asset1", formattedTokenAmountAsset1);
    console.log("amount expected asset1", Number(amountExpectedAsset1));

    const amountToSwap =
      Number(formattedTokenAmountAsset1) - amountExpectedAsset1;

    console.log("amount to swap", amountToSwap);
    const txSig = await sellSolForUsdc(driftClient, {
      amountSol: amountToSwap < 0 ? formattedTokenAmountAsset1 : amountToSwap,
    });
    console.log("Transaction signature:", txSig);
    return {
      status: "success",
      txSig,
      currentPercentageAsset1,
      currentPercentageAsset2,
      swapDirection,
      amountToSwap,
      amountToSwapInSOL: amountToSwap,
      totalAmountInUSD,
    };
  } else {
    const amountExpectedAsset2 = Number(
      expectedAmountAsset2 / Number(formattedOraclePriceAsset2)
    );

    console.log("amountExpectedAsset2", amountExpectedAsset2);

    console.log("current amount asset2", formattedTokenAmountAsset2);
    console.log("amount expected asset2", amountExpectedAsset2);

    const amountToSwap =
      Number(formattedTokenAmountAsset2) - amountExpectedAsset2;

    const amountToSwapInSOL =
      amountToSwap < 0
        ? formattedTokenAmountAsset2
        : Number(amountToSwap) / Number(formattedOraclePriceAsset1);

    console.log("amount to swap in sol", amountToSwapInSOL);
    const txSig = await buySolWithUsdc(driftClient, {
      amountSol: amountToSwapInSOL,
    });
    console.log("Transaction signature:", txSig);
    return {
      status: "success",
      txSig,
      currentPercentageAsset1,
      currentPercentageAsset2,
      swapDirection,
      amountToSwap,
      amountToSwapInSOL,
      totalAmountInUSD,
    };
  }
};
