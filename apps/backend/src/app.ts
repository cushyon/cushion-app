import express, { Express, Request, Response, RequestHandler } from "express";
import { getAssetPairPrice } from "./service/get-asset-pair-price.service";
import {
  getAssetQuantity,
  getAssetQuantityDrift,
} from "./service/get-asset-quantity.service";
import { getTradeExecutionData } from "./service/get-trade-execution-data.service";
import { updateTradeExecutionData } from "./service/update-trade-execution-data.service";
import { rebalance } from "./controller/rebalance.controller";

const app: Express = express();

// Middleware to parse JSON
app.use(express.json());

// Test route
app.get("/api/get-asset-pair-price", (async (req: Request, res: Response) => {
  try {
    const { asset1, asset2 } = req.query;
    if (!asset1 || !asset2) {
      return res
        .status(400)
        .json({ error: "asset1 and asset2 are required as query parameters" });
    }
    const price = await getAssetPairPrice(asset1 as string, asset2 as string);
    res.json({ price });
  } catch (error) {
    console.error("Error in get-asset-pair-price:", error);
    res.status(500).json({ error: "Failed to get asset pair price" });
  }
}) as RequestHandler);

app.get("/api/trade-execution-data", (async (req: Request, res: Response) => {
  try {
    console.log("Entering trade-execution-data");
    const { name, risky_asset, safe_asset } = req.query;
    if (!name || !risky_asset || !safe_asset) {
      return res
        .status(400)
        .json({ error: "name, risky_asset, and safe_asset are required" });
    }
    const tradeExecutionData = await getTradeExecutionData(
      name as string,
      risky_asset as string,
      safe_asset as string
    );
    res.json({ tradeExecutionData });
  } catch (error) {
    console.error("Error in trade-execution-data:", error);
    res.status(500).json({ error: "Failed to get trade execution data" });
  }
}) as RequestHandler);

app.get(
  "/api/get-asset-quantity/:asset1/:asset2",
  async (req: Request, res: Response) => {
    const { asset1, asset2 } = req.params;
    const quantity = await getAssetQuantity(asset1, asset2);
    res.json({ quantity });
  }
);

app.get(
  "/price-and-quantity/:asset1/:asset2",
  async (req: Request, res: Response) => {
    console.log("Entering price-and-quantity");
    const { asset1, asset2 } = req.params;
    if (!asset1 || !asset2) {
      throw new Error("Asset1 and asset2 are required");
    }
    const price = await getAssetPairPrice(asset1, asset2);
    const quantity = await getAssetQuantityDrift(asset1, asset2);
    res.json({ price, quantity });
  }
);

app.post("/api/rebalance", rebalance);

app.post(
  "/api/update-trade-execution-data",
  async (req: Request, res: Response) => {
    console.log("update-trade-execution-data req.body", req.body);
    const { id, nav, initial_capital } = req.body;
    const tradeExecutionData = await updateTradeExecutionData(
      id,
      nav,
      initial_capital
    );
    res.json({ tradeExecutionData });
  }
);

// rebalanceWithDrift(SOL.address, USDC.address, 70, 30);

export default app;
