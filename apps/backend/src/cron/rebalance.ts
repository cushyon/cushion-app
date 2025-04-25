import cron from "node-cron";
import { rebalance } from "../utils/rebalance";

cron.schedule("0 16 * * *", async () => {
  console.log("Rebalancing...");

  await rebalance({
    percentageAsset1: 60,
    percentageAsset2: 40,
  });

  console.log("Rebalancing completed");
});
