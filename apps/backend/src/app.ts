import express, { Express, RequestHandler } from "express";
import { rebalance } from "./controller/rebalance.controller";
import { tradeExecutionData } from "./controller/trade-execution-data.controller";
import { assetPairPrice } from "./controller/asset-pair-price.controller";
import { assetQuantity } from "./controller/asset-quantity.controller";
import { priceAndQuantity } from "./controller/price-and-quantity.controller";
import { updateTradeExecutionData } from "./controller/update-trade-execution-data.controller";

const app: Express = express();

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

// rebalanceWithDrift(SOL.address, USDC.address, 70, 30);

export default app;
