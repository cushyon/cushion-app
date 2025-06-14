import { USDC, SOL } from "../lib/tokens";

export const getAssetData = (asset: string) => {
  if (asset === SOL.address) return SOL;
  if (asset === USDC.address) return USDC;
  throw new Error("Invalid asset");
};
