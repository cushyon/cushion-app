import cron from "node-cron";
import { rebalance } from "../utils/rebalance";

cron.schedule("0 16 * * *", async () => {
  console.log("Rebalancing...");

  await rebalance();

  console.log("Rebalancing completed");
});
