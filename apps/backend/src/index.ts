import "dotenv/config";
import app from "./app";
import "./service/drift-service";

// Test if environment variables are loaded
console.log("Environment variables loaded:", {
  WALLET_PRIVATE_KEY: process.env.WALLET_PRIVATE_KEY ? "Set" : "Not set",
  ANCHOR_WALLET: process.env.ANCHOR_WALLET ? "Set" : "Not set",
  ANCHOR_PROVIDER_URL: process.env.ANCHOR_PROVIDER_URL ? "Set" : "Not set",
  HELIUS_API_KEY: process.env.HELIUS_API_KEY ? "Set" : "Not set",
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
