import cron from "node-cron";
import { calculateAPY } from "./apy.service";
// @ts-ignore
import { prisma } from "@repo/database";

interface APYCronConfig {
  vaultDepositorAddress: string;
  tradeExecutionId: string;
  cronSchedule?: string; // Default every 10 minutes
}

// Global variables to manage the cron job
let cronJob: cron.ScheduledTask | null = null;
let currentConfig: APYCronConfig | null = null;
let isExecuting = false;

/**
 * Starts the APY cron job
 */
export const startAPYCron = (config: APYCronConfig): void => {
  // Stop existing cron job if any
  stopAPYCron();

  currentConfig = {
    cronSchedule: "* * * * * *", // Every 1 second
    ...config,
  };

  // Ensure cronSchedule is always a valid string
  const schedule = currentConfig.cronSchedule || "* * * * * *";

  console.log(
    `Starting APY cron job for trade execution: ${currentConfig.tradeExecutionId}`
  );
  console.log(`Schedule: ${schedule}`);
  console.log(`Vault depositor: ${currentConfig.vaultDepositorAddress}`);

  cronJob = cron.schedule(schedule, async () => {
    if (isExecuting) {
      console.log(
        `[${new Date().toISOString()}] Skipping execution: previous task still running.`
      );
      return;
    }

    isExecuting = true;
    try {
      console.log(`[${new Date().toISOString()}] Executing APY calculation...`);

      // Calculate APY
      const result = await calculateAPY(
        currentConfig!.vaultDepositorAddress,
        currentConfig!.tradeExecutionId
      );

      // Store APY + TVL in database
      await prisma.tradeexecution.update({
        where: { id: currentConfig!.tradeExecutionId },
        data: {
          apy: result.apy,
          tvl: result.totalVaultValue
        },
      });

      console.log(`[${new Date().toISOString()}] APY calculation completed:`, {
        apy: result.apy,
        nav: result.nav,
        totalVaultValue: result.totalVaultValue,
        depositorShares: result.depositorShares,
      });
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Error in APY cron job:`,
        error
      );
    } finally {
      isExecuting = false;
    }
  });

  // Execute immediately on startup
  executeAPYCalculation();
};

/**
 * Stops the APY cron job
 */
export const stopAPYCron = (): void => {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    currentConfig = null;
    console.log("APY cron job stopped");
  }
};

/**
 * Manually executes APY calculation
 */
export const executeAPYCalculation = async (): Promise<void> => {
  if (!currentConfig) {
    throw new Error(
      "No APY cron job is currently running. Please start it first."
    );
  }

  if (isExecuting) {
    console.log(
      `[${new Date().toISOString()}] Cannot manually execute: task is already running.`
    );
    return;
  }

  isExecuting = true;
  try {
    console.log(
      `[${new Date().toISOString()}] Manual APY calculation execution...`
    );

    const result = await calculateAPY(
      currentConfig.vaultDepositorAddress,
      currentConfig.tradeExecutionId
    );

    await prisma.tradeexecution.update({
      where: { id: currentConfig.tradeExecutionId },
      data: {
        apy: result.apy,
      },
    });

    console.log(
      `[${new Date().toISOString()}] Manual APY calculation completed:`,
      {
        apy: result.apy,
        nav: result.nav,
        totalVaultValue: result.totalVaultValue,
        depositorShares: result.depositorShares,
      }
    );
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error in manual APY calculation:`,
      error
    );
    throw error;
  } finally {
    isExecuting = false;
  }
};

/**
 * Checks if the cron job is active
 */
export const isAPYCronRunning = (): boolean => {
  return cronJob !== null;
};

/**
 * Gets cron job information
 */
export const getAPYCronInfo = (): {
  isRunning: boolean;
  schedule?: string;
  vaultDepositorAddress?: string;
  tradeExecutionId?: string;
} => {
  if (!currentConfig) {
    return {
      isRunning: false,
    };
  }

  return {
    isRunning: isAPYCronRunning(),
    schedule: currentConfig.cronSchedule || "*/10 * * * *",
    vaultDepositorAddress: currentConfig.vaultDepositorAddress,
    tradeExecutionId: currentConfig.tradeExecutionId,
  };
};
