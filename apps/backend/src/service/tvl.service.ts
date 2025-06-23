// @ts-ignore
import { prisma } from "@repo/database";

export const getTVL = async (tradeExecutionId: string): Promise<number> => {
  const tradeExecution = await prisma.tradeexecution.findUnique({
    where: { id: tradeExecutionId },
  });

  if (!tradeExecution) {
    throw new Error("Trade execution not found");
  }

  return tradeExecution.tvl;
};