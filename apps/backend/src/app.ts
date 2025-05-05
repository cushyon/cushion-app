import express, { Express, Request, Response } from "express";
import "./cron/rebalance";
import { rebalance } from "./utils/rebalance";
import { getAssetPairPrice } from "./service/get-asset-pair-price.service";
import { getAssetQuantity } from "./service/get-asset-quantity.service";

const app: Express = express();

// Middleware pour parser le JSON
app.use(express.json());

// Route de test
app.get("/api/get-asset-pair-price", async (req: Request, res: Response) => {
  const { asset1, asset2 } = req.body;
  const price = await getAssetPairPrice(asset1, asset2);
  res.json({ price });
});

app.get("/api/get-asset-quantity", async (req: Request, res: Response) => {
  const { asset1, asset2 } = req.body;
  const quantity = await getAssetQuantity(asset1, asset2);
  res.json({ quantity });
});

app.get("/price-and-quantity", async (req: Request, res: Response) => {
  const { asset1, asset2 } = req.body;
  const price = await getAssetPairPrice(asset1, asset2);
  const quantity = await getAssetQuantity(asset1, asset2);
  res.json({ price, quantity });
});

app.post("/api/rebalance", async (req: Request, res: Response) => {
  try {
    const { percentageAsset1, percentageAsset2 } = req.body;
    if (!percentageAsset1 || !percentageAsset2)
      throw new Error("Percentage asset1 and asset2 are required");
    if (percentageAsset1 + percentageAsset2 !== 100)
      throw new Error("Percentage asset1 and asset2 must be 100");
    await rebalance({ percentageAsset1, percentageAsset2 });
    res.json({ message: "Rebalance done" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Rebalance failed" });
  }
});

// rebalance({
//   percentageAsset1: 70,
//   percentageAsset2: 30,
// });

export default app;
