import { DriftClient } from "@drift-labs/sdk";
import { buySolWithUsdc } from "@src/service/drift.service";

export const swapUsdcForSol = async (
  driftClient: DriftClient,
  formattedOraclePriceAsset1: number,
  formattedTokenAmountAsset2: number,
  formattedOraclePriceAsset2: number,
  expectedAmountAsset2: number
) => {
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
    amountToSwap,
    amountToSwapInSOL,
  };
};
