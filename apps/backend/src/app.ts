import express, { Express } from "express";
import "./cron/rebalance";
import { rebalance } from "./utils/rebalance";

const app: Express = express();

rebalance();

export default app;
