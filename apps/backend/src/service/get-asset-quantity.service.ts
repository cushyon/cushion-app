import { getTokenAccountData } from "../utils/get-token-account-data";

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
