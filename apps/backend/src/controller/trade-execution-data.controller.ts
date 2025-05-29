import { getTradeExecutionData } from "@src/service/get-trade-execution-data.service";
import { Request, Response } from "express";

export const tradeExecutionData = async (req: Request, res: Response) => {
  try {
    console.log("Entering trade-execution-data");
    const { name, risky_asset, safe_asset } = req.query;
    if (!name || !risky_asset || !safe_asset) {
      return res
        .status(400)
        .json({ error: "name, risky_asset, and safe_asset are required" });
    }
    const tradeExecutionData = await getTradeExecutionData(
      name as string,
      risky_asset as string,
      safe_asset as string
    );
    res.json({ tradeExecutionData });
  } catch (error) {
    console.error("Error in trade-execution-data:", error);
    res.status(500).json({ error: "Failed to get trade execution data" });
  }
};
