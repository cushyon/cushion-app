import "dotenv/config";
import app from "./app";
import { startAPYCron } from "./service/apy-cron.service";

// Test if environment variables are loaded
console.log("Environment variables loaded:", {
  WALLET_PRIVATE_KEY: process.env.WALLET_PRIVATE_KEY ? "Set" : "Not set",
  ANCHOR_WALLET: process.env.ANCHOR_WALLET ? "Set" : "Not set",
  ANCHOR_PROVIDER_URL: process.env.ANCHOR_PROVIDER_URL ? "Set" : "Not set",
  HELIUS_API_KEY: process.env.HELIUS_API_KEY ? "Set" : "Not set",
});

const PORT = process.env.PORT || 4000;

// Initialize APY cron job on startup
const initializeAPYCron = () => {
  try {
    // Get configuration from environment variables
    const vaultDepositorAddress = process.env.VAULT_DEPOSITOR_ADDRESS;
    const tradeExecutionId = process.env.TRADE_EXECUTION_ID;
    const cronSchedule = process.env.APY_CRON_SCHEDULE; // Optional, defaults to every 10 minutes

    console.log("APY Cron Configuration Check:");
    console.log(
      `- VAULT_DEPOSITOR_ADDRESS: ${vaultDepositorAddress || "NOT SET"}`
    );
    console.log(`- TRADE_EXECUTION_ID: ${tradeExecutionId || "NOT SET"}`);
    console.log(
      `- APY_CRON_SCHEDULE: ${cronSchedule || "NOT SET (will use default)"}`
    );

    if (!vaultDepositorAddress || !tradeExecutionId) {
      console.log(
        "❌ APY cron job not started: Missing required environment variables"
      );
      console.log("Required: VAULT_DEPOSITOR_ADDRESS, TRADE_EXECUTION_ID");
      console.log("Optional: APY_CRON_SCHEDULE (default: */10 * * * *)");
      return;
    }

    console.log("✅ All required environment variables are set");
    console.log("Initializing APY cron job with configuration:");
    console.log(`- Vault Depositor: ${vaultDepositorAddress}`);
    console.log(`- Trade Execution ID: ${tradeExecutionId}`);
    console.log(
      `- Cron Schedule: ${cronSchedule || "*/10 * * * * (every 10 minutes)"}`
    );

    startAPYCron({
      vaultDepositorAddress,
      tradeExecutionId,
      cronSchedule,
    });

    console.log("✅ APY cron job initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize APY cron job:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
};

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);

  // Initialize APY cron job after server starts
  setTimeout(() => {
    console.log("🔄 Starting APY cron job initialization...");
    initializeAPYCron();
  }, 2000); // Wait 2 seconds for server to fully start
});
