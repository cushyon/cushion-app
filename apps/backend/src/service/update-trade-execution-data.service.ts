import { prisma } from "@repo/database";

export const updateTradeExecutionData = async (
  id: string,
  nav: number,
  max_nav: number,
  initial_capital: number
) => {
  const tradeExecutionData = await prisma.tradeexecution.update({
    where: { id },
    data: { nav, max_nav, initial_capital },
  });
  return tradeExecutionData;
};
