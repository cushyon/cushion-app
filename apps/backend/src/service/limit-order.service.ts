import { initDrift } from "@src/utils/init-drift";
import { executeLimitOrder } from "./drift.service";
import { getAssetData } from "@src/utils/get-asset-data";
import { BN } from "@coral-xyz/anchor";

export async function placeLimitOrder(
  riskyAsset: string,
  executionPrice: number
) {
  const { driftClient, user } = await initDrift();

  // Get the price of the asset1 and asset2
  const riskyAssetData = getAssetData(riskyAsset);

  // Fetch portfolio Assets balance
  const tokenAmountRiskyAsset = user.getTokenAmount(riskyAssetData.marketIndex);

  console.log("tokenAmountRiskyAsset", tokenAmountRiskyAsset.toString());

  const formattedTokenAmountRiskyAsset =
    Number(tokenAmountRiskyAsset) / 10 ** riskyAssetData.decimals;

  console.log("formattedTokenAmountRiskyAsset", formattedTokenAmountRiskyAsset);

  let txSig;
  try {
    txSig = await executeLimitOrder(driftClient, {
      // amountSol: formattedTokenAmountRiskyAsset,
      amountSol: 0.1,
      marketIndex: riskyAssetData.marketIndex,
      executionPrice,
    });
  } catch (error) {
    console.log("error", error);
  }

  console.log("txSig", txSig);

  const orders = user.getOpenOrders();

  console.log("orders", orders);
}
