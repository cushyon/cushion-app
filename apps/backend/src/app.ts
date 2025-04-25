import express, { Express } from "express";
import "./cron/rebalance";
import { rebalance } from "./utils/rebalance";

const app: Express = express();

rebalance({
  percentageAsset1: 70,
  percentageAsset2: 30,
});

export default app;
