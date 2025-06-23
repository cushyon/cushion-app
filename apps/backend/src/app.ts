import express, { Express, RequestHandler } from "express";
import { corsMiddleware } from "./middleware/cors.middleware";
import { rebalance } from "./controller/rebalance.controller";
import { tradeExecutionData } from "./controller/trade-execution-data.controller";
import { assetPairPrice } from "./controller/asset-pair-price.controller";
import { assetQuantity } from "./controller/asset-quantity.controller";
import { priceAndQuantity } from "./controller/price-and-quantity.controller";
import { updateTradeExecutionData } from "./controller/update-trade-execution-data.controller";
import {
  calculateAPYController,
  calculateAPYWithTimePeriodController,
  getAPYController,
} from "./controller/apy.controller";
import {
  startAPYCronController,
  stopAPYCronController,
  getAPYCronStatusController,
  executeAPYCalculationController,
} from "./controller/apy-cron.controller";

const app: Express = express();

// CORS middleware
app.use(corsMiddleware);

// Middleware to parse JSON
app.use(express.json());

// Routes
app.get("/api/get-asset-pair-price", assetPairPrice as RequestHandler);

app.get("/api/trade-execution-data", tradeExecutionData as RequestHandler);

app.get(
  "/api/get-asset-quantity/:asset1/:asset2",
  assetQuantity as RequestHandler
);

app.get(
  "/price-and-quantity/:asset1/:asset2",
  priceAndQuantity as RequestHandler
);

app.post("/api/rebalance", rebalance);

app.post(
  "/api/update-trade-execution-data",
  updateTradeExecutionData as RequestHandler
);

// APY Routes
app.post("/api/calculate-apy", calculateAPYController as RequestHandler);
app.post(
  "/api/calculate-apy-with-time",
  calculateAPYWithTimePeriodController as RequestHandler
);
app.get("/api/get-apy/:tradeExecutionId", getAPYController as RequestHandler);

// APY Cron Routes
app.post("/api/apy-cron/start", startAPYCronController as RequestHandler);
app.post("/api/apy-cron/stop", stopAPYCronController as RequestHandler);
app.get("/api/apy-cron/status", getAPYCronStatusController as RequestHandler);
app.post(
  "/api/apy-cron/execute",
  executeAPYCalculationController as RequestHandler
);

// rebalanceWithDrift(SOL.address, USDC.address, 70, 30);

export default app;
