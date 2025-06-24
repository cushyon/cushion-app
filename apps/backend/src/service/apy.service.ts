import { initVaultDepositor } from "./vault-depositor.service";
import { getTradeExecutionData } from "./get-trade-execution-data.service";
import { initDrift } from "@src/utils/init-drift";
import { PublicKey } from "@solana/web3.js";
// @ts-ignore
import { prisma } from "@repo/database";
import { getAssetData } from "@src/utils/get-asset-data";

// cmav852gx0000w8cmlqa6yben

export interface APYCalculationResult {
  apy: number;
  currentValue: number;
  initialCapital: number;
  depositorShares: number;
  nav: number;
  totalVaultValue: number;
  timeElapsed: number;
}

export const calculateAPY = async (
  vaultDepositorAddress: string,
  tradeExecutionId: string
): Promise<APYCalculationResult> => {
  try {
    const tradeExecution = await prisma.tradeexecution.findUnique({
      where: { id: tradeExecutionId },
    });

    if (!tradeExecution) {
      throw new Error(`Trade execution with id ${tradeExecutionId} not found`);
    }

    const initialCapital = tradeExecution.initial_capital;
    const riskyAsset = tradeExecution.risky_asset;
    const safeAsset = tradeExecution.safe_asset;

    const { driftClient, user } = await initDrift();
    const { depositorShares, vaultAccount, vaultDepositorAccount } =
      await initVaultDepositor({
        driftClient,
        vaultDepositorAddress: new PublicKey(vaultDepositorAddress),
      });

    const asset1Data = getAssetData(riskyAsset);
    const asset2Data = getAssetData(safeAsset);

    const oraclePriceAsset1 = driftClient.getOracleDataForSpotMarket(
      asset1Data.marketIndex
    );
    const oraclePriceAsset2 = driftClient.getOracleDataForSpotMarket(
      asset2Data.marketIndex
    );

    const formattedOraclePriceAsset1 =
      Number(oraclePriceAsset1.price) / 10 ** 6;
    const formattedOraclePriceAsset2 =
      Number(oraclePriceAsset2.price) / 10 ** 6;

    const tokenAmountAsset1 = user.getTokenAmount(asset1Data.marketIndex);
    const tokenAmountAsset2 = user.getTokenAmount(asset2Data.marketIndex);

    const formattedTokenAmountAsset1 =
      Number(tokenAmountAsset1) / 10 ** asset1Data.decimals;
    const formattedTokenAmountAsset2 =
      Number(tokenAmountAsset2) / 10 ** asset2Data.decimals;

    const amountAsset1InUSD =
      formattedTokenAmountAsset1 * formattedOraclePriceAsset1;
    const amountAsset2InUSD =
      formattedTokenAmountAsset2 * formattedOraclePriceAsset2;

    const totalVaultValue = amountAsset1InUSD + amountAsset2InUSD;

    const nav = totalVaultValue * (depositorShares / 100);

    const timeElapsed = 365;

    let apy = 0;
    if (initialCapital > 0) {
      const totalReturn = nav / initialCapital - 1;
      apy = totalReturn * (365 / timeElapsed) * 100;
    }

    await driftClient.unsubscribe();
    await vaultAccount.unsubscribe();
    await vaultDepositorAccount.unsubscribe();

    return {
      apy,
      currentValue: nav,
      initialCapital,
      depositorShares,
      nav,
      totalVaultValue,
      timeElapsed,
    };
  } catch (error) {
    console.error("Error calculating APY:", error);
    throw error;
  }
};

export const calculateAPYWithTimePeriod = async (
  vaultDepositorAddress: string,
  tradeExecutionId: string,
  startDate: Date,
  endDate: Date = new Date()
): Promise<APYCalculationResult> => {
  try {
    const tradeExecution = await prisma.tradeexecution.findUnique({
      where: { id: tradeExecutionId },
    });

    if (!tradeExecution) {
      throw new Error(`Trade execution with id ${tradeExecutionId} not found`);
    }

    const initialCapital = tradeExecution.initial_capital;
    const riskyAsset = tradeExecution.risky_asset;
    const safeAsset = tradeExecution.safe_asset;

    const { driftClient, user } = await initDrift();
    const { depositorShares } = await initVaultDepositor({
      driftClient,
      vaultDepositorAddress: new PublicKey(vaultDepositorAddress),
    });

    const asset1Data = getAssetData(riskyAsset);
    const asset2Data = getAssetData(safeAsset);

    const oraclePriceAsset1 = driftClient.getOracleDataForSpotMarket(
      asset1Data.marketIndex
    );
    const oraclePriceAsset2 = driftClient.getOracleDataForSpotMarket(
      asset2Data.marketIndex
    );

    const formattedOraclePriceAsset1 =
      Number(oraclePriceAsset1.price) / 10 ** 6;
    const formattedOraclePriceAsset2 =
      Number(oraclePriceAsset2.price) / 10 ** 6;

    const tokenAmountAsset1 = user.getTokenAmount(asset1Data.marketIndex);
    const tokenAmountAsset2 = user.getTokenAmount(asset2Data.marketIndex);

    const formattedTokenAmountAsset1 =
      Number(tokenAmountAsset1) / 10 ** asset1Data.decimals;
    const formattedTokenAmountAsset2 =
      Number(tokenAmountAsset2) / 10 ** asset2Data.decimals;

    const amountAsset1InUSD =
      formattedTokenAmountAsset1 * formattedOraclePriceAsset1;
    const amountAsset2InUSD =
      formattedTokenAmountAsset2 * formattedOraclePriceAsset2;

    const totalVaultValue = amountAsset1InUSD + amountAsset2InUSD;

    const nav = totalVaultValue * (depositorShares / 100);

    const timeElapsed = Math.max(
      1,
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    );

    let apy = 0;
    if (initialCapital > 0) {
      const totalReturn = nav / initialCapital - 1;
      apy = totalReturn * (365 / timeElapsed) * 100;
    }

    return {
      apy,
      currentValue: nav,
      initialCapital,
      depositorShares,
      nav,
      totalVaultValue,
      timeElapsed,
    };
  } catch (error) {
    console.error("Error calculating APY with time period:", error);
    throw error;
  }
};

export const getAPY = async (tradeExecutionId: string): Promise<number> => {
  try {
    const tradeExecution = await prisma.tradeexecution.findUnique({
      where: { id: tradeExecutionId },
      select: { apy: true },
    });

    return tradeExecution?.apy || 0;
  } catch (error) {
    console.error("Error getting APY:", error);
    throw error;
  }
};
