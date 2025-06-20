import { Request, Response } from "express";
import {
  startAPYCron,
  stopAPYCron,
  getAPYCronInfo,
  executeAPYCalculation,
} from "@src/service/apy-cron.service";

export const startAPYCronController = async (req: Request, res: Response) => {
  try {
    const { vaultDepositorAddress, tradeExecutionId, cronSchedule } = req.body;

    if (!vaultDepositorAddress || !tradeExecutionId) {
      return res.status(400).json({
        error: "vaultDepositorAddress and tradeExecutionId are required",
      });
    }

    startAPYCron({
      vaultDepositorAddress,
      tradeExecutionId,
      cronSchedule,
    });

    res.json({
      success: true,
      message: "APY cron job started successfully",
      data: getAPYCronInfo(),
    });
  } catch (error) {
    console.error("Error in startAPYCronController:", error);
    res.status(500).json({
      error: "Failed to start APY cron job",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const stopAPYCronController = async (req: Request, res: Response) => {
  try {
    stopAPYCron();

    res.json({
      success: true,
      message: "APY cron job stopped successfully",
    });
  } catch (error) {
    console.error("Error in stopAPYCronController:", error);
    res.status(500).json({
      error: "Failed to stop APY cron job",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getAPYCronStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const cronInfo = getAPYCronInfo();

    res.json({
      success: true,
      data: cronInfo,
    });
  } catch (error) {
    console.error("Error in getAPYCronStatusController:", error);
    res.status(500).json({
      error: "Failed to get APY cron job status",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const executeAPYCalculationController = async (
  req: Request,
  res: Response
) => {
  try {
    await executeAPYCalculation();

    res.json({
      success: true,
      message: "APY calculation executed successfully",
      data: getAPYCronInfo(),
    });
  } catch (error) {
    console.error("Error in executeAPYCalculationController:", error);
    res.status(500).json({
      error: "Failed to execute APY calculation",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
