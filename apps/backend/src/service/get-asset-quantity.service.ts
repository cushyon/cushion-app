import { getTokenAccountBalance } from "../utils/get-token-account-balance";

export const getAssetQuantity = async (asset1: string, asset2: string) => {
  const tokenAccountBalance1 = await getTokenAccountBalance(asset1);
  const tokenAccountBalance2 = await getTokenAccountBalance(asset2);
  return {
    asset1: tokenAccountBalance1,
    asset2: tokenAccountBalance2,
  };
};
