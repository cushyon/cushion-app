import { getAssetQuantityDrift } from "@src/service/get-asset-quantity.service";
import { getAssetPairPrice } from "@src/service/get-asset-pair-price.service";
import { Request, Response } from "express";

export const priceAndQuantity = async (req: Request, res: Response) => {
  try {
    console.log("Entering price-and-quantity");
    const { asset1, asset2 } = req.params;
    if (!asset1 || !asset2) {
      throw new Error("Asset1 and asset2 are required");
    }
    const price = await getAssetPairPrice(asset1, asset2);
    const quantity = await getAssetQuantityDrift(asset1, asset2);
    res.json({ price, quantity });
  } catch (error) {
    console.error("Error in price-and-quantity:", error);
    res.status(500).json({ error: "Failed to get price and quantity" });
  }
};
