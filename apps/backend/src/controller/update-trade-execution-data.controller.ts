import { updateTradeExecutionData as updateTradeExecutionDataService } from "@src/service/update-trade-execution-data.service";
import { Request, Response } from "express";

export const updateTradeExecutionData = async (req: Request, res: Response) => {
  try {
    console.log("update-trade-execution-data req.body", req.body);
    const { id, nav, initial_capital } = req.body;
    const tradeExecutionData = await updateTradeExecutionDataService(
      id,
      nav,
      initial_capital
    );
    res.json({ tradeExecutionData });
  } catch (error) {
    console.error("Error in update-trade-execution-data:", error);
    res.status(500).json({ error: "Failed to update trade execution data" });
  }
};
