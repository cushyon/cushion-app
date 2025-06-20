import { Request, Response } from "express";
import {
  calculateAPY,
  calculateAPYWithTimePeriod,
  getAPY,
} from "@src/service/apy.service";

export const calculateAPYController = async (req: Request, res: Response) => {
  try {
    const { vaultDepositorAddress, tradeExecutionId } = req.body;

    if (!vaultDepositorAddress || !tradeExecutionId) {
      return res.status(400).json({
        error: "vaultDepositorAddress and tradeExecutionId are required",
      });
    }

    const result = await calculateAPY(vaultDepositorAddress, tradeExecutionId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in calculateAPYController:", error);
    res.status(500).json({
      error: "Failed to calculate APY",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const calculateAPYWithTimePeriodController = async (
  req: Request,
  res: Response
) => {
  try {
    const { vaultDepositorAddress, tradeExecutionId, startDate, endDate } =
      req.body;

    if (!vaultDepositorAddress || !tradeExecutionId || !startDate) {
      return res.status(400).json({
        error:
          "vaultDepositorAddress, tradeExecutionId, and startDate are required",
      });
    }

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();

    const result = await calculateAPYWithTimePeriod(
      vaultDepositorAddress,
      tradeExecutionId,
      start,
      end
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in calculateAPYWithTimePeriodController:", error);
    res.status(500).json({
      error: "Failed to calculate APY with time period",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getAPYController = async (req: Request, res: Response) => {
  try {
    const { tradeExecutionId } = req.params;

    if (!tradeExecutionId) {
      return res.status(400).json({
        error: "tradeExecutionId is required",
      });
    }

    const apy = await getAPY(tradeExecutionId);

    res.json({
      success: true,
      data: { apy },
    });
  } catch (error) {
    console.error("Error in getAPYController:", error);
    res.status(500).json({
      error: "Failed to get APY",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
