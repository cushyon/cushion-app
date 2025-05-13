import { prisma } from "@repo/database";

export const getTradeExecutionData = async (
  name?: string,
  risky_asset?: string,
  safe_asset?: string
) => {
  const tradeExecutionData = await prisma.tradeexecution.findFirst({
    where: { name, risky_asset, safe_asset },
  });
  return tradeExecutionData;
};
