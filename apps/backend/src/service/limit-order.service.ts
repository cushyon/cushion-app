import { initDrift } from "@src/utils/init-drift";
import {
  executeLimitOrder,
  modifyLimitOrder as modifyLimitOrderDrift,
} from "./drift.service";
import { getAssetData } from "@src/utils/get-asset-data";
import { User } from "@drift-labs/sdk";

const getFormattedTokenAmountRiskyAsset = async (
  user: User,
  riskyAsset: string
) => {
  const riskyAssetData = getAssetData(riskyAsset);
  const tokenAmountRiskyAsset = user.getTokenAmount(riskyAssetData.marketIndex);

  return Number(tokenAmountRiskyAsset) / 10 ** riskyAssetData.decimals;
};

export async function placeLimitOrder(
  riskyAsset: string,
  executionPrice: number
) {
  const { driftClient, user } = await initDrift();
  const riskyAssetData = getAssetData(riskyAsset);

  const formattedTokenAmountRiskyAsset =
    await getFormattedTokenAmountRiskyAsset(user, riskyAsset);

  let txSig;
  try {
    txSig = await executeLimitOrder(driftClient, {
      amountSol: formattedTokenAmountRiskyAsset,
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

export async function modifyLimitOrder(
  orderId: number,
  riskyAsset: string,
  executionPrice: number
) {
  try {
    const { driftClient, user } = await initDrift();

    const order = user.getOrder(orderId);

    const formattedExecutionPrice =
      driftClient.convertToPricePrecision(executionPrice);

    const formattedTokenAmountRiskyAsset =
      await getFormattedTokenAmountRiskyAsset(user, riskyAsset);

    const formattedAssetAmount = driftClient.convertToPerpPrecision(
      formattedTokenAmountRiskyAsset
    );

    const isTriggerPriceDifferent =
      order?.triggerPrice?.toString() !== formattedExecutionPrice.toString();

    const isAssetAmountDifferent =
      order?.baseAssetAmount?.toString() !== formattedAssetAmount.toString();

    console.log("isTriggerPriceDifferent", isTriggerPriceDifferent);
    console.log("isAssetAmountDifferent", isAssetAmountDifferent);

    if (isTriggerPriceDifferent || isAssetAmountDifferent) {
      const txSig = await modifyLimitOrderDrift(
        driftClient,
        orderId,
        formattedTokenAmountRiskyAsset,
        executionPrice
      );

      return txSig;
    } else {
      console.log(
        "Order price and asset amount is already set to the desired price"
      );
      return null;
    }
  } catch (error) {
    console.log("error", error);
    return null;
  }
}

export async function cancelLimitOrder(orderId: number) {
  try {
    const { driftClient, user } = await initDrift();

    return driftClient.cancelOrder(orderId);
  } catch (error) {
    console.log("error", error);
    return null;
  }
}

export async function isLimitOrderSet() {
  const { user } = await initDrift();

  const orders = user.getOpenOrders();

  if (orders.length > 0) {
    return { isSet: true, orderId: orders[0].orderId };
  } else {
    return { isSet: false, orderId: 0 };
  }
}
