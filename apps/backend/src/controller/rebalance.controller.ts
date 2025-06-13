import { updateTradeExecutionData } from "@src/service/update-trade-execution-data.service";
import { Request, Response } from "express";
import { rebalanceWithDrift } from "../service/rebalance-with-drift.service";
import { SOL, USDC } from "../lib/tokens";
import {
  writeLog,
  updateLastRow,
  LogEntry,
} from "../service/google-sheets.service";
import { normalisePercentage } from "@src/utils/percentage-checks";
import { retryWithDelay } from "@src/utils/retry-with-delay";

type RebalanceResult = {
  status: "success" | "error";
  txSig: string | null;
  currentPercentageAsset1: number;
  currentPercentageAsset2: number;
  swapDirection: string | null;
  amountToSwap: number;
  amountToSwapInSOL: number;
  totalAmountInUSD: number;
  nav: number;
};

export const rebalance = async (req: Request, res: Response) => {
  console.log("----- Entering rebalance -----");
  // Write the current date in the first column of the Google Sheet
  const currentDate = new Date().toISOString();
  const log: LogEntry = {
    column: "A",
    value: currentDate,
  };
  await writeLog(log);

  try {
    // Get the data from the request body
    let { id, percentageAsset1, percentageAsset2 } = req.body;
    console.log(
      "percentageAsset1",
      percentageAsset1,
      "percentageAsset2",
      percentageAsset2
    );
    const log: LogEntry = {
      column: "B",
      value: percentageAsset1,
    };
    await updateLastRow([log]);
    log.column = "C";
    log.value = percentageAsset2;
    await updateLastRow([log]);
    const { percentage1, percentage2 } = normalisePercentage(
      percentageAsset1,
      percentageAsset2
    );

    console.log("----- STARTING REBALANCE -----");

    const result = await retryWithDelay<RebalanceResult>(
      async () => {
        try {
          const rebalanceResult = await rebalanceWithDrift(
            SOL.address,
            USDC.address,
            percentage1,
            percentage2
          );

          // Ensure the status is either "success" or "error"
          const status =
            rebalanceResult.status === "success" ? "success" : "error";

          return {
            status,
            data: {
              ...rebalanceResult,
              status,
            },
          };
        } catch (error) {
          return {
            status: "error",
            error,
          };
        }
      },
      3,
      1000
    );

    console.log("----- REBALANCE COMPLETED -----");

    if (result.status === "error" || !result.data) {
      throw new Error(result.error || "Rebalance failed");
    }

    const rebalanceData = result.data;
    const logResult: LogEntry[] = [
      {
        column: "D",
        value: rebalanceData.status,
      },
      {
        column: "E",
        value: rebalanceData.txSig,
      },
      {
        column: "F",
        value: rebalanceData.currentPercentageAsset1,
      },
      {
        column: "G",
        value: rebalanceData.currentPercentageAsset2,
      },
      {
        column: "H",
        value: rebalanceData.swapDirection,
      },
      {
        column: "I",
        value: rebalanceData.amountToSwap,
      },
      {
        column: "J",
        value: rebalanceData.amountToSwapInSOL,
      },
      {
        column: "K",
        value: rebalanceData.nav,
      },
      {
        column: "L",
        value: rebalanceData.totalAmountInUSD,
      },
    ];
    await updateLastRow(logResult);

    console.log("Rebalance result", rebalanceData);
    if (rebalanceData.status === "success") {
      console.log("----- Updating trade execution data -----");
      await updateTradeExecutionData(
        id,
        rebalanceData.nav ?? 0,
        req.body.initial_capital
      );
      console.log("----- Trade execution data updated -----");
    }
    res.json({ message: "Rebalance done", result: rebalanceData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Rebalance failed" });
  }
};
