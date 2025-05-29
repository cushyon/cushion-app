import { DriftClient } from "@drift-labs/sdk";
import { sellSolForUsdc } from "@src/service/drift.service";

export const swapSolForUsdc = async (
  driftClient: DriftClient,
  formattedTokenAmountAsset1: number,
  formattedOraclePriceAsset1: number,
  expectedAmountAsset1: number
) => {
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
    amountToSwap,
    amountToSwapInSOL: amountToSwap,
  };
};
