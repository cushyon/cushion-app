import { Request, Response } from "express";
import { getTVL } from "@src/service/tvl.service";

export const getTVLController = async (req: Request, res: Response) => {
  try {
    const { tradeExecutionId } = req.params;
    const tvl = await getTVL(tradeExecutionId);
    res.json({ tvl });
  } catch (error) {
    res.status(500).json({ error: "Failed to get TVL" });
  }
};