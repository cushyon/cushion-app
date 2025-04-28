import { fetchJupiterTokenPrice } from "../utils/jupiter-get-price";

export const getAssetPairPrice = async (asset1: string, asset2: string) => {
  const price = await fetchJupiterTokenPrice(asset1);
  const price2 = await fetchJupiterTokenPrice(asset2);
  return { asset1Price: price, asset2Price: price2 };
};
