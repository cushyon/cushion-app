import { PublicKey } from "@solana/web3.js";
import { getTokenAccountData } from "../utils/get-token-account-data";
import { createDriftClient, initProvider } from "./drift.service";
import { initialize } from "@drift-labs/sdk";
import { getAssetData } from "./rebalance-with-drift.service";
import { USDC, SOL } from "../lib/tokens";

const PUBLIC_KEY = "8JJCtexL5QTc4jnLztHNT4dKLSNhswuYwmR4gVvJZwAh";

export const getAssetQuantity = async (asset1: string, asset2: string) => {
  const tokenAccountBalance1 = await getTokenAccountData(asset1, PUBLIC_KEY);
  const tokenAccountBalance2 = await getTokenAccountData(asset2, PUBLIC_KEY);
  return {
    asset1: tokenAccountBalance1?.result?.value
      ? tokenAccountBalance1.result.value
      : undefined,
    asset2: tokenAccountBalance2?.result?.value
      ? tokenAccountBalance2.result.value
      : undefined,
  };
};

export const getAssetQuantityDrift = async (asset1: string, asset2: string) => {
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

  const asset1Data = getAssetData(asset1);
  const asset2Data = getAssetData(asset2);

  const tokenAmountAsset1 = user.getTokenAmount(asset1Data.marketIndex);
  const tokenAmountAsset2 = user.getTokenAmount(asset2Data.marketIndex);

  return {
    asset1: {
      amount: tokenAmountAsset1.toString(),
      decimals: asset1Data.decimals,
      uiAmount: Number(tokenAmountAsset1) / 10 ** asset1Data.decimals,
    },
    asset2: {
      amount: tokenAmountAsset2.toString(),
      decimals: asset2Data.decimals,
      uiAmount: Number(tokenAmountAsset2) / 10 ** asset2Data.decimals,
    },
  };
};
