import { updateTradeExecutionData } from "@src/service/update-trade-execution-data.service";
import { Request, Response } from "express";
import {
  rebalanceWithDrift,
  SOL,
  USDC,
} from "../service/rebalance-with-drift.service";
import {
  writeLog,
  updateLastRow,
  LogEntry,
} from "../service/google-sheets.service";

export const rebalance = async (req: Request, res: Response) => {
  console.log("Entering rebalance");
  // Write the current date in the first column of the Google Sheet
  const currentDate = new Date().toISOString();
  const log: LogEntry = {
    column: "A",
    value: currentDate,
  };
  await writeLog(log);

  try {
    // Get the data from the request body
    const { id, percentageAsset1, percentageAsset2 } = req.body;
    console.log("percentageAsset1", percentageAsset1);
    console.log("percentageAsset2", percentageAsset2);
    const log: LogEntry = {
      column: "B",
      value: percentageAsset1,
    };
    await updateLastRow([log]);
    log.column = "C";
    log.value = percentageAsset2;
    await updateLastRow([log]);
    if (percentageAsset1 + percentageAsset2 !== 100) {
      console.log("Percentage asset1 and asset2 must be 100");
      throw new Error("Percentage asset1 and asset2 must be 100");
    }

    const result = await rebalanceWithDrift(
      SOL.address,
      USDC.address,
      percentageAsset1,
      percentageAsset2
    );

    const logResult: LogEntry[] = [
      {
        column: "D",
        value: result.status,
      },
      {
        column: "E",
        value: result.txSig,
      },
      {
        column: "F",
        value: result.currentPercentageAsset1,
      },
      {
        column: "G",
        value: result.currentPercentageAsset2,
      },
      {
        column: "H",
        value: result.swapDirection,
      },
      {
        column: "I",
        value: result.amountToSwap,
      },
      {
        column: "J",
        value: result.amountToSwapInSOL,
      },
      {
        column: "K",
        value: result.totalAmountInUSD,
      },
    ];
    await updateLastRow(logResult);

    console.log("result", result);
    if (result.status === "success") {
      await updateTradeExecutionData(
        id,
        result?.totalAmountInUSD ?? 0,
        req.body.initial_capital
      );
    }
    res.json({ message: "Rebalance done", result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Rebalance failed" });
  }
};
