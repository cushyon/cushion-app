import { getAssetPairPrice } from "@src/service/get-asset-pair-price.service";
import { Request, Response } from "express";

export const assetPairPrice = async (req: Request, res: Response) => {
  try {
    const { asset1, asset2 } = req.query;
    if (!asset1 || !asset2) {
      return res
        .status(400)
        .json({ error: "asset1 and asset2 are required as query parameters" });
    }
    const price = await getAssetPairPrice(asset1 as string, asset2 as string);
    res.json({ price });
  } catch (error) {
    console.error("Error in get-asset-pair-price:", error);
    res.status(500).json({ error: "Failed to get asset pair price" });
  }
};
