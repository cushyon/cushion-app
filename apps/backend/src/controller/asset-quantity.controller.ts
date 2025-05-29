import { getAssetQuantity } from "@src/service/get-asset-quantity.service";
import { Request, Response } from "express";

export const assetQuantity = async (req: Request, res: Response) => {
  try {
    const { asset1, asset2 } = req.params;
    const quantity = await getAssetQuantity(asset1, asset2);
    res.json({ quantity });
  } catch (error) {
    console.error("Error in asset-quantity:", error);
    res.status(500).json({ error: "Failed to get asset quantity" });
  }
};
